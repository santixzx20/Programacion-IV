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
import { alerta, filaMensaje } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(2);
if (!usuario) await new Promise(() => {});

const modalCat = new bootstrap.Modal(document.getElementById('modalCat'));
const modalVerCat = new bootstrap.Modal(document.getElementById('modalVerCat'));

// Muestra un mensaje arriba de la tabla (tipo: 'success' o 'danger')
function mostrarAlerta(mensaje, tipo = 'success') {
  alerta('alerta-cat', mensaje, tipo);
}

// BROWSE: pide las categorías activas al backend y dibuja la tabla
async function renderizarTabla() {
  const tbody = document.getElementById('tabla-categorias');
  if (!tbody) return;

  filaMensaje(tbody, 3, 'Cargando...');

  let categorias;
  try {
    categorias = await listarCategorias();
  } catch (error) {
    filaMensaje(tbody, 3, error.message, 'text-danger');
    return;
  }

  if (categorias.length === 0) {
    filaMensaje(tbody, 3, 'No hay categorías registradas.');
    return;
  }

  tbody.textContent = '';

  categorias.forEach(cat => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.className = 'ps-3 fw-bold';
    tdId.textContent = `#${cat.id_categoria}`;

    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = cat.descripcion;

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'text-end pe-3';

    const btnVer = document.createElement('button');
    btnVer.className = 'btn btn-outline-primary btn-sm me-1';
    btnVer.textContent = 'Ver';
    btnVer.addEventListener('click', () => verCategoria(cat.id_categoria));

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-outline-secondary btn-sm me-1';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirModal(cat.id_categoria));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-outline-danger btn-sm';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => borrarCategoria(cat.id_categoria));

    tdAcciones.append(btnVer, btnEditar, btnEliminar);
    tr.append(tdId, tdDescripcion, tdAcciones);
    tbody.appendChild(tr);
  });
}

// READ: pide una categoría y la muestra en el modal de detalle
async function verCategoria(id) {
  try {
    const cat = await obtenerCategoria(id);
    document.getElementById('ver-cat-id').textContent = `#${cat.id_categoria}`;
    document.getElementById('ver-cat-descripcion').textContent = cat.descripcion;
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
