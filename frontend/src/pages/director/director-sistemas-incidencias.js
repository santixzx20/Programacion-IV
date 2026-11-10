import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import {
  listarIncidencias, cancelarIncidencia, asignarIncidencia, listarUsuarios,
} from '../../api.js';
import { badgeEstado, alerta, filaMensaje } from '../../ui.js';
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
    filaMensaje(tbody, 7, 'No hay incidencias registradas.');
    return;
  }

  tbody.textContent = '';

  incidencias.forEach((inc) => {
    const cerrada = inc.estado === 'Finalizada' || inc.estado === 'Cancelada';
    const cancelable = inc.estado === 'Pendiente';
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

    const tdAsignacion = document.createElement('td');
    tdAsignacion.className = 'text-center';

    const divAsignado = document.createElement('div');
    divAsignado.className = 'small text-muted mb-1';
    divAsignado.textContent = inc.asignado_a_nombre || 'Sin asignar';

    const btnAsignar = document.createElement('button');
    btnAsignar.className = 'btn btn-outline-primary btn-sm';
    btnAsignar.disabled = cerrada;

    const iconoAsignar = document.createElement('i');
    iconoAsignar.className = 'bi bi-person-plus me-1';
    btnAsignar.append(iconoAsignar, inc.asignado_a ? 'Reasignar' : 'Asignar');
    btnAsignar.addEventListener('click', () => abrirAsignar(inc.id_incidencia));

    tdAsignacion.append(divAsignado, btnAsignar);

    const tdAccion = document.createElement('td');
    tdAccion.className = 'text-end pe-3';

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'btn btn-outline-danger btn-sm';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.disabled = !cancelable;
    btnCancelar.addEventListener('click', () => cancelar(inc.id_incidencia));

    tdAccion.appendChild(btnCancelar);

    tr.append(tdId, tdArticulo, tdDescripcion, tdPrioridad, tdEstado, tdAsignacion, tdAccion);
    tbody.appendChild(tr);
  });
}

async function cargarDatos() {
  try {
    [incidencias, empleados] = await Promise.all([
      listarIncidencias(),
      listarUsuarios({ rol: 2 }),
    ]);

    const selectUsuario = document.getElementById('asignar-usuario');
    selectUsuario.textContent = '';

    const optInicial = document.createElement('option');
    optInicial.value = '';
    optInicial.disabled = true;
    optInicial.selected = true;
    optInicial.textContent = 'Seleccione un empleado...';
    selectUsuario.appendChild(optInicial);

    empleados.forEach((u) => {
      const option = document.createElement('option');
      option.value = u.id_usuario;
      option.textContent = `${u.apellidos}, ${u.nombres}`;
      selectUsuario.appendChild(option);
    });

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
