import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
} from '../../api.js';

const modalCat = new bootstrap.Modal(document.getElementById('modalCat'));
const modalVerCat = new bootstrap.Modal(document.getElementById('modalVerCat'));

// Evita que un texto escrito por el usuario se interprete como HTML
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Muestra un mensaje arriba de la tabla (tipo: 'success' o 'danger')
function mostrarAlerta(mensaje, tipo = 'success') {
  document.getElementById('alerta-cat').innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${escaparHTML(mensaje)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// BROWSE: pide las categorías activas al backend y dibuja la tabla
async function renderizarTabla() {
  const tbody = document.getElementById('tabla-categorias');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">Cargando...</td></tr>`;

  let categorias;
  try {
    categorias = await listarCategorias();
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">${escaparHTML(error.message)}</td></tr>`;
    return;
  }

  if (categorias.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No hay categorías registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = categorias.map(cat => `
    <tr>
      <td class="ps-3 fw-bold">#${cat.id_categoria}</td>
      <td>${escaparHTML(cat.descripcion)}</td>
      <td class="text-end pe-3">
        <button class="btn btn-outline-primary btn-sm btn-ver me-1" data-id="${cat.id_categoria}">
          Ver
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-edit me-1" data-id="${cat.id_categoria}">
          Editar
        </button>
        <button class="btn btn-outline-danger btn-sm btn-del" data-id="${cat.id_categoria}">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-ver').forEach(btn => {
    btn.addEventListener('click', (e) => verCategoria(Number(e.currentTarget.dataset.id)));
  });
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => abrirModal(Number(e.currentTarget.dataset.id)));
  });
  document.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => borrarCategoria(Number(e.currentTarget.dataset.id)));
  });
}

// READ: pide una categoría y la muestra en el modal de detalle
async function verCategoria(id) {
  try {
    const cat = await obtenerCategoria(id);
    document.getElementById('detalle-cat').innerHTML = `
      <dl class="row mb-0">
        <dt class="col-4">ID</dt>
        <dd class="col-8">#${cat.id_categoria}</dd>
        <dt class="col-4">Descripción</dt>
        <dd class="col-8">${escaparHTML(cat.descripcion)}</dd>
        <dt class="col-4">Estado</dt>
        <dd class="col-8"><span class="badge bg-success">Activa</span></dd>
      </dl>
    `;
    modalVerCat.show();
  } catch (error) {
    mostrarAlerta(error.message, 'danger');
  }
}

// Abre el modal del formulario: sin id es AGREGAR, con id es EDITAR
async function abrirModal(id = null) {
  const form = document.getElementById('form-cat');
  form.reset();
  document.getElementById('error-form-cat').textContent = '';
  document.getElementById('cat-id').value = id ?? '';
  document.getElementById('titulo-modal-cat').textContent = id ? 'Editar Categoría' : 'Agregar Categoría';

  if (id) {
    try {
      const cat = await obtenerCategoria(id);
      document.getElementById('cat-nombre').value = cat.descripcion;
    } catch (error) {
      mostrarAlerta(error.message, 'danger');
      return;
    }
  }

  modalCat.show();
}

// DELETE: pide confirmación y hace el borrado lógico en la base
async function borrarCategoria(id) {
  if (!confirm(`¿Eliminar la categoría #${id}?`)) return;

  try {
    await eliminarCategoria(id);
    mostrarAlerta('Categoría eliminada');
    renderizarTabla();
  } catch (error) {
    mostrarAlerta(error.message, 'danger');
  }
}

// ADD / EDIT: envía el formulario al backend
document.getElementById('form-cat').addEventListener('submit', async (e) => {
  e.preventDefault(); // evita que el navegador recargue la página

  const id = document.getElementById('cat-id').value;
  const descripcion = document.getElementById('cat-nombre').value.trim();
  const botonGuardar = document.getElementById('btn-guardar-cat');

  botonGuardar.disabled = true;
  try {
    if (id) {
      await editarCategoria(id, descripcion);
    } else {
      await crearCategoria(descripcion);
    }
    modalCat.hide();
    mostrarAlerta(id ? 'Categoría actualizada' : 'Categoría creada');
    renderizarTabla();
  } catch (error) {
    // El error se muestra dentro del modal para que el usuario pueda corregirlo
    document.getElementById('error-form-cat').textContent = error.message;
  } finally {
    botonGuardar.disabled = false;
  }
});

document.getElementById('btn-nueva-cat').addEventListener('click', () => abrirModal());

renderizarTabla();
