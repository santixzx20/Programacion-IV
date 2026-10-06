// ==========================================
// 1. IMPORTACIONES
// ==========================================
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

// ==========================================
// 2. DATOS EN MEMORIA (MOCK DATA)
// ==========================================
let incidencias = [
  {
    id_incidencia: 1,
    articulo: "Impresora HP LaserJet",
    descripcion_pedido: "No toma las hojas de la bandeja 1",
    prioridad: "Media",
    estado: "pendiente"
  },
  {
    id_incidencia: 2,
    articulo: "Monitor Dell 24",
    descripcion_pedido: "Parpadea y se apaga a los 10 minutos",
    prioridad: "Alta",
    estado: "en proceso"
  }
];

const articulosDisponibles = [
  "Impresora HP LaserJet",
  "Monitor Dell 24",
  "PC de Escritorio Banghó",
  "Teclado Genius USB",
  "Switch de Red 8 Bocas"
];

// ==========================================
// 3. REFERENCIAS GLOBALES AL DOM
// ==========================================
const main = document.getElementById('contenido-principal');
const nav = document.getElementById('menu-lista');

// ==========================================
// 4. FUNCIONES DE VISTAS Y TABLAS
// ==========================================

// Dibuja las filas de la tabla según el estado del array 'incidencias'
function renderizarTablaIncidencias() {
  const tbody = document.getElementById('tabla-cuerpo-incidencias');
  if (!tbody) return;

  if (incidencias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">No hay incidencias registradas.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = incidencias.map(inc => {
    let badgeColor = 'bg-secondary';
    if (inc.estado === 'pendiente') badgeColor = 'bg-warning text-dark';
    if (inc.estado === 'en proceso') badgeColor = 'bg-info text-dark';
    if (inc.estado === 'finalizada') badgeColor = 'bg-success';
    if (inc.estado === 'cancelada') badgeColor = 'bg-danger';

    // Regla de negocio: sólo se cancela si está 'pendiente'
    const esCancelable = inc.estado === 'pendiente';

    return `
      <tr>
        <td class="fw-bold">#${inc.id_incidencia}</td>
        <td>${inc.articulo}</td>
        <td>${inc.descripcion_pedido}</td>
        <td><span class="badge bg-light text-dark border">${inc.prioridad}</span></td>
        <td><span class="badge ${badgeColor}">${inc.estado}</span></td>
        <td class="text-end">
          <button 
            class="btn btn-outline-danger btn-sm btn-cancelar" 
            data-id="${inc.id_incidencia}" 
            ${!esCancelable ? 'disabled' : ''}>
            Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Evento a cada botón de cancelar generado
  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      cancelarIncidencia(id);
    });
  });
}

// Acción de cancelación
function cancelarIncidencia(id) {
  const item = incidencias.find(i => i.id_incidencia === id);
  if (item && item.estado === 'pendiente') {
    item.estado = 'cancelada';
    renderizarTablaIncidencias();
  }
}

// Escucha el submit del modal para agregar la incidencia
function activarFormularioIncidencia() {
  const form = document.getElementById('form-nueva-incidencia');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const articulo = document.getElementById('select-articulo').value;
    const prioridad = document.getElementById('select-prioridad').value;
    const descripcion = document.getElementById('input-descripcion').value;

    const nuevaIncidencia = {
      id_incidencia: incidencias.length + 1,
      articulo: articulo,
      descripcion_pedido: descripcion,
      prioridad: prioridad,
      estado: 'pendiente'
    };

    incidencias.push(nuevaIncidencia);

    // Cerrar el modal con la instancia de Bootstrap
    const modalElemento = document.getElementById('modalNuevaIncidencia');
    const modalInstancia = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modalInstancia.hide();

    // Resetear campos
    form.reset();

    // Redibujar filas
    renderizarTablaIncidencias();
  });
}

// Carga la estructura completa de la vista de Incidencias en el <main>
function cargarVistaIncidencias() {
  main.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-0">Mis Incidencias</h2>
        <p class="text-muted small mb-0">Listado y seguimiento de fallas reportadas</p>
      </div>
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalNuevaIncidencia">
        + Nueva Incidencia
      </button>
    </div>

    <!-- TABLA DE INCIDENCIAS -->
    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th># ID</th>
              <th>Artículo</th>
              <th>Descripción</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th class="text-end pe-3">Acción</th>
            </tr>
          </thead>
          <tbody id="tabla-cuerpo-incidencias">
            <!-- Filas dinámicas -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE BOOTSTRAP -->
    <div class="modal fade" id="modalNuevaIncidencia" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Registrar Nueva Incidencia</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <form id="form-nueva-incidencia">
            <div class="modal-body">
              
              <div class="mb-3">
                <label for="select-articulo" class="form-label">Artículo afectado</label>
                <select id="select-articulo" class="form-select" required>
                  <option value="" disabled selected>Seleccione un artículo...</option>
                  ${articulosDisponibles.map(art => `<option value="${art}">${art}</option>`).join('')}
                </select>
              </div>

              <div class="mb-3">
                <label for="select-prioridad" class="form-label">Prioridad</label>
                <select id="select-prioridad" class="form-select" required>
                  <option value="Baja">Baja</option>
                  <option value="Media" selected>Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="input-descripcion" class="form-label">Descripción de la falla</label>
                <textarea id="input-descripcion" class="form-control" rows="3" placeholder="Detalle el problema presentado..." required></textarea>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Incidencia</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Inicializar tabla y formulario ahora que existen en el DOM
  renderizarTablaIncidencias();
  activarFormularioIncidencia();
}

// ==========================================
// 5. NAVEGACIÓN Y MENÚS
// ==========================================

// Menú del Empleado Municipal
function cargarMenuEmpleado() {
  nav.innerHTML = `
    <li><a href="#" id="link-emp-incidencias">Mis Incidencias</a></li>
    <li><a href="#" id="link-emp-articulos">Artículos</a></li>
    <li><a href="#" id="link-emp-salir" class="text-danger">← Volver / Salir</a></li>
  `;

  // Carga directamente la vista de incidencias como inicio del empleado
  cargarVistaIncidencias();

  document.getElementById('link-emp-incidencias').addEventListener('click', (e) => {
    e.preventDefault();
    cargarVistaIncidencias();
  });

  document.getElementById('link-emp-articulos').addEventListener('click', (e) => {
    e.preventDefault();
    main.innerHTML = `
      <h2>Listado de Artículos</h2>
      <p class="text-muted">Catálogo de artículos registrados en el municipio.</p>
      <ul class="list-group">
        ${articulosDisponibles.map(art => `<li class="list-group-item">${art}</li>`).join('')}
      </ul>
    `;
  });

  document.getElementById('link-emp-salir').addEventListener('click', (e) => {
    e.preventDefault();
    cargarMenuPrincipal();
  });
}

// Menú principal de Roles
function cargarMenuPrincipal() {
  nav.innerHTML = `
    <li><a href="#" id="link-empleado">Empleado Municipal</a></li>
    <li><a href="#" id="link-sistemas">Area de Sistemas</a></li>
    <li><a href="#" id="link-director">Director</a></li>
  `;

  main.innerHTML = `
    <h2>Panel de Inicio</h2>
    <p>Bienvenido al sistema de registro de incidencias del municipio.</p>
    <p>Selecciona tu rol en el menú lateral para ingresar.</p>
  `;

  document.getElementById('link-empleado').addEventListener('click', (e) => {
    e.preventDefault();
    cargarMenuEmpleado();
  });

  document.getElementById('link-sistemas').addEventListener('click', (e) => {
    e.preventDefault();
    main.innerHTML = `
      <h2>Área de Sistemas</h2>
      <p>Gestión técnica de incidencias, artículos y categorías.</p>
    `;
  });

  document.getElementById('link-director').addEventListener('click', (e) => {
    e.preventDefault();
    main.innerHTML = `
      <h2>Dirección</h2>
      <p>Dashboard de control general y reportes estadísticos.</p>
    `;
  });
}

// ==========================================
// 6. INICIALIZACIÓN DE LA APP
// ==========================================
cargarMenuPrincipal();