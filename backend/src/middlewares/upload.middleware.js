import multer from 'multer';
import path from 'path';
import fs from 'fs';

const CARPETA_AVATARS = 'uploads/avatars';

// Asegura que la carpeta exista antes de guardar archivos
fs.mkdirSync(CARPETA_AVATARS, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CARPETA_AVATARS);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `avatar-${req.usuario.id_usuario}-${Date.now()}${extension}`;
    cb(null, nombre);
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

export const subirAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 MB
});
