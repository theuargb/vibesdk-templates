## Usage

1) Build and push the container image using Wrangler:
```bash
npm run containers:build
npm run containers:push
```

2) Deploy the Worker and containers binding:
```bash
npm run deploy
```

3) Visit the URL printed by Wrangler. Use `?session=dev` to stick to a specific instance.

Notes:
- You can replace the Dockerfile with a prebuilt Magento image from a registry and set `image` in `wrangler.jsonc` accordingly.
