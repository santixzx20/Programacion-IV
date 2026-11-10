-- ============================================================
-- 03_upgrade_existing.sql
-- Aplica los ajustes sobre una base YA CREADA y CON DATOS,
-- sin borrar nada. Sirve para la base actual del grupo.
--
-- Qué hace:
--   1. Corrige el estado 'Resuela' -> 'Finalizada'.
--   2. Permite crear incidencias sin asignar (asignado_a NULL).
--   3. Convierte el historial a TIMESTAMPTZ (no pierde la fecha).
--   4. Agrega las foreign keys que faltaban.
--   5. Agrega índices.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

BEGIN;

-- 1) Corrección del estado mal escrito
UPDATE estados
   SET descripcion = 'Finalizada'
 WHERE descripcion = 'Resuela'
   AND NOT EXISTS (SELECT 1 FROM estados WHERE descripcion = 'Finalizada');

-- 2) Una incidencia puede existir sin asignar
ALTER TABLE incidencias ALTER COLUMN asignado_a DROP NOT NULL;
ALTER TABLE incidencias ALTER COLUMN prioridad SET DEFAULT 2;

-- 3) El historial necesita fecha + hora, no sólo hora.
--    Postgres no castea timetz -> timestamptz de forma directa, así que
--    combinamos la hora existente con la fecha actual en la zona de la sesión.
ALTER TABLE incidencias_estados
    ALTER COLUMN fecha_hora_estado TYPE TIMESTAMPTZ
    USING (CURRENT_DATE + fecha_hora_estado::time) AT TIME ZONE current_setting('TimeZone');

-- 4) Foreign keys (sólo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_area' AND conrelid = 'usuarios'::regclass) THEN
        ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_area
            FOREIGN KEY (id_area) REFERENCES areas (id_area);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articulos_area' AND conrelid = 'articulos'::regclass) THEN
        ALTER TABLE articulos ADD CONSTRAINT fk_articulos_area
            FOREIGN KEY (id_area) REFERENCES areas (id_area);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articulos_categoria' AND conrelid = 'articulos'::regclass) THEN
        ALTER TABLE articulos ADD CONSTRAINT fk_articulos_categoria
            FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incidencias_articulo' AND conrelid = 'incidencias'::regclass) THEN
        ALTER TABLE incidencias ADD CONSTRAINT fk_incidencias_articulo
            FOREIGN KEY (id_articulo) REFERENCES articulos (id_articulo);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incidencias_estado' AND conrelid = 'incidencias'::regclass) THEN
        ALTER TABLE incidencias ADD CONSTRAINT fk_incidencias_estado
            FOREIGN KEY (id_estado) REFERENCES estados (id_estado);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incidencias_creado_por' AND conrelid = 'incidencias'::regclass) THEN
        ALTER TABLE incidencias ADD CONSTRAINT fk_incidencias_creado_por
            FOREIGN KEY (creado_por) REFERENCES usuarios (id_usuario);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_incidencias_asignado_a' AND conrelid = 'incidencias'::regclass) THEN
        ALTER TABLE incidencias ADD CONSTRAINT fk_incidencias_asignado_a
            FOREIGN KEY (asignado_a) REFERENCES usuarios (id_usuario);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_historial_incidencia' AND conrelid = 'incidencias_estados'::regclass) THEN
        ALTER TABLE incidencias_estados ADD CONSTRAINT fk_historial_incidencia
            FOREIGN KEY (id_incidencia) REFERENCES incidencias (id_incidencia) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_historial_estado' AND conrelid = 'incidencias_estados'::regclass) THEN
        ALTER TABLE incidencias_estados ADD CONSTRAINT fk_historial_estado
            FOREIGN KEY (id_estado) REFERENCES estados (id_estado);
    END IF;
END $$;

-- 5) Índices
CREATE INDEX IF NOT EXISTS idx_incidencias_estado     ON incidencias (id_estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_asignado   ON incidencias (asignado_a);
CREATE INDEX IF NOT EXISTS idx_incidencias_creado_por ON incidencias (creado_por);
CREATE INDEX IF NOT EXISTS idx_incidencias_creado     ON incidencias (creado);
CREATE INDEX IF NOT EXISTS idx_historial_incidencia   ON incidencias_estados (id_incidencia);

COMMIT;
