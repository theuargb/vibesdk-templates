import { Hono } from "hono";
import { Bindings } from './types';

export function userRoutes(app: Hono<{ Bindings: Bindings }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
}
