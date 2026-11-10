import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { obtenerResumen, descargarReporte } from '../../api.js';
import { escaparHTML, formatearFecha } from '../../ui.js';
import { requerirSesion } from '../../auth.js';

const usuario = requerirSesion(3);
if (!usuario) await new Promise(() => {});

const main = document.getElementById('contenido-dashboard');

function tarjeta(titulo, valor, clase) {
  return `
    <div class="col">
      <div class="card border-0 shadow-sm ${clase} p-3 h-100">
        <div class="fs-6 text-uppercase fw-semibold">${titulo}</div>
        <div class="display-6 fw-bold">${valor}</div>
      </div>
    </div>
  `;
}

function renderizar(datos) {
  main.innerHTML = `
    <div class="mb-4">
      <h2 class="h3 mb-0" style="color: #031926;">Panel de Control (Dashboard)</h2>
      <p class="text-muted small mb-0">Métricas y resumen general de incidencias del municipio</p>
    </div>

    <div class="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-3 mb-4">
      ${tarjeta('Total', datos.total, 'bg-primary text-white')}
      ${tarjeta('Pendientes', datos.pendientes, 'bg-warning text-dark')}
      ${tarjeta('En Proceso', datos.enProceso, 'bg-info text-dark')}
      ${tarjeta('Finalizadas', datos.finalizadas, 'bg-success text-white')}
      ${tarjeta('Canceladas', datos.canceladas, 'bg-danger text-white')}
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 p-3 h-100">
          <h5 class="card-title text-secondary border-bottom pb-2">Incidencias por Fecha</h5>
          <div class="table-responsive">
            <table class="table table-striped table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th class="ps-3">Fecha</th><th class="text-end pe-3">Cantidad</th></tr>
              </thead>
              <tbody>
                ${datos.porFecha.map((f) => `
                  <tr><td class="ps-3">${f.fecha}</td><td class="text-end pe-3 fw-bold">${f.total}</td></tr>
                `).join('') || '<tr><td colspan="2" class="text-center text-muted py-4">Sin datos.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm border-0 p-3 h-100">
          <h5 class="card-title text-secondary border-bottom pb-2">Incidencias Prioritarias (Alta)</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th class="ps-3">#</th><th>Artículo</th><th>Estado</th><th class="text-end pe-3">Creada</th></tr>
              </thead>
              <tbody>
                ${datos.prioritarias.map((p) => `
                  <tr>
                    <td class="ps-3 fw-bold">#${p.id_incidencia}</td>
                    <td>${escaparHTML(p.articulo)}</td>
                    <td><span class="badge bg-light text-dark border">${escaparHTML(p.estado)}</span></td>
                    <td class="text-end pe-3 small text-muted">${formatearFecha(p.creado)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="text-center text-muted py-4">No hay incidencias prioritarias abiertas.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 p-3 mt-3">
      <h5 class="card-title text-secondary border-bottom pb-2">Reportes en PDF</h5>
      <p class="text-muted small mb-2">Descargá el listado de incidencias en formato PDF.</p>
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small fw-bold" for="reporte-estado">Estado</label>
          <select id="reporte-estado" class="form-select form-select-sm">
            <option value="">Todas las incidencias</option>
            ${datos.porEstado.map((e) => `<option value="${e.id_estado}">${escaparHTML(e.descripcion)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-3">
          <button id="btn-reporte" class="btn btn-outline-primary btn-sm w-100">
            <i class="bi bi-file-earmark-pdf"></i> Descargar PDF
          </button>
        </div>
      </div>
      <div id="error-reporte" class="text-danger small mt-2"></div>
    </div>
  `;

  document.getElementById('btn-reporte').addEventListener('click', async () => {
    const error = document.getElementById('error-reporte');
    error.textContent = '';
    try {
      await descargarReporte({ estado: document.getElementById('reporte-estado').value });
    } catch (e) {
      error.textContent = e.message;
    }
  });
}

async function cargarDashboard() {
  main.innerHTML = `<div class="text-center text-muted py-5">Cargando dashboard...</div>`;
  try {
    renderizar(await obtenerResumen());
  } catch (error) {
    main.innerHTML = `<div class="alert alert-danger">${escaparHTML(error.message)}</div>`;
  }
}

cargarDashboard();
