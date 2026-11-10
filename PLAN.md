# Plan de trabajo – Trabajo Final Integrador (Programación IV)

> Estado relevado el 10/11/2026 leyendo el código, la base `incidencias_db` y el PDF del enunciado.

> **Avance de la noche:** bloques 0 y 1 completos; BREAD de artículos, flujo de
> incidencias y dashboard implementados y probados; frontend conectado a la API en
> las pantallas de los tres roles. Queda login/JWT, Swagger del resto de endpoints,
> PDF, correo y middlewares.

## 1. Diagnóstico: dónde estamos parados

### Backend
- **No arranca.** `src/index.js` línea 8 usa `require()` pero el proyecto es ESM (`"type": "module"`).
  Error: `ReferenceError: require is not defined in ES module scope`.
- Sólo existe el CRUD de **categorías** (`/api/categorias`), sin versionado.
- **Swagger está montado pero vacío**: no hay anotaciones JSDoc en las rutas.
- No hay autenticación, ni JWT, ni roles, ni validaciones, ni Morgan, ni Multer.
- No hay manejo centralizado de errores por código HTTP (todo cae en 500).
- No hay script SQL en el repositorio: la base se creó a mano desde pgAdmin.

### Base de datos (`incidencias_db`, PostgreSQL 18.6)
Las 7 tablas del diagrama existen y tienen datos de prueba, pero:
- **No hay ninguna foreign key** declarada (el diagrama las implica).
- `estados` tiene `'Resuela'` (typo) y el front espera `'Finalizada'`.
- `incidencias.asignado_a` es `NOT NULL`, así que no se puede crear una incidencia sin asignarla.
- `incidencias_estados.fecha_hora_estado` es `time with time zone`: **pierde la fecha** del cambio de estado.
- `prioridad` es `integer` sin catálogo: usamos 1=Baja, 2=Media, 3=Alta.
- Contraseñas guardadas como **SHA-256 sin sal** (64 hex). No se pueden recuperar; hay que regenerarlas.
- `usuarios.rol`: 1 = Empleado Municipal, 2 = Empleado de Sistemas, 3 = Director.

### Frontend
- Está toda la navegación y el diseño, pero **sólo Categorías consume la API**.
- Artículos, Incidencias y Dashboard usan **datos mock hardcodeados**.
- Los botones de reportes PDF son `alert()`.
- **No existe pantalla de login**; `index.html` es un selector de roles que saltea la seguridad.
- No hay guard de sesión ni envío de token en los `fetch`.

### Entrega
- **No hay repositorio Git.** La consigna exige subir la URL de GitHub + ZIP sin `node_modules`.
- `backend/.env` tiene la contraseña real: **no debe subirse** (agregar al `.gitignore` y crear `.env.example`).

---

## 2. Decisiones de diseño propuestas

| Tema | Decisión |
|---|---|
| Versionado API | `/api/v1/...` (se mantiene `/api` como alias temporal sólo si hace falta) |
| Respuestas | `{ exito: true, datos }` / `{ exito: false, mensaje, errores? }` |
| Contraseñas | `bcryptjs` (hash + salt). Se resetean las 4 de prueba a `123456`. |
| Roles | 1 Municipal · 2 Sistemas · 3 Director (middleware `autorizar(...roles)`) |
| Prioridad | 1 Baja · 2 Media · 3 Alta |
| Estados | 1 Pendiente · 2 En Proceso · 3 Finalizada · 4 Cancelada |
| Soft delete | `activo = 0` en areas/usuarios/categorias/articulos/estados. `incidencias` no tiene `activo`: su baja lógica es el estado `Cancelada`. |
| Historial | `incidencias_estados` con `timestamp with time zone`, se inserta en cada cambio de estado (transacción). |
| Correo | `nodemailer` con SMTP por `.env`; si no hay credenciales, `jsonTransport` que loguea el correo (sirve para la demo). |
| PDF | `pdfkit`, reporte por estado y por rango de fechas. |
| Multer | Subida de avatar del usuario autenticado (`PUT /api/v1/usuarios/me/avatar`). |
| Front | `index.html` pasa a ser **login**. Guard por token + redirección por rol. `api.js` centraliza fetch con JWT. |

