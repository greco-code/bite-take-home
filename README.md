# Bite

Bite is a full-stack ordering application built with Next.js, Express, and
PostgreSQL. Customers can browse a menu, manage a persistent cart, complete an
order, and return to an anonymous receipt.

- [Live application](https://bite-take-home-web.vercel.app/)
- [API documentation](https://bite-api-eight.vercel.app/docs/)

## Features

- Responsive product catalog and product details
- Persistent browser cart with independent duplicate lines
- Quantity controls, line removal, and server-validated checkout
- PostgreSQL order and order-line persistence
- Anonymous receipt access without user accounts
- Server-rendered catalog and product pages
- Shared runtime validation and API contracts
- Generated OpenAPI 3.1 specification and interactive Swagger UI

## Technology

| Area      | Tools                                                 |
| --------- | ----------------------------------------------------- |
| Web       | Next.js 16, React 19, TanStack Query, SCSS Modules    |
| API       | Express 5, Neon PostgreSQL, Drizzle ORM               |
| Contracts | Zod, Zod OpenAPI                                      |
| Tooling   | TypeScript, pnpm, Turborepo, Vitest, ESLint, Prettier |
| Hosting   | Vercel                                                |

## Project structure

```text
apps/
  api/          Express API, database schema, migrations, and catalog data
  web/          Next.js customer application
packages/
  contracts/    Shared Zod schemas and TypeScript contracts
```

## Getting started

### Requirements

- Git
- Node.js `22.14.0` through `24.x`
- Corepack
- A PostgreSQL database; the project is configured for Neon

The repository includes an `.nvmrc` for Node `22.22.2` and pins pnpm
`10.34.5`.

### 1. Clone the repository

```bash
git clone https://github.com/greco-code/bite-take-home.git
cd bite-take-home
```

### 2. Install Node.js and dependencies

With nvm:

```bash
nvm install
nvm use
corepack enable
pnpm install --frozen-lockfile
```

Verify that the pinned package manager is active:

```bash
pnpm --version
```

The expected version is `10.34.5`. Use pnpm for this repository; the workspace
lockfile is not compatible with `npm install`.

If Corepack selects a different version:

```bash
corepack install --global pnpm@10.34.5
```

### 3. Create the environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Configure `apps/api/.env`:

```dotenv
PORT=4000
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
# DATABASE_MIGRATION_URL=postgresql://user:password@host/database?sslmode=require
WEB_ORIGINS=http://localhost:3000
```

`DATABASE_URL` is the API runtime connection. Use Neon's pooled connection
string in a serverless deployment. `DATABASE_MIGRATION_URL` is optional and
should use Neon's direct connection string when running production migrations;
Drizzle falls back to `DATABASE_URL` when it is omitted.

A real database connection string is included in `apps/api/.env.example` solely
for demonstration purposes. It connects to an isolated, disposable database
that contains no sensitive or production data. Committing real credentials is
not an appropriate production practice.

Configure `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Local environment files are ignored by Git.

### 4. Initialize the database

For a new database, apply the checked-in migrations:

```bash
pnpm --filter @bite/api db:migrate
```

Then import the starter catalog:

```bash
pnpm --filter @bite/api catalog:import
```

The catalog import is idempotent: it inserts missing products and updates
existing products without deleting rows. Skip these commands when the target
database is already migrated and populated.

### 5. Start the application

Run the web application and API together:

```bash
pnpm dev
```

| Service         | URL                                  |
| --------------- | ------------------------------------ |
| Web application | <http://localhost:3000>              |
| API health      | <http://localhost:4000/health>       |
| Swagger UI      | <http://localhost:4000/docs/>        |
| OpenAPI JSON    | <http://localhost:4000/openapi.json> |

Stop both development processes with `Ctrl+C`.

## Commands

Run workspace commands from the repository root.

| Command             | Purpose                           |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Start the web application and API |
| `pnpm dev:web`      | Start only Next.js                |
| `pnpm dev:api`      | Start only Express                |
| `pnpm build`        | Build every workspace package     |
| `pnpm lint`         | Run ESLint across the workspace   |
| `pnpm typecheck`    | Run TypeScript checks             |
| `pnpm test`         | Run all test suites               |
| `pnpm format`       | Check formatting                  |
| `pnpm format:write` | Apply Prettier formatting         |

Database commands:

| Command                                  | Purpose                                    |
| ---------------------------------------- | ------------------------------------------ |
| `pnpm --filter @bite/api db:generate`    | Generate a migration after a schema change |
| `pnpm --filter @bite/api db:migrate`     | Apply pending migrations                   |
| `pnpm --filter @bite/api catalog:import` | Import or update the starter catalog       |

Run a command for one package with a pnpm filter:

```bash
pnpm --filter @bite/api test
pnpm --filter @bite/web typecheck
pnpm --filter @bite/contracts build
```

Build the production applications:

```bash
pnpm build
```

Then start each application in a separate terminal:

```bash
pnpm --filter @bite/api start
```

```bash
pnpm --filter @bite/web start
```

## Architecture

The browser calls the Express API directly. `NEXT_PUBLIC_API_URL` selects the
API origin, while `WEB_ORIGINS` is the API's explicit CORS allow-list.

The catalog and product routes are rendered on the server and passed to TanStack
Query as initial data. API responses are validated against shared Zod contracts
before the application uses them.

Cart state is stored in local storage. Checkout sends only product IDs and
quantities; the API reloads authoritative products and prices, then writes the
order and its line snapshots in a transaction.

There is no authentication flow. A completed order returns an opaque receipt
token to the browser, while PostgreSQL stores only its SHA-256 hash. The token is
sent in the `x-order-token` header when the same browser reloads a receipt.

Order creation is not idempotency-key protected in this time-boxed,
non-payment application. Automatic mutation retries are disabled.

## API

| Method | Path                       | Purpose                                 |
| ------ | -------------------------- | --------------------------------------- |
| `GET`  | `/health`                  | Check API health                        |
| `GET`  | `/v1/products`             | List products                           |
| `GET`  | `/v1/products/{productId}` | Retrieve one product                    |
| `POST` | `/v1/orders`               | Price and persist an order              |
| `GET`  | `/v1/orders/{orderId}`     | Retrieve a receipt with `x-order-token` |

The OpenAPI document is generated from the shared Zod contracts:

- Local JSON: <http://localhost:4000/openapi.json>
- Local Swagger UI: <http://localhost:4000/docs/>
- Deployed Swagger UI: <https://bite-api-eight.vercel.app/docs/>

## Deployment

The repository is deployed to Vercel as two projects from the same monorepo.
Keep **Include source files outside of the Root Directory** enabled so each
application can build `packages/contracts`.

### API project

```text
Root Directory: apps/api
Framework: Express
```

Required Vercel environment variables:

```text
DATABASE_URL=<pooled Neon connection string>
WEB_ORIGINS=<exact deployed web origin>
```

Do not add `DATABASE_MIGRATION_URL` or `PORT` to Vercel.

### Web project

```text
Root Directory: apps/web
Framework: Next.js
```

Required Vercel environment variable:

```text
NEXT_PUBLIC_API_URL=<exact deployed API origin>
```

Changing an environment variable requires redeploying the affected project.
