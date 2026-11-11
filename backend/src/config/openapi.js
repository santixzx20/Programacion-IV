// Documentación OpenAPI de todos los endpoints.
// Se mantiene en un solo archivo para no repetir bloques en cada ruta.

const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` });
const respuesta = (nombre) => ({ $ref: `#/components/responses/${nombre}` });

const error = (descripcion) => ({
  description: descripcion,
  content: { 'application/json': { schema: ref('Error') } },
});

const okArray = (schema) => ({
  description: 'Listado obtenido correctamente',
  content: { 'application/json': { schema: { type: 'array', items: ref(schema) } } },
});

const okObjeto = (descripcion, schema) => ({
  description: descripcion,
  content: { 'application/json': { schema: ref(schema) } },
});

const cuerpo = (schema) => ({
  required: true,
  content: { 'application/json': { schema: ref(schema) } },
});

const idParam = (nombre, descripcion, ejemplo) => ({
  name: 'id',
  in: 'path',
  required: true,
  description: descripcion,
  schema: { type: 'integer', example: ejemplo },
});

const filtros = (lista) => lista.map(([name, descripcion, tipo, ejemplo]) => ({
  name,
  in: 'query',
  required: false,
  description: descripcion,
  schema: { type: tipo, example: ejemplo },
}));

export const schemas = {
  Error: {
    type: 'object',
    properties: { mensaje: { type: 'string', example: 'Recurso no encontrado' } },
  },
  LoginEntrada: {
    type: 'object',
    required: ['usuario', 'contrasenia'],
    properties: {
      usuario: { type: 'string', format: 'email', example: 'director@gmail.com' },
      contrasenia: { type: 'string', example: '123456' },
    },
  },
  UsuarioPublico: {
    type: 'object',
    properties: {
      id_usuario: { type: 'integer', example: 4 },
      nombres: { type: 'string', example: 'Esteban' },
      apellidos: { type: 'string', example: 'Rendón' },
      usuario: { type: 'string', example: 'director@gmail.com' },
      avatar: { type: 'string', nullable: true, example: null },
      rol: { type: 'integer', example: 3, description: '1 Municipal, 2 Sistemas, 3 Director' },
      id_area: { type: 'integer', example: 1 },
      area: { type: 'string', example: 'Sistemas' },
    },
  },
  LoginRespuesta: {
    type: 'object',
    properties: {
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      usuario: ref('UsuarioPublico'),
    },
  },
  Categoria: {
    type: 'object',
    properties: {
      id_categoria: { type: 'integer', example: 1 },
      descripcion: { type: 'string', example: 'Periféricos' },
      activo: { type: 'integer', example: 1 },
    },
  },
  CategoriaEntrada: {
    type: 'object',
    required: ['descripcion'],
    properties: { descripcion: { type: 'string', maxLength: 255, example: 'Periféricos' } },
  },
  Articulo: {
    type: 'object',
    properties: {
      id_articulo: { type: 'integer', example: 1 },
      descripcion: { type: 'string', example: 'Notebook HP 250 G9' },
      id_area: { type: 'integer', example: 1 },
      area: { type: 'string', example: 'Sistemas' },
      id_categoria: { type: 'integer', example: 1 },
      categoria: { type: 'string', example: 'Notebooks' },
      activo: { type: 'integer', example: 1 },
    },
  },
  ArticuloEntrada: {
    type: 'object',
    required: ['id_area', 'id_categoria', 'descripcion'],
    properties: {
      id_area: { type: 'integer', example: 1 },
      id_categoria: { type: 'integer', example: 1 },
      descripcion: { type: 'string', maxLength: 255, example: 'Notebook HP 250 G9' },
    },
  },
  Incidencia: {
    type: 'object',
    properties: {
      id_incidencia: { type: 'integer', example: 1 },
      id_articulo: { type: 'integer', example: 1 },
      articulo: { type: 'string', example: 'Notebook HP 250 G9' },
      id_estado: { type: 'integer', example: 1, description: '1 Pendiente, 2 En Proceso, 3 Finalizada, 4 Cancelada' },
      estado: { type: 'string', example: 'Pendiente' },
      creado_por: { type: 'integer', example: 3 },
      creado_por_nombre: { type: 'string', example: 'Pamela Almeida' },
      creado_por_email: { type: 'string', example: 'municipal@gmail.com' },
      asignado_a: { type: 'integer', nullable: true, example: null },
      asignado_a_nombre: { type: 'string', nullable: true, example: null },
      creado: { type: 'string', format: 'date-time', example: '2026-11-05T13:24:00.000Z' },
      prioridad: { type: 'integer', example: 3, description: '1 Baja, 2 Media, 3 Alta' },
      prioridad_texto: { type: 'string', example: 'Alta' },
      descripcion_pedido: { type: 'string', example: 'No enciende al presionar el botón.' },
      descripcion_resolucion: { type: 'string', nullable: true, example: null },
      imagen: { type: 'string', nullable: true, example: '/uploads/incidencias/incidencia-3-1699999999999.jpg' },
    },
  },
  IncidenciaEntrada: {
    type: 'object',
    required: ['id_articulo', 'descripcion_pedido'],
    properties: {
      id_articulo: { type: 'integer', example: 1 },
      prioridad: { type: 'integer', enum: [1, 2, 3], default: 2, example: 3 },
      descripcion_pedido: { type: 'string', maxLength: 1000, example: 'No enciende al presionar el botón.' },
    },
  },
  IncidenciaResolucion: {
    type: 'object',
    required: ['descripcion_resolucion'],
    properties: {
      descripcion_resolucion: { type: 'string', maxLength: 1000, example: 'Se reemplazó la fuente de alimentación.' },
    },
  },
  Asignacion: {
    type: 'object',
    required: ['asignado_a'],
    properties: { asignado_a: { type: 'integer', example: 1, description: 'ID de un empleado de Sistemas activo' } },
  },
  Mensaje: {
    type: 'object',
    properties: { mensaje: { type: 'string', example: 'Operación realizada correctamente' } },
  },
  Area: {
    type: 'object',
    properties: { id_area: { type: 'integer', example: 1 }, descripcion: { type: 'string', example: 'Sistemas' } },
  },
  Estado: {
    type: 'object',
    properties: { id_estado: { type: 'integer', example: 1 }, descripcion: { type: 'string', example: 'Pendiente' } },
  },
  DashboardResumen: {
    type: 'object',
    properties: {
      total: { type: 'integer', example: 7 },
      pendientes: { type: 'integer', example: 2 },
      enProceso: { type: 'integer', example: 1 },
      finalizadas: { type: 'integer', example: 3 },
      canceladas: { type: 'integer', example: 1 },
      prioritariasTotal: { type: 'integer', example: 1 },
      porEstado: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id_estado: { type: 'integer', example: 1 },
            descripcion: { type: 'string', example: 'Pendiente' },
            total: { type: 'integer', example: 2 },
          },
        },
      },
      porFecha: {
        type: 'array',
        items: {
          type: 'object',
          properties: { fecha: { type: 'string', example: '2026-11-05' }, total: { type: 'integer', example: 2 } },
        },
      },
      prioritarias: { type: 'array', items: ref('Incidencia') },
    },
  },
};

