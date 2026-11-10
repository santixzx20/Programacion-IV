import { Router } from 'express';
import { login, me, actualizarAvatar } from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validarLogin } from '../middlewares/validar.middleware.js';
import { subirAvatar } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/login', validarLogin, login);
router.get('/me', autenticar, me);
router.post('/avatar', autenticar, subirAvatar.single('avatar'), actualizarAvatar);

export default router;
