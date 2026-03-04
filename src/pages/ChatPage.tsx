import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
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
  History,
  Flame,
  Shield,
  Zap
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
import { ChatRelatedResources, type RelatedResourcesData } from '@/components/chat/ChatRelatedResources';
import { ChatFollowUpActions } from '@/components/chat/ChatFollowUpActions';
import { SEOHead } from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isCollapsed?: boolean;
  detectedLanguage?: string;
  originalContent?: string;
  relatedData?: RelatedResourcesData;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gita-coach`;
const MAX_CHARS = 500;
const COLLAPSE_THRESHOLD = 800;

const typingMessages = [
  "Krishna is contemplating...",
  "Finding the perfect verse...",
  "Drawing from ancient wisdom...",
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

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) =>
    <p className="text-[15px] leading-[1.8] text-foreground/90 mb-3 last:mb-0">{children}</p>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    href?.startsWith('/')
      ? <Link to={href} className="text-primary font-semibold underline decoration-primary/40 hover:decoration-primary underline-offset-2 transition-all hover:text-primary/80">{children}</Link>
      : <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline decoration-primary/40 hover:decoration-primary underline-offset-2 transition-all">{children}</a>,
  strong: ({ children }: { children?: React.ReactNode }) =>
    <strong className="font-bold text-foreground">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) =>
    <em className="italic text-foreground/80 not-italic border-l-2 border-primary/30 pl-2 inline-block">{children}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) =>
    <blockquote className="relative border-l-[3px] border-primary/40 pl-4 my-4 text-foreground/85 bg-primary/[0.04] py-3 pr-4 rounded-r-xl italic">{children}</blockquote>,
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isInline = !className;
    return isInline
      ? <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[13px] font-semibold">{children}</code>
      : <code className={cn("block bg-muted/80 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-border/50", className)}>{children}</code>;
  },
  h1: ({ children }: { children?: React.ReactNode }) =>
    <h1 className="text-xl font-extrabold mt-6 mb-3 text-foreground">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) =>
    <h2 className="text-lg font-bold mt-6 mb-3 text-foreground flex items-center gap-2">
      <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-amber-500 rounded-full inline-block flex-shrink-0" />
      {children}
    </h2>,
  h3: ({ children }: { children?: React.ReactNode }) =>
    <h3 className="text-base font-bold mt-5 mb-2 text-foreground flex items-center gap-2">
      <span className="w-1 h-4 bg-primary rounded-full inline-block flex-shrink-0" />
      {children}
    </h3>,
  h4: ({ children }: { children?: React.ReactNode }) =>
    <h4 className="text-sm font-bold mt-4 mb-1.5 text-foreground uppercase tracking-wide text-primary/80">{children}</h4>,
  ul: ({ children }: { children?: React.ReactNode }) =>
    <ul className="space-y-2.5 my-4 ml-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) =>
    <ol className="space-y-3 my-4 ml-1 counter-reset-list">{children}</ol>,
  li: ({ children, ...props }: { children?: React.ReactNode; ordered?: boolean }) => {
    const isOrdered = (props as any).ordered;
    return isOrdered ? (
      <li className="flex items-start gap-3 text-[15px] leading-relaxed">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">{(props as any).index + 1}</span>
        <span className="flex-1">{children}</span>
      </li>
    ) : (
      <li className="flex items-start gap-2.5 text-[15px] leading-relaxed">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-amber-500 mt-2.5 flex-shrink-0" />
        <span className="flex-1">{children}</span>
      </li>
    );
  },
  hr: () => <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />,
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
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

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
    }, 2500);
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

      let latestRelatedData: RelatedResourcesData | undefined;

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
            
            // Handle meta events (related resources)
            if (parsed.type === 'meta' && parsed.relatedData) {
              latestRelatedData = parsed.relatedData;
              continue;
            }
            
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantContent;
                  if (latestRelatedData) lastMessage.relatedData = latestRelatedData;
                }
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
    <Layout hideFooter={isMobile} hideHeader={isMobile}>
      <SEOHead
        title="Talk to Krishna - Personal Wisdom Guide"
        description="Talk to Krishna and receive personalized wisdom from the Bhagavad Gita. Get guidance for anxiety, decision-making, and life challenges."
        canonicalUrl="https://www.bhagavadgitagyan.com/chat"
        keywords={['talk to Krishna', 'Gita guidance', 'wisdom chat', 'personal guide', 'life advice']}
      />

      {/* Header Bar - compact on mobile, fixed at top */}
      <section className={cn(
        "relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-primary/[0.04] via-background to-amber-500/[0.04]",
        isMobile && "sticky top-0 z-30 backdrop-blur-xl bg-background/90"
      )}>
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 h-12 md:h-16">
            {/* Left: Identity */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className={cn(
                  "rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/25",
                  isMobile ? "w-8 h-8" : "w-10 h-10"
                )}>
                  <Flame className={cn(isMobile ? "h-4 w-4" : "h-5 w-5", "text-primary-foreground")} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold leading-tight">
                  Talk to <span className="text-gradient">Krishna</span>
                </h1>
                <p className="text-xs text-muted-foreground leading-tight">
                  Personal wisdom guide • 700+ verses
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold leading-tight">
                  <span className="text-gradient">Krishna</span>
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Online • 700+ verses</p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <EnhancedLanguageSelector
                selectedLanguage={preferredLanguage}
                onLanguageChange={setPreferredLanguage}
                disabled={isLoading}
                variant="prominent"
              />
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowHistory(!showHistory)}
                    className={cn(
                      "gap-1.5 h-9 hidden md:flex text-muted-foreground",
                      showHistory && "bg-primary/10 text-primary"
                    )}
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden lg:inline text-xs">History</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileHistoryOpen(true)}
                    className="md:hidden h-8 w-8 text-muted-foreground"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </>
              )}
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 md:h-9 md:w-auto md:px-3 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden md:inline text-xs ml-1.5">New</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile History Sheet */}
      <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
        <SheetContent side="left" className="w-[85%] p-0 md:hidden">
          <SheetTitle className="sr-only">Chat History</SheetTitle>
          <ChatHistorySidebar
            userId={user?.id}
            isOpen={true}
            onToggle={() => setMobileHistoryOpen(false)}
            onSelectConversation={(id, msgs) => {
              handleLoadConversation(id, msgs);
              setMobileHistoryOpen(false);
            }}
            onNewChat={() => {
              handleClearChat();
              setMobileHistoryOpen(false);
            }}
            activeConversationId={activeConversationId}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Container - full height on mobile */}
      <div className={cn(
        "container mx-auto px-0 sm:px-6 lg:px-8 sm:py-3",
        isMobile 
          ? "h-[calc(100dvh-48px)]" // dvh for mobile viewport, minus header
          : "py-3 h-[calc(100vh-10rem)]"
      )}>
        <div className="max-w-5xl mx-auto h-full flex gap-4">
          {/* Chat History Sidebar - desktop only */}
          <ChatHistorySidebar
            userId={user?.id}
            isOpen={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
            onSelectConversation={handleLoadConversation}
            onNewChat={handleClearChat}
            activeConversationId={activeConversationId}
          />

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden relative",
            isMobile 
              ? "bg-background" 
              : "rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/[0.03]"
          )}>
            {/* Messages Area */}
            <ScrollArea 
              className={cn(
                "flex-1 relative",
                isMobile ? "px-3 pt-2 pb-1" : "p-6"
              )}
              ref={scrollRef}
            >
              {messages.length === 0 ? (
                <MultiLanguageStarters onSelect={handleQuickAction} selectedLanguage={preferredLanguage} />
              ) : (
                <div className={cn(
                  "max-w-3xl mx-auto",
                  isMobile ? "space-y-3" : "space-y-6"
                )}>
                  {messages.map((message, index) => {
                    const isLongMessage = message.role === 'assistant' && message.content.length > COLLAPSE_THRESHOLD;
                    const isCollapsed = collapsedMessages.has(index);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-2 md:gap-3 group animate-fade-in",
                          message.role === 'user' ? 'justify-end' : ''
                        )}
                      >
                        {/* Krishna avatar */}
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className={cn(
                              "rounded-full bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center border border-primary/20",
                              isMobile ? "w-7 h-7" : "w-9 h-9"
                            )}>
                              <Flame className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-primary")} />
                            </div>
                          </div>
                        )}
                        
                        <div className={cn(
                          "flex flex-col",
                          isMobile ? "max-w-[85%]" : "max-w-[80%]"
                        )}>
                          {/* Message label - hidden on mobile for cleaner look */}
                          {!isMobile && (
                            <span className={cn(
                              "text-[10px] font-semibold uppercase tracking-wider mb-1 px-1",
                              message.role === 'user' ? 'text-right text-muted-foreground/60' : 'text-primary/60'
                            )}>
                              {message.role === 'user' ? 'You' : 'Krishna'}
                            </span>
                          )}
                          
                          <div
                            className={cn(
                              message.role === 'user'
                                ? cn(
                                    "bg-gradient-to-br from-primary to-amber-500 text-primary-foreground shadow-md shadow-primary/15 leading-relaxed",
                                    isMobile 
                                      ? "rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm" 
                                      : "rounded-2xl px-4 py-3 text-[15px]"
                                  )
                                : cn(
                                    "bg-gradient-to-br from-background via-card to-muted/30 border border-border/50 shadow-sm",
                                    isMobile 
                                      ? "rounded-2xl rounded-bl-md px-3.5 py-3" 
                                      : "rounded-2xl px-5 py-4"
                                  )
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
                                      className="mt-2 gap-1.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/5"
                                    >
                                      {isCollapsed ? (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          Continue reading
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
                              <p className={cn(isMobile ? "text-sm" : "text-[15px]", "leading-relaxed")}>{message.content}</p>
                            )}
                          </div>
                          
                          {/* Meta row - compact on mobile */}
                          <div className={cn(
                            "flex items-center justify-between px-1 gap-2",
                            isMobile ? "mt-1" : "mt-1.5"
                          )}>
                            <div className="flex items-center gap-2">
                              {message.timestamp && (
                                <span className="text-[10px] text-muted-foreground/60">
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

                          {/* Follow-up & Related */}
                          {message.role === 'assistant' && message.content && !isLoading && index === messages.length - 1 && (
                            <ChatFollowUpActions
                              onAction={handleQuickAction}
                              disabled={isLoading}
                              messageCount={messages.filter(m => m.role === 'user').length}
                            />
                          )}
                          {message.role === 'assistant' && message.relatedData && !isLoading && (
                            <ChatRelatedResources data={message.relatedData} />
                          )}
                        </div>
                        
                        {/* User avatar */}
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 mt-1">
                            <div className={cn(
                              "rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-md shadow-primary/15",
                              isMobile ? "w-7 h-7" : "w-9 h-9"
                            )}>
                              <User className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-primary-foreground")} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Typing indicator */}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex gap-2 md:gap-3 animate-fade-in">
                      <div className="flex-shrink-0 mt-1">
                        <div className={cn(
                          "rounded-full bg-gradient-to-br from-primary/15 to-amber-500/15 flex items-center justify-center border border-primary/20",
                          isMobile ? "w-7 h-7" : "w-9 h-9"
                        )}>
                          <Flame className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "text-primary animate-pulse")} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        {!isMobile && <span className="text-[10px] font-semibold uppercase tracking-wider mb-1 px-1 text-primary/60">Krishna</span>}
                        <div className="bg-gradient-to-br from-background via-card to-muted/30 border border-border/50 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground/70 italic">{typingMessage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Scroll to bottom */}
            {showScrollButton && (
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 z-10",
                isMobile ? "bottom-24" : "bottom-28"
              )}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={scrollToBottom}
                  className="rounded-full shadow-lg gap-1.5 bg-background/95 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all text-xs h-8"
                >
                  <ArrowDown className="h-3 w-3" />
                  {!isMobile && "Scroll down"}
                </Button>
              </div>
            )}

            {/* Composer - optimized for mobile */}
            <div className={cn(
              "border-t border-border/30 bg-gradient-to-t from-card via-card to-transparent",
              isMobile 
                ? "px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]" 
                : "p-4"
            )}>
              {/* Quick actions mid-conversation */}
              {messages.length > 0 && (
                <div className={cn(isMobile ? "mb-1.5" : "mb-2.5")}>
                  <QuickActionsBar onQuickAction={handleQuickAction} disabled={isLoading} />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="relative">
                <div className={cn(
                  "relative flex items-end gap-1 bg-background/80 backdrop-blur-md border border-border/60 focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] transition-all duration-200",
                  isMobile 
                    ? "rounded-xl px-1.5 py-1" 
                    : "rounded-2xl px-3 py-2"
                )}>
                  <VoiceInputButton 
                    onTranscript={handleVoiceTranscript} 
                    disabled={isLoading}
                    className={cn(
                      "flex-shrink-0 rounded-lg text-muted-foreground hover:text-foreground",
                      isMobile ? "h-9 w-9" : "h-10 w-10"
                    )}
                  />
                  
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isMobile ? "Ask Krishna..." : "Share what's on your mind..."}
                    className={cn(
                      "min-h-[44px] max-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-1 py-2.5 placeholder:text-muted-foreground/50",
                      isMobile ? "text-[16px]" : "text-[15px]", // 16px prevents iOS zoom
                      isOverLimit && "text-destructive"
                    )}
                    disabled={isLoading}
                  />
                  
                  <div className="flex items-center gap-1 flex-shrink-0 pb-0.5">
                    {charCount > 400 && !isMobile && (
                      <span className={cn(
                        "text-[10px] tabular-nums",
                        isOverLimit ? "text-destructive font-medium" : "text-muted-foreground/40"
                      )}>
                        {charCount}/{MAX_CHARS}
                      </span>
                    )}
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "rounded-lg bg-gradient-to-br from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md shadow-primary/20 transition-all duration-200",
                        isMobile ? "h-9 w-9" : "h-10 w-10",
                        input.trim() && !isOverLimit ? "opacity-100 scale-100" : "opacity-40 scale-95"
                      )}
                      disabled={!input.trim() || isLoading || isOverLimit}
                    >
                      {isLoading ? (
                        <Loader2 className={cn(isMobile ? "h-4 w-4" : "h-5 w-5", "animate-spin")} />
                      ) : (
                        <Send className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Footer meta - desktop only */}
                {!isMobile && (
                  <div className="flex items-center justify-between mt-1.5 px-3">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                      <span className="flex items-center gap-1">
                        <Keyboard className="h-3 w-3" />
                        Enter to send · Shift+Enter for new line
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                      <Shield className="h-3 w-3" />
                      <span>Private & secure</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
