Frontend Architecture & Design System Context

This document provides structural and architectural context for LLM agents working on this frontend codebase. The goal is to ensure architectural consistency, modular scalability, and strict design coherence.

1. High-Level Overview

The frontend is built with:

React (TypeScript)

Feature-based architecture

Tailwind CSS for styling

shadcn/ui as the component foundation

Centralized design tokens

Role-based UI rendering (admin vs external users)

The system is domain-oriented. Features are organized by business capability, not by technical layer.

2. Architectural Philosophy
   2.1 Feature-Based Architecture

The codebase follows a feature-based (vertical slicing) architecture.

Informal Definition

Each business domain lives in its own isolated module containing UI, logic, state, services, and types.

Technical Definition

The system is organized around domain-driven feature modules that encapsulate presentation, business logic, state management, and API communication within cohesive boundaries, minimizing cross-feature coupling.

Core Principle

Structure by domain, not by file type.

Wrong (layer-based):

components/
hooks/
services/

Correct (feature-based):

features/
events/
auth/
users/ 3. Project Structure
src/
app/
router/
providers/
features/
events/
pages/
components/
hooks/
services/
store/
types/
permissions/
index.ts
auth/
users/
shared/
ui/
layout/
theme/
utils/
types/ 4. Feature Module Structure

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

Tailwind CSS

Design tokens in tailwind.config.js

shadcn/ui components

Custom shared UI primitives

No inline arbitrary styling is allowed.

8. Tailwind Design System Configuration

All visual decisions are defined in tailwind.config.js.

Controlled Tokens

Colors

Typography scale

Spacing scale

Border radius

Shadows

Breakpoints

Example structure:

theme: {
extend: {
colors: {
primary: {...},
secondary: {...},
success: "...",
danger: "...",
neutral: {...}
},
fontSize: {...},
spacing: {...},
borderRadius: {...}
}
}
Hard Rules

No arbitrary values like text-[17px]

No inline hex colors

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

Theme configuration

Shared types (if domain-agnostic)

Not allowed:

Business logic

Feature-specific models

Domain-specific components

11. Routing Strategy

Routing lives in app/router.

Features may expose route definitions but must not control global routing directly.

Protected routes must use a guard abstraction.

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
