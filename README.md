# Bite

Bite is a full-stack ordering application built as a pnpm monorepo. The project
contains a Next.js customer application, an Express API, and a shared package for
runtime validation and API contracts.

> Project status: the workspace and development servers are ready. Catalog,
> cart, checkout, PostgreSQL persistence, and deployment will be implemented in
> subsequent milestones.

## Repository structure

```text
apps/
  web/                 Next.js application
  api/                 Express API
packages/
  contracts/           Shared Zod schemas and TypeScript API types
```

Turborepo coordinates development, builds, linting, type checks, and tests across
the workspace.

## Prerequisites

- Node.js `22.13.0` through `24.x`
- Corepack, which is included with the supported Node.js versions
- Git

The repository contains an `.nvmrc` for Node `22.22.2` and pins pnpm
`10.34.5` in `package.json`.

If you use nvm:

```bash
nvm install
nvm use
```

Enable the package-manager shim:

```bash
corepack enable
pnpm --version
```

The reported pnpm version should be `10.34.5`. Corepack reads the pinned version
from the repository automatically.

## Installation

From the repository root:

```bash
pnpm install --frozen-lockfile
```

Use pnpm for dependency installation. Do not run `npm install`, because this is
a pnpm workspace and `pnpm-lock.yaml` is the authoritative lockfile.

## Environment files

Environment files belong to the application that consumes them; a root `.env`
file is not used.

Create local files from the checked-in examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Both generated files are ignored by Git. Never commit real credentials.

### API environment

`apps/api/.env`:

| Variable       | Required now | Purpose                                                              |
| -------------- | ------------ | -------------------------------------------------------------------- |
| `PORT`         | No           | Express port. Defaults to `4000`.                                    |
| `DATABASE_URL` | Not yet      | Neon PostgreSQL connection string used by the persistence milestone. |
| `WEB_ORIGINS`  | Not yet      | Comma-separated browser origins allowed by CORS.                     |

Replace the example `DATABASE_URL` with the connection string supplied by Neon
before running database migrations or persistence features. It is a server-only
secret and must never use a `NEXT_PUBLIC_` prefix.

The API development and production-start scripts load `apps/api/.env`
automatically. Development can currently run without this file because the API
has a default port and does not connect to PostgreSQL yet.

### Web environment

`apps/web/.env.local`:

| Variable              | Required | Purpose                                               |
| --------------------- | -------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Base URL used by browser requests to the Express API. |

The local value is:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Variables prefixed with `NEXT_PUBLIC_` are included in browser code. Never put
secrets, database credentials, or private tokens in them.

Restart the relevant development server after changing an environment file.

### API communication

The browser calls the Express API directly using `NEXT_PUBLIC_API_URL`. In local
development, that means the web application on port `3000` requests the API on
port `4000`. The API will use `WEB_ORIGINS` as an explicit CORS allow-list when
catalog endpoints are introduced.

This deliberately keeps the two deployable applications independent. Do not add
a Next.js `/api` rewrite unless that deployment decision is revisited.

## Running locally

Start the web application and API together:

```bash
pnpm dev
```

`npm run dev` is also supported, but pnpm remains the required package manager
for installation and workspace maintenance.

Local services:

| Service    | URL                            |
| ---------- | ------------------------------ |
| Web        | <http://localhost:3000>        |
| API health | <http://localhost:4000/health> |

The health endpoint should return:

```json
{ "status": "ok" }
```

Run only one application when needed:

```bash
pnpm dev:web
pnpm dev:api
```

Stop the development processes with `Ctrl+C`.

## Production build

Build every workspace:

```bash
pnpm build
```

After a successful build, the applications can be started separately:

```bash
pnpm --filter @bite/api start
pnpm --filter @bite/web start
```

The final deployment will use separate Vercel projects for `apps/api` and
`apps/web`; deployment configuration is added in a later milestone.

## Quality checks

Run all repository checks from the root:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Package-specific commands use pnpm filters:

```bash
pnpm --filter @bite/web typecheck
pnpm --filter @bite/api lint
pnpm --filter @bite/contracts test
```

The current test commands succeed without test files while the scaffold is
empty. Each behavior milestone will add its tests alongside the implementation.

## Troubleshooting

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`

This error means Turbo found an incompatible global Corepack/pnpm shim instead
of the pnpm version pinned by the repository.

From the repository root:

```bash
corepack enable
corepack install --global pnpm@10.34.5
pnpm --version
pnpm install --frozen-lockfile
```

If you use nvm, run `corepack enable` again after switching or installing a Node
version. Open a new terminal if the old executable remains cached.

You can inspect the selected executable with:

```bash
which node
which pnpm
```

### Missing environment-file message

Create the application-specific files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

The API currently continues with safe local defaults when `.env` is absent.

### Port already in use

Either stop the process using ports `3000` or `4000`, or change `PORT` in
`apps/api/.env`. If the API port changes, update `NEXT_PUBLIC_API_URL` in
`apps/web/.env.local` to match.

## Security notes

- Commit example environment files only.
- Treat `DATABASE_URL` as a secret.
- Treat `NEXT_PUBLIC_*` variables as public browser configuration.
- Do not log environment values or connection strings.
- Completed orders will be priced and persisted by the API rather than trusting
  browser-submitted totals.
