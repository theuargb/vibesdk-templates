# Template Selection Guidelines

This template provides a general purpose distributed storage patterns for backend heavy projects with multiple entities.
The template uses a single durable object but builds a wrapper around it to provide convenient APIs to store data for multiple entities.

- Use this template when you need:
    * Backend heavy projects that might have multiple entities such as users, chats, orgs etc.
    * Projects that require server side storage/database like layer.
    * Projects like chat messaging apps, ecommerce platforms, etc.
    * Cost-effective persistence without KV namespace expenses

**This template does NOT allow access to the durable object directly, The Durable object is only used for purely storage purposes. There are no alarm or other functionality provided by the durable object.** 

- Do not use it for
    * Static or simple single-page applications
    * Simple backend projects that can make-do with a single durable object or require other durable object functionality that this template does not provide.
    * Landing pages focused on SEO or server-rendered content
    * Projects that require SSR (Server-Side Rendering)

- Built with
    * React Router 6 for declarative client-side routing
    * ShadCN UI (v2.3.0) for customizable and accessible UI components built on Radix UI primitives
    * Tailwind CSS for utility-first styling
    * Lucide Icons (React) for modern and lightweight iconography
    * ESLint with sensible defaults and TypeScript support
    * Vite for ultra-fast local development and builds
    * Cloudflare Workers for server-side processing
    * Durable Objects for server-side state persistence


