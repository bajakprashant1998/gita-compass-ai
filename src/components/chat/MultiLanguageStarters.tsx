import { useState } from 'react';
import { Briefcase, Heart, Brain, Compass, Sparkles, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_LANGUAGES } from './EnhancedLanguageSelector';

interface MultiLanguageStartersProps {
  onSelect: (text: string) => void;
  selectedLanguage: string;
}

// Multi-language prompts
const prompts: Record<string, { work: string[]; relationships: string[]; peace: string[]; decisions: string[] }> = {
  en: {
    work: [
      "I'm burned out at work and don't know how to find balance",
      "I feel stuck in my career and want purpose",
    ],
    relationships: [
      "I'm struggling to forgive someone who hurt me",
      "How do I maintain peace in difficult relationships?",
    ],
    peace: [
      "My mind is constantly racing with worries",
      "How do I find contentment with what I have?",
    ],
    decisions: [
      "I'm at a crossroads and don't know which path to take",
      "How do I know what my true purpose is?",
    ],
  },
  hi: {
    work: [
      "मैं काम में थक गया हूं और संतुलन कैसे पाऊं नहीं जानता",
      "मुझे अपने करियर में उद्देश्य खोजना है",
    ],
    relationships: [
      "मुझे किसी को माफ करने में कठिनाई हो रही है",
      "मैं कठिन रिश्तों में शांति कैसे बनाए रखूं?",
    ],
    peace: [
      "मेरा मन हमेशा चिंताओं से भरा रहता है",
      "मेरे पास जो है उसमें संतोष कैसे पाऊं?",
    ],
    decisions: [
      "मैं दोराहे पर हूं और कौन सा रास्ता चुनूं नहीं जानता",
      "मेरा असली उद्देश्य क्या है कैसे जानूं?",
    ],
  },
  ta: {
    work: [
      "நான் வேலையில் சோர்வாக இருக்கிறேன், சமநிலை எப்படி கண்டுபிடிப்பது?",
      "என் வாழ்க்கையில் நோக்கம் தேவை",
    ],
    relationships: [
      "என்னை காயப்படுத்தியவரை மன்னிக்க சிரமப்படுகிறேன்",
      "கடினமான உறவுகளில் அமைதியை எப்படி பராமரிப்பது?",
    ],
    peace: [
      "என் மனம் எப்போதும் கவலைகளால் நிறைந்திருக்கிறது",
      "என்னிடம் உள்ளதில் திருப்தி எப்படி கண்டுபிடிப்பது?",
    ],
    decisions: [
      "நான் ஒரு முக்கிய தீர்மானத்தில் இருக்கிறேன்",
      "என் உண்மையான நோக்கம் என்னவென்று எப்படி அறிவது?",
    ],
  },
  te: {
    work: [
      "నేను పనిలో అలసిపోయాను, సమతుల్యత ఎలా కనుగొనాలి?",
      "నా కెరీర్‌లో ఉద్దేశ్యం కావాలి",
    ],
    relationships: [
      "నన్ను బాధపెట్టిన వారిని క్షమించడంలో కష్టపడుతున్నాను",
      "కష్టమైన సంబంధాలలో శాంతిని ఎలా నిలుపుకోవాలి?",
    ],
    peace: [
      "నా మనసు ఎప్పుడూ ఆందోళనలతో నిండి ఉంటుంది",
      "నా దగ్గర ఉన్న దానితో సంతృప్తి ఎలా పొందాలి?",
    ],
    decisions: [
      "నేను ఒక ముఖ్యమైన నిర్ణయంలో ఉన్నాను",
      "నా నిజమైన ఉద్దేశ్యం ఏమిటో ఎలా తెలుసుకోవాలి?",
    ],
  },
  bn: {
    work: [
      "আমি কাজে ক্লান্ত, ভারসাম্য কীভাবে খুঁজব?",
      "আমার কর্মজীবনে উদ্দেশ্য চাই",
    ],
    relationships: [
      "যে আমাকে আঘাত করেছে তাকে ক্ষমা করতে কষ্ট হচ্ছে",
      "কঠিন সম্পর্কে শান্তি কীভাবে বজায় রাখব?",
    ],
    peace: [
      "আমার মন সবসময় দুশ্চিন্তায় ভরা থাকে",
      "আমার কাছে যা আছে তাতে সন্তুষ্টি কীভাবে পাব?",
    ],
    decisions: [
      "আমি একটি গুরুত্বপূর্ণ সিদ্ধান্তে আছি",
      "আমার প্রকৃত উদ্দেশ্য কী তা কীভাবে জানব?",
    ],
  },
};

const categories = [
  {
    key: 'work',
    icon: Briefcase,
    labels: { en: 'Work & Career', hi: 'काम और करियर', ta: 'வேலை', te: 'పని', bn: 'কাজ' },
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'hover:border-blue-500/30',
  },
  {
    key: 'relationships',
    icon: Heart,
    labels: { en: 'Relationships', hi: 'रिश्ते', ta: 'உறவுகள்', te: 'సంబంధాలు', bn: 'সম্পর্ক' },
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    borderColor: 'hover:border-pink-500/30',
  },
  {
    key: 'peace',
    icon: Brain,
    labels: { en: 'Inner Peace', hi: 'आंतरिक शांति', ta: 'உள் அமைதி', te: 'అంతర్గత శాంతి', bn: 'অন্তর শান্তি' },
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'hover:border-teal-500/30',
  },
  {
    key: 'decisions',
    icon: Compass,
    labels: { en: 'Life Decisions', hi: 'जीवन के निर्णय', ta: 'வாழ்க்கை தீர்மானங்கள்', te: 'జీవిత నిర్ణయాలు', bn: 'জীবন সিদ্ধান্ত' },
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'hover:border-amber-500/30',
  },
];

