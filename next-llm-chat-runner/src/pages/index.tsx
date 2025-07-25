/**
 * Simple AI Chat, Use it to understand how AI chat works.
 * This is a **Dummy homepage**. Make sure to rewrite it for your application. You may use the components and styles.
 */
import Head from "next/head";
import { motion } from "framer-motion";
import { Sparkles, Send, Image, X, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendMessage, getConversationHistory, clearConversation, convertImageToBase64, isValidImageFile, MODELS, type Message, type ChatState } from "../lib/chat";

export default function Home() {
  const [isDark, setIsDark] = useState(false); // Always start with false for SSR
  const [mounted, setMounted] = useState(false);
  const [chat, setChat] = useState<ChatState>({ messages: [], model: 'google-ai-studio/gemini-2.0-flash', isLoading: false, streamingMessage: '' });
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize theme after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setIsDark(shouldBeDark);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return; // Don't apply theme changes until mounted
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark, mounted]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const messages = await getConversationHistory();
        setChat(prev => ({ ...prev, messages }));
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };
    loadHistory();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    const userMessage: Message = { role: 'user', content: input.trim() || 'Analyze this image', image: selectedImage || undefined };
    setChat(prev => ({ ...prev, messages: [...prev.messages, userMessage], isLoading: true, streamingMessage: '' }));
    setInput(''); setSelectedImage(null);
    try {
      await sendMessage(userMessage, chat.model, (chunk) => {
        setChat(prev => ({
          ...prev,
          streamingMessage: (prev.streamingMessage || '') + chunk
        }));
      });
      
      // Get final messages after streaming completes
      const updatedMessages = await getConversationHistory();
      setChat(prev => ({ 
        ...prev, 
        messages: updatedMessages, 
        isLoading: false, 
        streamingMessage: '' 
      }));
    } catch (error) {
      console.error('Chat error:', error);
      setChat(prev => ({ 
        ...prev, 
        messages: [...prev.messages, { 
          role: 'assistant', 
          content: 'Error: Unable to connect to AI service' 
        }], 
        isLoading: false, 
        streamingMessage: '' 
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <Head>
        <title>LLM Chat - AI Assistant</title>
        <meta name="description" content="AI-powered chat application powered by Cloudflare." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden">
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute top-4 right-4 px-3 py-2 text-2xl hover:scale-110 hover:rotate-12 transition-all duration-200 active:scale-90 z-50 cursor-pointer"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className="absolute inset-0 bg-gradient-rainbow opacity-10 dark:opacity-20" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 relative z-10 mb-8"
        >
          <div className="flex justify-center">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary"
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
            Creating your <span className="text-gradient">app</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
            Your application would be ready soon.
          </p>
        </motion.div>
        
        <Card className="max-w-4xl mx-auto h-[60vh] flex flex-col relative z-10 backdrop-blur-xl bg-white/10 dark:bg-black/20 border-white/20 shadow-2xl">
          <div className="p-4 border-b flex items-center gap-4">
            <motion.div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <h1 className="font-display font-bold text-xl">AI Chat</h1>
            <Select value={chat.model} onValueChange={(value) => setChat(prev => ({ ...prev, model: value }))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{MODELS.map((model) => <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => clearConversation().then(() => setChat(prev => ({ ...prev, messages: [] })))} title="Clear conversation">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                  {msg.image && <img src={msg.image} alt="User uploaded image" className="max-w-xs rounded-lg mb-2" />}
                  <p className={`whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : ''}`}>{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {chat.streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl max-w-[80%]">
                  <p className="whitespace-pre-wrap">{chat.streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
            {chat.isLoading && !chat.streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex space-x-1">{[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: `${i * 100}ms`}} />)}</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="Selected image preview" className="max-w-20 rounded border" />
                <Button size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => setSelectedImage(null)}><X className="w-3 h-3" /></Button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input type="file" ref={fileInputRef} onChange={async (e) => { const file = e.target.files?.[0]; if (file && isValidImageFile(file)) setSelectedImage(await convertImageToBase64(file)); }} accept="image/*" className="hidden" />
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}><Image className="w-4 h-4" /></Button>
              <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Chat with me" 
                className="flex-1 min-h-[42px] max-h-32 resize-none leading-tight py-3" 
                rows={1}
                disabled={chat.isLoading} 
              />
              <Button type="submit" disabled={(!input.trim() && !selectedImage) || chat.isLoading}><Send className="w-4 h-4" /></Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  );
}