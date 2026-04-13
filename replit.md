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

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

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
