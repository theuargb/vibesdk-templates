// Supported AI models. DONT EDIT
export const SUPPORTED_MODELS = [
  'openai/gpt-4o',
  'google-ai-studio/gemini-2.0-flash',
  'google-ai-studio/gemini-2.5-flash',
  'google-ai-studio/gemini-2.5-pro',
  'anthropic/claude-opus-4-20250514'
] as const;

export const DEFAULT_MODEL = 'google-ai-studio/gemini-2.5-flash';

export const API_RESPONSES = {
  MISSING_MESSAGE: 'Message required',
  INVALID_MODEL: 'Invalid model',
  PROCESSING_ERROR: 'Failed to process message',
  NOT_FOUND: 'Not Found',
  AGENT_ROUTING_FAILED: 'Agent routing failed',
  INTERNAL_ERROR: 'Internal Server Error'
} as const;

export function isValidModel(model: string): model is typeof SUPPORTED_MODELS[number] {
  return SUPPORTED_MODELS.includes(model as typeof SUPPORTED_MODELS[number]);
}