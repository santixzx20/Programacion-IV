# Gestor de Incidencias – Municipalidad de Concordia

Trabajo Final Integrador de **Programación IV** (Licenciatura en Sistemas – UNER).

Sistema web para registrar, asignar y resolver incidencias informáticas del municipio, con tres roles: Empleado Municipal, Empleado de Sistemas y Director de Sistemas.

## Tecnologías

- **Frontend:** Vite + HTML + CSS + JavaScript + Bootstrap 5.
- **Backend:** Node.js + Express 5 (ESM) + PostgreSQL (`pg`).
- **Middlewares:** `express-validator` (validaciones), `morgan` (registro de solicitudes) y `multer` (imagen de la incidencia).
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
│   │   ├── middlewares/       # autenticar / autorizar / validar / upload
│   │   ├── models/            # consultas SQL
│   │   ├── routes/            # endpoints
│   │   ├── services/          # PDF y correo
│   │   ├── db.js              # pool de conexiones
│   │   └── index.js           # servidor Express
│   ├── .env.example
│   └── package.json
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

La base `incidencias_db` ya está creada y se administra con **pgAdmin 4**. El backend no crea tablas ni carga datos: sólo se conecta usando las credenciales del `.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env      # completar con la contraseña real de PostgreSQL
npm install
npm run dev
```

- API: `http://localhost:3000/api/v1` (se mantiene `/api` como alias)
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
| POST | `/api/v1/auth/login` | Inicia sesión y devuelve el token JWT |
| GET | `/api/v1/auth/me` | Datos del usuario autenticado |
| GET | `/api/v1/categorias` | Lista categorías activas (rol Sistemas) |
| GET | `/api/v1/categorias/:id` | Obtiene una categoría |
| POST | `/api/v1/categorias` | Crea una categoría |
| PUT | `/api/v1/categorias/:id` | Actualiza una categoría |
| DELETE | `/api/v1/categorias/:id` | Baja lógica |
| GET | `/api/v1/articulos` | Lista artículos (filtros `id_area`, `id_categoria`) |
| GET | `/api/v1/articulos/:id` | Obtiene un artículo |
| POST | `/api/v1/articulos` | Crea un artículo (rol Sistemas) |
| PUT | `/api/v1/articulos/:id` | Actualiza un artículo (rol Sistemas) |
| DELETE | `/api/v1/articulos/:id` | Baja lógica (rol Sistemas) |
| GET | `/api/v1/incidencias` | Lista según el rol (filtros `id_estado`, `prioridad`, `id_area`, `desde`, `hasta`) |
| GET | `/api/v1/incidencias/:id` | Detalle de la incidencia |
| POST | `/api/v1/incidencias` | Crea una incidencia con imagen opcional (`multer`) |
| PATCH | `/api/v1/incidencias/:id/cancelar` | Cancela (dueño o Director) |
| PATCH | `/api/v1/incidencias/:id/asignar` | Asigna a un empleado de Sistemas (Director) |
| PATCH | `/api/v1/incidencias/:id/finalizar` | Finaliza con resolución (Sistemas asignado) |
| GET | `/api/v1/dashboard/resumen` | Totales por estado, por fecha y prioritarias (Director) |
| GET | `/api/v1/areas` | Áreas activas |
| GET | `/api/v1/estados` | Estados activos |
| GET | `/api/v1/usuarios` | Usuarios activos (filtros `rol`, `id_area`, rol Director) |
| GET | `/api/v1/reportes/incidencias.pdf` | Reporte PDF (rol Director) |

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
- **Middlewares:** `express-validator`, `morgan` y `multer`.
- Variables sensibles en `.env`.
