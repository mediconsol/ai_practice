# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

메디콘솔 AI 프랙티스 플랫폼 - An AI practice platform for medical professionals to create and execute their own AI-powered workflow tools. This is not a platform for learning AI, but for medical professionals to build and run AI tools tailored to their specific work needs.

**Tech Stack**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + React Router v6

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint code
npm i

# Preview production build
npm run preview
```

## Project Architecture

### Application Structure

This is a single-page application (SPA) with client-side routing. All routes are wrapped in a `DashboardLayout` component that provides consistent sidebar navigation and header across the app.

**Main Routes** (src/App.tsx:24-30):
- `/` - Dashboard (홈)
- `/programs` - AI Programs catalog
- `/prompts` - Prompt library (프롬프트 자산)
- `/ai-execute` - AI execution interface
- `/projects` - Project management
- `/history` - Execution history

### Component Organization

```
src/
├── components/
│   ├── layout/          # Layout components
│   │   ├── AppSidebar.tsx      # Main sidebar navigation
│   │   └── DashboardLayout.tsx  # Page wrapper with sidebar + header
│   ├── dashboard/       # Dashboard-specific cards and widgets
│   └── ui/             # shadcn/ui components (50+ components)
├── pages/              # Route components (6 pages)
├── hooks/              # Custom React hooks (use-mobile, use-toast)
└── lib/                # Utilities (cn function for class merging)
```

### Key Patterns

**Layout Pattern**: All pages use `DashboardLayout` wrapper which provides:
- Collapsible sidebar with navigation
- Top header with search and notifications
- Responsive layout with sticky header

**Styling Approach**:
- Uses Tailwind CSS with custom theme (teal-blue medical color scheme)
- `cn()` utility (src/lib/utils.ts:4) for conditional class merging
- CSS variables for theming (check tailwind.config.ts)
- Custom animations: `animate-fade-in`, `animate-slide-in`

**Data Flow**:
- React Query (@tanstack/react-query) configured globally in App.tsx:15
- React Hook Form + Zod for forms (dependencies present but usage TBD)
- Client-side state management (no global state library currently)

### Import Aliases

All imports use `@/` alias pointing to `src/`:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Design System

**Color Scheme**: Teal-blue gradient theme (medical/professional trust feeling)
- Primary: Teal shades
- Gradients used extensively in cards (e.g., `from-primary to-info`)
- Dark sidebar with light content area

**Typography**: Pretendard font family (optimized for Korean)

**Component Library**: shadcn/ui (default style, slate base color)
- Configuration in components.json
- 50+ pre-built UI components in src/components/ui/
- Uses Radix UI primitives underneath

## Important Notes

### Korean Content
This application is Korean-language first. Most UI text, comments, and content are in Korean. Variable names and component names are in English.

### TypeScript Configuration
- Very relaxed TypeScript settings (tsconfig.json:9-14):
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
  - `noUnusedParameters: false`
- ESLint also disables unused vars warnings (eslint.config.js:23)

### Lovable Platform Integration
This project is generated/managed via Lovable platform:
- Includes lovable-tagger plugin in vite config
- Original README references Lovable project URLs
- See README.md for Lovable-specific workflows

### Current State
Based on docs/mvp.md, this is an MVP with 6 implemented pages focused on:
- AI program catalog (문서 요약기, 환자 안내문 생성기, etc.)
- Prompt library management
- AI execution interface with provider selection
- Project and history tracking

Most data is currently mock/static data in page components (see Dashboard.tsx:18-103 for example).
