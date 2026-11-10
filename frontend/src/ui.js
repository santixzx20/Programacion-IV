// Utilidades compartidas por las pantallas

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

  contenedor.textContent = '';

  const div = document.createElement('div');
  div.className = `alert alert-${tipo} alert-dismissible fade show`;
  div.role = 'alert';
  div.textContent = mensaje;

  const botonCerrar = document.createElement('button');
  botonCerrar.type = 'button';
  botonCerrar.className = 'btn-close';
  botonCerrar.setAttribute('data-bs-dismiss', 'alert');

  div.appendChild(botonCerrar);
  contenedor.appendChild(div);
}

// Muestra una fila con un mensaje centrado en una tabla (ej: cargando, error o sin datos)
export function filaMensaje(tbody, columnas, texto, claseColor = 'text-muted') {
  tbody.textContent = '';

  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = columnas;
  td.className = `text-center ${claseColor} py-4`;
  td.textContent = texto;

  tr.appendChild(td);
  tbody.appendChild(tr);
}
