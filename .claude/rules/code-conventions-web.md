---

origin: theonekit-web
repository: The1Studio/theonekit-web
module: null
protected: false
---
# Code Conventions — Web / TypeScript / Node.js

Extends core `code-conventions.md`. Web-specific patterns.

## Naming
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: `use` prefix (`useAuth`, `useFormValidation`)
- Utils/helpers: camelCase (`formatDate`, `parseQuery`)
- API routes: kebab-case (`/api/user-profile`)
- CSS classes: kebab-case with BEM or Tailwind utility
- Env vars: SCREAMING_SNAKE_CASE (`DATABASE_URL`)

## Architecture
- Prefer Server Components by default (Next.js App Router)
- Client Components only when needed (`"use client"` directive)
- Co-locate components with their styles, tests, and types
- Use barrel exports (`index.ts`) only at module boundaries, not within
- Dependency injection via React Context or module-level singletons

## Patterns
- Data fetching: Server Components + `fetch` with caching, or TanStack Query for client
- Forms: Server Actions or TanStack Form — avoid uncontrolled forms
- State: URL state first, then React state, then global store (last resort)
- Error handling: Error Boundaries for UI, try/catch for server, Result types for utils
- Auth: middleware-first validation, never trust client-side auth checks alone

## File Organization
- `src/app/` — routes and layouts (Next.js App Router)
- `src/components/` — shared UI components
- `src/lib/` — utilities, helpers, shared logic
- `src/server/` — server-only code (DB, auth, API)
- `src/types/` — shared TypeScript types
