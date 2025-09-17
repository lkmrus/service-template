# Repository Guidelines

## Project Structure & Module Organization
- `src/` hosts the NestJS application with bounded contexts such as `billing`, `orders`, `super-admin`, and shared `common` helpers. Use the module folders as aggregation points for controllers, services, and domain layers described in `billing_architecture.md`.
- `test/` keeps end-to-end specs and `jest-e2e.json`.
- `dist/` is generated output; never edit manually. Docs like `billing_architecture.md` and `transaction_statuses.md` capture domain rules.

## Build, Test, and Development Commands
- `npm run start:dev` boots the API in watch mode; rely on it for day-to-day work.
- `npm run build` compiles TypeScript to `dist/`.
- `npm run lint` (auto-fix enabled) enforces ESLint + Prettier; run before commits.
- `npm run test`, `npm run test:watch`, and `npm run test:cov` execute unit suites; `npm run test:e2e` targets the `test/` directory.

## Coding Style & Naming Conventions
- Stick to Nest defaults: 2-space indentation, single quotes, and TypeScript strictness from `tsconfig.json`.
- Generate components with `nest g` when possible so files follow `*.module.ts`, `*.service.ts`, and `*.controller.ts`.
- Use barrel files sparingly; prefer explicit imports to keep module boundaries visible.
- Run `npm run format` to apply Prettier to `src/` and `test/`.

## Testing Guidelines
- Co-locate unit specs next to source files using the `.spec.ts` suffix; mirror folder names (`billing/application/...`) in your tests.
- Mock external services such as Stripe by leveraging Jest's manual mocks; avoid hitting real APIs.
- Target at least the coverage reported by `npm run test:cov`; investigate dips before merging.
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, even if nobody asked.

## Commit & Pull Request Guidelines
- Follow the short, imperative style seen in history (`init ...`, `prettier`). Group related changes per commit.
- PRs should describe the motivation, link to relevant architecture docs, and include before/after API notes or screenshots when UI clients are affected.
- Ensure CI commands (`lint`, `test`, `test:e2e`) pass locally before requesting review.

## Configuration & Security
- Manage secrets through `.env` files loaded by `@nestjs/config`; never commit keys such as Stripe credentials.
- Document any new environment variable in `README.md` and provide safe defaults for local development.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `npm lint` and `npm test` and `npm run build` before committing.
