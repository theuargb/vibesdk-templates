# Template Selection Guidelines

This template provides a minimal setup for building applications that can leverage Cloudflare Durable Object capabilities and persistence.
There is only a single global Durable object binding named `GlobalDurableObject`. Therefore only applications that can leverage this single Durable Object are suitable for this template.

- Use this template when you need:
    * Projects that require server side state persistence (provided via Durable Objects)
    * Projects that can make-do with a single global Durable Object for persistence
    * Projects like file manager dashboards, real-time applications, or stateful services

- Do not use it for
    * Static or simple single-page applications
    * Landing pages focused on SEO or server-rendered content
    * Projects that require SSR (Server-Side Rendering)
    * Projects that require multiple entities which only need database-like storage and not durable object features like alarms etc.

- Built with
    * React Router 6 for declarative client-side routing
    * ShadCN UI (v2.3.0) for customizable and accessible UI components built on Radix UI primitives
    * Tailwind CSS for utility-first styling
    * Lucide Icons (React) for modern and lightweight iconography
    * ESLint with sensible defaults and TypeScript support
    * Vite for ultra-fast local development and builds
    * Cloudflare Workers for server-side processing
    * Single Durable Object for server-side state persistence


