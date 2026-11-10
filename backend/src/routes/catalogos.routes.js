import { Router } from 'express';
import { areas, estados, usuarios } from '../controllers/catalogos.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/areas', autenticar, areas);
router.get('/estados', autenticar, estados);
router.get('/usuarios', autenticar, autorizar(3), usuarios);

export default router;
