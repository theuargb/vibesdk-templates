import { NextApiRequest, NextApiResponse } from 'next';
// Force OpenAI SDK to use web runtime for Cloudflare compatibility
process.env.OPENAI_RUNTIME = 'web';
import OpenAI from 'openai';

const client = new OpenAI({ baseURL: process.env.CF_AI_BASE_URL, apiKey: process.env.CF_AI_API_KEY });
let messages: Array<{ role: string; content: string; image?: string }> = [];
const SYSTEM_PROMPT = "You are a helpful AI assistant that helps users build and deploy web applications. You provide clear, concise guidance on development, deployment, and troubleshooting. Keep responses practical and actionable.";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') return res.json({ messages: messages.filter(m => m.role !== 'system') });
    if (req.method === 'DELETE') { messages = []; return res.json({ success: true }); }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, model } = req.body;
    const validModels = ['openai/gpt-4o', 'google-ai-studio/gemini-2.0-flash', 'google-ai-studio/gemini-2.5-flash', 'google-ai-studio/gemini-2.5-pro', 'anthropic/claude-opus-4-20250514'];
    
    if (model && !validModels.includes(model)) return res.status(400).json({ error: 'Invalid model' });
    if (message.image && (!message.image.startsWith('data:image/'))) return res.status(400).json({ error: 'Invalid image' });

    // Initialize conversation
    if (messages.length === 0) messages.push({ role: 'system', content: SYSTEM_PROMPT });
    messages.push({ role: 'user', content: message.content, image: message.image });

    // Create completion with streaming
    const completion = await client.chat.completions.create({
      model: model || 'google-ai-studio/gemini-2.0-flash',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.image ? [{ type: 'text', text: msg.content }, { type: 'image_url', image_url: { url: msg.image } }] : msg.content
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: 16000,
      stream: true
    });

    // Set up streaming response headers
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    let fullResponse = '';
    
    try {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(content);
        }
      }
      
      messages.push({ role: 'assistant', content: fullResponse });
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.end();
    }
  } catch (error) {
    console.error('Chat API Error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to get chat response' });
  }
}