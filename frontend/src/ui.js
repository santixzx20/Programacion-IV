// Utilidades compartidas por las pantallas

// Evita que un texto escrito por el usuario se interprete como HTML
export function escaparHTML(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Clase de Bootstrap según el estado de la incidencia
export function badgeEstado(estado) {
  switch (estado) {
    case 'Pendiente': return 'bg-warning text-dark';
    case 'En Proceso': return 'bg-info text-dark';
    case 'Finalizada': return 'bg-success';
    case 'Cancelada': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

export function formatearFecha(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

// Mensaje de alerta reutilizable
export function alerta(contenedorId, mensaje, tipo = 'success') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${escaparHTML(mensaje)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}
