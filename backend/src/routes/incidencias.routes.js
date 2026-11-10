import { Router } from 'express';
import {
  listar, obtener, crear, cancelar, asignar, finalizar,
} from '../controllers/incidencias.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', autenticar, listar);
router.get('/:id', autenticar, obtener);
router.post('/', autenticar, autorizar(1), crear);
router.patch('/:id/cancelar', autenticar, autorizar(1, 3), cancelar);
router.patch('/:id/asignar', autenticar, autorizar(3), asignar);
router.patch('/:id/finalizar', autenticar, autorizar(2), finalizar);

export default router;
