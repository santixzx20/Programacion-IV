// ==========================================
// Conexión con el backend: todos los fetch() de categorías
// ==========================================
const URL_API = 'http://localhost:3000/api/categorias';

// Envía el pedido y devuelve el JSON de la respuesta.
// Si el backend responde con error (400, 404, 500), lanza un Error con su mensaje.
async function pedir(url, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, opciones);
  } catch {
    // fetch solo falla así cuando no hay conexión (ej: el backend está apagado)
    throw new Error('No se pudo conectar con el servidor');
  }

  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Ocurrió un error');
  }
  return datos;
}

// Opciones para los pedidos que envían datos (POST y PUT)
const conBody = (method, datos) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos),
});

// BROWSE
export const listarCategorias = () => pedir(URL_API);

// READ
export const obtenerCategoria = (id) => pedir(`${URL_API}/${id}`);

// ADD
export const crearCategoria = (descripcion) =>
  pedir(URL_API, conBody('POST', { descripcion }));

// EDIT
export const editarCategoria = (id, descripcion) =>
  pedir(`${URL_API}/${id}`, conBody('PUT', { descripcion }));

// DELETE
export const eliminarCategoria = (id) =>
  pedir(`${URL_API}/${id}`, { method: 'DELETE' });
