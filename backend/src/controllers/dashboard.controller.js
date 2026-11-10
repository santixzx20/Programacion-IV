import { pool } from '../db.js';

// Panel de resumen del Director de Sistemas
export const resumen = async (req, res) => {
  const [total, porEstado, porFecha, prioritarias] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM incidencias`),
    pool.query(`
      SELECT e.id_estado, e.descripcion, count(i.id_incidencia)::int AS total
      FROM estados e
      LEFT JOIN incidencias i ON i.id_estado = e.id_estado
      WHERE e.activo = 1
      GROUP BY e.id_estado, e.descripcion
      ORDER BY e.id_estado
    `),
    pool.query(`
      SELECT to_char(creado, 'YYYY-MM-DD') AS fecha, count(*)::int AS total
      FROM incidencias
      GROUP BY 1
      ORDER BY 1
    `),
    pool.query(`
      SELECT i.id_incidencia, a.descripcion AS articulo, e.descripcion AS estado,
             i.creado, i.descripcion_pedido,
             (u.nombres || ' ' || u.apellidos) AS creado_por_nombre
      FROM incidencias i
      JOIN articulos a ON a.id_articulo = i.id_articulo
      JOIN estados e ON e.id_estado = i.id_estado
      JOIN usuarios u ON u.id_usuario = i.creado_por
      WHERE i.prioridad = 3 AND i.id_estado IN (1, 2)
      ORDER BY i.creado
    `),
  ]);

  const estados = Object.fromEntries(porEstado.rows.map((e) => [e.descripcion, e.total]));

  res.json({
    total: total.rows[0].total,
    pendientes: estados['Pendiente'] ?? 0,
    enProceso: estados['En Proceso'] ?? 0,
    finalizadas: estados['Finalizada'] ?? 0,
    canceladas: estados['Cancelada'] ?? 0,
    prioritariasTotal: prioritarias.rowCount,
    porEstado: porEstado.rows,
    porFecha: porFecha.rows,
    prioritarias: prioritarias.rows,
  });
};
