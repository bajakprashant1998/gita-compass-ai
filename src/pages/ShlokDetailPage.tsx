import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen, Lightbulb, MessageSquare, Heart, Sparkles, Share2, Bookmark, Copy, Check, Eye, Clock, ArrowUp, Star, MessageCircle, ExternalLink, List, X, ChevronDown } from 'lucide-react';
import { SEOHead, generateArticleSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { generateEnhancedVerseSchema, generateSpeakableSchema } from '@/lib/seoSchemas';
import { RelatedContentLinks } from '@/components/seo/RelatedContentLinks';
import { FloatingOm, RadialGlow } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Modular components
import { SanskritVerse } from '@/components/shlok/SanskritVerse';
import { ProblemTags } from '@/components/shlok/ProblemTags';
import { ModernStory } from '@/components/shlok/ModernStory';
import { ShareWisdomCard } from '@/components/shlok/ShareWisdomCard';
import { ShlokActions } from '@/components/shlok/ShlokActions';
import { WisdomCardGenerator } from '@/components/shlok/WisdomCardGenerator';
import { VerseChat } from '@/components/shlok/VerseChat';
import { CommunityReflections } from '@/components/shlok/CommunityReflections';
import { ReadingProgress } from '@/components/shlok/ReadingProgress';
import { DiscussionThreads } from '@/components/shlok/DiscussionThreads';
import { VerseNavigation } from '@/components/shlok/VerseNavigation';
import { PageLanguageSelector, getScriptClass, isRTL } from '@/components/shlok/PageLanguageSelector';
import { TranslatableContent } from '@/components/shlok/TranslatableContent';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { trackVerseRead } from '@/hooks/useReadingActivity';
import { NextVerseRecommendation } from '@/components/shlok/NextVerseRecommendation';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Section definitions for TOC
const tocSections = [
  { id: 'sanskrit', label: 'Sanskrit Verse', icon: BookOpen, emoji: '📜' },
  { id: 'meaning', label: 'Meaning', icon: MessageSquare, emoji: '💡' },
  { id: 'key-insight', label: 'Key Insight', icon: Sparkles, emoji: '✨' },
  { id: 'problems', label: 'Life Challenges', icon: Heart, emoji: '🎯' },
  { id: 'story', label: 'Modern Story', icon: Lightbulb, emoji: '📖' },
  { id: 'application', label: 'Life Application', icon: Target, emoji: '🌱' },
  { id: 'wisdom-card', label: 'Wisdom Card', icon: Star, emoji: '🃏' },
  { id: 'verse-chat', label: 'Ask Krishna', icon: MessageCircle, emoji: '🙏' },
  { id: 'community', label: 'Community', icon: MessageSquare, emoji: '👥' },
];

// Scroll-triggered animation wrapper
function AnimatedSection({ children, id, className = '' }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

interface TranslatedContent {
  meaning?: string;
  lifeApplication?: string;
  practicalAction?: string;
  modernStory?: string;
  problemContext?: string;
  solutionGita?: string;
}

// Mobile TOC Sheet
function MobileTOC({ sections, activeSection, onSelect, shlok }: { 
  sections: typeof tocSections; 
  activeSection: string; 
  onSelect: (id: string) => void;
  shlok: any;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      {/* Floating TOC button - mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 lg:hidden p-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform"
        aria-label="Table of contents"
      >
        <List className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg">On This Page</h3>
                  <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    if (section.id === 'story' && !shlok.modern_story) return null;
                    if (section.id === 'problems' && (!shlok.problems || shlok.problems.length === 0)) return null;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSelect(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-base">{section.emoji}</span>
                        <span>{section.label}</span>
                        {isActive && <span className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
              {/* Safe area */}
              <div className="h-[env(safe-area-inset-bottom,0px)]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ShlokDetailPage() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');
  const verseNum = parseInt(verseNumber || '1');

  const { user } = useAuth();
  const { data: shlok, isLoading } = useQuery({
    queryKey: ['shlok-by-verse', chapterNum, verseNum],
    queryFn: () => getShlokByChapterAndVerse(chapterNum, verseNum),
    enabled: !!chapterNum && !!verseNum,
  });

  // Translation state
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('sanskrit');
  const [showFloatingShare, setShowFloatingShare] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset translation when shlok changes
  useEffect(() => {
    setTranslatedContent(null);
    setCurrentLanguage('en');
  }, [shlok?.id]);

  // Track reading activity
  useEffect(() => {
    if (shlok?.id && user?.id) {
      trackVerseRead(user.id).catch(() => {});
    }
  }, [shlok?.id, user?.id]);

  // Scroll tracking for floating share bar & active TOC
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingShare(window.scrollY > 400);
      setShowScrollTop(window.scrollY > 800);

      const sectionIds = tocSections.map(s => s.id);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTranslated = useCallback((content: TranslatedContent, langCode: string) => {
    setTranslatedContent(content);
    setCurrentLanguage(langCode);
  }, []);

  const handleReset = useCallback(() => {
    setTranslatedContent(null);
    setCurrentLanguage('en');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        if (verseNum > 1) window.location.href = `/chapters/${chapterNum}/verse/${verseNum - 1}`;
        else if (chapterNum > 1) window.location.href = `/chapters/${chapterNum - 1}`;
      } else if (e.key === 'ArrowRight') {
        window.location.href = `/chapters/${chapterNum}/verse/${verseNum + 1}`;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterNum, verseNum]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = async (platform: string) => {
    const text = shlok ? (shlok.life_application || shlok.english_meaning) : '';
    const url = window.location.href;
    const title = `Bhagavad Gita Ch ${chapterNum}, Verse ${verseNum}`;
    const encoded = encodeURIComponent(`${text}\n\n— ${title}`);
    const encodedUrl = encodeURIComponent(url);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encoded}%20${encodedUrl}`,
    };
    if (platform === 'native' && navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {}
      return;
    }
    window.open(urls[platform], '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced loading skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="text-center mb-10 space-y-4">
              <div className="flex justify-center gap-2">
                <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-12 w-80 animate-pulse rounded-lg bg-muted mx-auto" />
              <div className="h-8 w-48 animate-pulse rounded-lg bg-muted mx-auto" />
            </div>
            <div className="flex gap-8">
              <div className="flex-1 space-y-6">
                <div className="h-64 animate-pulse rounded-2xl bg-gradient-to-br from-primary/5 to-muted" />
                <div className="h-48 animate-pulse rounded-2xl bg-muted" />
                <div className="h-32 animate-pulse rounded-2xl bg-muted" />
              </div>
              <div className="hidden lg:block w-72 space-y-6">
                <div className="h-80 animate-pulse rounded-2xl bg-muted" />
                <div className="h-48 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!shlok) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Verse not found</h1>
            <p className="text-muted-foreground mb-6">Chapter {chapterNum}, Verse {verseNum} could not be found.</p>
            <Link to={`/chapters/${chapterNum}`}>
              <Button className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Chapter {chapterNum}
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const displayContent = {
    meaning: translatedContent?.meaning || shlok.english_meaning,
    lifeApplication: translatedContent?.lifeApplication || shlok.life_application,
    practicalAction: translatedContent?.practicalAction || shlok.practical_action,
    modernStory: translatedContent?.modernStory || shlok.modern_story,
    problemContext: translatedContent?.problemContext || shlok.problem_context,
    solutionGita: translatedContent?.solutionGita || shlok.solution_gita,
  };

  const enhancedVerseSchema = generateEnhancedVerseSchema({
    chapter_number: chapterNum,
    verse_number: verseNum,
    english_meaning: shlok.english_meaning,
    sanskrit_text: shlok.sanskrit_text,
    life_application: shlok.life_application || undefined,
    practical_action: shlok.practical_action || undefined,
    updated_at: shlok.updated_at || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com' },
    { name: 'Chapters', url: 'https://www.bhagavadgitagyan.com/chapters' },
    { name: `Chapter ${chapterNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}` },
    { name: `Verse ${verseNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}` },
  ]);

  const speakableSchema = generateSpeakableSchema();

  const wordCount = shlok.english_meaning.split(/\s+/).length + (shlok.life_application?.split(/\s+/).length || 0) + (shlok.modern_story?.split(/\s+/).length || 0);
  const readTime = Math.max(3, Math.ceil(wordCount / 200));

  const problemIds = (shlok as any).problems?.map((p: any) => p.problem_id || p.id) || [];

  return (
    <Layout>
      <ReadingProgress />
      
      <SEOHead
        title={(shlok as any).meta_title || `Chapter ${chapterNum}, Verse ${verseNum} - ${shlok.life_application || 'Bhagavad Gita'}`}
        description={(shlok as any).meta_description || shlok.english_meaning.substring(0, 155) + '...'}
        canonicalUrl={`https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}`}
        keywords={(shlok as any).meta_keywords || ['Bhagavad Gita', `Chapter ${chapterNum}`, `Verse ${verseNum}`, 'wisdom', 'guidance']}
        structuredData={[enhancedVerseSchema, breadcrumbSchema, speakableSchema]}
        type="article"
        hreflang={[
          { lang: 'en', url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}` },
          { lang: 'hi', url: `https://www.bhagavadgitagyan.com/hi/chapters/${chapterNum}/verse/${verseNum}` },
          { lang: 'x-default', url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}` },
        ]}
        ogImage={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-og-image?chapter=${chapterNum}&verse=${verseNum}`}
      />

      {/* Floating Social Share Bar - Left side */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 transition-all duration-500 ${showFloatingShare ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
        {[
          { action: handleCopyLink, icon: linkCopied ? Check : Copy, title: 'Copy link', hoverClass: 'hover:bg-primary hover:text-primary-foreground hover:border-primary' },
          { action: () => handleShare('twitter'), icon: ExternalLink, title: 'Share on X', hoverClass: 'hover:bg-primary hover:text-primary-foreground hover:border-primary' },
          { action: () => handleShare('whatsapp'), icon: Share2, title: 'Share on WhatsApp', hoverClass: 'hover:bg-green-600 hover:text-white hover:border-green-600' },
          { action: () => handleShare('native'), icon: Bookmark, title: 'Share', hoverClass: 'hover:bg-primary hover:text-primary-foreground hover:border-primary' },
        ].map((btn, i) => (
          <motion.button
            key={btn.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={btn.action}
            className={`p-2.5 rounded-full bg-card border border-border shadow-lg transition-all duration-200 ${btn.hoverClass}`}
            title={btn.title}
          >
            <btn.icon className="h-4 w-4" />
          </motion.button>
        ))}
      </div>

      {/* Mobile TOC */}
      <MobileTOC sections={tocSections} activeSection={activeSection} onSelect={scrollToSection} shlok={shlok} />

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-110 transition-transform"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
      
      <div className="relative overflow-hidden">
        {/* Sanskrit watermark */}
        <div className="absolute top-32 right-10 text-[200px] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>
        <FloatingOm className="top-40 -left-10 animate-float hidden xl:block" />
        <RadialGlow position="top-right" color="primary" className="opacity-30" />
        <RadialGlow position="bottom-left" color="amber" className="opacity-20" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 relative">
          
          {/* Top bar: Back + Language */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 max-w-6xl mx-auto"
          >
            <Link to={`/chapters/${chapterNum}`}>
              <Button variant="ghost" className="gap-2 group hover:bg-primary/10 border border-transparent hover:border-primary/20">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Chapter {chapterNum}
              </Button>
            </Link>
            <PageLanguageSelector
              originalContent={{
                meaning: shlok.english_meaning,
                hindiMeaning: shlok.hindi_meaning,
                lifeApplication: shlok.life_application,
                practicalAction: shlok.practical_action,
                modernStory: shlok.modern_story,
                problemContext: shlok.problem_context,
                solutionGita: shlok.solution_gita,
              }}
              onTranslated={handleTranslated}
              onReset={handleReset}
            />
          </motion.div>

          {/* Breadcrumb */}
          <div className="max-w-6xl mx-auto mb-6">
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/" className="hover:text-primary transition-colors">Home</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/chapters" className="hover:text-primary transition-colors">Chapters</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to={`/chapters/${chapterNum}`} className="hover:text-primary transition-colors">Chapter {chapterNum}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage className="font-medium">Verse {verseNum}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Hero Header — Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto mb-10"
          >
            <div className="text-center space-y-5">
              {/* Verse number hero badge */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary via-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="text-center text-white -rotate-3 hover:rotate-0 transition-transform duration-500">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-80">Verse</p>
                      <p className="text-2xl sm:text-3xl font-bold leading-none">{verseNum}</p>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground shadow">
                    {chapterNum}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="secondary" className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border-0">
                  Bhagavad Gita
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                  <Clock className="h-3 w-3 mr-1" />{readTime} min read
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                  <Eye className="h-3 w-3 mr-1" />{wordCount} words
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-amber-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                Chapter {chapterNum}: {shlok.chapter?.title_english}
              </h1>
              
              <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
                Verse {verseNum} {shlok.chapter?.title_sanskrit && <span className="text-primary/60">• {shlok.chapter.title_sanskrit}</span>}
              </h2>

              {/* Quick insight pill */}
              {displayContent.meaning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  <p className="text-base text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 text-left sm:text-center sm:border-l-0 sm:pl-0">
                    "{displayContent.meaning.split('.')[0]}."
                  </p>
                </motion.div>
              )}

              {/* Scroll hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <ChevronDown className="h-5 w-5 mx-auto text-muted-foreground/40 animate-bounce" />
              </motion.div>
            </div>
          </motion.div>

          {/* ===== Two Column Layout ===== */}
          <div className="max-w-6xl mx-auto flex gap-8">
            
            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-0">
              
              {/* Sanskrit Verse */}
              <AnimatedSection id="sanskrit">
                <SanskritVerse shlok={shlok} />
              </AnimatedSection>

              {/* Meaning & Interpretation */}
              <AnimatedSection id="meaning">
                <Card className="mb-8 border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <div className="h-1 bg-gradient-to-r from-secondary via-accent to-secondary" />
                  <CardContent className="p-5 sm:p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-accent text-secondary-foreground">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Meaning & Interpretation</h3>
                        <p className="text-xs text-muted-foreground">Understanding the verse</p>
                      </div>
                    </div>
                    <div className="relative pl-6 border-l-4 border-primary/30">
                      <TranslatableContent languageCode={currentLanguage} className="text-base sm:text-lg md:text-xl leading-relaxed text-foreground">
                        {displayContent.meaning}
                      </TranslatableContent>
                      {currentLanguage !== 'en' && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">Translated</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Key Insight Card */}
              {displayContent.meaning && (
                <AnimatedSection id="key-insight" className="mb-8">
                  <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-orange-500/10 border border-primary/20 p-5 sm:p-6 group hover:border-primary/40 transition-colors duration-300">
                    <div className="absolute top-3 right-3 text-3xl opacity-10 select-none">💡</div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white flex-shrink-0 shadow-lg shadow-primary/20">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-2">Key Insight</h4>
                        <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                          {displayContent.meaning.split('.')[0]}.
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* Problem Tags */}
              <AnimatedSection id="problems">
                <ProblemTags problems={shlok.problems || []} />
              </AnimatedSection>

              {/* Problem → Solution Flow with visual connector */}
              {(displayContent.problemContext || displayContent.solutionGita) && (
                <AnimatedSection className="mb-8">
                  <div className="relative space-y-0">
                    {displayContent.problemContext && (
                      <Card className="border-l-4 border-l-amber-500 overflow-hidden rounded-b-none">
                        <CardContent className="p-6">
                          <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600">?</span>
                            The Problem
                          </h4>
                          <TranslatableContent languageCode={currentLanguage} className="text-foreground leading-relaxed">
                            {displayContent.problemContext}
                          </TranslatableContent>
                        </CardContent>
                      </Card>
                    )}
                    {displayContent.problemContext && displayContent.solutionGita && (
                      <div className="flex items-center justify-center relative z-10 -my-px">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-green-500 flex items-center justify-center shadow-lg">
                          <ArrowRight className="h-5 w-5 text-white rotate-90" />
                        </div>
                      </div>
                    )}
                    {displayContent.solutionGita && (
                      <Card className="border-l-4 border-l-green-500 overflow-hidden rounded-t-none">
                        <CardContent className="p-6">
                          <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-bold text-green-600">✓</span>
                            Gita's Solution
                          </h4>
                          <TranslatableContent languageCode={currentLanguage} className="text-foreground leading-relaxed">
                            {displayContent.solutionGita}
                          </TranslatableContent>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </AnimatedSection>
              )}

              {/* Modern Story */}
              {shlok.modern_story && (
                <AnimatedSection id="story">
                  <ModernStory shlok={shlok} />
                </AnimatedSection>
              )}

              {/* Life Application & Today's Action */}
              <AnimatedSection id="application" className="space-y-6 mb-8">
                {displayContent.lifeApplication && (
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-xl text-primary">Life Application</h3>
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground hidden sm:inline">Key Takeaway</span>
                          </div>
                          <TranslatableContent languageCode={currentLanguage} className="text-base sm:text-lg md:text-xl leading-relaxed font-medium text-foreground">
                            {displayContent.lifeApplication}
                          </TranslatableContent>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {displayContent.practicalAction && (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Today's Action</h3>
                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-semibold animate-pulse">DO THIS</span>
                          </div>
                          <TranslatableContent languageCode={currentLanguage} className="text-base sm:text-lg md:text-xl leading-relaxed text-foreground">
                            {displayContent.practicalAction}
                          </TranslatableContent>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </AnimatedSection>

              {/* Share Wisdom */}
              <AnimatedSection>
                <ShareWisdomCard shlok={shlok} />
              </AnimatedSection>

              {/* Wisdom Card Generator */}
              <AnimatedSection id="wisdom-card">
                <WisdomCardGenerator shlok={shlok} />
              </AnimatedSection>

              {/* Verse Chat */}
              <AnimatedSection id="verse-chat">
                <VerseChat shlok={shlok} />
              </AnimatedSection>

              {/* Community */}
              <AnimatedSection id="community">
                <CommunityReflections shlokId={shlok.id} />
                <DiscussionThreads shlokId={shlok.id} />
              </AnimatedSection>

              {/* Actions */}
              <AnimatedSection>
                <ShlokActions shlokId={shlok.id} />
              </AnimatedSection>

              {/* Chapter Progress */}
              <AnimatedSection>
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-background to-accent/10 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Chapter {chapterNum} Progress</span>
                    <span className="text-sm font-bold text-primary">Verse {verseNum} / {shlok.chapter?.verse_count || 47}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-amber-500 to-orange-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((verseNum / (shlok.chapter?.verse_count || 47)) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Keep exploring to unlock more wisdom
                    </p>
                    <Link to={`/chapters/${chapterNum}`} className="text-xs text-primary hover:underline font-medium">
                      View all verses →
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* ===== Sidebar (Desktop only) ===== */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                
                {/* Table of Contents */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-amber-500" />
                  <CardContent className="p-5">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      On This Page
                    </h4>
                    <nav className="space-y-0.5">
                      {tocSections.map((section) => {
                        const isActive = activeSection === section.id;
                        const SectionIcon = section.icon;
                        if (section.id === 'story' && !shlok.modern_story) return null;
                        if (section.id === 'problems' && (!shlok.problems || shlok.problems.length === 0)) return null;
                        return (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group ${
                              isActive
                                ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <SectionIcon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} />
                            <span className="truncate">{section.label}</span>
                            {isActive && (
                              <motion.span 
                                layoutId="toc-indicator" 
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                              />
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>

                {/* Verse Info Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-amber-500/5 overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                        <span className="text-2xl font-bold text-white">{verseNum}</span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Chapter {chapterNum}</p>
                      <p className="text-xs text-muted-foreground">{shlok.chapter?.title_english}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 rounded-xl bg-background border border-border/50">
                        <p className="text-lg font-bold text-primary">{readTime}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Read</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border/50">
                        <p className="text-lg font-bold text-primary">{wordCount}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Words</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-5 space-y-2">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h4>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10" size="sm" onClick={handleCopyLink}>
                      {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10" size="sm" onClick={() => handleShare('whatsapp')}>
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10" size="sm" onClick={() => handleShare('twitter')}>
                      <ExternalLink className="h-4 w-4" /> Share on X
                    </Button>
                    <Link to={`/chat?context=chapter${chapterNum}verse${verseNum}`} className="block">
                      <Button variant="outline" className="w-full justify-start gap-2 text-sm h-10" size="sm">
                        <MessageCircle className="h-4 w-4" /> Ask Krishna AI
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Related Wisdom CTA */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-amber-600 text-white overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-5 relative">
                    <div className="absolute -top-6 -right-6 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">🙏</div>
                    <h4 className="font-bold text-lg mb-2">Need Guidance?</h4>
                    <p className="text-sm text-white/80 mb-4">Talk to Krishna AI about your life challenges and get personalized wisdom.</p>
                    <Link to="/chat">
                      <Button size="sm" variant="secondary" className="w-full gap-2 group-hover:scale-[1.02] transition-transform">
                        <MessageCircle className="h-4 w-4" /> Start Conversation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* AI Next Verse Recommendation */}
      {user && (
        <div className="container mx-auto px-4 max-w-4xl mb-6">
          <NextVerseRecommendation userId={user.id} />
        </div>
      )}

      {/* Internal Linking Engine */}
      <div className="container mx-auto px-4 max-w-4xl">
        <RelatedContentLinks
          currentChapter={chapterNum}
          currentVerse={verseNum}
          problemIds={problemIds}
        />
      </div>

      <VerseNavigation chapterNumber={chapterNum} verseNumber={verseNum} />
    </Layout>
  );
}
