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

La API quedará disponible en `http://localhost:3000` y la base de datos en `localhost:5432`.

## Variables de entorno

Crea un archivo `.env` basado en `.env.example` antes de ejecutar Prisma o levantar el proyecto fuera de Docker.
