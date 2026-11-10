import * as Articulos from '../models/articulos.model.js';

const aEntero = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const validar = ({ id_area, id_categoria, descripcion }) => {
  if (!aEntero(id_area)) return 'El área es obligatoria';
  if (!aEntero(id_categoria)) return 'La categoría es obligatoria';
  if (!descripcion?.trim()) return 'La descripción es obligatoria';
  if (descripcion.trim().length > 255) return 'La descripción no puede superar los 255 caracteres';
  return null;
};

// BROWSE
export const listar = async (req, res) => {
  const filtros = {
    id_area: aEntero(req.query.id_area) ?? undefined,
    id_categoria: aEntero(req.query.id_categoria) ?? undefined,
  };
  res.json(await Articulos.listarActivos(filtros));
};

// READ
export const obtener = async (req, res) => {
  const articulo = await Articulos.buscarPorId(Number(req.params.id));
  if (!articulo) return res.status(404).json({ mensaje: 'Artículo no encontrado' });
  res.json(articulo);
};

// ADD
export const crear = async (req, res) => {
  const { id_area, id_categoria, descripcion } = req.body ?? {};
  const error = validar({ id_area, id_categoria, descripcion });
  if (error) return res.status(400).json({ mensaje: error });

  const articulo = await Articulos.crear({
    id_area: aEntero(id_area),
    id_categoria: aEntero(id_categoria),
    descripcion: descripcion.trim(),
  });
  res.status(201).json(articulo);
};

// EDIT
export const actualizar = async (req, res) => {
  const { id_area, id_categoria, descripcion } = req.body ?? {};
  const error = validar({ id_area, id_categoria, descripcion });
  if (error) return res.status(400).json({ mensaje: error });

  const articulo = await Articulos.actualizar(Number(req.params.id), {
    id_area: aEntero(id_area),
    id_categoria: aEntero(id_categoria),
    descripcion: descripcion.trim(),
  });
  if (!articulo) return res.status(404).json({ mensaje: 'Artículo no encontrado' });
  res.json(articulo);
};

// DELETE lógico
export const eliminar = async (req, res) => {
  const ok = await Articulos.eliminar(Number(req.params.id));
  if (!ok) return res.status(404).json({ mensaje: 'Artículo no encontrado' });
  res.json({ mensaje: 'Artículo eliminado lógicamente' });
};
