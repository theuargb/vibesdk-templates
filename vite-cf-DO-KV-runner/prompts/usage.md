# Usage instructions

- Built with
    * React Router 6 for declarative client-side routing
    * ShadCN UI (v2.3.0) for customizable and accessible UI components built on Radix UI primitives
    * Tailwind CSS for utility-first styling
    * Lucide Icons (React) for modern and lightweight iconography
    * ESLint with sensible defaults and TypeScript support
    * Cloudflare Workers for serving and server-side processing
    * Durable Objects for server-side state persistence
    * Workers KV for server-side state persistence

- Restrictions:
  * When including `tailwind.config.js`, **hardcode custom colors** directly in the config file – do **not** define them in `index.css` unless specified

- Styling:
  * Must generate **fully responsive** and accessible layouts
  * Use Shadcn preinstalled components rather than writing custom ones when possible
  * Use **Tailwind's spacing, layout, and typography utilities** for all custom components

- Components
  * All Shadcn components are available and can be imported from @/components/ui/...
  * Do not write custom components if shadcn components are available
  * Icons from Lucide should be imported directly from `lucide-react`

**NOTE: ErrorBoundary and related Error handling components and code are already implemented but hidden**

- Animation:
  * Use `framer-motion`'s `motion` components to animate sections on scroll or page load
  * You can integrate variants and transitions using Tailwind utility classes alongside motion props

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

Usage Example:
```tsx file="example.tsx"
        import { Button } from '@/components/ui/button'
        import { CardContent, Card } from '@/components/ui/card'
        import { MousePointerClickIcon } from 'lucide-react';
        // custom hook for example ignore
        import { useStopwatch } from '../hooks/useStopwatch'

        export function Stopwatch({ initialTime = 0 }) {
        const { time, isRunning, start, pause, reset } = useStopwatch(initialTime);

        return (
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-4">
              <div 
                className="text-6xl font-bold tabular-nums" 
                aria-live="polite"
                aria-atomic="true"
              >
                {time}
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={isRunning ? pause : start}
                  aria-pressed={isRunning}
                >
                  <MousePointerClickIcon className="text-yellow-400 size-4" />
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button 
                  onClick={reset}
                  disabled={time === 0 && !isRunning}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )
        }
```

The backend routes (worker logic) are defined in the `worker/index.ts` file. 
For any server-side processing, define appropriate routes, types and controllers in the worker, **BUT BE CAREFUL** You can easily break everything so make sure you follow the **exact** pattern in the worker file to add any new routes

# Simple Demo Template

This template demonstrates basic **Cloudflare Workers** patterns with:
- **Frontend**: React with routing (`/` and `/demo`)
- **Backend**: Type-safe APIs with mock data fallback
- **Storage**: KV for persistence + Durable Objects for counters

## Mock Data System

### Quick Setup
1. **Seed storage**: `POST /api/seed` (populates KV with simple demo data)

### Demo API Endpoints
- `GET /api/demo` - Simple items (KV → fallback to mock)
- `GET /api/counter` - Durable Object counter
- `POST /api/counter/increment` - Increment DO counter

### Minimal Files
- `shared/types.ts` - Simple interfaces (12 lines)
- `shared/mock-data.ts` - Basic demo data (12 lines)  
- `shared/seed-utils.ts` - Type-safe seeding utilities (32 lines)

### Demo Page (`/demo`)
Simple showcase of:
- **KV Storage**: Lists demo items with mock fallback
- **Durable Objects**: Interactive counter with increment button
- **Type Safety**: Uses shared types for all API responses

# Available bindings:
**Only The following bindings are to be used in the project! Do not use any other bindings or remove/replace any of the bindings**
- `GlobalDurableObject`: A durable object binding for the global durable object
- `KVStore`: A KV namespace binding for the global durable object
