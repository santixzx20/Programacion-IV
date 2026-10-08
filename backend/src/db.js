import pg from 'pg';
import 'dotenv/config';

// Pool: reutiliza conexiones en vez de abrir una nueva por cada consulta
export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
