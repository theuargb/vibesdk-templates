# AI Development Guidelines

## Architecture Overview
This is a **Cloudflare Workers** template with React frontend, demonstrating:
- **Frontend**: React Router 6 with TypeScript and ShadCN UI
- **Backend**: Hono-based Worker with Durable Objects + KV storage
- **Shared Types**: Type-safe APIs with mock data fallback system

## ⚠️ IMPORTANT: Demo Content
**The existing demo pages, mock data, and API endpoints are FOR TEMPLATE UNDERSTANDING ONLY.**
- Replace `HomePage.tsx` and `DemoPage.tsx` with actual application pages
- Remove or replace mock data in `shared/mock-data.ts` with real data structures
- Remove or replace demo API endpoints (`/api/demo`, `/api/seed`) and implement actual business logic
- The counter example is just to show DO patterns - replace with real functionality

## Tech Stack
- React Router 6 for client-side routing
- ShadCN UI (v2.3.0) built on Radix UI primitives
- Tailwind CSS for styling
- Lucide Icons for iconography
- Hono framework for Workers API
- TypeScript with shared interfaces

## Development Restrictions
- **Tailwind Colors**: Hardcode custom colors in `tailwind.config.js`, NOT in `index.css`
- **Components**: Use existing ShadCN components instead of writing custom ones
- **Icons**: Import from `lucide-react` directly
- **Error Handling**: ErrorBoundary components are pre-implemented
- **Worker Patterns**: Follow exact patterns in `worker/index.ts` to avoid breaking functionality

## Styling Guidelines
- Generate **fully responsive** and accessible layouts
- Use ShadCN preinstalled components when available
- Use Tailwind's spacing, layout, and typography utilities
- Integrate `framer-motion` for animations with Tailwind classes

Components available:
```sh
$ ls -1 src/components/ui
accordion.tsx
alert-dialog.tsx
alert.tsx
aspect-ratio.tsx
avatar.tsx
badge.tsx
breadcrumb.tsx
button.tsx
calendar.tsx
card.tsx
carousel.tsx
chart.tsx
checkbox.tsx
collapsible.tsx
command.tsx
context-menu.tsx
dialog.tsx
drawer.tsx
dropdown-menu.tsx
form.tsx
hover-card.tsx
input-otp.tsx
input.tsx
label.tsx
menubar.tsx
navigation-menu.tsx
pagination.tsx
popover.tsx
progress.tsx
radio-group.tsx
resizable.tsx
scroll-area.tsx
select.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
slider.tsx
sonner.tsx
switch.tsx
table.tsx
tabs.tsx
textarea.tsx
toast.tsx
toggle-group.tsx
toggle.tsx
tooltip.tsx
```

## Code Organization

### Frontend Structurew
- `src/pages/HomePage.tsx` - Homepage for user to see while you are working on the app
- `src/pages/DemoPage.tsx` - Main demo showcasing KV + DO features
- `src/components/ThemeToggle.tsx` - Theme switching component
- `src/hooks/useTheme.ts` - Theme management hook

### Backend Structure  
- `worker/index.ts` - Main Worker entry point (**DO NOT MODIFY core patterns**)
- `worker/userRoutes.ts` - Add new API routes here following existing patterns
- `worker/durableObject.ts` - DO implementation (counter with increment/decrement)
- `worker/core-utils.ts` - Core types and utilities (**DO NOT MODIFY**)

### Shared Code
- `shared/types.ts` - TypeScript interfaces for API responses and data models
- `shared/mock-data.ts` - **DEMO ONLY** - Replace with real data structures
- `shared/seed-utils.ts` - **DEMO ONLY** - Remove when implementing real data sources

## API Patterns

### Adding New Endpoints
Follow this exact pattern in `worker/userRoutes.ts`:
```typescript
// KV endpoint with mock fallback
app.get('/api/my-data', async (c) => {
  const items = await c.env.KVStore.get('my_key');
  const data: MyType[] = items ? JSON.parse(items) : MOCK_FALLBACK;
  return c.json({ success: true, data } satisfies ApiResponse<MyType[]>);
});

// Durable Object endpoint
app.post('/api/counter/action', async (c) => {
  const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
  const data = await stub.myMethod() as number;
  return c.json({ success: true, data } satisfies ApiResponse<number>);
});
```

### Type Safety Requirements
- All API responses must use `ApiResponse<T>` interface
- Share types between frontend and backend via `shared/types.ts`
- Mock data must match TypeScript interfaces exactly

## Available Bindings
**CRITICAL**: Only use these Cloudflare bindings:
- `GlobalDurableObject` - Durable object for stateful operations
- `KVStore` - KV namespace for data persistence

## Frontend Integration
- Use direct `fetch()` calls to `/api/*` endpoints
- Handle loading states and errors appropriately  
- Leverage shared types for type-safe API responses
- Components should be responsive and use ShadCN UI patterns
