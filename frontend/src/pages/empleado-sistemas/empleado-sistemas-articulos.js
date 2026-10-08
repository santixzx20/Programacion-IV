import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

let articulos = [
  { id_articulo: 1, descripcion: "Impresora HP LaserJet", categoria: "Hardware e Insumos", activo: 1 },
  { id_articulo: 2, descripcion: "Monitor Dell 24", categoria: "Hardware e Insumos", activo: 1 },
  { id_articulo: 3, descripcion: "Sistema de Expedientes", categoria: "Software y Sistemas", activo: 1 },
  { id_articulo: 4, descripcion: "Switch Cisco 24 Bocas", categoria: "Redes y Comunicaciones", activo: 1 }
];

function renderizarTabla() {
  const tbody = document.getElementById('tabla-articulos');
  if (!tbody) return;

  tbody.innerHTML = articulos.filter(a => a.activo === 1).map(art => `
    <tr>
      <td class="ps-3 fw-bold">#${art.id_articulo}</td>
      <td>${art.descripcion}</td>
      <td><span class="badge bg-secondary">${art.categoria}</span></td>
      <td class="text-end pe-3">
        <button class="btn btn-outline-secondary btn-sm btn-edit-art me-1" data-id="${art.id_articulo}">
          Editar
        </button>
        <button class="btn btn-outline-danger btn-sm btn-del-art" data-id="${art.id_articulo}">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  // Editar Artículo
  document.querySelectorAll('.btn-edit-art').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const art = articulos.find(a => a.id_articulo === id);
      const nuevo = prompt("Modificar descripción del artículo:", art.descripcion);
      if (nuevo && nuevo.trim() !== "") {
        art.descripcion = nuevo.trim();
        renderizarTabla();
      }
    });
  });

  // Eliminar Artículo (Soft delete)
  document.querySelectorAll('.btn-del-art').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const art = articulos.find(a => a.id_articulo === id);
      if (art) {
        art.activo = 0;
        renderizarTabla();
      }
    });
  });
}

// Agregar Artículo
document.getElementById('form-art').addEventListener('submit', (e) => {
  e.preventDefault();
  articulos.push({
    id_articulo: articulos.length + 1,
    descripcion: document.getElementById('art-nombre').value,
    categoria: document.getElementById('art-cat').value,
    activo: 1
  });

  const modalEl = document.getElementById('modalArt');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
  e.target.reset();
  renderizarTabla();
});

renderizarTabla();