import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { QuickActionsBar } from '@/components/chat/QuickActionsBar';
import { MessageActions } from '@/components/chat/MessageActions';
import { ConversationStarters } from '@/components/chat/ConversationStarters';
import { SEOHead } from '@/components/SEOHead';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gita-coach`;

const typingMessages = [
  "Consulting ancient wisdom...",
  "Finding relevant verses...",
  "Preparing guidance...",
];

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState(typingMessages[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle initial query from URL
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && messages.length === 0) {
      setInput(initialQuery);
      // Auto-submit after a short delay
      setTimeout(() => {
        handleSubmit(undefined, initialQuery);
      }, 500);
    }
  }, [searchParams]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Rotate typing message
  useEffect(() => {
    if (!isLoading) return;
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % typingMessages.length;
      setTypingMessage(typingMessages[index]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 402) {
          toast.error('Service temporarily unavailable. Please try again later.');
        } else {
          toast.error(errorData.error || 'Failed to get response');
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put it back
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1 || prev[i].content !== ''));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (text: string) => {
    handleSubmit(undefined, text);
  };

  return (
    <Layout>
      <SEOHead
        title="AI Gita Coach - Personal Wisdom Guide"
        description="Chat with an AI-powered guide that offers personalized wisdom from the Bhagavad Gita. Get guidance for anxiety, decision-making, and life challenges."
        canonicalUrl="https://gitawisdom.com/chat"
        keywords={['AI coach', 'Gita guidance', 'wisdom chat', 'personal guide', 'life advice AI']}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 border-b border-border/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI Gita Coach
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Your Personal <span className="text-gradient">Wisdom Guide</span>
            </h1>
            <p className="text-muted-foreground">
              Share what's on your mind. I'll offer guidance from the Bhagavad Gita.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-16rem)]">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-xl shadow-primary/5">
            <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <ConversationStarters onSelect={handleQuickAction} />
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''} group animate-fade-in`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center border border-primary/20">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[85%]">
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/20'
                              : 'bg-muted/80 border border-border/50'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                        {message.role === 'assistant' && message.content && (
                          <MessageActions content={message.content} className="mt-1" />
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center border border-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="bg-muted/80 border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{typingMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <CardContent className="p-4 border-t border-border/50 space-y-3 bg-gradient-to-b from-transparent to-muted/30">
              <QuickActionsBar onQuickAction={handleQuickAction} disabled={isLoading} />
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind..."
                  className="min-h-[60px] max-h-[120px] resize-none border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-[60px] w-[60px] bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
