import '../../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

// Datos en memoria simulados (luego se reemplazarán con fetch a la API)
let categorias = [
  { id_categoria: 1, descripcion: "Hardware e Insumos", activo: 1 },
  { id_categoria: 2, descripcion: "Software y Sistemas", activo: 1 },
  { id_categoria: 3, descripcion: "Redes y Comunicaciones", activo: 1 }
];

function renderizarTabla() {
  const tbody = document.getElementById('tabla-categorias');
  if (!tbody) return;

  // Filtramos para mostrar únicamente las activas (soft delete)
  tbody.innerHTML = categorias.filter(c => c.activo === 1).map(cat => `
    <tr>
      <td class="ps-3 fw-bold">#${cat.id_categoria}</td>
      <td>${cat.descripcion}</td>
      <td class="text-end pe-3">
        <button class="btn btn-outline-secondary btn-sm btn-edit me-1" data-id="${cat.id_categoria}">
          Editar
        </button>
        <button class="btn btn-outline-danger btn-sm btn-del" data-id="${cat.id_categoria}">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  // Editar categoría
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const cat = categorias.find(c => c.id_categoria === id);
      const nuevo = prompt("Modificar nombre de la categoría:", cat.descripcion);
      if (nuevo && nuevo.trim() !== "") {
        cat.descripcion = nuevo.trim();
        renderizarTabla();
      }
    });
  });

  // Eliminar categoría (Soft Delete: cambia activo a 0)
  document.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const cat = categorias.find(c => c.id_categoria === id);
      if (cat) {
        cat.activo = 0;
        renderizarTabla();
      }
    });
  });
}

// Agregar categoría desde el modal
document.getElementById('form-cat').addEventListener('submit', (e) => {
  e.preventDefault();

  categorias.push({
    id_categoria: categorias.length + 1,
    descripcion: document.getElementById('cat-nombre').value,
    activo: 1
  });

  const modalEl = document.getElementById('modalCat');
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();

  e.target.reset();
  renderizarTabla();
});

renderizarTabla();