# Event Tracker - Frontend

A modern, feature-based React application for managing events with a custom design system.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component foundation
- **React Router v7** - Routing

## Architecture

This project follows a **feature-based (vertical slicing) architecture**. Each business domain lives in its own isolated module containing UI, logic, state, services, and types.

### Project Structure

```
src/
├── app/
│   └── router/           # React Router v7 configuration
├── features/             # Feature-based modules
│   ├── home/            # Home page
│   └── admin/          # Admin module
├── shared/              # Cross-domain shared layer
│   ├── ui/             # Design system components
│   └── theme/          # Design tokens
├── core/               # App-level configuration
│   ├── config/        # App constants
│   ├── design/        # Extended design tokens
│   └── layouts/       # Layout components
└── lib/               # Utilities
```

### Key Principles

- **Structure by domain**, not by file type
- **No cross-feature internal imports** - features communicate via exports
- **Shared components** must live in `shared/ui/`
- **Backend enforces real authorization** - frontend restrictions are UX-level only

## Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#0F172A` | Petroleum blue - main actions |
| Secondary | `#14B8A6` | Turquoise - secondary actions |
| Accent | `#FB7185` | Coral - highlights |
| Success | `#22C55E` | Green - success states |
| Warning | `#F59E0B` | Amber - warnings |
| Error | `#EF4444` | Red - errors |
| Background | `#F1F5F9` | Light gray |
| Foreground | `#334155` | Dark gray text |

### Typography

- **Inter** - Headings and UI elements
- **IBM Plex Sans** - Body text

### Available Components

Located in `shared/ui/`:

- `Button` - Primary, Secondary, Accent, Outline, Ghost, Destructive variants
- `Input` - Standard input with error states
- `Card` - Card, CardHeader, CardTitle, CardContent, CardFooter
- `Badge` - Status badges with Success, Warning, Error variants
- `H1`, `H2`, `H3`, `Body`, `Caption` - Typography components

## Routing

Uses **React Router v7** with a centralized route configuration.

### Adding New Routes

1. Create a page component in your feature's `pages/` folder
2. Export it from your feature's `index.ts`
3. Add the route in `app/router/AppRoutes.tsx`:

```typescript
import { YourPage } from "@/features/your-feature"

export const routes = [
  {
    path: "/your-path",
    Component: YourPage,
  },
]
```

### Available Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Design system demo |
| `/admin/dashboard` | DashboardPage | Admin dashboard (placeholder) |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Adding Components

This project uses shadcn/ui for component primitives:

```bash
npx shadcn@latest add <component-name>
```

Components will be automatically added to `shared/ui/`.
