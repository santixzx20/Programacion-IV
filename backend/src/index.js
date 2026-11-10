import express from 'express';
import cors from 'cors';
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
app.use(express.json()); // permite leer el body en formato JSON
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Documentación Swagger

app.use('/api/categorias', categoriasRoutes);
app.use('/api/articulos', articulosRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api', catalogosRoutes); // /api/areas, /api/estados, /api/usuarios

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
  // Códigos de error de PostgreSQL
  if (err.code === '23503') return res.status(400).json({ mensaje: 'Referencia inexistente (área, categoría o usuario)' });
  if (err.code === '23505') return res.status(409).json({ mensaje: 'El registro ya existe' });
  if (err.code === '23502') return res.status(400).json({ mensaje: 'Falta un dato obligatorio' });
  if (err.code === '22P02') return res.status(400).json({ mensaje: 'Formato de dato inválido' });

  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
