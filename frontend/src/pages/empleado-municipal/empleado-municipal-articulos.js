import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { listarArticulos } from '../../api.js';
import { filaMensaje } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(1);
if (!usuario) await new Promise(() => {});

async function cargarArticulos() {
  const tbody = document.getElementById('tabla-articulos-consulta');
  if (!tbody) return;

  filaMensaje(tbody, 3, 'Cargando...');

  try {
    const articulos = await listarArticulos();
    if (!articulos.length) {
      filaMensaje(tbody, 3, 'No hay artículos registrados.');
      return;
    }

    tbody.textContent = '';

    articulos.forEach((art) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.className = 'ps-3 fw-bold';
      tdId.textContent = `#${art.id_articulo}`;

      const tdDescripcion = document.createElement('td');
      tdDescripcion.className = 'fw-medium';
      tdDescripcion.textContent = art.descripcion;

      const tdCategoria = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'badge bg-secondary';
      badge.textContent = art.categoria;
      tdCategoria.appendChild(badge);

      tr.append(tdId, tdDescripcion, tdCategoria);
      tbody.appendChild(tr);
    });
  } catch (error) {
    filaMensaje(tbody, 3, error.message, 'text-danger');
  }
}

cargarArticulos();
