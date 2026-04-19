# Backend Collabs

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Docker

Para levantar la API y PostgreSQL con Docker Compose:

1. Copia la plantilla de Docker:

```bash
copy .env.compose.example .env.compose
```

2. Ajusta los valores si lo necesitas.
3. Levanta los servicios usando ese archivo de entorno:

```bash
docker compose --env-file .env.compose up --build
```

La API quedará disponible en `http://localhost:4000` y la base de datos en `localhost:5432`.

## Variables de entorno

Hay dos archivos de ejemplo:

- `.env.example`: para ejecutar la app fuera de Docker.
- `.env.compose.example`: para ejecutar `docker compose`.

Copia el que corresponda a tu flujo y renómbralo como archivo real.

Variables soportadas por `src/config/index.ts`:

- `PORT`: puerto HTTP de la API. Por defecto `4000`.
- `DATABASE_URL`: cadena de conexión de PostgreSQL.
- `JWT_SECRET`: secreto para firmar tokens JWT.
- `JWT_EXPIRES_IN`: duración de los JWT, por ejemplo `1d` o `3600`.
- `CORS_ORIGIN`: origen permitido por CORS. Por defecto `http://localhost:3000`.
- `NODE_ENV`: entorno de ejecución. Por defecto `development`.
