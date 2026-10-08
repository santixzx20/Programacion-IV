import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import categoriasRoutes from './routes/categorias.routes.js';

const app = express();

app.use(cors());
app.use(express.json()); // permite leer el body en formato JSON

app.use('/api/categorias', categoriasRoutes);

// Manejo de errores: Express 5 envía acá los errores de las funciones async
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
