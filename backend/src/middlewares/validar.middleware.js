import { body, validationResult } from 'express-validator';

// Revisa si alguna regla de express-validator falló y devuelve 400 con el primer mensaje
export const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: errores.array()[0].msg });
  }
  next();
};

export const validarLogin = [
  body('usuario')
    .trim()
    .notEmpty()
    .withMessage('Usuario y contraseña son obligatorios'),
  body('contrasenia')
    .notEmpty()
    .withMessage('Usuario y contraseña son obligatorios'),
  validarCampos,
];

export const validarCategoria = [
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres'),
  validarCampos,
];

export const validarArticulo = [
  body('id_area')
    .isInt({ min: 1 })
    .withMessage('El área es obligatoria'),
  body('id_categoria')
    .isInt({ min: 1 })
    .withMessage('La categoría es obligatoria'),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres'),
  validarCampos,
];

export const validarCrearIncidencia = [
  body('id_articulo')
    .isInt({ min: 1 })
    .withMessage('El artículo es obligatorio'),
  body('prioridad')
    .optional()
    .isInt()
    .toInt()
    .isIn([1, 2, 3])
    .withMessage('La prioridad debe ser 1 (Baja), 2 (Media) o 3 (Alta)'),
  body('descripcion_pedido')
    .trim()
    .notEmpty()
    .withMessage('La descripción del pedido es obligatoria')
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede superar los 1000 caracteres'),
  validarCampos,
];

export const validarAsignarIncidencia = [
  body('asignado_a')
    .isInt({ min: 1 })
    .withMessage('El empleado asignado es obligatorio'),
  validarCampos,
];

export const validarFinalizarIncidencia = [
  body('descripcion_resolucion')
    .trim()
    .notEmpty()
    .withMessage('La descripción de la resolución es obligatoria')
    .isLength({ max: 1000 })
    .withMessage('La resolución no puede superar los 1000 caracteres'),
  validarCampos,
];
