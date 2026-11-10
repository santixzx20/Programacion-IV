import { pool } from '../db.js';

export const listarActivas = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM categorias WHERE activo = 1 ORDER BY descripcion`
  );
  return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM categorias WHERE id_categoria = $1 AND activo = 1`,
    [id]
  );
  return rows[0];
};

export const crear = async (descripcion) => {
  const { rows } = await pool.query(
    `INSERT INTO categorias (descripcion, activo) VALUES ($1, 1) RETURNING *`,
    [descripcion]
  );
  return rows[0];
};

export const actualizar = async (id, descripcion) => {
  const { rows } = await pool.query(
    `UPDATE categorias SET descripcion = $1
     WHERE id_categoria = $2 AND activo = 1
     RETURNING *`,
    [descripcion, id]
  );
  return rows[0];
};

// Borrado lógico: no se elimina la fila, se marca como inactiva
export const eliminar = async (id) => {
  const { rows } = await pool.query(
    `UPDATE categorias SET activo = 0
     WHERE id_categoria = $1 AND activo = 1
     RETURNING *`,
    [id]
  );
  return rows[0];
};
