# Flowdesk Workspace Unification

This repository is the integration layer for `flowdesk-bck` and `flowdesk-frt`.

## Architecture
- The top-level workspace owns shared environment variables, local startup scripts, Docker composition, and gateway routing.
- The frontend and backend remain independent submodules. UI behavior, backend routes, backend business logic, and feature scope stay inside their own repositories.
- The gateway is the only public entry point in the unified topology.
  - `/api/*` is routed to the backend.
  - All other paths are routed to the frontend.

## Current Module Status
- `auth`: live frontend-backend contract.
- `inventory`: frontend-only placeholder view. No backend contract is wired in this phase.
- `products`: contract deferred.
- `tasks`: contract deferred.

## Local Development
1. Copy `./.env.example` to `.env` and fill in the backend secrets and database values you want to use locally.
2. Install backend dependencies in `flowdesk-bck` and frontend dependencies in `flowdesk-frt`.
3. Start everything from the root workspace with `./scripts/dev-up.sh`.
4. Open `FLOWDESK_PUBLIC_ORIGIN` from `.env`. The default is `http://127.0.0.1:8080`.

You can also run the services separately:
- `./scripts/start-backend.sh`
- `./scripts/start-frontend.sh`
- `./scripts/start-gateway.sh`

## Docker Workflow
- Run `docker compose up --build` from the root workspace.
- The exposed public URL is `http://127.0.0.1:8080` by default.
- In Docker, the backend talks to `postgres` over the internal network, and the gateway remains the only published service.
- The root backend image installs only the API runtime dependencies required by the current FastAPI app. It does not package the backend repo's broader analytics/notebook toolchain.

## Deployment Blueprint
- Keep the gateway public.
- Keep the backend private behind the gateway.
- Frontend traffic should still enter through the gateway, even if the frontend is later served as static assets or a private app service.
- Preserve `VITE_API_BASE_URL=/` at the public entry point so the frontend keeps using the existing relative `/api/...` paths.

## Integration Rules
- Root workspace changes are the default place for cross-repo composition.
- The first allowed submodule edits in future phases should be config-only integration hooks.
- Frontend screen changes, backend route changes, and backend behavior changes require explicit approval before implementation.
