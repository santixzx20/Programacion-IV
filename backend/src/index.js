import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';

import swaggerSpec from './config/swagger.js';
import categoriasRoutes from './routes/categorias.routes.js';
import articulosRoutes from './routes/articulos.routes.js';
import incidenciasRoutes from './routes/incidencias.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import authRoutes from './routes/auth.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

const app = express();

app.use(cors());
app.use(morgan('dev')); // registra cada solicitud HTTP en la consola
app.use(express.json()); // permite leer el body en formato JSON
app.use('/uploads', express.static('uploads')); // sirve los avatares subidos con multer
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Documentación Swagger

const apiRouter = express.Router();
apiRouter.use('/categorias', categoriasRoutes);
apiRouter.use('/articulos', articulosRoutes);
apiRouter.use('/incidencias', incidenciasRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/reportes', reportesRoutes);
apiRouter.use('/', catalogosRoutes); // /areas, /estados, /usuarios

// Versionado de la API REST (/api/v1) manteniendo también /api por compatibilidad
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Cualquier ruta que no exista responde 404 (en vez de quedar colgada)
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

// Manejo de errores: Express 5 envía acá los errores de las funciones async
app.use((err, req, res, next) => {
  console.error(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }
  // Errores de carga de archivos (Multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ mensaje: 'El archivo supera el tamaño máximo de 2 MB' });
  }
  if (err.message === 'Solo se permiten imágenes JPG, PNG o WEBP') {
    return res.status(400).json({ mensaje: err.message });
  }
  // Códigos de error de PostgreSQL
  if (err.code === '23503') return res.status(400).json({ mensaje: 'Referencia inexistente (área, categoría o usuario)' });
  if (err.code === '23505') return res.status(409).json({ mensaje: 'El registro ya existe' });
  if (err.code === '23502') return res.status(400).json({ mensaje: 'Falta un dato obligatorio' });
  if (err.code === '22P02') return res.status(400).json({ mensaje: 'Formato de dato inválido' });

  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
