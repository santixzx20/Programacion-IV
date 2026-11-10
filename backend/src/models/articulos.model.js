import { pool } from '../db.js';

const SELECT = `
  SELECT a.id_articulo, a.id_area, a.id_categoria, a.descripcion, a.activo,
         ar.descripcion AS area, c.descripcion AS categoria
  FROM articulos a
  JOIN areas ar ON ar.id_area = a.id_area
  JOIN categorias c ON c.id_categoria = a.id_categoria
`;

export const listarActivos = async ({ id_area, id_categoria } = {}) => {
  const condiciones = ['a.activo = 1'];
  const valores = [];

  if (id_area) { valores.push(id_area); condiciones.push(`a.id_area = $${valores.length}`); }
  if (id_categoria) { valores.push(id_categoria); condiciones.push(`a.id_categoria = $${valores.length}`); }

  const { rows } = await pool.query(
    `${SELECT} WHERE ${condiciones.join(' AND ')} ORDER BY a.descripcion`,
    valores
  );
  return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `${SELECT} WHERE a.id_articulo = $1 AND a.activo = 1`,
    [id]
  );
  return rows[0];
};

export const crear = async ({ id_area, id_categoria, descripcion }) => {
  const { rows } = await pool.query(
    `INSERT INTO articulos (id_area, id_categoria, descripcion, activo)
     VALUES ($1, $2, $3, 1) RETURNING id_articulo`,
    [id_area, id_categoria, descripcion]
  );
  return buscarPorId(rows[0].id_articulo);
};

export const actualizar = async (id, { id_area, id_categoria, descripcion }) => {
  const { rowCount } = await pool.query(
    `UPDATE articulos SET id_area = $1, id_categoria = $2, descripcion = $3
     WHERE id_articulo = $4 AND activo = 1`,
    [id_area, id_categoria, descripcion, id]
  );
  return rowCount ? buscarPorId(id) : undefined;
};

// Borrado lógico
export const eliminar = async (id) => {
  const { rowCount } = await pool.query(
    `UPDATE articulos SET activo = 0 WHERE id_articulo = $1 AND activo = 1`,
    [id]
  );
  return rowCount > 0;
};
