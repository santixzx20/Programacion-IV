import { Router } from 'express';
import { resumen } from '../controllers/dashboard.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/resumen', autenticar, autorizar(3), resumen);

export default router;
