import * as Categorias from '../models/categorias.model.js';

const NO_ENCONTRADA = { mensaje: 'Categoría no encontrada' };

const validarDescripcion = (descripcion) => {
  if (!descripcion?.trim()) return 'La descripción es obligatoria';
  if (descripcion.length > 255) return 'La descripción no puede superar los 255 caracteres';
  return null;
};

// BROWSE
export const listar = async (req, res) => {
  res.json(await Categorias.listarActivas());
};

// READ
export const obtener = async (req, res) => {
  const categoria = await Categorias.buscarPorId(Number(req.params.id));
  if (!categoria) return res.status(404).json(NO_ENCONTRADA);
  res.json(categoria);
};

// ADD
export const crear = async (req, res) => {
  const { descripcion } = req.body ?? {};
  const error = validarDescripcion(descripcion);
  if (error) return res.status(400).json({ mensaje: error });

  res.status(201).json(await Categorias.crear(descripcion.trim()));
};

// EDIT
export const actualizar = async (req, res) => {
  const { descripcion } = req.body ?? {};
  const error = validarDescripcion(descripcion);
  if (error) return res.status(400).json({ mensaje: error });

  const categoria = await Categorias.actualizar(Number(req.params.id), descripcion.trim());
  if (!categoria) return res.status(404).json(NO_ENCONTRADA);
  res.json(categoria);
};

// DELETE (lógico)
export const eliminar = async (req, res) => {
  const categoria = await Categorias.eliminar(Number(req.params.id));
  if (!categoria) return res.status(404).json(NO_ENCONTRADA);
  res.json({ mensaje: 'Categoría eliminada lógicamente' });
};
