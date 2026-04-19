# Endpoints de la API de Collabs Backend

**Base URL:** `/api`

Esta guía resume los endpoints que existen en el código actual, cómo se usan y qué autenticación requieren.

## Reglas generales

- La API usa prefijo global `/api`.
- Las rutas protegidas requieren header:

```http
Authorization: Bearer <access_token>
```

- El backend valida los `DTOs` con `ValidationPipe`:
  - `whitelist: true`
  - `transform: true`
  - `forbidNonWhitelisted: true`
- Si envías campos extra en el body, la petición falla.

## Auth

### `POST /api/auth/register`
Crea un usuario nuevo.

**Body**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Validaciones**
- `name`: string, mínimo 3 caracteres
- `email`: email válido
- `password`: string, mínimo 8 caracteres

**Respuesta exitosa**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "createdAt": "2026-04-19T12:00:00.000Z"
  }
}
```

**Errores comunes**
- `409 Conflict`: el email ya existe
- `400 Bad Request`: validación fallida

---

### `POST /api/auth/login`
Inicia sesión y devuelve un token JWT.

**Body**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Validaciones**
- `email`: email válido
- `password`: string, mínimo 8 caracteres

**Respuesta exitosa**
```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Errores comunes**
- `401 Unauthorized`: credenciales inválidas

---

### `GET /api/auth/me`
Devuelve el usuario autenticado según el JWT.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa**
```json
{
  "id": "...",
  "email": "juan@example.com",
  "name": "Juan Pérez"
}
```

---

## Usuarios

### `PATCH /api/users/me`
Actualiza el nombre del usuario autenticado.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Body**
```json
{
  "name": "Juan Nuevo"
}
```

**Validaciones**
- `name`: string, mínimo 2 caracteres

