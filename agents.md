Frontend Architecture & Design System Context

This document provides structural and architectural context for LLM agents working on this frontend codebase. The goal is to ensure architectural consistency, modular scalability, and strict design coherence.

1. High-Level Overview

The frontend is built with:

React 19 (TypeScript)

Vite (build tool)

Tailwind CSS v4 for styling

shadcn/ui as the component foundation

Feature-based architecture

Centralized design tokens (CSS-based)

Role-based UI rendering (admin vs external users)

The system is domain-oriented. Features are organized by business capability, not by technical layer.

2. Architectural Philosophy

The codebase follows a feature-based (vertical slicing) architecture.

Each business domain lives in its own isolated module containing UI, logic, state, services, and types.

The system is organized around domain-driven feature modules that encapsulate presentation, business logic, state management, and API communication within cohesive boundaries, minimizing cross-feature coupling.

Core Principle: Structure by domain, not by file type.

Wrong (layer-based):

components/
hooks/
services/

Correct (feature-based):

features/
  events/
  auth/
users/

3. Project Structure

```
src/
├── app/                 # App-level configuration
├── router/              # React Router setup
├── providers/           # Context providers
├── features/            # Feature-based modules
│   ├── events/
│   │   ├── pages/      # Page components
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   ├── services/   # API services
│   │   ├── store/      # State management
│   │   ├── types/      # TypeScript types
│   │   ├── permissions/# Permission logic
│   │   └── index.ts    # Feature exports
│   ├── auth/
│   └── users/
├── shared/              # Cross-domain shared layer
│   ├── ui/             # Design system components
│   ├── theme/          # Design tokens
│   └── utils/          # Shared utilities
├── core/                # App-level configuration
│   ├── config/         # App constants
│   ├── design/         # Extended design tokens
│   └── layouts/        # Layout components
└── lib/                # Library utilities
```

4. Feature Module Structure

Example: features/events/

events/
pages/
EventsListPage.tsx
EventDetailPage.tsx
AdminEventsPage.tsx

components/
EventCard.tsx
EventsTable.tsx
EventForm.tsx

hooks/
useEvents.ts
useCreateEvent.ts
useUpdateEvent.ts
useDeleteEvent.ts

services/
eventsApi.ts

store/
events.store.ts

types/
event.types.ts

permissions/
event.permissions.ts

index.ts
Rules

No cross-feature internal imports.

Other features may only import what is exported in index.ts.

Business logic remains inside its feature.

Shared components must live in shared/ui.

5. Role-Based Access Control

Roles (e.g., ADMIN, USER) do not create separate features.

The domain remains unified (events). Authorization is handled through:

Route guards

Permission helpers

Conditional UI rendering

Example:

canCreateEvent(user)
canEditEvent(user)
canDeleteEvent(user)

Authorization must be enforced in backend as well. Frontend restrictions are UX-level safeguards only.

6. State Management

State must follow these principles:

Local UI state → React state

Feature domain state → feature store

Global session/auth state → auth feature

Avoid shared global state unless strictly necessary.

Async state must explicitly handle:

loading

error

success

 7. Design System Overview

The UI is governed by a centralized design system built with:

Tailwind CSS v4

Design tokens in shared/theme/tokens.css (base tokens) and core/design/extended.css (extended tokens)

shadcn/ui components

Custom shared UI primitives

No inline arbitrary styling is allowed.

 8. Tailwind Design System Configuration

All visual decisions are defined in CSS using Tailwind v4's @theme directive.

Controlled Tokens (in shared/theme/tokens.css)

Colors

Typography (Inter, IBM Plex Sans)

Border radius

Extended tokens (in core/design/extended.css)

Z-index scale

Shadows

Animation durations

Extended spacing

Example structure:

shared/theme/tokens.css:
@theme {
  --font-sans: "Inter", sans-serif;
  --font-body: "IBM Plex Sans", sans-serif;
  --color-primary: #0F172A;
  --color-secondary: #14B8A6;
  --color-success: #22C55E;
}

core/design/extended.css:
@theme {
  --z-dropdown: 100;
  --z-modal: 300;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
Hard Rules

No arbitrary values like text-[17px]

No inline hex colors (use design tokens)

No custom spacing outside defined scale

No duplicated style logic in features

All style decisions must use defined tokens.

9. shadcn/ui Usage

shadcn/ui is the base component system.

Purpose:

Provide accessible, composable primitives

Standardize component structure

Ensure consistent interaction patterns

Usage rules:

Extend shadcn components, do not rewrite them.

Wrap them in shared abstractions when necessary.

Never create alternative button systems if shadcn Button exists.

Variants must follow project design tokens.

Example pattern:

shared/ui/Button.tsx

This wraps the shadcn Button with project variants and constraints.

10. Shared Layer

shared/ contains cross-domain elements only.

Allowed content:

Base UI primitives (Button, Input, Modal)

Layout containers

Generic utilities

Theme configuration (shared/theme/)

Shared types (if domain-agnostic)

Not allowed:

Business logic

Feature-specific models

Domain-specific components

11. Core Layer

core/ contains app-level configuration and extended design tokens.

Allowed content:

App constants and configuration (core/config/)

Extended design tokens (core/design/)

Layout components (core/layouts/)

Not allowed:

Feature-specific logic

UI components (use shared/ui/)

11. Routing Strategy

Routing is centralized in app/router and uses React Router v7 (data-driven routing).

Features may expose route definitions but must not control global routing directly.

All routes should be defined in a centralized route configuration that imports page components from features.

Protected routes must use a guard abstraction (e.g., auth guards, role-based access).

Example structure:

app/
router/
index.tsx        # createBrowserRouter + RouterProvider setup
AppRoutes.tsx    # Route definitions (array of route objects)

features/
events/
pages/
EventsListPage.tsx  # Exported for router import

11.1 React Router v7 Configuration

React Router v7 uses a data-driven approach with createBrowserRouter outside React.

Setup (app/router/index.tsx):
import { createBrowserRouter } from "react-router"
import { routes } from "./AppRoutes"

export const router = createBrowserRouter(routes)

Usage in main.tsx:
import { RouterProvider } from "react-router"
import { router } from "./app/router"

<RouterProvider router={router} />

Defining Routes (app/router/AppRoutes.tsx):
import { HomePage } from "@/features/home"
import { DashboardPage } from "@/features/admin"

export const routes = [
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/admin/dashboard",
    Component: DashboardPage,
  },
]

Adding a New Route:
1. Create page component in features/<feature>/pages/
2. Export from features/<feature>/index.ts
3. Add route to AppRoutes.tsx

12. Consistency Enforcement

Consistency is enforced by structure, not discipline.

Mechanisms:

Centralized design tokens

Controlled component primitives

Feature isolation

Strict import boundaries

ESLint + formatting rules

Developers should not be able to accidentally break consistency.

13. Scalability Considerations

The architecture must support:

New features without structural refactor

Clear domain separation

Potential evolution toward microfrontends

Independent feature testing

Clear permission modeling

14. Non-Negotiable Principles

Structure by domain.

No cross-feature leakage.

No arbitrary styling.

No role-based feature duplication.

Backend enforces real authorization.

UI consistency comes from tokens and primitives.

This file exists to ensure any LLM or contributor understands:

How the frontend is structured

How features are isolated

How design consistency is enforced

How permissions are modeled

How scalability is preserved

Any generated code must respect this architecture.
