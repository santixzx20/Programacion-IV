import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

let incidencias = [
  { id_incidencia: 1, articulo: "Impresora HP LaserJet", estado: "Pendiente", prioridad: "Media", fecha: "2026-10-05" },
  { id_incidencia: 2, articulo: "Monitor Dell 24", estado: "Proceso", prioridad: "Alta", fecha: "2026-10-06" },
  { id_incidencia: 3, articulo: "Switch Cisco 24 Bocas", estado: "Finalizada", prioridad: "Alta", fecha: "2026-10-07" },
  { id_incidencia: 4, articulo: "Teclado USB Genérico", estado: "Cancelada", prioridad: "Baja", fecha: "2026-10-07" }
];

const main = document.getElementById('contenido-dashboard');

function renderizarDashboard() {
  const total = incidencias.length;
  const pendientes = incidencias.filter(i => i.estado === 'Pendiente').length;
  const canceladas = incidencias.filter(i => i.estado === 'Cancelada').length;
  const prioritarias = incidencias.filter(i => i.prioridad === 'Alta').length;

  // Agrupamiento por fecha
  const conteoFechas = {};
  incidencias.forEach(i => {
    conteoFechas[i.fecha] = (conteoFechas[i.fecha] || 0) + 1;
  });

  main.innerHTML = `
    <div class="mb-4">
      <h2 class="h3 mb-0" style="color: #031926;">Panel de Control (Dashboard)</h2>
      <p class="text-muted small mb-0">Métricas y resumen general de incidencias del municipio</p>
    </div>

    <!-- TARJETAS MÉTRICAS -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white p-3">
          <div class="fs-6 text-uppercase fw-semibold">Total Incidencias</div>
          <div class="display-6 fw-bold">${total}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark p-3">
          <div class="fs-6 text-uppercase fw-semibold">Pendientes</div>
          <div class="display-6 fw-bold">${pendientes}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white p-3">
          <div class="fs-6 text-uppercase fw-semibold">Canceladas</div>
          <div class="display-6 fw-bold">${canceladas}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-dark text-white p-3">
          <div class="fs-6 text-uppercase fw-semibold">Prioritarias (Alta)</div>
          <div class="display-6 fw-bold">${prioritarias}</div>
        </div>
      </div>
    </div>

    <!-- TOTALES POR FECHA Y REPORTES PDF -->
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card shadow-sm border-0 p-3 h-100">
          <h5 class="card-title text-secondary border-bottom pb-2">Totales de Incidencias por Fecha</h5>
          <div class="table-responsive">
            <table class="table table-striped table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-3">Fecha</th>
                  <th class="text-end pe-3">Cantidad de Incidencias</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(conteoFechas).map(f => `
                  <tr>
                    <td class="ps-3">${f}</td>
                    <td class="text-end pe-3 fw-bold">${conteoFechas[f]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm border-0 p-3 h-100">
          <h5 class="card-title text-secondary border-bottom pb-2">Generar Reportes Estadísticos (PDF)</h5>
          <p class="text-muted small">Descargar informe detallado por estado de incidencia:</p>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-warning text-dark text-start" onclick="alert('Descargando Reporte PDF: Incidencias Pendientes...')">
              <i class="bi bi-file-earmark-pdf me-2"></i> Reporte: Incidencias Pendientes
            </button>
            <button class="btn btn-outline-info text-dark text-start" onclick="alert('Descargando Reporte PDF: Incidencias En Proceso...')">
              <i class="bi bi-file-earmark-pdf me-2"></i> Reporte: Incidencias En Proceso
            </button>
            <button class="btn btn-outline-success text-start" onclick="alert('Descargando Reporte PDF: Incidencias Finalizadas...')">
              <i class="bi bi-file-earmark-pdf me-2"></i> Reporte: Incidencias Finalizadas
            </button>
            <button class="btn btn-outline-danger text-start" onclick="alert('Descargando Reporte PDF: Incidencias Canceladas...')">
              <i class="bi bi-file-earmark-pdf me-2"></i> Reporte: Incidencias Canceladas
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

renderizarDashboard();