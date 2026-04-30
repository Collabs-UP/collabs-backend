
# Collabs Backend

![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/jwt-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

## 📌 Descripción

Backend construido bajo un enfoque SOA (Arquitectura Orientada a Servicios) para la gestión de usuarios, autenticación, workspaces, miembros y tareas en Collabs. Expone una API REST robusta y segura, diseñada para integrarse con el frontend y otros servicios.

---

## Problema que resuelve

- Centraliza la lógica de negocio y persistencia para colaboración en equipos.
- Provee endpoints seguros para autenticación, gestión de tareas y administración de workspaces.
- Permite integración desacoplada con clientes frontend y potenciales servicios externos.

---

## Responsabilidades principales

- Autenticación y autorización vía JWT.
- CRUD de usuarios, workspaces, miembros y tareas.
- Validación de datos y control de acceso por roles.
- Persistencia eficiente sobre PostgreSQL mediante Prisma ORM.

---

## Flujo general

```
1. Usuario se registra o inicia sesión (JWT emitido)
2. Crea o se une a un workspace
3. Gestiona tareas y miembros dentro del workspace
4. Todas las operaciones se validan y persisten en la base de datos
5. El frontend consume los endpoints protegidos según el flujo de negocio
```

---

## Modelo de datos (simplificado)

- **Usuario**: id, email, password (hash), nombre
- **Workspace**: id, nombre, ownerId
- **Miembro**: id, userId, workspaceId, rol
- **Tarea**: id, título, descripción, status, workspaceId, assignedTo

Relaciones:
- Un usuario puede pertenecer a varios workspaces.
- Un workspace tiene múltiples miembros y tareas.
- Las tareas pueden asignarse a miembros específicos.

---

## Comunicación con otros servicios

- **API REST**: expone endpoints consumidos por el frontend y potenciales servicios externos.
- **JWT**: autenticación y autorización en cada petición.

---

## Decisiones técnicas

- **NestJS**: estructura modular, inyección de dependencias y escalabilidad.
- **Prisma ORM**: tipado estricto, migraciones y consultas eficientes.
- **PostgreSQL**: robustez y soporte para relaciones complejas.
- **DTOs y Guards**: validación y seguridad a nivel de endpoint.
- **Arquitectura limpia**: separación clara de dominios (auth, users, workspaces, tasks).

---

## Desarrollo local

1. Clona el repositorio:
	```bash
	git clone https://github.com/Collabs-UP/collabs-backend.git
	cd collabs-backend
	```
2. Instala dependencias:
	```bash
	npm install
	```
3. Configura variables de entorno en `.env` (ver ejemplo en `.env.example`).
4. Aplica migraciones de base de datos:
	```bash
	npx prisma migrate dev
	```
5. Inicia el servidor en desarrollo:
	```bash
	npm run start:dev
	```
	El backend estará disponible en `http://localhost:3001` (o el puerto configurado).

---

## Variables de entorno

Soportadas por `src/config/index.ts`:

- `PORT`: puerto HTTP de la API. Por defecto `4000`.
- `DATABASE_URL`: cadena de conexión de PostgreSQL.
- `JWT_SECRET`: secreto para firmar tokens JWT.
- `JWT_EXPIRES_IN`: duración de los JWT, por ejemplo `1d` o `3600`.
- `CORS_ORIGIN`: origen permitido por CORS. Por defecto `http://localhost:3000`.
- `NODE_ENV`: entorno de ejecución. Por defecto `development`.


---

## Pruebas

- Pruebas e2e con Jest disponibles en la carpeta `/test`.
- Ejecuta:
  ```bash
  npm run test:e2e
  ```
- Se recomienda validar flujos críticos: registro, login, creación de workspace, gestión de tareas.