### Ajustes SQL necesarios (script reproducible)
1. `ALTER TABLE incidencias ALTER COLUMN asignado_a DROP NOT NULL`.
2. `ALTER TABLE incidencias_estados ALTER COLUMN fecha_hora_estado TYPE timestamptz USING fecha_hora_estado::timestamptz`.
3. `UPDATE estados SET descripcion='Finalizada' WHERE id_estado=3`.
4. Agregar FKs: articulos→areas/categorias, usuarios→areas, incidencias→articulos/estados/usuarios, incidencias_estados→incidencias/estados.
5. Índices en columnas de búsqueda (`incidencias.id_estado`, `asignado_a`, `creado_por`, `creado`).

---

## 3. Bloques de trabajo (ordenados por impacto en la rúbrica)

### Bloque 0 – Infraestructura (15 min)
- [x] Corregir imports ESM en `index.js` (el backend vuelve a arrancar).
- [x] Estructura `src/config`, `src/middlewares`, `src/utils`, `src/services`.
- [x] `.gitignore` raíz (node_modules, .env, uploads), `.env.example` back y front.
- [ ] `git init` + primer commit.

### Bloque 1 – Base de datos reproducible (45 min)
- [x] `database/01_schema.sql`: 7 tablas + PK + UNIQUE + FKs + índices + tipos corregidos.
- [x] `database/02_seed.sql`: áreas, categorías, estados, artículos, usuarios con bcrypt, incidencias de ejemplo + historial.
- [ ] Script npm `db:reset` que ejecuta ambos.
- [x] Verificar que la app funcione contra una base recreada desde cero.
- [x] `database/03_upgrade_existing.sql` para conservar los datos actuales.
- [x] Respaldo de la base original en `database/backups/` (no se sube al repo).

### Bloque 2 – Autenticación y autorización (1 h)
- [ ] `POST /api/v1/auth/login` (usuario + contraseña) → `{ token, usuario }`.
- [ ] `GET /api/v1/auth/me`.
- [ ] Middleware `autenticar` (Bearer JWT) y `autorizar(...roles)`.
- [ ] `PUT /api/v1/auth/password` (opcional del enunciado, bajo costo).
- [ ] Seed de usuarios con contraseñas conocidas y documentadas.

### Bloque 3 – BREAD Categorías y Artículos (1,5 h)
- [ ] Categorías: browse/read/add/edit/delete lógico (ya está la base, se adapta a v1 + validaciones + respuestas).
- [ ] Artículos: CRUD completo con `id_area`, `id_categoria`, validación de existencia y soft delete.
- [ ] `GET /api/v1/areas` y `GET /api/v1/estados` (auxiliares para selects).
- [ ] `GET /api/v1/usuarios` (para asignar) restringido a Director.

### Bloque 4 – Incidencias: flujo completo (2 h)
- [ ] `GET /api/v1/incidencias` con filtros (`estado`, `prioridad`, `asignado_a`, `creado_por`, fechas) y paginación.
- [ ] `GET /api/v1/incidencias/:id`.
- [ ] `POST /api/v1/incidencias` (Empleado Municipal): estado Pendiente, prioridad, artículo.
- [ ] `PATCH /api/v1/incidencias/:id/cancelar` (dueño si Pendiente / Director).
- [ ] `PATCH /api/v1/incidencias/:id/asignar` (Director → empleado de Sistemas del área).
- [ ] `PATCH /api/v1/incidencias/:id/finalizar` (Empleado de Sistemas asignado) + `descripcion_resolucion`.
- [ ] Cada cambio de estado dentro de una **transacción** que actualiza `incidencias` e inserta en `incidencias_estados`.
- [ ] Correo al finalizar/cancelar.

### Bloque 5 – Dashboard y reportes (1 h)
- [ ] `GET /api/v1/dashboard/resumen`: totales por estado, por fecha, prioritarias, últimos movimientos.
- [ ] `GET /api/v1/reportes/incidencias.pdf?estado=&desde=&hasta=` con pdfkit.
- [ ] (Opcional) `GET /api/v1/eventos` SSE para actualización en tiempo real.

