import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { listarIncidencias, finalizarIncidencia } from '../../api.js';
import { badgeEstado, alerta, filaMensaje } from '../../ui.js';
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
    filaMensaje(tbody, 6, 'No tenés incidencias asignadas con ese filtro.');
    return;
  }

  tbody.textContent = '';

  incidencias.forEach((inc) => {
    const cerrada = inc.estado === 'Finalizada' || inc.estado === 'Cancelada';
    const tr = document.createElement('tr');

    const tdId = document.createElement('td');
    tdId.className = 'ps-3 fw-bold';
    tdId.textContent = `#${inc.id_incidencia}`;

    const tdArticulo = document.createElement('td');
    tdArticulo.textContent = inc.articulo;

    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = inc.descripcion_pedido;

    const tdPrioridad = document.createElement('td');
    const badgePrioridad = document.createElement('span');
    badgePrioridad.className = 'badge bg-light text-dark border';
    badgePrioridad.textContent = inc.prioridad_texto;
    tdPrioridad.appendChild(badgePrioridad);

    const tdEstado = document.createElement('td');
    const spanEstado = document.createElement('span');
    spanEstado.className = `badge ${badgeEstado(inc.estado)}`;
    spanEstado.textContent = inc.estado;
    tdEstado.appendChild(spanEstado);

    const tdAccion = document.createElement('td');
    tdAccion.className = 'text-end pe-3';

    const btnFinalizar = document.createElement('button');
    btnFinalizar.className = 'btn btn-success btn-sm';
    btnFinalizar.disabled = cerrada;

    const icono = document.createElement('i');
    icono.className = 'bi bi-check2-circle me-1';
    btnFinalizar.append(icono, 'Finalizar');

    btnFinalizar.addEventListener('click', () => finalizar(inc.id_incidencia));

    tdAccion.appendChild(btnFinalizar);
    tr.append(tdId, tdArticulo, tdDescripcion, tdPrioridad, tdEstado, tdAccion);
    tbody.appendChild(tr);
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
