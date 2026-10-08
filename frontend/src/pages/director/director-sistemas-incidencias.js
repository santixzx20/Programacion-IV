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
    estado: "Pendiente",
    asignado: false
  },
  {
    id_incidencia: 2,
    articulo: "Monitor Dell 24",
    descripcion_pedido: "Parpadea y se apaga a los 10 minutos",
    prioridad: "Alta",
    estado: "Proceso",
    asignado: true
  },
  {
    id_incidencia: 3,
    articulo: "Switch Cisco 24 Bocas",
    descripcion_pedido: "Sin conexión de red en oficina contable",
    prioridad: "Alta",
    estado: "Finalizada",
    asignado: true
  },
  {
    id_incidencia: 4,
    articulo: "Teclado USB Genérico",
    descripcion_pedido: "Teclas trabadas por derrame de café",
    prioridad: "Baja",
    estado: "Cancelada",
    asignado: false
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
  const tbody = document.getElementById('tabla-director-incidencias');
  if (!tbody) return;

  tbody.innerHTML = incidencias.map(inc => {
    const puedeCancelar = inc.estado === 'Pendiente';

    return `
      <tr>
        <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
        <td>${inc.articulo}</td>
        <td>${inc.descripcion_pedido}</td>
        <td><span class="badge bg-light text-dark border">${inc.prioridad}</span></td>
        <td><span class="badge ${obtenerBadgeEstado(inc.estado)}">${inc.estado}</span></td>
        <td class="text-center">
          <button class="btn btn-outline-primary btn-sm btn-asignar" data-id="${inc.id_incidencia}">
            <i class="bi bi-person-plus"></i> ${inc.asignado ? 'Asignado' : 'Asignar'}
          </button>
        </td>
        <td class="text-end pe-3">
          <button class="btn btn-outline-danger btn-sm btn-cancelar" data-id="${inc.id_incidencia}" ${!puedeCancelar ? 'disabled' : ''}>
            Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Acción de Asignación
  document.querySelectorAll('.btn-asignar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('button').dataset.id);
      const inc = incidencias.find(i => i.id_incidencia === id);
      if (inc) {
        inc.asignado = true;
        if (inc.estado === 'Pendiente') inc.estado = 'Proceso';
        renderizarTabla();
      }
    });
  });

  // Cancelación por parte del Director (solo permitida si está Pendiente)
  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('button').dataset.id);
      const inc = incidencias.find(i => i.id_incidencia === id);
      if (inc && inc.estado === 'Pendiente') {
        inc.estado = 'Cancelada';
        renderizarTabla();
      }
    });
  });
}

renderizarTabla();