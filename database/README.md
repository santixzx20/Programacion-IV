# Base de datos

Scripts para crear la base `incidencias_db` desde cero.

| Archivo | Cuándo usarlo |
|---|---|
| `01_schema.sql` | Crea las 7 tablas, claves y relaciones. **Borra las tablas existentes.** |
| `02_seed.sql` | Carga áreas, categorías, estados, usuarios y datos de ejemplo. |
| `03_upgrade_existing.sql` | Aplica los ajustes sobre una base con datos **sin borrar nada**. |

## Opción A: instalación limpia (recomendada para la entrega)

1. Abrir pgAdmin 4 y conectarse al servidor.
2. Crear una base llamada `incidencias_db` (si ya existe, se puede usar igual).
3. Abrir el **Query Tool** sobre esa base.
4. Ejecutar el contenido de `01_schema.sql`.
5. Ejecutar el contenido de `02_seed.sql`.

Por consola (si `psql` está en el PATH):

```bash
psql -U postgres -d incidencias_db -f database/01_schema.sql
psql -U postgres -d incidencias_db -f database/02_seed.sql
```

## Opción B: conservar los datos actuales

Ejecutar únicamente `03_upgrade_existing.sql`. Agrega las foreign keys,
corrige el estado `Resuela` y ajusta los tipos, sin borrar registros.

> Las contraseñas viejas están hasheadas con SHA-256 y no se pueden recuperar.
> Después de este script hay que regenerarlas con el seed de usuarios
> (se explica en el bloque de autenticación).

## Usuarios de prueba

Todas las cuentas del seed usan la contraseña `123456`.

| Rol | Usuario |
|---|---|
| Empleado Municipal | `pamalm@correo.com` |
| Empleado de Sistemas | `carper@correo.com` |
| Empleado de Sistemas | `cargom@correo.com` |
| Director de Sistemas | `estren@correo.com` |

## Modelo de datos

```
areas ──< usuarios
areas ──< articulos >── categorias
usuarios ──< incidencias >── estados
articulos ──< incidencias
incidencias ──< incidencias_estados >── estados
```

- `activo = 1/0` implementa el borrado lógico (soft delete).
- `prioridad`: 1 = Baja, 2 = Media, 3 = Alta.
- `rol`: 1 = Empleado Municipal, 2 = Empleado de Sistemas, 3 = Director.
- `incidencias.asignado_a` es `NULL` hasta que el Director asigna la incidencia.
- `incidencias_estados.id_pedidos_estados` conserva el nombre del diagrama de la cátedra.
