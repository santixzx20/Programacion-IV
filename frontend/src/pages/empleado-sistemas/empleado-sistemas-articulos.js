import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarArticulos, crearArticulo, editarArticulo, eliminarArticulo,
  listarCategorias, listarAreas,
} from '../../api.js';
import { escaparHTML, alerta } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(2);
if (!usuario) await new Promise(() => {});

const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalArt'));
const form = document.getElementById('form-art');
let articulos = [];
let editando = null;

function renderizarTabla() {
  const tbody = document.getElementById('tabla-articulos');
  if (!tbody) return;

  if (!articulos.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay artículos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = articulos.map((art) => `
    <tr>
      <td class="ps-3 fw-bold">#${art.id_articulo}</td>
      <td>${escaparHTML(art.descripcion)}</td>
      <td><span class="badge bg-light text-dark border">${escaparHTML(art.area)}</span></td>
      <td><span class="badge bg-secondary">${escaparHTML(art.categoria)}</span></td>
      <td class="text-end pe-3">
        <button class="btn btn-outline-secondary btn-sm btn-edit-art me-1" data-id="${art.id_articulo}">Editar</button>
        <button class="btn btn-outline-danger btn-sm btn-del-art" data-id="${art.id_articulo}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-edit-art').forEach((btn) => {
    btn.addEventListener('click', () => abrirModal(articulos.find((a) => a.id_articulo === Number(btn.dataset.id))));
  });
  document.querySelectorAll('.btn-del-art').forEach((btn) => {
    btn.addEventListener('click', () => borrar(Number(btn.dataset.id)));
  });
}

async function cargarArticulos() {
  try {
    articulos = await listarArticulos();
    renderizarTabla();
  } catch (error) {
    alerta('alerta-art', error.message, 'danger');
  }
}

async function cargarCatalogos() {
  try {
    const [categorias, areas] = await Promise.all([listarCategorias(), listarAreas()]);
    document.getElementById('art-cat').innerHTML =
      `<option value="" disabled selected>Seleccione una categoría...</option>` +
      categorias.map((c) => `<option value="${c.id_categoria}">${escaparHTML(c.descripcion)}</option>`).join('');
    document.getElementById('art-area').innerHTML =
      `<option value="" disabled selected>Seleccione un área...</option>` +
      areas.map((a) => `<option value="${a.id_area}">${escaparHTML(a.descripcion)}</option>`).join('');
  } catch (error) {
    alerta('alerta-art', error.message, 'danger');
  }
}

function abrirModal(articulo = null) {
  editando = articulo;
  form.reset();
  document.getElementById('error-form-art').textContent = '';
  document.getElementById('art-id').value = articulo?.id_articulo ?? '';
  document.getElementById('titulo-modal-art').textContent = articulo ? 'Editar Artículo' : 'Agregar Artículo';

  if (articulo) {
    document.getElementById('art-nombre').value = articulo.descripcion;
    document.getElementById('art-area').value = articulo.id_area;
    document.getElementById('art-cat').value = articulo.id_categoria;
  }
  modal.show();
}

async function borrar(id) {
  if (!confirm(`¿Eliminar el artículo #${id}?`)) return;
  try {
    await eliminarArticulo(id);
    alerta('alerta-art', 'Artículo eliminado');
    cargarArticulos();
  } catch (error) {
    alerta('alerta-art', error.message, 'danger');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const boton = form.querySelector('button[type="submit"]');
  boton.disabled = true;

  const datos = {
    descripcion: document.getElementById('art-nombre').value.trim(),
    id_area: Number(document.getElementById('art-area').value),
    id_categoria: Number(document.getElementById('art-cat').value),
  };

  try {
    if (editando) {
      await editarArticulo(editando.id_articulo, datos);
    } else {
      await crearArticulo(datos);
    }
    modal.hide();
    alerta('alerta-art', editando ? 'Artículo actualizado' : 'Artículo creado');
    cargarArticulos();
  } catch (error) {
    document.getElementById('error-form-art').textContent = error.message;
  } finally {
    boton.disabled = false;
  }
});

document.getElementById('btn-nuevo-art').addEventListener('click', () => abrirModal());

cargarCatalogos();
cargarArticulos();
