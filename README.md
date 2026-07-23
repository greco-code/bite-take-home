# Bite

Bite is a full-stack ordering application built as a pnpm monorepo. The project
contains a Next.js customer application, an Express API, and a shared package for
runtime validation and API contracts.

> Project status: the workspace, responsive product catalog, product details,
> PostgreSQL catalog persistence, API, and API documentation are ready. Cart,
> checkout, order persistence, and deployment will be implemented in subsequent
> milestones.

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

- Node.js `22.14.0` through `24.x`
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

| Variable       | Required | Purpose                                                            |
| -------------- | -------- | ------------------------------------------------------------------ |
| `PORT`         | No       | Express port. Defaults to `4000`.                                  |
| `DATABASE_URL` | Yes      | Neon PostgreSQL connection string used by Drizzle.                 |
| `WEB_ORIGINS`  | No       | Comma-separated browser origins allowed by CORS. Defaults locally. |

Replace the example `DATABASE_URL` with the connection string supplied by Neon
before running database migrations or persistence features. It is a server-only
secret and must never use a `NEXT_PUBLIC_` prefix.

The API development, production-start, and catalog-import scripts load
`apps/api/.env` automatically. The API requires `DATABASE_URL` because catalog
requests read from PostgreSQL.

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
port `4000`. The API uses `WEB_ORIGINS` as an explicit CORS allow-list.

This deliberately keeps the two deployable applications independent. Do not add
a Next.js `/api` rewrite unless that deployment decision is revisited.

## Database setup

Create a Neon PostgreSQL project and place its pooled connection string in
`apps/api/.env`. Then apply the checked-in migration:

```bash
pnpm --filter @bite/api db:migrate
```

Import the starter catalog:

```bash
pnpm --filter @bite/api catalog:import
```

The import is idempotent: it inserts new product IDs and updates matching IDs.
It also preserves the JSON array as the catalog display order and never deletes
catalog rows. Schema migrations and imports are explicit commands and are never
run during application startup.

Neon is the PostgreSQL provider; Drizzle does not replace PostgreSQL. It is the
thin schema, migration, and type-safe query layer used on top of Neon. Keeping
it gives the upcoming order and order-line tables reviewed SQL migrations and
typed queries without introducing a generated database client. Database access
still stays explicit in the API repositories.

When the Drizzle schema changes, generate and review a new SQL migration:

```bash
pnpm --filter @bite/api db:generate
```

## Running locally

Start the web application and API together:

```bash
pnpm dev
```

`npm run dev` is also supported, but pnpm remains the required package manager
for installation and workspace maintenance.

Local services:

| Service      | URL                                  |
| ------------ | ------------------------------------ |
| Web          | <http://localhost:3000>              |
| API health   | <http://localhost:4000/health>       |
| Product list | <http://localhost:4000/v1/products>  |
| OpenAPI JSON | <http://localhost:4000/openapi.json> |
| Swagger UI   | <http://localhost:4000/docs>         |

The health endpoint should return:

```json
{ "status": "ok" }
```

Catalog endpoints:

| Method | Path                       | Purpose                    |
| ------ | -------------------------- | -------------------------- |
| `GET`  | `/v1/products`             | List all catalog products. |
| `GET`  | `/v1/products/{productId}` | Retrieve one product.      |

Customer routes:

| Path                    | Purpose                         |
| ----------------------- | ------------------------------- |
| `/`                     | Browse the responsive menu.     |
| `/products/{productId}` | View one product and its price. |

The customer application uses TanStack Query for catalog server-state and
validates API responses against the shared Zod contracts before rendering them.

The OpenAPI 3.1 document is generated from the shared Zod contracts rather than
maintained separately. Swagger UI renders that document and can execute requests
against the current API origin.

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

The API test suite covers health, catalog responses and errors, CORS, the
OpenAPI document, and Swagger UI. Frontend tests cover catalog response
validation, encoded product URLs, API errors, and price formatting.

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

The API reports a clear startup error when `DATABASE_URL` is absent.

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
