import jwt from 'jsonwebtoken';
import { buscarPorId } from '../models/auth.model.js';

export const autenticar = async (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await buscarPorId(payload.sub);
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario inexistente o inactivo' });
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o vencido' });
  }
};

export const autorizar = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tenés permisos para esta acción' });
  }
  next();
};
