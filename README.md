# Backend Collabs

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Docker

Levantar la API y PostgreSQL con Docker Compose:

```bash
docker compose up --build
```

La API quedará disponible en `http://localhost:4000` y la base de datos en `localhost:5432`.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores según tu entorno.

Variables soportadas por `src/config/index.ts`:

- `PORT`: puerto HTTP de la API. Por defecto `4000`.
- `DATABASE_URL`: cadena de conexión de PostgreSQL.
- `JWT_SECRET`: secreto para firmar tokens JWT.
- `JWT_EXPIRES_IN`: duración de los JWT, por ejemplo `1d` o `3600`.
- `CORS_ORIGIN`: origen permitido por CORS. Por defecto `http://localhost:3000`.
- `NODE_ENV`: entorno de ejecución. Por defecto `development`.
