# Gestor de Incidencias – Municipalidad de Concordia

Trabajo Final Integrador de **Programación IV** (Licenciatura en Sistemas – UNER).

Sistema web para registrar, asignar y resolver incidencias informáticas del municipio, con tres roles: Empleado Municipal, Empleado de Sistemas y Director de Sistemas.

## Tecnologías

- **Frontend:** Vite + HTML + CSS + JavaScript + Bootstrap 5.
- **Backend:** Node.js + Express 5 (ESM) + PostgreSQL (`pg`).
- **Seguridad:** JWT (`jsonwebtoken`), contraseñas con `bcryptjs`, variables de entorno con `dotenv`.
- **Reportes:** PDF con `pdfkit`. **Correo:** `nodemailer`.
- **Base de datos:** PostgreSQL 18.
- **Documentación:** Swagger UI (OpenAPI 3) en `/api-docs`.

## Estructura

```
Programacion-IV-main/
├── backend/
│   ├── src/
│   │   ├── config/            # Swagger/OpenAPI
│   │   ├── controllers/       # lógica de cada recurso
│   │   ├── middlewares/       # autenticar / autorizar por rol
│   │   ├── models/            # consultas SQL
│   │   ├── routes/            # endpoints
│   │   ├── services/          # PDF y correo
│   │   ├── db.js              # pool de conexiones
│   │   └── index.js           # servidor Express
│   ├── .env.example
│   └── package.json
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   ├── 03_upgrade_existing.sql
│   └── README.md
├── frontend/
│   ├── index.html
│   ├── assets/
│   └── src/
│       ├── api.js             # todas las llamadas a la API
│       ├── auth.js            # sesión, token y guard por rol
│       ├── ui.js              # helpers de interfaz
│       ├── style.css
│       └── pages/             # pantallas por rol
└── PLAN.md                    # plan de trabajo y estado
```

## Puesta en marcha

### 1. Base de datos

Seguir `database/README.md`. Resumen:

```bash
psql -U postgres -d incidencias_db -f database/01_schema.sql
psql -U postgres -d incidencias_db -f database/02_seed.sql
```

También se pueden ejecutar desde el Query Tool de pgAdmin 4.

### 2. Backend

```bash
cd backend
cp .env.example .env      # completar con la contraseña real de PostgreSQL
npm install
npm run dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api-docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Usuarios de prueba

Contraseña para todas las cuentas: `123456`.

| Rol | Usuario |
|---|---|
| Empleado Municipal | `pamalm@correo.com` |
| Empleado de Sistemas | `carper@correo.com` |
| Empleado de Sistemas | `cargom@correo.com` |
| Director de Sistemas | `estren@correo.com` |

Al ingresar, el sistema guarda el token en `localStorage` y redirige según el rol.
Cada request envía `Authorization: Bearer <token>` y las pantallas verifican el rol antes de mostrarse.

## Endpoints implementados

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicia sesión y devuelve el token JWT |
| GET | `/api/auth/me` | Datos del usuario autenticado |
| GET | `/api/categorias` | Lista categorías activas (rol Sistemas) |
| GET | `/api/categorias/:id` | Obtiene una categoría |
| POST | `/api/categorias` | Crea una categoría |
| PUT | `/api/categorias/:id` | Actualiza una categoría |
| DELETE | `/api/categorias/:id` | Baja lógica |
| GET | `/api/articulos` | Lista artículos (filtros `id_area`, `id_categoria`) |
| GET | `/api/articulos/:id` | Obtiene un artículo |
| POST | `/api/articulos` | Crea un artículo (rol Sistemas) |
| PUT | `/api/articulos/:id` | Actualiza un artículo (rol Sistemas) |
| DELETE | `/api/articulos/:id` | Baja lógica (rol Sistemas) |
| GET | `/api/incidencias` | Lista según el rol (filtros `id_estado`, `prioridad`, `id_area`, `desde`, `hasta`) |
| GET | `/api/incidencias/:id` | Detalle de la incidencia |
| POST | `/api/incidencias` | Crea una incidencia (rol Municipal) |
| PATCH | `/api/incidencias/:id/cancelar` | Cancela (dueño o Director) |
| PATCH | `/api/incidencias/:id/asignar` | Asigna a un empleado de Sistemas (Director) |
| PATCH | `/api/incidencias/:id/finalizar` | Finaliza con resolución (Sistemas asignado) |
| GET | `/api/dashboard/resumen` | Totales por estado, por fecha y prioritarias (Director) |
| GET | `/api/areas` | Áreas activas |
| GET | `/api/estados` | Estados activos |
| GET | `/api/usuarios` | Usuarios activos (filtros `rol`, `id_area`, rol Director) |
| GET | `/api/reportes/incidencias.pdf` | Reporte PDF (rol Director) |

Los cambios de estado se hacen dentro de **transacciones**, registran el historial en `incidencias_estados` y disparan un correo al solicitante cuando la incidencia se **finaliza o cancela**.

## Estado del proyecto

Implementado:

- Base de datos con 7 tablas, claves foráneas e índices, más seed reproducible.
- BREAD de categorías y artículos con **soft delete** (`activo = 1/0`).
- Flujo completo de incidencias: crear, cancelar, asignar y finalizar.
- **JWT** con login, `/auth/me` y middlewares de autorización por rol.
- **Frontend responsivo** conectado a la API, con guard de sesión y redirección por rol.
- **Reporte PDF** descargable desde el dashboard del Director.
- **Correo** al finalizar o cancelar (real por SMTP o simulado por consola).
- **Swagger** con todos los endpoints documentados en `/api-docs`.
- Variables sensibles en `.env`.

Pendiente (ver `PLAN.md`):

- Middlewares `express-validator`, `morgan` y `multer`.
- Repositorio GitHub y ZIP de entrega.
