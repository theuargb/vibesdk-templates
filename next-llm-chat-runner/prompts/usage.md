# Usage instructions

You can start customizing the template homepage by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The chat API can be accessed on [http://localhost:3000/api/chat](http://localhost:3000/api/chat) and is defined in `pages/api/chat.ts`. **Use it!**

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as API routes instead of React pages.

- Built with:
  * **Next.js (Page Router)** for hybrid static/server rendering and API routes
  * **OpenAI SDK** for AI model integration via Cloudflare AI Gateway
  * **Tailwind CSS** for utility-first styling with glass morphism effects
  * **Framer Motion** for smooth chat animations and loading states
  * **Lucide Icons** (React) for modern, consistent iconography
  * **Shadcn/UI** for accessible chat components built on Radix UI primitives
  * **TypeScript** for type safety and better developer experience

- Chat Features:
  * **Multi-modal input**: Supports both text messages and image uploads
  * **Model selection**: Switch between GPT-4o, Gemini 2.0 Flash, Gemini 2.5 Flash/Pro powered by Cloudflare AI gateway
  * **Conversation memory**: Maintains chat history during session
  * **Security**: Input validation, sanitization, and secure API key handling

- Restrictions:
  * **Environment variables**: CF_AI_BASE_URL and CF_AI_API_KEY must be set (they will be set for you)
  * **API keys**: Never expose API keys to client-side - they're server-side only
  * **Image validation**: Only accepts valid base64 data URLs for images
  * **Use Page router** and not App router for Next.js

- Styling:
  * Must generate **fully responsive** and beautiful UI
  * Use Shadcn preinstalled components rather than writing custom ones when possible
  * Use **Tailwind's spacing, layout, and typography utilities** for all components

- Components:
  * All Shadcn components are available and can be imported from `@/components/ui/...`
  * Current chat uses: `Button`, `Input`, `Card`, `Select` for the interface
  * Do not write custom components if shadcn components are available
  * Icons from Lucide should be imported directly from `lucide-react`

- Animation:
  * Use `framer-motion`'s `motion` components for animations
  * Animate message appearances, loading states, and UI transitions
  * You can integrate variants and transitions using Tailwind utility classes alongside motion props

---

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