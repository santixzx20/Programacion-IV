import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Auth from '../models/auth.model.js';

const datosPublicos = (u) => ({
  id_usuario: u.id_usuario,
  nombres: u.nombres,
  apellidos: u.apellidos,
  usuario: u.usuario,
  avatar: u.avatar,
  rol: u.rol,
  id_area: u.id_area,
  area: u.area,
});

const firmarToken = (u) => jwt.sign(
  { sub: u.id_usuario, rol: u.rol, id_area: u.id_area },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);

export const login = async (req, res) => {
  const { usuario, contrasenia } = req.body ?? {};
  if (!usuario?.trim() || !contrasenia) {
    return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
  }

  const encontrado = await Auth.buscarPorUsuario(usuario.trim());
  // Mismo mensaje para usuario inexistente y contraseña incorrecta
  if (!encontrado || !(await bcrypt.compare(contrasenia, encontrado.contrasenia))) {
    return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
  }

  res.json({ token: firmarToken(encontrado), usuario: datosPublicos(encontrado) });
};

export const me = async (req, res) => {
  res.json(datosPublicos(req.usuario));
};

export const actualizarAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'Tenés que seleccionar un archivo de imagen' });
  }

  const rutaAvatar = `/uploads/avatars/${req.file.filename}`;
  await Auth.actualizarAvatar(req.usuario.id_usuario, rutaAvatar);

  res.json({
    mensaje: 'Avatar actualizado correctamente',
    avatar: rutaAvatar,
  });
};