**Respuesta exitosa**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "name": "Juan Nuevo",
    "email": "juan@example.com",
    "createdAt": "2026-04-19T12:00:00.000Z"
  }
}
```

---

### `DELETE /api/users/me`
Elimina el usuario autenticado.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Reglas de negocio**
- No permite borrar si el usuario todavía es dueño de workspaces.
- No permite borrar si todavía tiene tareas asignadas.

**Respuesta exitosa**
```json
{
  "message": "User deleted successfully"
}
```

**Errores comunes**
- `409 Conflict`: el usuario aún tiene workspaces o tareas pendientes
- `404 Not Found`: usuario no encontrado

---

## Workspaces

### `POST /api/workspaces`
Crea un workspace nuevo.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Body**
```json
{
  "projectName": "Proyecto Alpha",
  "description": "Tablero principal del equipo"
}
```

**Validaciones**
- `projectName`: string, mínimo 3 caracteres
- `description`: string, mínimo 5 caracteres

**Respuesta exitosa**
```json
{
  "id": "...",
  "projectName": "Proyecto Alpha",
  "description": "Tablero principal del equipo",
  "accessCode": "ABC123",
  "role": "OWNER",
  "createdAt": "2026-04-19T12:00:00.000Z"
}
```

---

### `POST /api/workspaces/join`
Permite unirse a un workspace con su código de acceso.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Body**
```json
{
  "accessCode": "ABC123"
}
```

**Validaciones**
- `accessCode`: string de exactamente 6 caracteres

**Comportamiento**
- El código se normaliza a mayúsculas.

**Respuesta exitosa**
```json
{
  "message": "Joined workspace successfully",
  "workspace": {
    "id": "...",
    "projectName": "Proyecto Alpha",
    "description": "Tablero principal del equipo",
    "accessCode": "ABC123"
  },
  "membership": {
    "id": "...",
    "role": "MEMBER",
    "joinedAt": "2026-04-19T12:00:00.000Z"
  }
}
```

**Errores comunes**
- `404 Not Found`: no existe el workspace con ese código
- `409 Conflict`: ya eres miembro

---

### `GET /api/workspaces`
Lista los workspaces del usuario autenticado.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa**
```json
{
  "data": [
    {
      "id": "...",
      "project_name": "Proyecto Alpha",
      "description": "Tablero principal del equipo",
      "access_code": "ABC123",
      "role": "OWNER",
      "created_at": "2026-04-19T12:00:00.000Z",
      "owner": {
        "id": "...",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      },
      "stats": {
        "total_tasks": 10,
        "completed_tasks": 4,
        "in_process_tasks": 6,
        "progress_percentage": 40
      }
    }
  ]
}
```

---

### `GET /api/workspaces/:workspaceId/members`
Lista los miembros de un workspace y sus estadísticas.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace

**Regla de acceso**
- Debes ser miembro del workspace.

**Respuesta exitosa**
```json
{
  "workspace_id": "...",
  "members": [
    {
      "id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "OWNER",
      "joined_at": "2026-04-19T12:00:00.000Z",
      "task_stats": {
        "assigned_tasks": 5,
        "completed_tasks": 3,
        "in_process_tasks": 2
      }
    }
  ]
}
```

**Errores comunes**
- `404 Not Found`: workspace no existe
- `403 Forbidden`: no eres miembro

---

### `PATCH /api/workspaces/:workspaceId`
Actualiza un workspace.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace

**Body**
```json
{
  "projectName": "Proyecto Beta",
  "description": "Nueva descripción"
}
```

**Validaciones**
- `projectName`: opcional, si se envía mínimo 3 caracteres
- `description`: opcional, si se envía mínimo 5 caracteres
- Debe enviarse al menos uno de los dos campos

**Regla de acceso**
- Solo el dueño puede actualizarlo.

**Respuesta exitosa**
```json
{
  "message": "Workspace updated successfully",
  "workspace": {
    "id": "...",
    "projectName": "Proyecto Beta",
    "description": "Nueva descripción",
    "accessCode": "ABC123",
    "createdAt": "2026-04-19T12:00:00.000Z"
  }
}
```

**Errores comunes**
- `404 Not Found`: workspace no existe
- `403 Forbidden`: no eres el dueño
- `400 Bad Request`: no enviaste campos para actualizar

---

### `DELETE /api/workspaces/:workspaceId`
Elimina un workspace.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace

**Regla de acceso**
- Solo el dueño puede eliminarlo.

**Respuesta**
La lógica está en el service; el controlador devuelve el resultado directo del servicio.

**Errores comunes**
- `404 Not Found`: workspace no existe
- `403 Forbidden`: no eres el dueño

---

## Tareas

### `POST /api/workspaces/:workspaceId/tasks`
Crea una tarea dentro de un workspace.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace

**Body**
```json
{
  "title": "Diseñar UI",
  "description": "Crear el mockup de la pantalla principal",
  "assignedToId": "usuario-id",
  "dueDate": "2026-05-01T00:00:00.000Z"
}
```

**Validaciones**
- `title`: string, mínimo 3 caracteres
- `description`: string, mínimo 5 caracteres
- `assignedToId`: string
- `dueDate`: fecha en formato ISO

**Reglas de acceso**
- Solo el dueño del workspace puede crear tareas.
- El usuario asignado debe ser miembro del workspace.

**Respuesta exitosa**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "...",
    "title": "Diseñar UI",
    "description": "Crear el mockup de la pantalla principal",
    "status": "IN_PROCESS",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "assignedTo": {
      "id": "usuario-id",
      "name": "Ana",
      "email": "ana@example.com"
    }
  }
}
```

**Errores comunes**
- `404 Not Found`: workspace no existe
- `403 Forbidden`: no eres el dueño
- `400 Bad Request`: el asignado no pertenece al workspace o el body no valida

---

### `GET /api/workspaces/:workspaceId/tasks`
Lista las tareas de un workspace.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace

**Query opcional**
- `status`: `IN_PROCESS` o `COMPLETED`

**Ejemplos**
```http
GET /api/workspaces/:workspaceId/tasks
GET /api/workspaces/:workspaceId/tasks?status=COMPLETED
```

**Regla de acceso**
- Debes ser miembro del workspace.

**Respuesta exitosa**
```json
{
  "workspaceId": "...",
  "tasks": [
    {
      "id": "...",
      "title": "Diseñar UI",
      "description": "Crear el mockup de la pantalla principal",
      "status": "IN_PROCESS",
      "creationDate": "2026-04-19T12:00:00.000Z",
      "dueDate": "2026-05-01T00:00:00.000Z",
      "assignedTo": {
        "id": "usuario-id",
        "name": "Ana",
        "email": "ana@example.com"
      }
    }
  ],
  "summary": {
    "totalTasks": 1,
    "completedTasks": 0,
    "inProcessTasks": 1,
    "progressPercentage": 0
  }
}
```

