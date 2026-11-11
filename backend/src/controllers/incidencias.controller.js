import * as Incidencias from '../models/incidencias.model.js';
import { avisarCambioEstado } from '../services/mail.service.js';

const aEntero = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const responderError = (res, resultado, mensajeExito) => {
  if (resultado.error === 'no_encontrada') {
    return res.status(404).json({ mensaje: 'Incidencia no encontrada' });
  }
  if (resultado.error === 'sin_asignar') {
    return res.status(409).json({ mensaje: 'La incidencia todavía no está asignada' });
  }
  if (resultado.error === 'estado') {
    return res.status(409).json({ mensaje: 'La incidencia no está en un estado que permita esa acción' });
  }
  return res.json({ mensaje: mensajeExito });
};

const puedeVer = (incidencia, usuario) => (
  usuario.rol === 3
  || (usuario.rol === 1 && incidencia.creado_por === usuario.id_usuario)
  || (usuario.rol === 2 && incidencia.asignado_a === usuario.id_usuario)
);

// BROWSE: cada rol ve sólo lo que le corresponde
export const listar = async (req, res) => {
  const filtros = {};
  for (const campo of ['id_estado', 'prioridad', 'id_area']) {
    const valor = aEntero(req.query[campo]);
    if (valor) filtros[campo] = valor;
  }
  if (req.query.desde) filtros.desde = req.query.desde;
  if (req.query.hasta) filtros.hasta = req.query.hasta;

  if (req.usuario.rol === 1) filtros.creado_por = req.usuario.id_usuario;
  if (req.usuario.rol === 2) filtros.asignado_a = req.usuario.id_usuario;

  res.json(await Incidencias.listar(filtros));
};

// READ
export const obtener = async (req, res) => {
  const incidencia = await Incidencias.buscarPorId(Number(req.params.id));
  if (!incidencia) return res.status(404).json({ mensaje: 'Incidencia no encontrada' });
  if (!puedeVer(incidencia, req.usuario)) {
    return res.status(403).json({ mensaje: 'No tenés permisos para ver esta incidencia' });
  }
  res.json(incidencia);
};

// ADD (Empleado Municipal)
export const crear = async (req, res) => {
  const { id_articulo, prioridad = 2, descripcion_pedido } = req.body ?? {};

  if (!aEntero(id_articulo)) return res.status(400).json({ mensaje: 'El artículo es obligatorio' });
  if (![1, 2, 3].includes(Number(prioridad))) {
    return res.status(400).json({ mensaje: 'La prioridad debe ser 1 (Baja), 2 (Media) o 3 (Alta)' });
  }
  if (!descripcion_pedido?.trim()) {
    return res.status(400).json({ mensaje: 'La descripción del pedido es obligatoria' });
  }
  if (descripcion_pedido.trim().length > 1000) {
    return res.status(400).json({ mensaje: 'La descripción no puede superar los 1000 caracteres' });
  }
  if (!(await Incidencias.articuloActivo(Number(id_articulo)))) {
    return res.status(400).json({ mensaje: 'El artículo no existe o está inactivo' });
  }

  const incidencia = await Incidencias.crear({
    id_articulo: Number(id_articulo),
    creado_por: req.usuario.id_usuario,
    prioridad: Number(prioridad),
    descripcion_pedido: descripcion_pedido.trim(),
    imagen: req.file ? `/uploads/incidencias/${req.file.filename}` : null,
  });
  res.status(201).json(incidencia);
};

// Cancelar: empleado dueño (sólo Pendiente) o Director
export const cancelar = async (req, res) => {
  const id = Number(req.params.id);
  const incidencia = await Incidencias.buscarPorId(id);
  if (!incidencia) return res.status(404).json({ mensaje: 'Incidencia no encontrada' });
  if (req.usuario.rol === 1 && incidencia.creado_por !== req.usuario.id_usuario) {
    return res.status(403).json({ mensaje: 'Sólo podés cancelar tus propias incidencias' });
  }

  const resultado = await Incidencias.cancelar(id);
  if (resultado.ok) {
    const actualizada = await Incidencias.buscarPorId(id);
    avisarCambioEstado(actualizada, 'cancelada').catch((e) => console.error('Correo:', e.message));
  }
  responderError(res, resultado, 'Incidencia cancelada');
};

// Asignar (Director)
export const asignar = async (req, res) => {
  const asignado_a = aEntero(req.body?.asignado_a);
  if (!asignado_a) return res.status(400).json({ mensaje: 'El empleado asignado es obligatorio' });
  if (!(await Incidencias.usuarioSistemasActivo(asignado_a))) {
    return res.status(400).json({ mensaje: 'El usuario no es un empleado de Sistemas activo' });
  }

  const resultado = await Incidencias.asignar(Number(req.params.id), asignado_a);
  responderError(res, resultado, 'Incidencia asignada');
};

// Finalizar (Empleado de Sistemas asignado)
export const finalizar = async (req, res) => {
  const id = Number(req.params.id);
  const descripcion_resolucion = req.body?.descripcion_resolucion?.trim();
  if (!descripcion_resolucion) {
    return res.status(400).json({ mensaje: 'La descripción de la resolución es obligatoria' });
  }
  if (descripcion_resolucion.length > 1000) {
    return res.status(400).json({ mensaje: 'La resolución no puede superar los 1000 caracteres' });
  }

  const incidencia = await Incidencias.buscarPorId(id);
  if (!incidencia) return res.status(404).json({ mensaje: 'Incidencia no encontrada' });
  if (incidencia.asignado_a !== req.usuario.id_usuario) {
    return res.status(403).json({ mensaje: 'Sólo podés finalizar las incidencias asignadas a vos' });
  }

  const resultado = await Incidencias.finalizar(id, descripcion_resolucion);
  if (resultado.ok) {
    const actualizada = await Incidencias.buscarPorId(id);
    avisarCambioEstado(actualizada, 'finalizada').catch((e) => console.error('Correo:', e.message));
  }
  responderError(res, resultado, 'Incidencia finalizada');
};
