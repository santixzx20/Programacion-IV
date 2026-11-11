import { Router } from 'express';
import {
  listar, obtener, crear, cancelar, asignar, finalizar,
} from '../controllers/incidencias.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { subirImagen } from '../middlewares/upload.middleware.js';
import {
  validarCrearIncidencia,
  validarAsignarIncidencia,
  validarFinalizarIncidencia,
} from '../middlewares/validar.middleware.js';

const router = Router();

router.get('/', autenticar, listar);
router.get('/:id', autenticar, obtener);
router.post('/', autenticar, autorizar(1), subirImagen.single('imagen'), validarCrearIncidencia, crear);
router.patch('/:id/cancelar', autenticar, autorizar(1, 3), cancelar);
router.patch('/:id/asignar', autenticar, autorizar(3), validarAsignarIncidencia, asignar);
router.patch('/:id/finalizar', autenticar, autorizar(2), validarFinalizarIncidencia, finalizar);

export default router;