**Errores comunes**
- `403 Forbidden`: no eres miembro del workspace

---

### `DELETE /api/workspaces/:workspaceId/tasks/:taskId`
Elimina una tarea del workspace.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace
- `taskId`: ID de la tarea

**Respuesta exitosa**
```json
{
  "message": "Tarea eliminada exitosamente"
}
```

**Notas importantes**
- En el código actual esta ruta está protegida con JWT, pero el service no verifica explícitamente rol/propiedad del usuario que borra la tarea.
- Si la tarea no pertenece al workspace o no existe, responde `404`.

---

### `PATCH /api/tasks/:taskId/status`
Actualiza el estado de una tarea.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `taskId`: ID de la tarea

**Body**
```json
{
  "status": "COMPLETED"
}
```

**Validaciones**
- `status`: debe ser un valor del enum `TaskStatus`
- Valores actuales: `IN_PROCESS`, `COMPLETED`

**Regla de acceso**
- Solo el usuario asignado puede cambiar el estado.

**Respuesta exitosa**
```json
{
  "message": "Task status updated successfully",
  "task": {
    "id": "...",
    "title": "Diseñar UI",
    "description": "Crear el mockup de la pantalla principal",
    "status": "COMPLETED",
    "dueDate": "2026-05-01T00:00:00.000Z",
    "assignedTo": {
      "id": "usuario-id",
      "name": "Ana",
      "email": "ana@example.com"
    }
  }
}
```

**Errores comunes**
- `404 Not Found`: tarea no encontrada
- `403 Forbidden`: no eres el asignado

---

## Miembros

### `DELETE /api/workspaces/:workspaceId/members/:memberId`
Elimina un miembro de un workspace y reasigna sus tareas al dueño.

**Headers**
```http
Authorization: Bearer <access_token>
```

**Params**
- `workspaceId`: ID del workspace
- `memberId`: ID del usuario a eliminar del workspace

**Respuesta exitosa**
```json
{
  "message": "Miembro eliminado y tareas reasignadas al administrador"
}
```

**Notas importantes**
- En el código actual este endpoint no tiene `JwtAuthGuard` en el controlador.
- Reasigna automáticamente las tareas del miembro al owner del workspace.
- Si el miembro no existe dentro del workspace, responde `404`.

---

## Resumen rápido de rutas

| Método | Ruta | Auth | Descripción |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Crear usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | Sí | Ver usuario autenticado |
| PATCH | `/api/users/me` | Sí | Actualizar perfil |
| DELETE | `/api/users/me` | Sí | Eliminar usuario |
| POST | `/api/workspaces` | Sí | Crear workspace |
| POST | `/api/workspaces/join` | Sí | Unirse a workspace |
| GET | `/api/workspaces` | Sí | Listar mis workspaces |
| GET | `/api/workspaces/:workspaceId/members` | Sí | Listar miembros |
| PATCH | `/api/workspaces/:workspaceId` | Sí | Actualizar workspace |
| DELETE | `/api/workspaces/:workspaceId` | Sí | Eliminar workspace |
| POST | `/api/workspaces/:workspaceId/tasks` | Sí | Crear tarea |
| GET | `/api/workspaces/:workspaceId/tasks` | Sí | Listar tareas |
| DELETE | `/api/workspaces/:workspaceId/tasks/:taskId` | Sí | Eliminar tarea |
| PATCH | `/api/tasks/:taskId/status` | Sí | Cambiar estado |
| DELETE | `/api/workspaces/:workspaceId/members/:memberId` | No en controlador | Eliminar miembro |

## Archivos útiles para mantener esta documentación

- `src/main.ts` — prefijo global `/api` y validación de inputs.
- `src/services/auth/controllers/AuthController.ts`
- `src/services/workspaces/controllers/WorkspacesController.ts`
- `src/services/task/controllers/TaskController.ts`
- `src/services/task/controllers/TaskStatusController.ts`
- `src/services/users/controllers/UserController.ts`
- `src/services/members/controllers/members.controller.ts`
- `src/services/**/dto/*.ts` — contratos de request.
- `src/services/**/services/*.ts` — reglas de negocio y respuestas.
- `prisma/schema.prisma` — enums y relaciones.

## Nota final

No encontré un `Controller` raíz adicional en el código actual, así que estos son los endpoints expuestos por la app según el workspace revisado.

