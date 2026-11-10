import { pool } from '../db.js';

const SELECT = `
  SELECT i.id_incidencia, i.id_articulo, art.descripcion AS articulo,
         i.id_estado, e.descripcion AS estado,
         i.creado_por, (uc.nombres || ' ' || uc.apellidos) AS creado_por_nombre,
         uc.usuario AS creado_por_email,
         i.asignado_a, (ua.nombres || ' ' || ua.apellidos) AS asignado_a_nombre,
         i.creado, i.prioridad,
         CASE i.prioridad WHEN 1 THEN 'Baja' WHEN 2 THEN 'Media' ELSE 'Alta' END AS prioridad_texto,
         i.descripcion_pedido, i.descripcion_resolucion
  FROM incidencias i
  JOIN articulos art ON art.id_articulo = i.id_articulo
  JOIN estados e ON e.id_estado = i.id_estado
  JOIN usuarios uc ON uc.id_usuario = i.creado_por
  LEFT JOIN usuarios ua ON ua.id_usuario = i.asignado_a
`;

const conTransaccion = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const listar = async (filtros = {}) => {
  const condiciones = [];
  const valores = [];
  const agregar = (sql, valor) => { valores.push(valor); condiciones.push(sql.replace('?', `$${valores.length}`)); };

  if (filtros.id_estado) agregar('i.id_estado = ?', filtros.id_estado);
  if (filtros.prioridad) agregar('i.prioridad = ?', filtros.prioridad);
  if (filtros.creado_por) agregar('i.creado_por = ?', filtros.creado_por);
  if (filtros.asignado_a) agregar('i.asignado_a = ?', filtros.asignado_a);
  if (filtros.id_area) agregar('art.id_area = ?', filtros.id_area);
  if (filtros.sin_asignar === true) condiciones.push('i.asignado_a IS NULL');
  if (filtros.desde) agregar('i.creado >= ?', filtros.desde);
  if (filtros.hasta) agregar('i.creado <= ?', filtros.hasta);

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const { rows } = await pool.query(`${SELECT} ${where} ORDER BY i.creado DESC`, valores);
  return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(`${SELECT} WHERE i.id_incidencia = $1`, [id]);
  if (!rows[0]) return undefined;

  const historial = await pool.query(
    `SELECT h.id_pedidos_estados, h.id_estado, e.descripcion AS estado, h.fecha_hora_estado
     FROM incidencias_estados h
     JOIN estados e ON e.id_estado = h.id_estado
     WHERE h.id_incidencia = $1
     ORDER BY h.fecha_hora_estado`,
    [id]
  );
  return { ...rows[0], historial: historial.rows };
};

export const crear = async ({ id_articulo, creado_por, prioridad, descripcion_pedido }) => {
  const id = await conTransaccion(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO incidencias (id_articulo, id_estado, creado_por, prioridad, descripcion_pedido)
       VALUES ($1, 1, $2, $3, $4) RETURNING id_incidencia`,
      [id_articulo, creado_por, prioridad, descripcion_pedido]
    );
    await client.query(
      `INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, 1)`,
      [rows[0].id_incidencia]
    );
    return rows[0].id_incidencia;
  });
  return buscarPorId(id);
};

export const articuloActivo = async (id) => {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM articulos WHERE id_articulo = $1 AND activo = 1`,
    [id]
  );
  return rowCount > 0;
};

export const usuarioSistemasActivo = async (id) => {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM usuarios WHERE id_usuario = $1 AND rol = 2 AND activo = 1`,
    [id]
  );
  return rowCount > 0;
};

export const cancelar = (id) =>
  conTransaccion(async (client) => {
    const { rows } = await client.query(
      `SELECT id_estado FROM incidencias WHERE id_incidencia = $1 FOR UPDATE`,
      [id]
    );
    if (!rows[0]) return { error: 'no_encontrada' };
    if (rows[0].id_estado !== 1) return { error: 'estado' };

    await client.query(`UPDATE incidencias SET id_estado = 4 WHERE id_incidencia = $1`, [id]);
    await client.query(`INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, 4)`, [id]);
    return { ok: true };
  });

export const asignar = (id, asignado_a) =>
  conTransaccion(async (client) => {
    const { rows } = await client.query(
      `SELECT id_estado FROM incidencias WHERE id_incidencia = $1 FOR UPDATE`,
      [id]
    );
    if (!rows[0]) return { error: 'no_encontrada' };
    if ([3, 4].includes(rows[0].id_estado)) return { error: 'estado' };

    await client.query(`UPDATE incidencias SET asignado_a = $2 WHERE id_incidencia = $1`, [id, asignado_a]);
    if (rows[0].id_estado === 1) {
      await client.query(`UPDATE incidencias SET id_estado = 2 WHERE id_incidencia = $1`, [id]);
      await client.query(`INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, 2)`, [id]);
    }
    return { ok: true };
  });

export const finalizar = (id, descripcion_resolucion) =>
  conTransaccion(async (client) => {
    const { rows } = await client.query(
      `SELECT id_estado, asignado_a FROM incidencias WHERE id_incidencia = $1 FOR UPDATE`,
      [id]
    );
    if (!rows[0]) return { error: 'no_encontrada' };
    if (!rows[0].asignado_a) return { error: 'sin_asignar' };
    if ([3, 4].includes(rows[0].id_estado)) return { error: 'estado' };

    await client.query(
      `UPDATE incidencias SET id_estado = 3, descripcion_resolucion = $2 WHERE id_incidencia = $1`,
      [id, descripcion_resolucion]
    );
    await client.query(`INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, 3)`, [id]);
    return { ok: true };
  });
