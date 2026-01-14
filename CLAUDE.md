# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lifting diary application built with Next.js 16, React 19, TypeScript 5, and Tailwind CSS 4. Currently a fresh scaffold ready for feature development.

## Documentation-First Development

**All generated code MUST align with the documentation in the `/docs` directory.** Before writing any code, consult the relevant docs files to ensure consistency with established patterns, standards, and specifications.

## Commands

```bash
npm run dev      # Start development server at localhost:3000 (uses Turbopack)
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## Architecture

- **Next.js App Router** - Uses `/app` directory with file-based routing
- **React Server Components** - Server components by default
- **Tailwind CSS** - Utility-first styling with dark mode support via media queries
- **shadcn/ui** - UI component library (see `docs/ui.md` for standards)
- **Clerk** - Authentication provider (see `docs/auth.md` for standards)

### Routing Standards

**ALL application routes MUST be accessed through `/dashboard`.** The `/dashboard` page and all sub-pages are protected routes, accessible only to logged-in users. Route protection is handled through Next.js middleware using Clerk. See `docs/routing.md` for complete guidelines.

### Authentication Standards

**ALL authentication MUST use Clerk.** No custom authentication logic should be implemented. Use `auth()` from `@clerk/nextjs/server` to get the current user's ID in Server Components. See `docs/auth.md` for complete guidelines.

### UI Standards

**ONLY use shadcn/ui components for all UI elements.** No custom components should be created. See `docs/ui.md` for complete guidelines.

### Data Fetching Standards

**ALL data fetching MUST be done via Server Components.** Database queries must use Drizzle ORM through helper functions in the `/data` directory. Users can ONLY access their own data. See `docs/data-fetching.md` for complete guidelines.

### Data Mutation Standards

**ALL data mutations MUST be done via Server Actions.** Server actions must be in colocated `actions.ts` files, use typed parameters (no FormData), and validate all arguments with Zod. Database mutations must use Drizzle ORM through helper functions in the `/data` directory. See `docs/data-mutations.md` for complete guidelines.

### Server Component Standards

**In Next.js 15+, `params` and `searchParams` are Promises and MUST be awaited.** Always use `async` page components and `await params` before accessing route parameters. See `docs/server-components.md` for complete guidelines.

### Key Files

- `app/layout.tsx` - Root layout with metadata, fonts (Geist), and global CSS
- `app/page.tsx` - Home page component
- `app/globals.css` - Tailwind imports and CSS custom properties for theming

### Path Aliases

`@/*` maps to project root (configured in tsconfig.json)
