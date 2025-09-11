# Cloudflare Agents Chat Template

A beautiful AI chatbot template built with **Cloudflare Agents SDK**, **React**, and **AI Gateway**.

## 🚀 Features

- **Cloudflare Agents SDK**: Stateful AI agents with persistent conversations
- **AI Gateway Integration**: Uses Cloudflare AI Gateway with OpenAI SDK
- **Tool System**: Weather, Calculator, and Time tools with smart detection
- **Beautiful UI**: Modern chat interface with Framer Motion animations
- **TypeScript**: Fully typed with proper Cloudflare Worker types
- **Dark/Light Theme**: Persistent theme switching

## 🛠 Setup

1. **Configure AI Gateway**: Update `wrangler.jsonc` with your settings:
   ```jsonc
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai",
     "CF_AI_API_KEY": "your-cloudflare-api-key"
   }
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build**:
   ```bash
   npm run build
   ```

5. **Deploy**:
   ```bash
   npm run deploy
   ```

## 🎯 Key Files

- `worker/index.ts` - Cloudflare Agent implementation
- `src/App.tsx` - React chat UI
- `src/lib/chat.ts` - Chat service and utilities
- `wrangler.jsonc` - Cloudflare Worker configuration

## 🔧 Tools Available

- **Weather**: Ask "What's the weather in London?"
- **Calculator**: Ask "Calculate 25 * 4" or "What's 10 + 5?"
- **Time**: Ask "What time is it in Tokyo?"

## 📝 Notes

- Uses Node.js compatibility (`nodejs_compat`) for the Agents SDK
- AI Gateway provides better performance, analytics, and cost control
- Template is optimized for AI code generation use cases