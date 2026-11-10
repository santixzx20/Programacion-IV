import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarIncidencias, cancelarIncidencia, asignarIncidencia, listarUsuarios,
} from '../../api.js';
import { escaparHTML, badgeEstado, alerta } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(3);
if (!usuario) await new Promise(() => {});

const modalAsignar = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAsignar'));
const formAsignar = document.getElementById('form-asignar');
let incidencias = [];
let empleados = [];

function renderizarTabla() {
  const tbody = document.getElementById('tabla-director-incidencias');
  if (!tbody) return;

  if (!incidencias.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay incidencias registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = incidencias.map((inc) => {
    const cerrada = inc.estado === 'Finalizada' || inc.estado === 'Cancelada';
    const cancelable = inc.estado === 'Pendiente';
    return `
      <tr>
        <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
        <td>${escaparHTML(inc.articulo)}</td>
        <td>${escaparHTML(inc.descripcion_pedido)}</td>
        <td><span class="badge bg-light text-dark border">${escaparHTML(inc.prioridad_texto)}</span></td>
        <td><span class="badge ${badgeEstado(inc.estado)}">${escaparHTML(inc.estado)}</span></td>
        <td class="text-center">
          <div class="small text-muted mb-1">${escaparHTML(inc.asignado_a_nombre || 'Sin asignar')}</div>
          <button class="btn btn-outline-primary btn-sm btn-asignar" data-id="${inc.id_incidencia}" ${cerrada ? 'disabled' : ''}>
            <i class="bi bi-person-plus"></i> ${inc.asignado_a ? 'Reasignar' : 'Asignar'}
          </button>
        </td>
        <td class="text-end pe-3">
          <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${inc.id_incidencia}" ${cancelable ? '' : 'disabled'}>
            Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-asignar').forEach((btn) => {
    btn.addEventListener('click', () => abrirAsignar(Number(btn.dataset.id)));
  });
  document.querySelectorAll('.btn-cancelar').forEach((btn) => {
    btn.addEventListener('click', () => cancelar(Number(btn.dataset.id)));
  });
}

async function cargarDatos() {
  try {
    [incidencias, empleados] = await Promise.all([
      listarIncidencias(),
      listarUsuarios({ rol: 2 }),
    ]);
    document.getElementById('asignar-usuario').innerHTML =
      `<option value="" disabled selected>Seleccione un empleado...</option>` +
      empleados.map((u) => `<option value="${u.id_usuario}">${escaparHTML(`${u.apellidos}, ${u.nombres}`)}</option>`).join('');
    renderizarTabla();
  } catch (error) {
    alerta('alerta-dir', error.message, 'danger');
  }
}

function abrirAsignar(id) {
  document.getElementById('asignar-id').value = id;
  document.getElementById('asignar-usuario').value = '';
  document.getElementById('error-form-asignar').textContent = '';
  modalAsignar.show();
}

async function cancelar(id) {
  if (!confirm(`¿Cancelar la incidencia #${id}?`)) return;
  try {
    await cancelarIncidencia(id);
    alerta('alerta-dir', `Incidencia #${id} cancelada`);
    cargarDatos();
  } catch (error) {
    alerta('alerta-dir', error.message, 'danger');
  }
}

formAsignar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('asignar-id').value);
  const asignado_a = Number(document.getElementById('asignar-usuario').value);

  try {
    await asignarIncidencia(id, asignado_a);
    modalAsignar.hide();
    alerta('alerta-dir', `Incidencia #${id} asignada`);
    cargarDatos();
  } catch (error) {
    document.getElementById('error-form-asignar').textContent = error.message;
  }
});

cargarDatos();
