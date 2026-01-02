# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lifting diary application built with Next.js 16, React 19, TypeScript 5, and Tailwind CSS 4. Currently a fresh scaffold ready for feature development.

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

### Key Files

- `app/layout.tsx` - Root layout with metadata, fonts (Geist), and global CSS
- `app/page.tsx` - Home page component
- `app/globals.css` - Tailwind imports and CSS custom properties for theming

### Path Aliases

`@/*` maps to project root (configured in tsconfig.json)
