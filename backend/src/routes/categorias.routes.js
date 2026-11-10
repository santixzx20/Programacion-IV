import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/categorias.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { validarCategoria } from '../middlewares/validar.middleware.js';

const router = Router();

// BREAD de categorías: exclusivo del área de Sistemas
router.use(autenticar, autorizar(2));

/**
 * @openapi
 * /api/categorias:
 *   get:
 *     tags: [Categorías]
 *     summary: Lista todas las categorías activas
 *     responses:
 *       200:
 *         description: Listado de categorías activas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 *       500:
 *         $ref: '#/components/responses/ErrorInterno'
 */
router.get('/', listar);

/**
 * @openapi
 * /api/categorias/{id}:
 *   get:
 *     tags: [Categorías]
 *     summary: Obtiene una categoría por su ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdCategoria'
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorInterno'
 */
router.get('/:id', obtener);

/**
 * @openapi
 * /api/categorias:
 *   post:
 *     tags: [Categorías]
 *     summary: Crea una categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaEntrada'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       500:
 *         $ref: '#/components/responses/ErrorInterno'
 */
router.post('/', validarCategoria, crear);

/**
 * @openapi
 * /api/categorias/{id}:
 *   put:
 *     tags: [Categorías]
 *     summary: Actualiza la descripción de una categoría
 *     parameters:
 *       - $ref: '#/components/parameters/IdCategoria'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaEntrada'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         $ref: '#/components/responses/ErrorValidacion'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorInterno'
 */
router.put('/:id', validarCategoria, actualizar);

/**
 * @openapi
 * /api/categorias/{id}:
 *   delete:
 *     tags: [Categorías]
 *     summary: Elimina lógicamente una categoría (activo = 0)
 *     parameters:
 *       - $ref: '#/components/parameters/IdCategoria'
 *     responses:
 *       200:
 *         description: Categoría eliminada lógicamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *       500:
 *         $ref: '#/components/responses/ErrorInterno'
 */
router.delete('/:id', eliminar);

export default router;
