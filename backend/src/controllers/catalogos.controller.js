import { pool } from '../db.js';

// Áreas activas (para selects)
export const areas = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id_area, descripcion FROM areas WHERE activo = 1 ORDER BY descripcion`
  );
  res.json(rows);
};

// Estados activos (para filtros)
export const estados = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id_estado, descripcion FROM estados WHERE activo = 1 ORDER BY id_estado`
  );
  res.json(rows);
};

// Usuarios activos, filtrables por rol y área (para asignar incidencias)
export const usuarios = async (req, res) => {
  const condiciones = ['u.activo = 1'];
  const valores = [];
  const agregar = (sql, valor) => { valores.push(valor); condiciones.push(sql.replace('?', `$${valores.length}`)); };

  if (req.query.rol) agregar('u.rol = ?', Number(req.query.rol));
  if (req.query.id_area) agregar('u.id_area = ?', Number(req.query.id_area));

  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.nombres, u.apellidos, u.usuario, u.avatar, u.rol,
            u.id_area, a.descripcion AS area
     FROM usuarios u
     JOIN areas a ON a.id_area = u.id_area
     WHERE ${condiciones.join(' AND ')}
     ORDER BY u.apellidos, u.nombres`,
    valores
  );
  res.json(rows);
};