### Bloque 6 – Requerimientos técnicos transversales (1 h)
- [ ] `express-validator` en todos los POST/PUT/PATCH.
- [ ] `morgan` para registro de solicitudes.
- [ ] `multer` para avatar.
- [ ] `helmet` + CORS restringido al front.
- [ ] Swagger completo en `/api-docs` (schemas, seguridad Bearer, códigos de respuesta).
- [ ] Manejo de errores por código (400/401/403/404/409/500) y respuestas consistentes.

### Bloque 7 – Frontend conectado (2,5 h)
- [ ] `index.html` → login real; redirección según rol.
- [ ] `auth.js` (guard, token, logout) y `api.js` reescrito (JWT + errores + todos los recursos).
- [ ] Empleado Municipal: artículos (API) + mis incidencias (crear/cancelar).
- [ ] Empleado de Sistemas: asignadas + finalizar; categorías (ya funciona, adaptar) + artículos (CRUD real).
- [ ] Director: dashboard real + asignar/cancelar + descarga de PDF.
- [ ] Menú dinámico por rol y botón Salir que cierra sesión.
- [ ] Responsive: revisar sidebar en mobile.

### Bloque 8 – Cierre y entrega (45 min)
- [ ] `README.md` con instalación, credenciales de prueba, endpoints, decisiones y capturas.
- [ ] Probar el flujo completo de los 3 roles.
- [ ] `git push` a GitHub y ZIP sin `node_modules` ni `.env`.
- [ ] Guion de exposición (5–10 min).

### Opcionales si sobra tiempo
- [ ] BREAD de usuarios y de áreas.
- [ ] SSE en el dashboard.
- [ ] Tests mínimos de endpoints.

---

## 4. Credenciales de prueba propuestas

| Rol | Usuario | Contraseña |
|---|---|---|
| Empleado Municipal | `pamalm@correo.com` | `123456` |
| Empleado de Sistemas | `carper@correo.com` | `123456` |
| Empleado de Sistemas | `cargom@correo.com` | `123456` |
| Director de Sistemas | `estren@correo.com` | `123456` |

---

## 5. Riesgos

- **Tiempo**: la entrega es mañana. Los bloques 0–6 son los que más puntúan; el 7 es el más largo.
- **Datos existentes**: el script de seed reconstruye la base; si quieren conservar datos, se corre sólo el `ALTER` del bloque 1.
- **Contraseñas actuales**: son SHA-256 sin sal y no se pueden revertir. Se reemplazan por bcrypt.
- **GitHub**: sin repositorio no se cumple la condición de entrega. Hacerlo temprano.

---

## 6. Estado real (actualizado)

Completado y probado:

- Base de datos recreada con `01_schema.sql` + `02_seed.sql` (7 incidencias, 4 usuarios).
- BREAD de categorías y artículos con soft delete.
- Flujo de incidencias con transacciones, historial y permisos por rol.
- **JWT**: `POST /api/auth/login`, `GET /api/auth/me`, middleware `autenticar` y `autorizar`.
- **Frontend**: login real, sesión en `localStorage`, token en cada request, guard por rol y diseño responsivo.
- **PDF**: `GET /api/reportes/incidencias.pdf` (rol Director) y botón de descarga en el dashboard.
- **Correo**: `nodemailer` al finalizar o cancelar (SMTP real o simulado por consola).
- **Variables de entorno**: JWT, SMTP y base en `.env` / `.env.example`.
- **Swagger**: 16 rutas documentadas con seguridad Bearer en `/api-docs`.

Pruebas realizadas: login de los 3 roles, creación y finalización de incidencias desde la UI, PDF descargado desde el navegador, guard de roles (redirige al login) y respuestas 401/403/404/409.

Pendiente:

- `express-validator`, `morgan` y `multer`.
- `git init`, repositorio en GitHub y ZIP sin `node_modules` ni `.env`.
- Guion de exposición.
