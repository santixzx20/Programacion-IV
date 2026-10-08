import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

let articulos = [
  { id_articulo: 1, descripcion: "Impresora HP LaserJet", categoria: "Hardware e Insumos" },
  { id_articulo: 2, descripcion: "Monitor Dell 24", categoria: "Hardware e Insumos" },
  { id_articulo: 3, descripcion: "Sistema de Expedientes", categoria: "Software y Sistemas" },
  { id_articulo: 4, descripcion: "Switch Cisco 24 Bocas", categoria: "Redes y Comunicaciones" }
];

function renderizarArticulos() {
  const tbody = document.getElementById('tabla-articulos-consulta');
  if (!tbody) return;

  tbody.innerHTML = articulos.map(art => `
    <tr>
      <td class="ps-3 fw-bold">#${art.id_articulo}</td>
      <td class="fw-medium">${art.descripcion}</td>
      <td><span class="badge bg-secondary">${art.categoria}</span></td>
    </tr>
  `).join('');
}

renderizarArticulos();