const headings: Record<string, { title: string; subtitle: string; tip: string }> = {
  en: {
    title: '🙏 Hare Krishna!',
    subtitle: 'Krishna is here to guide you. Just ask.',
    tip: '💡 Be specific about your situation for personalized guidance',
  },
  hi: {
    title: '🙏 हरे कृष्ण!',
    subtitle: 'कृष्ण आपका मार्गदर्शन करने के लिए यहाँ हैं। बस पूछें।',
    tip: '💡 व्यक्तिगत मार्गदर्शन के लिए अपनी स्थिति स्पष्ट बताएं',
  },
  ta: {
    title: '🙏 ஹரே கிருஷ்ணா!',
    subtitle: 'கிருஷ்ணா உங்களுக்கு வழிகாட்ட இங்கே இருக்கிறார்.',
    tip: '💡 தனிப்பயனாக்கப்பட்ட வழிகாட்டுதலுக்கு குறிப்பிட்டதாக இருங்கள்',
  },
  te: {
    title: '🙏 హరే కృష్ణ!',
    subtitle: 'కృష్ణుడు మీకు మార్గదర్శకత్వం చేయడానికి ఇక్కడ ఉన్నాడు.',
    tip: '💡 వ్యక్తిగతీకరించిన మార్గదర్శకత్వం కోసం నిర్దిష్టంగా ఉండండి',
  },
  bn: {
    title: '🙏 হরে কৃষ্ণ!',
    subtitle: 'কৃষ্ণ আপনাকে পথ দেখাতে এখানে আছেন। শুধু জিজ্ঞেস করুন।',
    tip: '💡 ব্যক্তিগত নির্দেশনার জন্য আপনার পরিস্থিতি স্পষ্টভাবে বলুন',
  },
};

export function MultiLanguageStarters({ onSelect, selectedLanguage }: MultiLanguageStartersProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Get language-specific content or fall back to English
  const lang = selectedLanguage === 'auto' ? 'en' : selectedLanguage;
  const langPrompts = prompts[lang] || prompts.en;
  const langHeadings = headings[lang] || headings.en;

  // On mobile, show only 2 categories initially (peace + decisions)
  const visibleCategories = showAll ? categories : categories;
  const mobileCategories = showAll ? categories : categories.slice(2); // peace & decisions first on mobile

  return (
    <div className="h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-5 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2 animate-fade-in">
            {langHeadings.title}
          </h3>
          <p className="text-muted-foreground animate-fade-in text-sm md:text-base" style={{ animationDelay: '100ms' }}>
            {langHeadings.subtitle}
          </p>
          
          {/* Language indicator */}
          {selectedLanguage !== 'en' && selectedLanguage !== 'auto' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Globe className="h-3.5 w-3.5" />
              <span>{INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}</span>
            </div>
          )}
        </div>

        {/* Categories Grid - Desktop: all 4, Mobile: 2 initially */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-4">
          {visibleCategories.map((category, catIndex) => (
            <CategoryCard
              key={category.key}
              category={category}
              lang={lang}
              langPrompts={langPrompts}
              catIndex={catIndex}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Mobile: show 2 categories initially */}
        <div className="sm:hidden space-y-3">
          {mobileCategories.map((category, catIndex) => (
            <CategoryCard
              key={category.key}
              category={category}
              lang={lang}
              langPrompts={langPrompts}
              catIndex={catIndex}
              onSelect={onSelect}
              compact
            />
          ))}
          
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-primary font-medium rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span>More topics</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          
          {showAll && categories.slice(0, 2).map((category, catIndex) => (
            <CategoryCard
              key={category.key}
              category={category}
              lang={lang}
              langPrompts={langPrompts}
              catIndex={catIndex + 2}
              onSelect={onSelect}
              compact
            />
          ))}
        </div>

        {/* Tip */}
        <div className="mt-4 md:mt-6 text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-xs text-muted-foreground">
            {langHeadings.tip}
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, lang, langPrompts, catIndex, onSelect, compact }: {
  category: typeof categories[0];
  lang: string;
  langPrompts: typeof prompts.en;
  catIndex: number;
  onSelect: (text: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="space-y-1.5 sm:space-y-2 animate-fade-in"
      style={{ animationDelay: `${200 + catIndex * 100}ms` }}
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className={cn(
          "w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center",
          "bg-gradient-to-br shadow-lg",
          category.color
        )}>
          <category.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <span className="font-semibold text-sm sm:text-base text-foreground">
          {category.labels[lang as keyof typeof category.labels] || category.labels.en}
        </span>
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        {(langPrompts[category.key as keyof typeof langPrompts] || []).slice(0, compact ? 1 : 2).map((prompt, promptIndex) => (
          <button
            key={promptIndex}
            onClick={() => onSelect(prompt)}
            className={cn(
              "group w-full text-left p-3 sm:p-3.5 md:p-4 rounded-xl border border-border/50 bg-card",
              "text-sm transition-all duration-200",
              "hover:bg-muted/50 hover:shadow-lg hover:-translate-y-0.5",
              "min-h-[44px]",
              category.borderColor
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                {prompt}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                "opacity-0 group-hover:opacity-100 transition-all",
                "bg-gradient-to-r",
                category.color
              )}>
                <ArrowRight className="h-3 w-3 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
