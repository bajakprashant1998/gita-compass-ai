import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { getShlokByChapterAndVerse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen, Lightbulb, MessageSquare, Heart, Sparkles, Share2, Bookmark, Copy, Check, Eye, Clock, ArrowUp, Star, MessageCircle, ExternalLink } from 'lucide-react';
import { SEOHead, generateArticleSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { FloatingOm, RadialGlow } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';

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
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Section definitions for TOC
const tocSections = [
  { id: 'sanskrit', label: 'Sanskrit Verse', icon: BookOpen },
  { id: 'meaning', label: 'Meaning', icon: MessageSquare },
  { id: 'key-insight', label: 'Key Insight', icon: Sparkles },
  { id: 'problems', label: 'Life Challenges', icon: Heart },
  { id: 'story', label: 'Modern Story', icon: Lightbulb },
  { id: 'application', label: 'Life Application', icon: Target },
  { id: 'wisdom-card', label: 'Wisdom Card', icon: Star },
  { id: 'verse-chat', label: 'Ask Krishna', icon: MessageCircle },
  { id: 'community', label: 'Community', icon: MessageSquare },
];

interface TranslatedContent {
  meaning?: string;
  lifeApplication?: string;
  practicalAction?: string;
  modernStory?: string;
  problemContext?: string;
  solutionGita?: string;
}

export default function ShlokDetailPage() {
  const { chapterNumber, verseNumber } = useParams<{ chapterNumber: string; verseNumber: string }>();
  const chapterNum = parseInt(chapterNumber || '1');
  const verseNum = parseInt(verseNumber || '1');

  const { user } = useAuth();
  // Favorites handled by ShlokActions component
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

      // Active section tracking
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="h-12 w-96 animate-pulse rounded-lg bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!shlok) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Verse not found</h1>
          <p className="text-muted-foreground mb-4">Chapter {chapterNum}, Verse {verseNum} could not be found.</p>
          <Link to="/chapters"><Button>Browse Chapters</Button></Link>
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

  const articleSchema = generateArticleSchema({
    chapter_number: chapterNum,
    verse_number: verseNum,
    english_meaning: shlok.english_meaning,
    life_application: shlok.life_application || undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.bhagavadgitagyan.com' },
    { name: `Chapter ${chapterNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}` },
    { name: `Verse ${verseNum}`, url: `https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}` },
  ]);

  const combinedSchema = { '@context': 'https://schema.org', '@graph': [articleSchema, breadcrumbSchema] };
  const wordCount = shlok.english_meaning.split(/\s+/).length + (shlok.life_application?.split(/\s+/).length || 0) + (shlok.modern_story?.split(/\s+/).length || 0);
  const readTime = Math.max(3, Math.ceil(wordCount / 200));

  return (
    <Layout>
      <ReadingProgress />
      
      <SEOHead
        title={(shlok as any).meta_title || `Chapter ${chapterNum}, Verse ${verseNum} - ${shlok.life_application || 'Bhagavad Gita'}`}
        description={(shlok as any).meta_description || shlok.english_meaning.substring(0, 155) + '...'}
        canonicalUrl={`https://www.bhagavadgitagyan.com/chapters/${chapterNum}/verse/${verseNum}`}
        keywords={(shlok as any).meta_keywords || ['Bhagavad Gita', `Chapter ${chapterNum}`, `Verse ${verseNum}`, 'wisdom', 'guidance']}
        structuredData={combinedSchema}
        type="article"
      />

      {/* Floating Social Share Bar - Left side */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2 transition-all duration-500 ${showFloatingShare ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
        <button onClick={handleCopyLink} className="p-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" title="Copy link">
          {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        <button onClick={() => handleShare('twitter')} className="p-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" title="Share on X">
          <ExternalLink className="h-4 w-4" />
        </button>
        <button onClick={() => handleShare('whatsapp')} className="p-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200" title="Share on WhatsApp">
          <Share2 className="h-4 w-4" />
        </button>
        <button onClick={() => handleShare('native')} className="p-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" title="Share">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-20 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-110 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      
      <div className="relative overflow-hidden">
        {/* Sanskrit watermark */}
        <div className="absolute top-32 right-10 text-[200px] font-bold text-primary/[0.03] select-none pointer-events-none leading-none hidden lg:block" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ॐ</div>
        <FloatingOm className="top-40 -left-10 animate-float hidden xl:block" />
        <RadialGlow position="top-right" color="primary" className="opacity-30" />
        <RadialGlow position="bottom-left" color="amber" className="opacity-20" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 relative">
          
          {/* Top bar: Back + Language */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 max-w-6xl mx-auto">
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
          </div>

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

          {/* Hero Header */}
          <div className="max-w-6xl mx-auto mb-10">
            <div className="text-center space-y-4">
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
                <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed italic">
                  "{displayContent.meaning.split('.')[0]}."
                </p>
              )}
            </div>
          </div>

          {/* ===== Two Column Layout ===== */}
          <div className="max-w-6xl mx-auto flex gap-8">
            
            {/* Main Content Column */}
            <div className="flex-1 min-w-0">
              
              {/* Sanskrit Verse */}
              <div id="sanskrit">
                <SanskritVerse shlok={shlok} />
              </div>

              {/* Meaning & Interpretation */}
              <div id="meaning">
                <Card className="mb-8 border-0 shadow-lg animate-fade-in animation-delay-200 overflow-hidden">
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
              </div>

              {/* Key Insight Card */}
              {displayContent.meaning && (
                <div id="key-insight" className="mb-8 animate-fade-in animation-delay-300">
                  <div className="relative rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-orange-500/10 border border-primary/20 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white flex-shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-1">Key Insight</h4>
                        <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                          {displayContent.meaning.split('.')[0]}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Tags */}
              <div id="problems">
                <ProblemTags problems={shlok.problems || []} />
              </div>

              {/* Problem → Solution Flow */}
              {(displayContent.problemContext || displayContent.solutionGita) && (
                <div className="mb-8 space-y-4">
                  {displayContent.problemContext && (
                    <Card className="border-l-4 border-l-amber-500 overflow-hidden">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600">?</span>
                          The Problem
                        </h4>
                        <TranslatableContent languageCode={currentLanguage} className="text-foreground leading-relaxed">
                          {displayContent.problemContext}
                        </TranslatableContent>
                      </CardContent>
                    </Card>
                  )}
                  {displayContent.solutionGita && (
                    <Card className="border-l-4 border-l-green-500 overflow-hidden">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-600">✓</span>
                          Gita's Solution
                        </h4>
                        <TranslatableContent languageCode={currentLanguage} className="text-foreground leading-relaxed">
                          {displayContent.solutionGita}
                        </TranslatableContent>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Modern Story */}
              {shlok.modern_story && (
                <div id="story">
                  <ModernStory shlok={shlok} />
                </div>
              )}

              {/* Life Application & Today's Action */}
              <div id="application" className="space-y-6 mb-8 animate-fade-in animation-delay-400">
                {displayContent.lifeApplication && (
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg">
                          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-xl text-primary">Life Application</h3>
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Key Takeaway</span>
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
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="shrink-0 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                          <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Today's Action</h3>
                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-semibold">DO THIS</span>
                          </div>
                          <TranslatableContent languageCode={currentLanguage} className="text-base sm:text-lg md:text-xl leading-relaxed text-foreground">
                            {displayContent.practicalAction}
                          </TranslatableContent>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Share Wisdom */}
              <ShareWisdomCard shlok={shlok} />

              {/* Wisdom Card Generator */}
              <div id="wisdom-card">
                <WisdomCardGenerator shlok={shlok} />
              </div>

              {/* Verse Chat */}
              <div id="verse-chat">
                <VerseChat shlok={shlok} />
              </div>

              {/* Community */}
              <div id="community">
                <CommunityReflections shlokId={shlok.id} />
                <DiscussionThreads shlokId={shlok.id} />
              </div>

              {/* Actions */}
              <ShlokActions shlokId={shlok.id} />

              {/* Chapter Progress */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-background to-accent/10 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Chapter {chapterNum} Progress</span>
                  <span className="text-sm font-bold text-primary">Verse {verseNum} / {shlok.chapter?.verse_count || 47}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-500" style={{ width: `${Math.min((verseNum / (shlok.chapter?.verse_count || 47)) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Keep exploring to unlock more wisdom
                </p>
              </div>
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
                    <nav className="space-y-1">
                      {tocSections.map((section) => {
                        const isActive = activeSection === section.id;
                        const SectionIcon = section.icon;
                        // Check if section has content
                        if (section.id === 'story' && !shlok.modern_story) return null;
                        if (section.id === 'problems' && (!shlok.problems || shlok.problems.length === 0)) return null;
                        return (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left ${
                              isActive
                                ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <SectionIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{section.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>

                {/* Verse Info Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-amber-500/5">
                  <CardContent className="p-5 space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mx-auto mb-3">
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
                  <CardContent className="p-5 space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Quick Actions</h4>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm" onClick={handleCopyLink}>
                      {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm" onClick={() => handleShare('whatsapp')}>
                      <Share2 className="h-4 w-4" /> Share on WhatsApp
                    </Button>
                    <Link to="/chat" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2 text-sm" size="sm">
                        <MessageCircle className="h-4 w-4" /> Ask Krishna AI
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Related Wisdom CTA */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-amber-600 text-white overflow-hidden">
                  <CardContent className="p-5 relative">
                    <div className="absolute -top-6 -right-6 text-6xl opacity-10">🙏</div>
                    <h4 className="font-bold text-lg mb-2">Need Guidance?</h4>
                    <p className="text-sm text-white/80 mb-4">Talk to Krishna AI about your life challenges and get personalized wisdom.</p>
                    <Link to="/chat">
                      <Button size="sm" variant="secondary" className="w-full gap-2">
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

      <VerseNavigation chapterNumber={chapterNum} verseNumber={verseNum} />
    </Layout>
  );
}
