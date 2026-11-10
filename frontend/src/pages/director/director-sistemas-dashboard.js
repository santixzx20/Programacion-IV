import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { obtenerResumen, descargarReporte } from '../../api.js';
import { formatearFecha, alerta, filaMensaje } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(3);
if (!usuario) await new Promise(() => {});

function renderizar(datos) {
  // Actualizar las 5 tarjetas métricas
  document.getElementById('metrica-total').textContent = datos.total;
  document.getElementById('metrica-pendientes').textContent = datos.pendientes;
  document.getElementById('metrica-proceso').textContent = datos.enProceso;
  document.getElementById('metrica-finalizadas').textContent = datos.finalizadas;
  document.getElementById('metrica-canceladas').textContent = datos.canceladas;

  // Tabla de incidencias por fecha
  const tbodyFechas = document.getElementById('tabla-fechas');
  if (!datos.porFecha.length) {
    filaMensaje(tbodyFechas, 2, 'Sin datos.');
  } else {
    tbodyFechas.textContent = '';
    datos.porFecha.forEach((f) => {
      const tr = document.createElement('tr');

      const tdFecha = document.createElement('td');
      tdFecha.className = 'ps-3';
      tdFecha.textContent = f.fecha;

      const tdCantidad = document.createElement('td');
      tdCantidad.className = 'text-end pe-3 fw-bold';
      tdCantidad.textContent = f.total;

      tr.append(tdFecha, tdCantidad);
      tbodyFechas.appendChild(tr);
    });
  }

  // Tabla de incidencias prioritarias
  const tbodyPrioritarias = document.getElementById('tabla-prioritarias');
  if (!datos.prioritarias.length) {
    filaMensaje(tbodyPrioritarias, 4, 'No hay incidencias prioritarias abiertas.');
  } else {
    tbodyPrioritarias.textContent = '';
    datos.prioritarias.forEach((p) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.className = 'ps-3 fw-bold';
      tdId.textContent = `#${p.id_incidencia}`;

      const tdArticulo = document.createElement('td');
      tdArticulo.textContent = p.articulo;

      const tdEstado = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'badge bg-light text-dark border';
      badge.textContent = p.estado;
      tdEstado.appendChild(badge);

      const tdCreada = document.createElement('td');
      tdCreada.className = 'text-end pe-3 small text-muted';
      tdCreada.textContent = formatearFecha(p.creado);

      tr.append(tdId, tdArticulo, tdEstado, tdCreada);
      tbodyPrioritarias.appendChild(tr);
    });
  }

  // Cargar opciones del select de estados para el reporte PDF
  const selectEstado = document.getElementById('reporte-estado');
  selectEstado.textContent = '';

  const optTodas = document.createElement('option');
  optTodas.value = '';
  optTodas.textContent = 'Todas las incidencias';
  selectEstado.appendChild(optTodas);

  datos.porEstado.forEach((e) => {
    const option = document.createElement('option');
    option.value = e.id_estado;
    option.textContent = e.descripcion;
    selectEstado.appendChild(option);
  });
}

document.getElementById('btn-reporte').addEventListener('click', async () => {
  const error = document.getElementById('error-reporte');
  error.textContent = '';
  try {
    await descargarReporte({ estado: document.getElementById('reporte-estado').value });
  } catch (e) {
    error.textContent = e.message;
  }
});

async function cargarDashboard() {
  try {
    renderizar(await obtenerResumen());
  } catch (error) {
    alerta('alerta-dashboard', error.message, 'danger');
  }
}

cargarDashboard();
