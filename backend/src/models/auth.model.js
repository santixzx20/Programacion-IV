import { pool } from '../db.js';

const SELECT = `
  SELECT u.id_usuario, u.id_area, u.nombres, u.apellidos, u.usuario,
         u.contrasenia, u.avatar, u.rol, u.activo, a.descripcion AS area
  FROM usuarios u
  JOIN areas a ON a.id_area = u.id_area
`;

export const buscarPorUsuario = async (usuario) => {
  const { rows } = await pool.query(`${SELECT} WHERE u.usuario = $1 AND u.activo = 1`, [usuario]);
  return rows[0];
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(`${SELECT} WHERE u.id_usuario = $1 AND u.activo = 1`, [id]);
  return rows[0];
};

export const actualizarAvatar = async (id_usuario, avatar) => {
  const { rows } = await pool.query(
    `UPDATE usuarios SET avatar = $1 WHERE id_usuario = $2 AND activo = 1 RETURNING avatar`,
    [avatar, id_usuario]
  );
  return rows[0];
};
