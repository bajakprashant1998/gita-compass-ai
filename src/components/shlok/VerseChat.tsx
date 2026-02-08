import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { linkVerseReferences } from '@/lib/verseLinker';
import { Link } from 'react-router-dom';
import type { Shlok } from '@/types';

interface VerseChatProps {
  shlok: Shlok;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const quickQuestions = [
  'How do I apply this at work?',
  'Explain in simple terms',
  'How is this relevant today?',
];

export function VerseChat({ shlok }: VerseChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const verseContext = `Chapter ${shlok.chapter?.chapter_number}, Verse ${shlok.verse_number}: "${shlok.sanskrit_text}" — Meaning: ${shlok.english_meaning}. Life Application: ${shlok.life_application || 'N/A'}`;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('gita-coach', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          verse_context: verseContext,
        },
      });

      if (response.error) throw response.error;

      // Parse SSE stream
      const text_response = response.data;
      let fullText = '';

      if (typeof text_response === 'string') {
        const lines = text_response.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              fullText += parsed.choices?.[0]?.delta?.content || '';
            } catch { /* skip */ }
          }
        }
      } else if (text_response?.choices) {
        fullText = text_response.choices[0]?.delta?.content || text_response.choices[0]?.message?.content || '';
      }

      if (fullText) {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      }
    } catch (err) {
      console.error('VerseChat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not respond. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-primary/20 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">Ask About This Verse</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <CardContent className="p-4 pt-0 space-y-3">
          {/* Quick Questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(q)}
                  className="text-xs"
                >
                  {q}
                </Button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            if (href?.startsWith('/')) {
                              return <Link to={href} className="text-primary underline">{children}</Link>;
                            }
                            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>;
                          }
                        }}
                      >
                        {linkVerseReferences(msg.content)}
                      </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this verse..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
