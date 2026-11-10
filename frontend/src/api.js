// ==========================================================
// Conexión con el backend: todas las llamadas a la API
// ==========================================================
import { tokenActual, limpiarSesion } from './auth.js';

const URL_API = 'http://localhost:3000/api/v1';

// Envía el pedido y devuelve el JSON de la respuesta.
// Si el backend responde con error, lanza un Error con su mensaje.
async function pedir(ruta, opciones = {}) {
  const headers = { ...(opciones.headers || {}) };
  if (tokenActual()) headers.Authorization = `Bearer ${tokenActual()}`;

  let respuesta;
  try {
    respuesta = await fetch(URL_API + ruta, { ...opciones, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  const datos = await respuesta.json().catch(() => null);

  // Token vencido o inválido: se cierra la sesión y se vuelve al login
  if (respuesta.status === 401 && tokenActual()) {
    limpiarSesion();
    location.replace('/index.html');
    throw new Error('La sesión venció. Volvé a ingresar.');
  }

  if (!respuesta.ok) {
    throw new Error(datos?.mensaje || 'Ocurrió un error');
  }
  return datos;
}

const conBody = (method, datos) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos),
});

// Arma ?clave=valor&... salteando los filtros vacíos
const query = (filtros = {}) => {
  const qs = new URLSearchParams(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? `?${qs}` : '';
};

// ---------------- Sesión ----------------
export const iniciarSesion = (usuario, contrasenia) =>
  pedir('/auth/login', conBody('POST', { usuario, contrasenia }));

// ---------------- Categorías ----------------
export const listarCategorias = () => pedir('/categorias');
export const obtenerCategoria = (id) => pedir(`/categorias/${id}`);
export const crearCategoria = (descripcion) => pedir('/categorias', conBody('POST', { descripcion }));
export const editarCategoria = (id, descripcion) => pedir(`/categorias/${id}`, conBody('PUT', { descripcion }));
export const eliminarCategoria = (id) => pedir(`/categorias/${id}`, { method: 'DELETE' });

// ---------------- Artículos ----------------
export const listarArticulos = (filtros) => pedir(`/articulos${query(filtros)}`);
export const obtenerArticulo = (id) => pedir(`/articulos/${id}`);
export const crearArticulo = (datos) => pedir('/articulos', conBody('POST', datos));
export const editarArticulo = (id, datos) => pedir(`/articulos/${id}`, conBody('PUT', datos));
export const eliminarArticulo = (id) => pedir(`/articulos/${id}`, { method: 'DELETE' });

// ---------------- Incidencias ----------------
export const listarIncidencias = (filtros) => pedir(`/incidencias${query(filtros)}`);
export const obtenerIncidencia = (id) => pedir(`/incidencias/${id}`);
export const crearIncidencia = (datos) => pedir('/incidencias', conBody('POST', datos));
export const cancelarIncidencia = (id) => pedir(`/incidencias/${id}/cancelar`, { method: 'PATCH' });
export const asignarIncidencia = (id, asignado_a) =>
  pedir(`/incidencias/${id}/asignar`, conBody('PATCH', { asignado_a }));
export const finalizarIncidencia = (id, descripcion_resolucion) =>
  pedir(`/incidencias/${id}/finalizar`, conBody('PATCH', { descripcion_resolucion }));

// ---------------- Dashboard y catálogos ----------------
export const obtenerResumen = () => pedir('/dashboard/resumen');
export const listarAreas = () => pedir('/areas');
export const listarEstados = () => pedir('/estados');
export const listarUsuarios = (filtros) => pedir(`/usuarios${query(filtros)}`);

// ---------------- Reportes ----------------
export async function descargarReporte(filtros = {}) {
  const respuesta = await fetch(`${URL_API}/reportes/incidencias.pdf${query(filtros)}`, {
    headers: { Authorization: `Bearer ${tokenActual()}` },
  });
  if (!respuesta.ok) throw new Error('No se pudo generar el reporte');

  const blob = await respuesta.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'reporte-incidencias.pdf';
  enlace.click();
  URL.revokeObjectURL(url);
}
