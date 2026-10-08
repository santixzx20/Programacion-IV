import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

let incidencias = [
  {
    id_incidencia: 1,
    articulo: "Impresora HP LaserJet",
    descripcion_pedido: "No toma las hojas de la bandeja 1",
    prioridad: "Media",
    estado: "Pendiente"
  },
  {
    id_incidencia: 2,
    articulo: "Monitor Dell 24",
    descripcion_pedido: "Parpadea y se apaga a los 10 minutos",
    prioridad: "Alta",
    estado: "Proceso"
  }
];

function obtenerBadgeEstado(estado) {
  switch (estado) {
    case 'Pendiente': return 'bg-warning text-dark';
    case 'Proceso': return 'bg-info text-dark';
    case 'Finalizada': return 'bg-success';
    case 'Cancelada': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function renderizarTabla() {
  const tbody = document.getElementById('tabla-mis-incidencias');
  if (!tbody) return;

  tbody.innerHTML = incidencias.map(inc => {
    // Solo se permite cancelar si el estado es 'Pendiente'
    const esCancelable = inc.estado === 'Pendiente';

    return `
      <tr>
        <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
        <td>${inc.articulo}</td>
        <td>${inc.descripcion_pedido}</td>
        <td><span class="badge bg-light text-dark border">${inc.prioridad}</span></td>
        <td><span class="badge ${obtenerBadgeEstado(inc.estado)}">${inc.estado}</span></td>
        <td class="text-end pe-3">
          <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${inc.id_incidencia}" ${!esCancelable ? 'disabled' : ''}>
            Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const inc = incidencias.find(i => i.id_incidencia === id);
      if (inc && inc.estado === 'Pendiente') {
        inc.estado = 'Cancelada';
        renderizarTabla();
      }
    });
  });
}

// Envío del modal para registrar incidencia
document.getElementById('form-nueva-incidencia').addEventListener('submit', (e) => {
  e.preventDefault();

  incidencias.push({
    id_incidencia: incidencias.length + 1,
    articulo: document.getElementById('select-articulo').value,
    descripcion_pedido: document.getElementById('input-descripcion').value,
    prioridad: document.getElementById('select-prioridad').value,
    estado: 'Pendiente'
  });

  const modalEl = document.getElementById('modalNuevaIncidencia');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
  e.target.reset();
  renderizarTabla();
});

renderizarTabla();