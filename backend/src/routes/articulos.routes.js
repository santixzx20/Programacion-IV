import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/articulos.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validarArticulo } from '../middlewares/validar.middleware.js';

const router = Router();

// Cualquier usuario autenticado puede consultar; sólo Sistemas modifica
router.get('/', autenticar, listar);
router.get('/:id', autenticar, obtener);
router.post('/', autenticar, autorizar(2), validarArticulo, crear);
router.put('/:id', autenticar, autorizar(2), validarArticulo, actualizar);
router.delete('/:id', autenticar, autorizar(2), eliminar);

export default router;
