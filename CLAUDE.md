# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo with two Next.js frontends and one NestJS backend for a complimentary tracker system.

## Architecture

| Package | Framework | Port | Purpose |
|---|---|---|---|
| `backend/` | NestJS 11 (TypeScript) | 3000 | API server |
| `frontend-backoffice/` | Next.js 16 (App Router, React 19) | 3001 | Admin/backoffice UI |
| `frontend-counter/` | Next.js 16 (App Router, React 19) | 3002 | Counter-facing UI |

Both frontends use **shadcn/ui** (new-york style, RSC enabled) with Tailwind CSS v4, Radix UI, and lucide-react icons.

## Common Commands

### Backend (`cd backend`)
```bash
npm run start:dev          # Dev server with watch mode
npm run build              # Production build
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm run test               # Unit tests (Jest)
npm run test:watch         # Tests in watch mode
npm run test:cov           # Tests with coverage
npm run test:e2e           # E2E tests (uses test/jest-e2e.json)
```

Run a single backend test:
```bash
npx jest --testPathPattern=<pattern>
```

### Frontends (`cd frontend-backoffice` or `cd frontend-counter`)
```bash
npm run dev                # Dev server
npm run build              # Production build
npm run lint               # ESLint
```

### Adding shadcn/ui Components
```bash
npx shadcn@latest add <component-name>
```

## Code Conventions

### Backend (NestJS)
- Prettier: single quotes, trailing commas (`all`), auto line endings
- ESLint: `@typescript-eslint/no-explicit-any` is off, floating promises and unsafe arguments are warnings
- Test files use `.spec.ts` suffix (unit) and `.e2e-spec.ts` suffix (e2e)
- TypeScript target: ES2023, module resolution: nodenext

### Frontends (Next.js)
- Use the `cn()` utility from `@/lib/utils` for combining Tailwind classes
- shadcn/ui components live in `src/components/ui/` — use `data-slot` attributes
- Path alias: `@/*` maps to `src/*`
- Tailwind v4 syntax: `@theme inline` blocks, `@import` for plugins
- CSS variables use OKLCH color model for theming
- TypeScript strict mode enabled

### General
- Use event handler functions; avoid inline event handlers
- Use enums instead of direct string comparisons
- Always use braces `{ }` for `if` blocks regardless of body length
- Always have an empty line before `return` statements
