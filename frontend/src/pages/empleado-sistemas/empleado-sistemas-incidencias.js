import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { listarIncidencias, finalizarIncidencia } from '../../api.js';
import { escaparHTML, badgeEstado, alerta } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(2);
if (!usuario) await new Promise(() => {});

const ID_USUARIO = usuario.id_usuario;

let incidencias = [];
let filtroEstado = '';

function renderizarTabla() {
  const tbody = document.getElementById('tabla-sistemas');
  if (!tbody) return;

  if (!incidencias.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No tenés incidencias asignadas con ese filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = incidencias.map((inc) => {
    const cerrada = inc.estado === 'Finalizada' || inc.estado === 'Cancelada';
    return `
      <tr>
        <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
        <td>${escaparHTML(inc.articulo)}</td>
        <td>${escaparHTML(inc.descripcion_pedido)}</td>
        <td><span class="badge bg-light text-dark border">${escaparHTML(inc.prioridad_texto)}</span></td>
        <td><span class="badge ${badgeEstado(inc.estado)}">${escaparHTML(inc.estado)}</span></td>
        <td class="text-end pe-3">
          <button class="btn btn-success btn-sm btn-finalizar" data-id="${inc.id_incidencia}" ${cerrada ? 'disabled' : ''}>
            <i class="bi bi-check2-circle"></i> Finalizar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-finalizar').forEach((btn) => {
    btn.addEventListener('click', () => finalizar(Number(btn.dataset.id)));
  });
}

async function cargarIncidencias() {
  try {
    incidencias = await listarIncidencias({
      asignado_a: ID_USUARIO,
      id_estado: filtroEstado || undefined,
    });
    renderizarTabla();
  } catch (error) {
    alerta('alerta-sis', error.message, 'danger');
  }
}

async function finalizar(id) {
  const resolucion = prompt(`Descripción de la resolución de la incidencia #${id}:`);
  if (resolucion === null) return;
  if (!resolucion.trim()) {
    alerta('alerta-sis', 'Tenés que escribir la resolución', 'warning');
    return;
  }

  try {
    await finalizarIncidencia(id, resolucion.trim());
    alerta('alerta-sis', `Incidencia #${id} finalizada`);
    cargarIncidencias();
  } catch (error) {
    alerta('alerta-sis', error.message, 'danger');
  }
}

document.getElementById('filtro-estado').addEventListener('change', (e) => {
  filtroEstado = e.target.value;
  cargarIncidencias();
});

cargarIncidencias();
