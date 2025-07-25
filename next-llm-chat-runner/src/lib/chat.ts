export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  timestamp?: number;
}

export interface ChatState {
  messages: Message[];
  model: string;
  isLoading: boolean;
  streamingMessage?: string;
}

interface SessionHistoryResponse {
  messages: Message[];
}

const MODELS = [
  { id: 'openai/gpt-4o', name: 'ChatGPT 4o' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'anthropic/claude-opus-4-20250514', name: 'Claude Opus 4' }
];

export { MODELS };

export async function sendMessage(
  message: Message,
  model: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let fullResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      console.log('Raw chunk received:', chunk);
      
      if (chunk) {
        fullResponse += chunk;
        onChunk?.(chunk);
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
}

export async function getConversationHistory(): Promise<Message[]> {
  const response = await fetch('/api/chat');
  
  if (!response.ok) {
    throw new Error('Failed to get conversation history');
  }

  const data = await response.json() as SessionHistoryResponse;
  return data.messages;
}

export async function clearConversation(): Promise<void> {
  await fetch('/api/chat', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize;
}