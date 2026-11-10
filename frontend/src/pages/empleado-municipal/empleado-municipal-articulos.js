import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { listarArticulos } from '../../api.js';
import { escaparHTML } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(1);
if (!usuario) await new Promise(() => {});

async function cargarArticulos() {
  const tbody = document.getElementById('tabla-articulos-consulta');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">Cargando...</td></tr>`;

  try {
    const articulos = await listarArticulos();
    if (!articulos.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No hay artículos registrados.</td></tr>`;
      return;
    }
    tbody.innerHTML = articulos.map((art) => `
      <tr>
        <td class="ps-3 fw-bold">#${art.id_articulo}</td>
        <td class="fw-medium">${escaparHTML(art.descripcion)}</td>
        <td><span class="badge bg-secondary">${escaparHTML(art.categoria)}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">${escaparHTML(error.message)}</td></tr>`;
  }
}

cargarArticulos();
