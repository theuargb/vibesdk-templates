import { Hono } from "hono";
import { Env } from './core-utils';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));

    // Example apis of a counter using durable object
    app.get('/api/counter', async (c) => {
        const durableObject = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        return c.json({ success: true, data: await durableObject.getCounterValue() });
    });
    app.post('/api/counter/increment', async (c) => {
        const durableObject = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        return c.json({ success: true, data: await durableObject.increment() });
    });
    app.post('/api/counter/decrement', async (c) => {
        const durableObject = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        return c.json({ success: true, data: await durableObject.decrement() });
    });

    // Example apis of using KV store
    app.get('/api/kv', async (c) => {
        const value = await c.env.KVStore.get("user_data");
        return c.json({ success: true, data: value });
    }); 
    app.post('/api/kv', async (c) => {
        // Get user data from request body
        const userData = await c.req.json();
        // Store user data in KV
        await c.env.KVStore.put("user_data", JSON.stringify(userData));
        return c.json({ success: true });
    }); 
}
