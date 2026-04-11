# Live Auth Contract

The backend auth routes in `flowdesk-bck` are the source of truth for the current live frontend-backend contract.

## Endpoints

### `POST /api/v1/auth/register`
Request body:

```json
{
  "name": "Empresa Demo",
  "schema_name": "empresa_demo",
  "admin_email": "admin@empresa.com",
  "admin_username": "admin"
}
```

Response body:

```json
{
  "id": "uuid",
  "name": "Empresa Demo",
  "schema_name": "empresa_demo",
  "is_active": true,
  "created_at": "2026-04-11T00:00:00Z"
}
```

### `POST /api/v1/auth/login`
Request body:

```json
{
  "email": "admin@empresa.com",
  "password": "secret"
}
```

Response body:

```json
{
  "access_token": "jwt",
  "token_type": "bearer"
}
```

### `POST /api/v1/auth/set-password`
Request body:

```json
{
  "token": "jwt",
  "new_password": "secret"
}
```

### `POST /api/v1/auth/employees`
- Requires `Authorization: Bearer <token>`.
- Requires an admin user.

## JWT Claims Currently Used by the Frontend
- `sub`
- `exp`
- `iat`
- `purpose`
- `role`
- `company_id`
- `schema_name`

## Known Deferred Gap
- The registration screen in `flowdesk-frt` collects `admin_password` and `admin_confirm_password`.
- The current request contract does not send those fields.
- The backend still uses the `set-password` flow after company registration.
- This mismatch is documented here and intentionally preserved in this phase.

## Error Handling Expectations
- The frontend currently normalizes backend errors from `detail`, `message`, or `errors`.
- The backend currently raises `AppError`, which is surfaced through FastAPI as `detail`.
