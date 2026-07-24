# BOQ AI SaaS Application

## Stack
- React 19, TypeScript, Vite, Tailwind CSS v3
- React Query, React Hook Form, Zod
- Zustand (persist middleware), Framer Motion
- Lucide React, Sonner, class-variance-authority
- Design tokens → CSS custom properties (`src/tokens.css`)

## Architecture
- Feature-based folder structure under `src/features/`
- 17 application modules: Auth, Onboarding, Dashboard, Projects, BOQ Generator, Cost Estimation, Material Schedules, Measurement Sheets, Reports, Rate Analysis, AI Assistant, Templates, Team Collaboration, Settings, Subscriptions, Notifications, Admin
- Route guards: `ProtectedRoute` (redirects to /login) and `PublicRoute` (redirects to /dashboard)
- Dark mode via `.dark` class (Tailwind `darkMode: 'class'`), toggled via `useThemeStore`
- Design tokens consumed as CSS custom properties (`var(--sys-*)`), not JS variables

## Key Files
- `src/types/index.ts` — All TypeScript interfaces (User, Project, Boq, Material, etc.)
- `src/store/` — Zustand stores (useAuthStore, useProjectStore, useBoqStore, useOnboardingStore, useSubscriptionStore, useNotificationStore, useThemeStore)
- `src/components/shared/` — Reusable UI: Button, Input, Card, Select, Badge, Skeleton, EmptyState
- `src/components/layouts/` — RootLayout (AppShell with sidebar) + Sidebar
- `src/lib/navigation.ts` — Sidebar navigation config
- `src/routes/index.tsx` — Complete router with lazy-loaded pages
- `src/tokens.css` — Generated design tokens (light/dark)

## Routes
- Public: /, /login, /register, /forgot-password
- Protected: /onboarding, /dashboard, /projects, /projects/:id, /projects/boq, /projects/estimation, /projects/materials, /projects/measurements, /projects/reports, /projects/rates, /ai-assistant, /templates, /collaboration, /settings, /subscription, /notifications, /admin

## Build
```powershell
npm run build    # tsc + vite build (passes cleanly)
npm run dev      # vite dev server on port 5173
```

## Conventions
- All CSS uses `var(--sys-*)` tokens (no Tailwind color utility classes for theme colors)
- Shared components from `@/components/shared`
- Stores from `@/store/*`
- Types from `@/types`
- cn utility from `@/lib/cn` (re-exports from `@/utils/cn`)
- toast via sonner, icons via lucide-react
- Animations via framer-motion
- Mock data in stores (no live API backend)
