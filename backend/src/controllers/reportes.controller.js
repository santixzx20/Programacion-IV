import * as Incidencias from '../models/incidencias.model.js';
import { generarReporte } from '../services/reporte.service.js';

export const reporteIncidencias = async (req, res) => {
  const filtros = {};
  if (req.query.estado) filtros.id_estado = Number(req.query.estado);
  if (req.query.desde) filtros.desde = req.query.desde;
  if (req.query.hasta) filtros.hasta = req.query.hasta;

  const datos = await Incidencias.listar(filtros);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte-incidencias.pdf"');
  generarReporte(datos).pipe(res);
};
