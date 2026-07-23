# Bite repository instructions

## Repository shape

- This repository is a `pnpm` workspace orchestrated by Turborepo.
- `apps/web` is the Next.js customer application.
- `apps/api` is the Express API and owns database access, migrations, and catalog imports.
- `packages/contracts` owns runtime Zod schemas and shared API types.
- Keep deployable applications in `apps/*` and reusable packages in `packages/*`.

## Commands

- Install dependencies with `pnpm install`.
- Run both applications with `pnpm dev`.
- Run repository checks with `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Run package-specific commands with `pnpm --filter <package-name> <script>`.
- Generate migrations with `pnpm --filter @bite/api db:generate`.
- Apply migrations with `pnpm --filter @bite/api db:migrate`.
- Import the starter catalog with `pnpm --filter @bite/api catalog:import`.
- Never run schema changes or catalog imports during application startup.

## Architecture agreements

- Keep Next.js route files thin and organize web domain code using pragmatic Feature-Sliced Design.
- Keep API routing, business logic, and persistence separated into route/controller, service, and repository boundaries.
- Define HTTP inputs and outputs in `@bite/contracts`; do not duplicate wire types in an app.
- Derive OpenAPI from the Zod contracts and expose it at `/openapi.json`; never maintain a duplicate handwritten specification.
- Store money as integer cents and calculate final order prices on the API.
- Each cart addition creates a distinct cart line, even when the product already exists.
- Anonymous cart state belongs in versioned browser storage; completed orders belong in PostgreSQL.
- Guest order retrieval must require the order ID and a separate opaque receipt token. Store only the token hash in PostgreSQL.
- Prefer the smallest existing abstraction that preserves these boundaries. Do not add empty layers or one-file packages.

## Frontend agreements

- Use shadcn/Tailwind for shared UI primitives and global design tokens.
- Use SCSS Modules for page, widget, feature, and entity composition.
- Keep each reusable UI component in its own folder with its `.tsx`,
  `.module.scss`, and component-specific tests or stories when present.
- Keep Next.js special route files (`page.tsx`, `layout.tsx`, `loading.tsx`, and
  similar files) in their route segment as required by the framework. Keep them
  thin and extract reusable or styled UI into co-located component folders.
- SCSS must consume shared CSS custom properties rather than duplicating design-token values.
- Browser code calls the Express API directly through `NEXT_PUBLIC_API_URL`; keep the API CORS allow-list explicit and environment-specific.
- Preserve keyboard navigation, focus visibility, accessible labels, pending states, and responsive behavior.
- Handle loading, error, empty, and broken-image states for every data-backed view.

## Quality and safety

- Keep TypeScript strict and do not bypass checks with broad assertions or ignored rules.
- Add or update tests with each behavior change; do not defer all testing to the end.
- Never expose secrets in source, logs, fixtures, screenshots, or error responses.
- Keep `.env.example` files current and use placeholders only.
- Preserve unrelated and user-authored changes.
- Inspect the final diff and run the relevant checks before handing off a task.
- Do not commit, push, deploy, create external resources, or contact third parties unless explicitly requested.
