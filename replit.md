# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

### Development Servers
You can start development servers directly from the root workspace using the following commands:
- `pnpm run dev:all` — starts the API Server, Expo Dashboard, and Component Preview Server concurrently.
- `pnpm run dev:api` — starts only the API Server (port `8080`).
- `pnpm run dev:dashboard` — starts the Expo / React Native POS Dashboard Metro bundler in LAN mode (port `8082`). This generates a QR code to scan with Expo Go if your phone is on the same Wi-Fi network.
- `pnpm run dev:dashboard:tunnel` — starts the Expo POS Dashboard Metro bundler in tunnel mode (port `8082`). Best if your phone is on a different network or Wi-Fi isolation is enabled.
- `pnpm run dev:sandbox` — starts the Component Preview Server / Canvas (port `8081`).

### Database Commands
- `pnpm --filter @workspace/db run push` — pushes database schema changes to PostgreSQL.

### Code Quality & Compilation
- `pnpm run typecheck` — runs full typecheck across all workspace packages.
- `pnpm run build` — runs typecheck and builds all packages in the workspace.
- `pnpm --filter @workspace/api-spec run codegen` — regenerates API hooks and Zod schemas from the OpenAPI spec.

## Development Setup Instructions

1. **Database Setup**: Ensure PostgreSQL is running locally. Create a database named `posify`:
   ```bash
   createdb posify
   ```
2. **Schema Push**: Sync the schema to the database:
   ```bash
   DATABASE_URL=postgresql://localhost:5432/posify pnpm --filter @workspace/db run push
   ```
3. **Start the Application**: 
   - **For Local Development**: Run `pnpm run dev:all` or start them separately.
   - **For Expo Go on Mobile**:
     - If your phone is on the same Wi-Fi network:
       ```bash
       pnpm run dev:dashboard
       ```
     - If your phone is on a different network (e.g. mobile data):
       ```bash
       pnpm run dev:dashboard:tunnel
       ```
     - Scan the printed QR code in the terminal using the Expo Go app on your phone!

## Artifacts

### POS Dashboard (Mobile) — `/`
- **Type**: Expo (React Native)
- **Directory**: `artifacts/pos-dashboard/`
- **Purpose**: Full-featured Point of Sale mobile dashboard for managing sales, products, purchases, and inventory
- **Design**: Deep indigo/purple (#4F46E5) primary, Inter font, clean card-based layout
- **Screens**:
  - Dashboard — 4 stat cards, revenue chart, category breakdown, top/least selling products, low stock alerts
  - Products — searchable/filterable product list with stock levels
  - POS — full sell screen with cart, quantity controls, GST, checkout
  - Purchases — vendor purchase orders with status filter
  - Profile — account settings, store config, menu
- **Colors**: Defined in `constants/colors.ts`
- **Data**: Frontend-only with static mock data (AsyncStorage-ready)
