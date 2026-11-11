import multer from 'multer';
import path from 'path';
import fs from 'fs';

const CARPETA_IMAGENES = 'uploads/incidencias';

// Asegura que la carpeta exista antes de guardar archivos
fs.mkdirSync(CARPETA_IMAGENES, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CARPETA_IMAGENES);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `incidencia-${req.usuario.id_usuario}-${Date.now()}${extension}`;
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

export const subirImagen = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 MB
});
