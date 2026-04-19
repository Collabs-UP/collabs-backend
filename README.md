# Backend Collabs

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Producción en Railway

En `develop`, la app debe leer sus variables desde Railway, especialmente `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` y `PORT`.

No dependas de archivos `.env` en el repo; configura las variables directamente en el servicio de Railway.

## Variables de entorno

Variables soportadas por `src/config/index.ts`:

- `PORT`: puerto HTTP de la API. Por defecto `4000`.
- `DATABASE_URL`: cadena de conexión de PostgreSQL.
- `JWT_SECRET`: secreto para firmar tokens JWT.
- `JWT_EXPIRES_IN`: duración de los JWT, por ejemplo `1d` o `3600`.
- `CORS_ORIGIN`: origen permitido por CORS. Por defecto `http://localhost:3000`.
- `NODE_ENV`: entorno de ejecución. Por defecto `development`.

## Docker

Si ya no vas a usar archivos `.env`, elimina las referencias locales en tu flujo de despliegue y define los valores como variables de entorno del contenedor o del proveedor de hosting.
