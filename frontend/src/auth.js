// Sesión del usuario guardada en localStorage
const CLAVE = 'gi_sesion';

export function guardarSesion(datos) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}

export function limpiarSesion() {
  localStorage.removeItem(CLAVE);
}

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function usuarioActual() {
  return obtenerSesion()?.usuario ?? null;
}

export function tokenActual() {
  return obtenerSesion()?.token ?? null;
}

// Protege una página: si no hay sesión (o el rol no corresponde) vuelve al login.
export function requerirSesion(...roles) {
  const sesion = obtenerSesion();
  if (!sesion?.token || !sesion?.usuario) {
    location.replace('/index.html');
    return null;
  }
  if (roles.length && !roles.includes(sesion.usuario.rol)) {
    location.replace('/index.html');
    return null;
  }
  return sesion.usuario;
}

export function rutaPorRol(rol) {
  if (rol === 1) return '/src/pages/empleado-municipal/empleado-municipal.html';
  if (rol === 2) return '/src/pages/empleado-sistemas/empleado-sistemas.html';
  return '/src/pages/director/director-sistemas-dashboard.html';
}
