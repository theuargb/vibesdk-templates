# Magento 2 via Cloudflare Containers

Run a Magento-ready container image orchestrated by a Cloudflare Worker. The Worker starts/stops on-demand container instances and proxies requests to your image.

## What you get
- A Worker (`src/index.ts`) that routes traffic to a container (Durable Object class)
- `Dockerfile` placeholder for a PHP/Apache image (customize with your Magento app)
- Migrations and bindings configured in `wrangler.jsonc`

## Requirements
- Cloudflare account with Workers (Containers feature enabled)
- Wrangler CLI authenticated

## Quick start
```bash
npm install
# Build and push the container image (uses Dockerfile in this folder)
npm run containers:build
npm run containers:push
# Deploy the Worker and container binding
npm run deploy
```

Open the deployed URL from Wrangler output. For sticky routing to a specific instance, append `?session=dev` to the URL.

## Customize the container image
- Replace `container-root/` with your Magento application (or use a prebuilt Magento image and set `image` in `wrangler.jsonc` to that registry ref)
- Ensure your container listens on port 80 (or update `defaultPort` in `src/index.ts`)

## Learn more
- Cloudflare Containers: https://developers.cloudflare.com/containers/
