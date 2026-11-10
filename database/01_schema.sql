-- ============================================================
-- 01_schema.sql
-- Estructura de la base de datos del Gestor de Incidencias.
-- Motor: PostgreSQL
--
-- IMPORTANTE: este script BORRA y vuelve a crear las tablas.
-- Usarlo para una instalación limpia (o para la corrección).
-- Si ya tenés datos que querés conservar, usá 03_upgrade_existing.sql.
-- ============================================================

BEGIN;

-- El orden importa: primero las tablas que dependen de otras.
DROP TABLE IF EXISTS incidencias_estados CASCADE;
DROP TABLE IF EXISTS incidencias CASCADE;
DROP TABLE IF EXISTS articulos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS estados CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- ------------------------------------------------------------
-- áreas del municipio
-- ------------------------------------------------------------
CREATE TABLE areas (
    id_area     SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    activo      SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ------------------------------------------------------------
-- categorías de artículos
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    descripcion  VARCHAR(255) NOT NULL,
    activo       SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ------------------------------------------------------------
-- estados posibles de una incidencia
-- ------------------------------------------------------------
CREATE TABLE estados (
    id_estado   SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE,
    activo      SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ------------------------------------------------------------
-- usuarios del sistema
-- rol: 1 = Empleado Municipal, 2 = Empleado de Sistemas, 3 = Director
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario  SERIAL PRIMARY KEY,
    id_area     INTEGER NOT NULL REFERENCES areas (id_area),
    nombres     VARCHAR(100) NOT NULL,
    apellidos   VARCHAR(100) NOT NULL,
    usuario     VARCHAR(150) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    avatar      VARCHAR(255) NOT NULL DEFAULT '',
    rol         SMALLINT NOT NULL CHECK (rol IN (1, 2, 3)),
    activo      SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ------------------------------------------------------------
-- artículos inventariados
-- ------------------------------------------------------------
CREATE TABLE articulos (
    id_articulo  SERIAL PRIMARY KEY,
    id_area      INTEGER NOT NULL REFERENCES areas (id_area),
    id_categoria INTEGER NOT NULL REFERENCES categorias (id_categoria),
    descripcion  VARCHAR(255) NOT NULL,
    activo       SMALLINT NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ------------------------------------------------------------
-- incidencias
-- prioridad: 1 = Baja, 2 = Media, 3 = Alta
-- asignado_a queda NULL hasta que el Director la asigna.
-- ------------------------------------------------------------
CREATE TABLE incidencias (
    id_incidencia          SERIAL PRIMARY KEY,
    id_articulo            INTEGER NOT NULL REFERENCES articulos (id_articulo),
    id_estado              INTEGER NOT NULL REFERENCES estados (id_estado),
    creado_por             INTEGER NOT NULL REFERENCES usuarios (id_usuario),
    asignado_a             INTEGER REFERENCES usuarios (id_usuario),
    creado                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prioridad              SMALLINT NOT NULL DEFAULT 2 CHECK (prioridad BETWEEN 1 AND 3),
    descripcion_pedido     VARCHAR(1000) NOT NULL,
    descripcion_resolucion VARCHAR(1000)
);

-- ------------------------------------------------------------
-- historial de cambios de estado de cada incidencia
-- El nombre id_pedidos_estados se mantiene porque así figura
-- en el diagrama entregado por la cátedra.
-- ------------------------------------------------------------
CREATE TABLE incidencias_estados (
    id_pedidos_estados SERIAL PRIMARY KEY,
    id_incidencia      INTEGER NOT NULL REFERENCES incidencias (id_incidencia) ON DELETE CASCADE,
    id_estado          INTEGER NOT NULL REFERENCES estados (id_estado),
    fecha_hora_estado  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- índices para las consultas más frecuentes
-- ------------------------------------------------------------
CREATE INDEX idx_incidencias_estado     ON incidencias (id_estado);
CREATE INDEX idx_incidencias_asignado   ON incidencias (asignado_a);
CREATE INDEX idx_incidencias_creado_por ON incidencias (creado_por);
CREATE INDEX idx_incidencias_creado     ON incidencias (creado);
CREATE INDEX idx_historial_incidencia   ON incidencias_estados (id_incidencia);

COMMIT;