export const paths = {
  // ---------------- Auth ----------------
  '/api/v1/auth/login': {
    post: {
      tags: ['Autenticación'],
      summary: 'Inicia sesión y devuelve un token JWT',
      security: [],
      requestBody: cuerpo('LoginEntrada'),
      responses: {
        200: okObjeto('Sesión iniciada', 'LoginRespuesta'),
        400: respuesta('ErrorValidacion'),
        401: error('Usuario o contraseña incorrectos'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Autenticación'],
      summary: 'Devuelve los datos del usuario autenticado',
      responses: {
        200: okObjeto('Usuario actual', 'UsuarioPublico'),
        401: error('Token no proporcionado, inválido o vencido'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Categorías ----------------
  '/api/v1/categorias': {
    get: {
      tags: ['Categorías'],
      summary: 'Lista todas las categorías activas',
      responses: { 200: okArray('Categoria'), 401: error('No autenticado'), 403: error('Requiere rol Sistemas'), 500: respuesta('ErrorInterno') },
    },
    post: {
      tags: ['Categorías'],
      summary: 'Crea una categoría',
      requestBody: cuerpo('CategoriaEntrada'),
      responses: {
        201: okObjeto('Categoría creada', 'Categoria'),
        400: respuesta('ErrorValidacion'),
        401: error('No autenticado'),
        403: error('Requiere rol Sistemas'),
        409: error('La categoría ya existe'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/categorias/{id}': {
    get: {
      tags: ['Categorías'],
      summary: 'Obtiene una categoría por su ID',
      parameters: [idParam('id', 'Identificador de la categoría', 1)],
      responses: { 200: okObjeto('Categoría encontrada', 'Categoria'), 404: respuesta('NoEncontrado'), 500: respuesta('ErrorInterno') },
    },
    put: {
      tags: ['Categorías'],
      summary: 'Actualiza la descripción de una categoría',
      parameters: [idParam('id', 'Identificador de la categoría', 1)],
      requestBody: cuerpo('CategoriaEntrada'),
      responses: {
        200: okObjeto('Categoría actualizada', 'Categoria'),
        400: respuesta('ErrorValidacion'),
        404: respuesta('NoEncontrado'),
        500: respuesta('ErrorInterno'),
      },
    },
    delete: {
      tags: ['Categorías'],
      summary: 'Elimina lógicamente una categoría (activo = 0)',
      parameters: [idParam('id', 'Identificador de la categoría', 1)],
      responses: {
        200: okObjeto('Categoría eliminada lógicamente', 'Mensaje'),
        404: respuesta('NoEncontrado'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Artículos ----------------
  '/api/v1/articulos': {
    get: {
      tags: ['Artículos'],
      summary: 'Lista los artículos activos',
      parameters: filtros([
        ['id_area', 'Filtra por área', 'integer', 1],
        ['id_categoria', 'Filtra por categoría', 'integer', 1],
      ]),
      responses: { 200: okArray('Articulo'), 401: error('No autenticado'), 500: respuesta('ErrorInterno') },
    },
    post: {
      tags: ['Artículos'],
      summary: 'Crea un artículo (rol Sistemas)',
      requestBody: cuerpo('ArticuloEntrada'),
      responses: {
        201: okObjeto('Artículo creado', 'Articulo'),
        400: respuesta('ErrorValidacion'),
        401: error('No autenticado'),
        403: error('Requiere rol Sistemas'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/articulos/{id}': {
    get: {
      tags: ['Artículos'],
      summary: 'Obtiene un artículo por su ID',
      parameters: [idParam('id', 'Identificador del artículo', 1)],
      responses: { 200: okObjeto('Artículo encontrado', 'Articulo'), 404: respuesta('NoEncontrado'), 500: respuesta('ErrorInterno') },
    },
    put: {
      tags: ['Artículos'],
      summary: 'Actualiza un artículo (rol Sistemas)',
      parameters: [idParam('id', 'Identificador del artículo', 1)],
      requestBody: cuerpo('ArticuloEntrada'),
      responses: {
        200: okObjeto('Artículo actualizado', 'Articulo'),
        400: respuesta('ErrorValidacion'),
        403: error('Requiere rol Sistemas'),
        404: respuesta('NoEncontrado'),
        500: respuesta('ErrorInterno'),
      },
    },
    delete: {
      tags: ['Artículos'],
      summary: 'Elimina lógicamente un artículo (activo = 0)',
      parameters: [idParam('id', 'Identificador del artículo', 1)],
      responses: {
        200: okObjeto('Artículo eliminado lógicamente', 'Mensaje'),
        403: error('Requiere rol Sistemas'),
        404: respuesta('NoEncontrado'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Incidencias ----------------
  '/api/v1/incidencias': {
    get: {
      tags: ['Incidencias'],
      summary: 'Lista incidencias según el rol del usuario',
      description:
        'El Empleado Municipal sólo ve las propias, el Empleado de Sistemas las asignadas a él y el Director ve todas.',
      parameters: filtros([
        ['id_estado', 'Filtra por estado', 'integer', 1],
        ['prioridad', 'Filtra por prioridad (1 a 3)', 'integer', 3],
        ['id_area', 'Filtra por área del artículo', 'integer', 1],
        ['desde', 'Fecha mínima de creación (YYYY-MM-DD)', 'string', '2026-01-01'],
        ['hasta', 'Fecha máxima de creación (YYYY-MM-DD)', 'string', '2026-12-31'],
      ]),
      responses: { 200: okArray('Incidencia'), 401: error('No autenticado'), 500: respuesta('ErrorInterno') },
    },
    post: {
      tags: ['Incidencias'],
      summary: 'Registra una incidencia con imagen opcional (rol Municipal)',
      description:
        'Acepta JSON o multipart/form-data. Con multipart se puede adjuntar una imagen JPG, PNG o WEBP de hasta 2 MB en el campo "imagen".',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['id_articulo', 'descripcion_pedido'],
              properties: {
                id_articulo: { type: 'integer', example: 1 },
                prioridad: { type: 'integer', enum: [1, 2, 3], default: 2, example: 3 },
                descripcion_pedido: { type: 'string', maxLength: 1000, example: 'No enciende al presionar el botón.' },
                imagen: { type: 'string', format: 'binary', description: 'Imagen opcional (JPG, PNG o WEBP, máximo 2 MB)' },
              },
            },
          },
          'application/json': { schema: ref('IncidenciaEntrada') },
        },
      },
      responses: {
        201: okObjeto('Incidencia creada', 'Incidencia'),
        400: respuesta('ErrorValidacion'),
        401: error('No autenticado'),
        403: error('Requiere rol Municipal'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/incidencias/{id}': {
    get: {
      tags: ['Incidencias'],
      summary: 'Obtiene una incidencia por su ID',
      parameters: [idParam('id', 'Identificador de la incidencia', 1)],
      responses: {
        200: okObjeto('Incidencia encontrada', 'Incidencia'),
        403: error('La incidencia no pertenece al usuario'),
        404: respuesta('NoEncontrado'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/incidencias/{id}/cancelar': {
    patch: {
      tags: ['Incidencias'],
      summary: 'Cancela una incidencia (dueño o Director)',
      description: 'El Empleado Municipal sólo puede cancelar sus propias incidencias en estado Pendiente. Envía un correo al solicitante.',
      parameters: [idParam('id', 'Identificador de la incidencia', 1)],
      responses: {
        200: okObjeto('Incidencia cancelada', 'Mensaje'),
        403: error('No es el dueño de la incidencia'),
        404: respuesta('NoEncontrado'),
        409: error('La incidencia no está en un estado que permita cancelarla'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/incidencias/{id}/asignar': {
    patch: {
      tags: ['Incidencias'],
      summary: 'Asigna una incidencia a un empleado de Sistemas (Director)',
      parameters: [idParam('id', 'Identificador de la incidencia', 1)],
      requestBody: cuerpo('Asignacion'),
      responses: {
        200: okObjeto('Incidencia asignada', 'Mensaje'),
        400: respuesta('ErrorValidacion'),
        403: error('Requiere rol Director'),
        404: respuesta('NoEncontrado'),
        409: error('La incidencia no está en un estado que permita asignarla'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
  '/api/v1/incidencias/{id}/finalizar': {
    patch: {
      tags: ['Incidencias'],
      summary: 'Finaliza una incidencia asignada (rol Sistemas)',
      description: 'Sólo el empleado asignado puede finalizarla. Envía un correo al solicitante.',
      parameters: [idParam('id', 'Identificador de la incidencia', 1)],
      requestBody: cuerpo('IncidenciaResolucion'),
      responses: {
        200: okObjeto('Incidencia finalizada', 'Mensaje'),
        400: respuesta('ErrorValidacion'),
        403: error('La incidencia no está asignada al usuario'),
        404: respuesta('NoEncontrado'),
        409: error('La incidencia no está en un estado que permita finalizarla'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Dashboard ----------------
  '/api/v1/dashboard/resumen': {
    get: {
      tags: ['Dashboard'],
      summary: 'Resumen de incidencias para el Director',
      responses: {
        200: okObjeto('Resumen del dashboard', 'DashboardResumen'),
        401: error('No autenticado'),
        403: error('Requiere rol Director'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Catálogos ----------------
  '/api/v1/areas': {
    get: {
      tags: ['Catálogos'],
      summary: 'Lista las áreas activas',
      responses: { 200: okArray('Area'), 401: error('No autenticado'), 500: respuesta('ErrorInterno') },
    },
  },
  '/api/v1/estados': {
    get: {
      tags: ['Catálogos'],
      summary: 'Lista los estados activos',
      responses: { 200: okArray('Estado'), 401: error('No autenticado'), 500: respuesta('ErrorInterno') },
    },
  },
  '/api/v1/usuarios': {
    get: {
      tags: ['Catálogos'],
      summary: 'Lista usuarios activos (rol Director)',
      parameters: filtros([
        ['rol', 'Filtra por rol (1 a 3)', 'integer', 2],
        ['id_area', 'Filtra por área', 'integer', 1],
      ]),
      responses: {
        200: okArray('UsuarioPublico'),
        401: error('No autenticado'),
        403: error('Requiere rol Director'),
        500: respuesta('ErrorInterno'),
      },
    },
  },

  // ---------------- Reportes ----------------
  '/api/v1/reportes/incidencias.pdf': {
    get: {
      tags: ['Reportes'],
      summary: 'Genera el reporte de incidencias en PDF (rol Director)',
      parameters: filtros([
        ['estado', 'Filtra por estado', 'integer', 1],
        ['desde', 'Fecha mínima de creación (YYYY-MM-DD)', 'string', '2026-01-01'],
        ['hasta', 'Fecha máxima de creación (YYYY-MM-DD)', 'string', '2026-12-31'],
      ]),
      responses: {
        200: {
          description: 'Archivo PDF generado',
          content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
        },
        401: error('No autenticado'),
        403: error('Requiere rol Director'),
        500: respuesta('ErrorInterno'),
      },
    },
  },
};
