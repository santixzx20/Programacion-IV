import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validarLogin } from '../middlewares/validar.middleware.js';

const router = Router();

router.post('/login', validarLogin, login);
router.get('/me', autenticar, me);

export default router;
