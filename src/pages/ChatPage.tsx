import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  RotateCcw, 
  ArrowDown,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Globe,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { linkVerseReferences } from '@/lib/verseLinker';
import { QuickActionsBar } from '@/components/chat/QuickActionsBar';
import { MessageActions } from '@/components/chat/MessageActions';
import { MultiLanguageStarters } from '@/components/chat/MultiLanguageStarters';
import { EnhancedLanguageSelector, INDIAN_LANGUAGES } from '@/components/chat/EnhancedLanguageSelector';
import { LanguageBadge } from '@/components/chat/LanguageBadge';
import { ChatHistorySidebar } from '@/components/chat/ChatHistorySidebar';
import { VoiceInputButton } from '@/components/chat/VoiceInputButton';
import { SEOHead } from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isCollapsed?: boolean;
  detectedLanguage?: string;
  originalContent?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gita-coach`;
const MAX_CHARS = 500;
const COLLAPSE_THRESHOLD = 800;

const typingMessages = [
  "Krishna is thinking...",
  "Finding a verse for you...",
  "Preparing wisdom...",
  "Consulting the Gita...",
];

function getScriptFontClass(langCode: string): string {
  const scriptFonts: Record<string, string> = {
    hi: 'font-devanagari', mr: 'font-devanagari', sa: 'font-devanagari',
    ta: 'font-tamil', te: 'font-telugu', bn: 'font-bengali', as: 'font-bengali',
    gu: 'font-gujarati', kn: 'font-kannada', ml: 'font-malayalam',
    pa: 'font-gurmukhi', or: 'font-odia', ur: 'font-urdu',
  };
  return scriptFonts[langCode] || '';
}

// Custom markdown components for richer formatting
const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    href?.startsWith('/')
      ? <Link to={href} className="text-primary underline decoration-primary/30 hover:decoration-primary/80 underline-offset-2 transition-all font-medium">{children}</Link>
      : <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline decoration-primary/30 hover:decoration-primary/80 underline-offset-2 transition-all">{children}</a>,
  strong: ({ children }: { children?: React.ReactNode }) =>
    <strong className="font-bold text-foreground">{children}</strong>,
  blockquote: ({ children }: { children?: React.ReactNode }) =>
    <blockquote className="border-l-3 border-primary/40 pl-4 my-3 italic text-muted-foreground bg-primary/5 py-2 pr-3 rounded-r-lg">{children}</blockquote>,
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className;
    return isInline
      ? <code className="bg-muted/80 px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>
      : <code className={cn("block bg-muted/80 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-border/50", className)}>{children}</code>;
  },
  h3: ({ children }: { children?: React.ReactNode }) =>
    <h3 className="text-base font-bold mt-4 mb-2 text-foreground flex items-center gap-2">
      <span className="w-1 h-4 bg-primary rounded-full inline-block" />
      {children}
    </h3>,
  h4: ({ children }: { children?: React.ReactNode }) =>
    <h4 className="text-sm font-bold mt-3 mb-1.5 text-foreground">{children}</h4>,
  ul: ({ children }: { children?: React.ReactNode }) =>
    <ul className="space-y-1.5 my-2 ml-1">{children}</ul>,
  li: ({ children }: { children?: React.ReactNode }) =>
    <li className="flex items-start gap-2 text-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
      <span>{children}</span>
    </li>,
  hr: () => <hr className="my-4 border-border/50" />,
};

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState(typingMessages[0]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [collapsedMessages, setCollapsedMessages] = useState<Set<number>>(new Set());
  const [preferredLanguage, setPreferredLanguage] = useState('auto');
  const [showHistory, setShowHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && messages.length === 0) {
      setInput(initialQuery);
      setTimeout(() => {
        handleSubmit(undefined, initialQuery);
      }, 500);
    }
  }, [searchParams]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    }
  }, [messages.length]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!isLoading) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % typingMessages.length;
      setTypingMessage(typingMessages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const toggleMessageCollapse = (index: number) => {
    setCollapsedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageText = overrideInput || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText, timestamp: new Date() };
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
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          preferredLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) toast.error('Too many requests. Please wait a moment.');
        else if (response.status === 402) toast.error('Service temporarily unavailable.');
        else toast.error(errorData.error || 'Failed to get response');
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

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
                if (lastMessage?.role === 'assistant') lastMessage.content = assistantContent;
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
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

  const handleQuickAction = (text: string) => handleSubmit(undefined, text);

  const handleClearChat = () => {
    setMessages([]);
    setCollapsedMessages(new Set());
    setActiveConversationId(undefined);
    toast.success('Conversation cleared');
  };

  const handleTranslate = async (langCode: string, content: string, messageIndex: number) => {
    const langName = INDIAN_LANGUAGES.find(l => l.code === langCode)?.name || langCode;
    const toastId = `translate-${messageIndex}`;
    toast.loading(`Translating to ${langName}...`, { id: toastId });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content, targetLanguage: langCode }),
      });

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();
      
      if (data.translatedContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            const msg = newMessages[messageIndex];
            newMessages[messageIndex] = {
              ...msg,
              originalContent: msg.originalContent || msg.content,
              content: data.translatedContent,
              detectedLanguage: langCode,
            };
          }
          return newMessages;
        });
        toast.success(`Translated to ${langName}`, { id: toastId });
      }
    } catch {
      toast.error('Translation failed. Please try again.', { id: toastId });
    }
  };

  const handleRestoreOriginal = (messageIndex: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const msg = newMessages[messageIndex];
      if (msg?.originalContent) {
        newMessages[messageIndex] = {
          ...msg,
          content: msg.originalContent,
          originalContent: undefined,
          detectedLanguage: undefined,
        };
      }
      return newMessages;
    });
    toast.success('Restored original content');
  };

  const handleLoadConversation = (conversationId: string, msgs: Array<{ role: string; content: string }>) => {
    setActiveConversationId(conversationId);
    setMessages(msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content, timestamp: new Date() })));
    setCollapsedMessages(new Set());
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
    textareaRef.current?.focus();
  };

  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <Layout>
      <SEOHead
        title="Talk to Krishna - Personal Wisdom Guide"
        description="Talk to Krishna and receive personalized wisdom from the Bhagavad Gita. Get guidance for anxiety, decision-making, and life challenges."
        canonicalUrl="https://www.bhagavadgitagyan.com/chat"
        keywords={['talk to Krishna', 'Gita guidance', 'wisdom chat', 'personal guide', 'life advice']}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-4 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-xl sm:text-2xl">🙏</span>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Talk to <span className="text-gradient">Krishna</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user ? `Hare Krishna! Ask anything about life.` : 'Ask Krishna for guidance from the Gita'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <EnhancedLanguageSelector
                selectedLanguage={preferredLanguage}
                onLanguageChange={setPreferredLanguage}
                disabled={isLoading}
                variant="prominent"
              />
              {user && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHistory(!showHistory)}
                  className={cn(
                    "gap-2 transition-all hidden md:flex",
                    showHistory && "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden lg:inline">History</span>
                </Button>
              )}
              {messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearChat}
                  className="gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-12rem)]">
        <div className="max-w-5xl mx-auto h-full flex gap-4">
          {/* Chat History Sidebar */}
          <ChatHistorySidebar
            userId={user?.id}
            isOpen={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
            onSelectConversation={handleLoadConversation}
            onNewChat={handleClearChat}
            activeConversationId={activeConversationId}
          />

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-xl shadow-primary/5 relative">
            <ScrollArea 
              className="flex-1 p-4 md:p-6 relative chat-bg-pattern" 
              ref={scrollRef}
            >
              {messages.length === 0 ? (
                <MultiLanguageStarters onSelect={handleQuickAction} selectedLanguage={preferredLanguage} />
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => {
                    const isLongMessage = message.role === 'assistant' && message.content.length > COLLAPSE_THRESHOLD;
                    const isCollapsed = collapsedMessages.has(index);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-3 group animate-fade-in",
                          message.role === 'user' ? 'justify-end' : ''
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center border border-primary/30 shadow-sm">
                            <span className="text-lg">🙏</span>
                          </div>
                        )}
                        <div className="flex flex-col max-w-[90%] sm:max-w-[85%]">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 backdrop-blur-sm",
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/20 bubble-tail-right'
                                : 'bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-sm bubble-tail-left'
                            )}
                          >
                            {message.role === 'assistant' ? (
                              isLongMessage ? (
                                <Collapsible open={!isCollapsed}>
                                  <div className={cn(
                                    "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90",
                                    message.detectedLanguage && getScriptFontClass(message.detectedLanguage)
                                  )}>
                                    <CollapsibleContent className="CollapsibleContent">
                                      <ReactMarkdown components={markdownComponents}>{linkVerseReferences(message.content)}</ReactMarkdown>
                                    </CollapsibleContent>
                                    {isCollapsed && (
                                      <ReactMarkdown components={markdownComponents}>{linkVerseReferences(message.content.slice(0, 400) + '...')}</ReactMarkdown>
                                    )}
                                  </div>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleMessageCollapse(index)}
                                      className="mt-2 gap-1 text-xs text-primary hover:text-primary/80"
                                    >
                                      {isCollapsed ? (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          Read more
                                        </>
                                      ) : (
                                        <>
                                          <ChevronUp className="h-3 w-3" />
                                          Show less
                                        </>
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                </Collapsible>
                              ) : (
                                <div className={cn(
                                  "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90",
                                  message.detectedLanguage && getScriptFontClass(message.detectedLanguage)
                                )}>
                                  <ReactMarkdown components={markdownComponents}>{linkVerseReferences(message.content || '...')}</ReactMarkdown>
                                </div>
                              )
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1.5 px-1 gap-2">
                            <div className="flex items-center gap-2">
                              {message.timestamp && (
                                <span className="text-xs text-muted-foreground/80">
                                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                                </span>
                              )}
                              {message.detectedLanguage && message.detectedLanguage !== 'en' && (
                                <LanguageBadge languageCode={message.detectedLanguage} size="sm" />
                              )}
                            </div>
                            {message.role === 'assistant' && message.content && (
                              <MessageActions 
                                content={message.content} 
                                className="ml-auto" 
                                messageIndex={index}
                                hasOriginal={!!message.originalContent}
                                onTranslate={handleTranslate}
                                onRestoreOriginal={handleRestoreOriginal}
                              />
                            )}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-3 animate-fade-in">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center border border-primary/30">
                        <span className="text-lg animate-pulse">🙏</span>
                      </div>
                      <div className="bg-gradient-to-br from-card to-muted/30 border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm backdrop-blur-sm">
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

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={scrollToBottom}
                  className="rounded-full shadow-lg gap-2 bg-background/95 backdrop-blur-sm border border-primary/30 hover:border-primary/50 transition-all"
                >
                  <ArrowDown className="h-4 w-4" />
                  New messages
                </Button>
              </div>
            )}

            {/* Modern Composer Input */}
            <div className="p-4 relative">
              {/* Quick actions only show when no messages */}
              {messages.length > 0 && (
                <div className="mb-3">
                  <QuickActionsBar onQuickAction={handleQuickAction} disabled={isLoading} />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="relative">
                {/* Glow ring on focus */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-amber-500/20 to-orange-500/20 rounded-2xl blur-md opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative flex items-end gap-2 bg-card/80 backdrop-blur-md border-2 border-border/50 focus-within:border-primary/40 rounded-2xl px-3 py-2 shadow-lg transition-all">
                  {/* Voice button */}
                  <VoiceInputButton 
                    onTranscript={handleVoiceTranscript} 
                    disabled={isLoading}
                    className="h-10 w-10 flex-shrink-0 rounded-xl"
                  />
                  
                  {/* Expandable text input */}
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Krishna anything about life..."
                    className={cn(
                      "min-h-[44px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-2 py-2.5 text-base",
                      isOverLimit && "text-destructive"
                    )}
                    disabled={isLoading}
                  />
                  
                  {/* Character count + Send button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {charCount > 400 && (
                      <span className={cn(
                        "text-xs hidden md:inline",
                        isOverLimit ? "text-destructive font-medium" : "text-muted-foreground/60"
                      )}>
                        {charCount}/{MAX_CHARS}
                      </span>
                    )}
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md transition-all",
                        input.trim() && !isOverLimit ? "opacity-100 scale-100" : "opacity-50 scale-95"
                      )}
                      disabled={!input.trim() || isLoading || isOverLimit}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Helper text */}
                <div className="flex items-center justify-between mt-1.5 px-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                    <Keyboard className="h-3 w-3" />
                    <span className="hidden sm:inline">Enter to send · Shift+Enter for new line</span>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
