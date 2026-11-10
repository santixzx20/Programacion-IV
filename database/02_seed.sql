-- ============================================================
-- 02_seed.sql
-- Datos de prueba para poder iniciar sesión y ver el sistema
-- funcionando desde el primer arranque.
--
-- Todas las cuentas usan la contraseña: 123456
-- ============================================================

BEGIN;

-- pgcrypto permite generar el hash bcrypt desde SQL.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Áreas
-- ------------------------------------------------------------
INSERT INTO areas (id_area, descripcion, activo) VALUES
    (1, 'Legales',               1),
    (2, 'Personal',              1),
    (3, 'Sistemas',              1),
    (4, 'Hacienda',              1),
    (5, 'Finanzas',              1),
    (6, 'Salud y Acción Social', 1),
    (7, 'Desarrollo Urbano',     0); -- inactiva: ejemplo de soft delete

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
INSERT INTO categorias (id_categoria, descripcion, activo) VALUES
    (1, 'Periféricos',        1),
    (2, 'Notebooks',          1),
    (3, 'PC Escritorio',      1),
    (4, 'CPU',                1),
    (5, 'Almacenamiento',     1),
    (6, 'Equipos de Red',     1),
    (7, 'Impresoras',         1),
    (8, 'Telefonía IP',       1),
    (9, 'Escáneres',          0); -- inactiva: ejemplo de soft delete

-- ------------------------------------------------------------
-- Estados
-- ------------------------------------------------------------
INSERT INTO estados (id_estado, descripcion, activo) VALUES
    (1, 'Pendiente',  1),
    (2, 'En Proceso', 1),
    (3, 'Finalizada', 1),
    (4, 'Cancelada',  1);

-- ------------------------------------------------------------
-- Usuarios (contraseña: 123456)
-- rol: 1 = Empleado Municipal, 2 = Empleado de Sistemas, 3 = Director
-- ------------------------------------------------------------
INSERT INTO usuarios (id_usuario, id_area, nombres, apellidos, usuario, contrasenia, avatar, rol, activo) VALUES
    (1, 3, 'Carlos',  'Pérez',   'carper@correo.com', crypt('123456', gen_salt('bf', 10)), '', 2, 1),
    (2, 3, 'Carmen',  'Gómez',   'cargom@correo.com', crypt('123456', gen_salt('bf', 10)), '', 2, 1),
    (3, 2, 'Pamela',  'Almeida', 'pamalm@correo.com', crypt('123456', gen_salt('bf', 10)), '', 1, 1),
    (4, 3, 'Esteban', 'Reniero', 'estren@correo.com', crypt('123456', gen_salt('bf', 10)), '', 3, 1);

-- ------------------------------------------------------------
-- Artículos
-- ------------------------------------------------------------
INSERT INTO articulos (id_articulo, id_area, id_categoria, descripcion, activo) VALUES
    (1,  3, 2, 'Notebook HP 250 G9',            1),
    (2,  2, 1, 'Monitor LG 24"',                1),
    (3,  1, 1, 'Mouse inalámbrico Logitech',    1),
    (4,  4, 3, 'PC de escritorio Dell OptiPlex',1),
    (5,  5, 7, 'Impresora HP LaserJet M404',    1),
    (6,  3, 6, 'Switch Cisco 24 bocas',         1),
    (7,  3, 5, 'Disco SSD 480 GB',              1),
    (8,  2, 1, 'Teclado USB',                   1),
    (9,  3, 4, 'Servidor de archivos',          1),
    (10, 6, 8, 'Teléfono IP Yealink',           1),
    (11, 1, 2, 'Notebook Lenovo ThinkPad',      1),
    (12, 4, 9, 'Escáner Epson',                 0); -- inactivo: ejemplo de soft delete

-- ------------------------------------------------------------
-- Incidencias de ejemplo
-- ------------------------------------------------------------
INSERT INTO incidencias
    (id_incidencia, id_articulo, id_estado, creado_por, asignado_a, creado, prioridad, descripcion_pedido, descripcion_resolucion)
VALUES
    (1, 1,  3, 3, 1,    '2026-11-01 09:15:00-03', 2, 'No enciende al presionar el botón de encendido.', 'Se reemplazó la fuente de alimentación.'),
    (2, 2,  2, 3, 2,    '2026-11-03 10:30:00-03', 3, 'La pantalla parpadea y se apaga a los pocos minutos.', NULL),
    (3, 3,  1, 3, NULL, '2026-11-05 08:00:00-03', 1, 'El mouse no responde ni con pilas nuevas.', NULL),
    (4, 5,  4, 3, NULL, '2026-11-05 14:20:00-03', 2, 'La impresora se atasca con cualquier hoja.', NULL),
    (5, 4,  3, 3, 2,    '2026-11-07 11:00:00-03', 3, 'La PC no arranca Windows, queda en pantalla negra.', 'Se reinstaló el sistema operativo y se recuperaron los datos.'),
    (6, 6,  2, 3, 1,    '2026-11-09 16:45:00-03', 3, 'Sin conexión de red en el ala oeste del edificio.', NULL),
    (7, 11, 1, 3, NULL, '2026-11-10 09:00:00-03', 2, 'La batería no carga y se apaga desenchufada.', NULL);

-- ------------------------------------------------------------
-- Historial de estados
-- Cada incidencia registra su estado inicial y, si avanzó,
-- los estados posteriores con su fecha.
-- ------------------------------------------------------------
INSERT INTO incidencias_estados (id_incidencia, id_estado, fecha_hora_estado) VALUES
    (1, 1, '2026-11-01 09:15:00-03'),
    (1, 2, '2026-11-01 11:00:00-03'),
    (1, 3, '2026-11-02 16:30:00-03'),

    (2, 1, '2026-11-03 10:30:00-03'),
    (2, 2, '2026-11-03 15:10:00-03'),

    (3, 1, '2026-11-05 08:00:00-03'),

    (4, 1, '2026-11-05 14:20:00-03'),
    (4, 4, '2026-11-05 18:05:00-03'),

    (5, 1, '2026-11-07 11:00:00-03'),
    (5, 2, '2026-11-07 11:30:00-03'),
    (5, 3, '2026-11-08 09:45:00-03'),

    (6, 1, '2026-11-09 16:45:00-03'),
    (6, 2, '2026-11-09 17:20:00-03'),

    (7, 1, '2026-11-10 09:00:00-03');

-- ------------------------------------------------------------
-- Sincronizar las secuencias con los IDs insertados a mano.
-- Si no se hace, el próximo INSERT intentaría usar el id 1.
-- ------------------------------------------------------------
SELECT setval('areas_id_area_seq',             (SELECT MAX(id_area)             FROM areas));
SELECT setval('categorias_id_categoria_seq',   (SELECT MAX(id_categoria)        FROM categorias));
SELECT setval('estados_id_estado_seq',         (SELECT MAX(id_estado)           FROM estados));
SELECT setval('usuarios_id_usuario_seq',       (SELECT MAX(id_usuario)          FROM usuarios));
SELECT setval('articulos_id_articulo_seq',     (SELECT MAX(id_articulo)         FROM articulos));
SELECT setval('incidencias_id_incidencia_seq', (SELECT MAX(id_incidencia)       FROM incidencias));
SELECT setval('incidencias_estados_id_pedidos_estados_seq',
              (SELECT COALESCE(MAX(id_pedidos_estados), 1) FROM incidencias_estados));

COMMIT;
