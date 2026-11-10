import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarArticulos, crearArticulo, editarArticulo, eliminarArticulo,
  listarCategorias, listarAreas,
} from '../../api.js';
import { alerta, filaMensaje } from '../../ui.js';
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
    filaMensaje(tbody, 5, 'No hay artículos registrados.');
    return;
  }

  tbody.textContent = '';

  articulos.forEach((art) => {
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.className = 'ps-3 fw-bold';
    tdId.textContent = `#${art.id_articulo}`;

    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = art.descripcion;

    const tdArea = document.createElement('td');
    const badgeArea = document.createElement('span');
    badgeArea.className = 'badge bg-light text-dark border';
    badgeArea.textContent = art.area;
    tdArea.appendChild(badgeArea);

    const tdCategoria = document.createElement('td');
    const badgeCategoria = document.createElement('span');
    badgeCategoria.className = 'badge bg-secondary';
    badgeCategoria.textContent = art.categoria;
    tdCategoria.appendChild(badgeCategoria);

    const tdAcciones = document.createElement('td');
    tdAcciones.className = 'text-end pe-3';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-outline-secondary btn-sm me-1';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirModal(art));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-outline-danger btn-sm';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => borrar(art.id_articulo));

    tdAcciones.append(btnEditar, btnEliminar);
    tr.append(tdId, tdDescripcion, tdArea, tdCategoria, tdAcciones);
    tbody.appendChild(tr);
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

    const selectCat = document.getElementById('art-cat');
    selectCat.textContent = '';
    const optCatInicial = document.createElement('option');
    optCatInicial.value = '';
    optCatInicial.disabled = true;
    optCatInicial.selected = true;
    optCatInicial.textContent = 'Seleccione una categoría...';
    selectCat.appendChild(optCatInicial);

    categorias.forEach((c) => {
      const option = document.createElement('option');
      option.value = c.id_categoria;
      option.textContent = c.descripcion;
      selectCat.appendChild(option);
    });

    const selectArea = document.getElementById('art-area');
    selectArea.textContent = '';
    const optAreaInicial = document.createElement('option');
    optAreaInicial.value = '';
    optAreaInicial.disabled = true;
    optAreaInicial.selected = true;
    optAreaInicial.textContent = 'Seleccione un área...';
    selectArea.appendChild(optAreaInicial);

    areas.forEach((a) => {
      const option = document.createElement('option');
      option.value = a.id_area;
      option.textContent = a.descripcion;
      selectArea.appendChild(option);
    });
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
