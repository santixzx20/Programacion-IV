import swaggerJsdoc from 'swagger-jsdoc';
import { paths, schemas } from './openapi.js';

// Toda la documentación está definida en ./openapi.js (rutas + esquemas).
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestor de Incidencias',
      version: '1.0.0',
      description:
        'API REST del sistema de gestión y control de incidencias informáticas del municipio de Concordia. ' +
        'Autenticación con JWT: iniciá sesión en /api/auth/login y enviá el token como "Bearer" en el botón Authorize.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    tags: [
      { name: 'Autenticación', description: 'Login y datos del usuario' },
      { name: 'Categorías', description: 'BREAD de categorías de artículos' },
      { name: 'Artículos', description: 'BREAD de artículos' },
      { name: 'Incidencias', description: 'Alta, consulta, asignación, finalización y cancelación' },
      { name: 'Dashboard', description: 'Resumen para el Director' },
      { name: 'Catálogos', description: 'Áreas, estados y usuarios' },
      { name: 'Reportes', description: 'Generación de reportes en PDF' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token devuelto por POST /api/auth/login',
        },
      },
      schemas,
      responses: {
        ErrorValidacion: {
          description: 'Datos de entrada inválidos',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NoEncontrado: {
          description: 'El recurso no existe o está inactivo',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ErrorInterno: {
          description: 'Error interno del servidor',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
