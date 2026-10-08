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
    estado: "Proceso",
    asignado: true
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
  }
];

let filtroEstado = "todos";

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
  const tbody = document.getElementById('tabla-sistemas');
  if (!tbody) return;

  let lista = incidencias.filter(i => i.asignado === true);
  if (filtroEstado !== 'todos') {
    lista = lista.filter(i => i.estado === filtroEstado);
  }

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron incidencias con el filtro aplicado.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(inc => `
    <tr>
      <td class="ps-3 fw-bold">#${inc.id_incidencia}</td>
      <td>${inc.articulo}</td>
      <td>${inc.descripcion_pedido}</td>
      <td><span class="badge bg-light text-dark border">${inc.prioridad}</span></td>
      <td><span class="badge ${obtenerBadgeEstado(inc.estado)}">${inc.estado}</span></td>
      <td class="text-end pe-3">
        <button class="btn btn-success btn-sm btn-finalizar" data-id="${inc.id_incidencia}" ${inc.estado === 'Finalizada' ? 'disabled' : ''}>
          <i class="bi bi-check2-circle"></i> Finalizar
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-finalizar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('button').dataset.id);
      const inc = incidencias.find(i => i.id_incidencia === id);
      if (inc) {
        inc.estado = 'Finalizada';
        renderizarTabla();
      }
    });
  });
}

document.getElementById('filtro-estado').addEventListener('change', (e) => {
  filtroEstado = e.target.value;
  renderizarTabla();
});

renderizarTabla();