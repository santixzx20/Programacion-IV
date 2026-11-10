import { Router } from 'express';
import { reporteIncidencias } from '../controllers/reportes.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/incidencias.pdf', autenticar, autorizar(3), reporteIncidencias);

export default router;
