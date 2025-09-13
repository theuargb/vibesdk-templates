# AI Development Guidelines

## Architecture Overview
This is a **Cloudflare Workers** template with React frontend, demonstrating:
- **Frontend**: React Router 6 with TypeScript and ShadCN UI
- **Backend**: Hono-based Worker with Durable Objects for all persistence
- **Shared Types**: Type-safe APIs with automatic data initialization

## ⚠️ IMPORTANT: Demo Content
**The existing demo pages, mock data, and API endpoints are FOR TEMPLATE UNDERSTANDING ONLY.**
- Replace `HomePage.tsx` and `DemoPage.tsx` with actual application pages
- Remove or replace mock data in `shared/mock-data.ts` with real data structures
- Remove or replace demo API endpoints (`/api/demo`, `/api/counter`) and implement actual business logic
- The counter and demo items examples show DO patterns - replace with real functionality

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
- **CRITICAL**: You CANNOT modify `wrangler.jsonc` - only use the single `GlobalDurableObject` binding

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

### Frontend Structure
- `src/pages/HomePage.tsx` - Homepage for user to see while you are working on the app
- `src/pages/DemoPage.tsx` - Main demo showcasing Durable Object features
- `src/components/ThemeToggle.tsx` - Theme switching component
- `src/hooks/useTheme.ts` - Theme management hook

### Backend Structure  
- `worker/index.ts` - Main Worker entry point (**DO NOT MODIFY core patterns**)
- `worker/user-routes.ts` - Add new API routes here following existing patterns
- `worker/durableObject.ts` - DO implementation with counter and demo items storage
- `worker/core-utils.ts` - Core types and utilities (**DO NOT MODIFY**)

### Shared Code
- `shared/types.ts` - TypeScript interfaces for API responses and data models
- `shared/mock-data.ts` - **DEMO ONLY** - Replace with real data structures
- `shared/seed-utils.ts` - **DEMO ONLY** - Remove when implementing real data sources

## API Patterns

### Adding New Endpoints
Follow this exact pattern in `worker/user-routes.ts`:
```typescript
// Durable Object endpoint for data retrieval
app.get('/api/my-data', async (c) => {
  const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
  const data = await stub.getMyData();
  return c.json({ success: true, data } satisfies ApiResponse<MyType[]>);
});

// Durable Object endpoint for data modification
app.post('/api/my-data', async (c) => {
  const body = await c.req.json() as MyType;
  const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
  const data = await stub.addMyData(body);
  return c.json({ success: true, data } satisfies ApiResponse<MyType[]>);
});
```

### Durable Object Methods Pattern
Add methods to `GlobalDurableObject` class in `worker/durableObject.ts`:
```typescript
async getMyData(): Promise<MyType[]> {
  const items = await this.ctx.storage.get("my_data_key");
  if (items) {
    return items as MyType[];
  }
  // Initialize with default data if not exists
  const defaultData = DEFAULT_MY_DATA;
  await this.ctx.storage.put("my_data_key", defaultData);
  return defaultData;
}

async addMyData(item: MyType): Promise<MyType[]> {
  const items = await this.getMyData();
  const updated = [...items, item];
  await this.ctx.storage.put("my_data_key", updated);
  return updated;
}
```

### Type Safety Requirements
- All API responses must use `ApiResponse<T>` interface
- Share types between frontend and backend via `@shared/types.ts`
- All Durable Object methods must have proper return type annotations

## Available Bindings
**CRITICAL**: Only use this Cloudflare binding:
- `GlobalDurableObject` - Single Durable object for ALL stateful operations

**YOU CANNOT**:
- Modify `wrangler.jsonc` 
- Add new Durable Objects or KV namespaces
- Change binding names or add new bindings

## Durable Object Storage Patterns
- Use unique storage keys for different data types (e.g., "counter_value", "demo_items", "user_data")
- Always initialize data on first access using the pattern shown above
- Store complex objects directly - Durable Object storage handles serialization
- Use atomic operations for data consistency

## Frontend Integration
- Use direct `fetch()` calls to `/api/*` endpoints
- Handle loading states and errors appropriately  
- Leverage shared types for type-safe API responses
- Components should be responsive and use ShadCN UI patterns

## Cost Optimization
This template uses only Durable Objects for persistence, avoiding KV namespace costs while maintaining full data persistence and consistency.