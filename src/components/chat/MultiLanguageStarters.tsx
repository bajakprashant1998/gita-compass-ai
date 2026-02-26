import { useState } from 'react';
import { Briefcase, Heart, Brain, Compass, ArrowRight, Globe, ChevronDown, BookOpen, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_LANGUAGES } from './EnhancedLanguageSelector';

interface MultiLanguageStartersProps {
  onSelect: (text: string) => void;
  selectedLanguage: string;
}

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
    work: ["मैं काम में थक गया हूं और संतुलन कैसे पाऊं नहीं जानता", "मुझे अपने करियर में उद्देश्य खोजना है"],
    relationships: ["मुझे किसी को माफ करने में कठिनाई हो रही है", "मैं कठिन रिश्तों में शांति कैसे बनाए रखूं?"],
    peace: ["मेरा मन हमेशा चिंताओं से भरा रहता है", "मेरे पास जो है उसमें संतोष कैसे पाऊं?"],
    decisions: ["मैं दोराहे पर हूं और कौन सा रास्ता चुनूं नहीं जानता", "मेरा असली उद्देश्य क्या है कैसे जानूं?"],
  },
  ta: {
    work: ["நான் வேலையில் சோர்வாக இருக்கிறேன்", "என் வாழ்க்கையில் நோக்கம் தேவை"],
    relationships: ["என்னை காயப்படுத்தியவரை மன்னிக்க சிரமப்படுகிறேன்", "கடினமான உறவுகளில் அமைதி எப்படி?"],
    peace: ["என் மனம் எப்போதும் கவலைகளால் நிறைந்திருக்கிறது", "என்னிடம் உள்ளதில் திருப்தி எப்படி?"],
    decisions: ["நான் ஒரு முக்கிய தீர்மானத்தில் இருக்கிறேன்", "என் உண்மையான நோக்கம் என்ன?"],
  },
  te: {
    work: ["నేను పనిలో అలసిపోయాను", "నా కెరీర్‌లో ఉద్దేశ్యం కావాలి"],
    relationships: ["నన్ను బాధపెట్టిన వారిని క్షమించడంలో కష్టం", "కష్టమైన సంబంధాలలో శాంతి ఎలా?"],
    peace: ["నా మనసు ఆందోళనలతో నిండి ఉంటుంది", "సంతృప్తి ఎలా పొందాలి?"],
    decisions: ["నేను ఒక ముఖ్యమైన నిర్ణయంలో ఉన్నాను", "నా నిజమైన ఉద్దేశ్యం ఏమిటి?"],
  },
  bn: {
    work: ["আমি কাজে ক্লান্ত", "আমার কর্মজীবনে উদ্দেশ্য চাই"],
    relationships: ["ক্ষমা করতে কষ্ট হচ্ছে", "কঠিন সম্পর্কে শান্তি কীভাবে?"],
    peace: ["আমার মন দুশ্চিন্তায় ভরা", "সন্তুষ্টি কীভাবে পাব?"],
    decisions: ["আমি একটি গুরুত্বপূর্ণ সিদ্ধান্তে আছি", "আমার প্রকৃত উদ্দেশ্য কী?"],
  },
};

const categories = [
  {
    key: 'work',
    icon: Briefcase,
    labels: { en: 'Work & Career', hi: 'काम और करियर', ta: 'வேலை', te: 'పని', bn: 'কাজ' },
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-400/40',
  },
  {
    key: 'relationships',
    icon: Heart,
    labels: { en: 'Relationships', hi: 'रिश्ते', ta: 'உறவுகள்', te: 'సంబంధాలు', bn: 'সম্পর্ক' },
    iconBg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
    hoverBorder: 'hover:border-pink-400/40',
  },
  {
    key: 'peace',
    icon: Brain,
    labels: { en: 'Inner Peace', hi: 'आंतरिक शांति', ta: 'உள் அமைதி', te: 'అంతర్గత శాంతి', bn: 'অন্তর শান্তি' },
    iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    hoverBorder: 'hover:border-teal-400/40',
  },
  {
    key: 'decisions',
    icon: Compass,
    labels: { en: 'Life Decisions', hi: 'जीवन के निर्णय', ta: 'வாழ்க்கை தீர்மானங்கள்', te: 'జీవిత నిర్ణయాలు', bn: 'জীবন সিদ্ধান্ত' },
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-400/40',
  },
];

const headings: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'What weighs on your heart?', subtitle: 'Krishna is here to listen, guide, and walk with you.' },
  hi: { title: 'आपके मन में क्या है?', subtitle: 'कृष्ण आपकी बात सुनने और मार्गदर्शन करने के लिए यहाँ हैं।' },
  ta: { title: 'உங்கள் மனதில் என்ன?', subtitle: 'கிருஷ்ணா உங்களுக்கு வழிகாட்ட இருக்கிறார்.' },
  te: { title: 'మీ మనసులో ఏముంది?', subtitle: 'కృష్ణుడు మీకు మార్గదర్శకత్వం చేయడానికి ఉన్నాడు.' },
  bn: { title: 'আপনার মনে কী আছে?', subtitle: 'কৃষ্ণ আপনার কথা শুনতে এখানে আছেন।' },
};

const dailyVerses = [
  { text: "You have the right to perform your duty, but not to the fruits of your actions.", ref: "2.47" },
  { text: "The soul is neither born, nor does it ever die.", ref: "2.20" },
  { text: "A person can rise through the efforts of their own mind.", ref: "6.5" },
];

export function MultiLanguageStarters({ onSelect, selectedLanguage }: MultiLanguageStartersProps) {
  const [showAll, setShowAll] = useState(false);
  
  const lang = selectedLanguage === 'auto' ? 'en' : selectedLanguage;
  const langPrompts = prompts[lang] || prompts.en;
  const langHeadings = headings[lang] || headings.en;
  const dailyVerse = dailyVerses[new Date().getDay() % dailyVerses.length];
  const mobileCategories = showAll ? categories : categories.slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-5 py-4 md:py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight animate-fade-in">
          {langHeadings.title}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
          {langHeadings.subtitle}
        </p>
        {selectedLanguage !== 'en' && selectedLanguage !== 'auto' && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs animate-fade-in" style={{ animationDelay: '150ms' }}>
            <Globe className="h-3 w-3" />
            <span>{INDIAN_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}</span>
          </div>
        )}
      </div>

      {/* Daily verse — compact */}
      <div className="relative overflow-hidden rounded-xl bg-primary/[0.05] border border-primary/10 px-4 py-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="absolute top-1 right-2 text-4xl text-primary/[0.06] font-serif select-none">ॐ</div>
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/85 italic leading-snug truncate">"{dailyVerse.text}"</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Gita {dailyVerse.ref}</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-1 animate-fade-in" style={{ animationDelay: '250ms' }}>
          Choose a topic or type below
        </p>
        
        {/* Desktop: 2x2 */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-2.5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.key} category={cat} lang={lang} langPrompts={langPrompts} catIndex={i} onSelect={onSelect} />
          ))}
        </div>

        {/* Mobile */}
        <div className="sm:hidden space-y-2">
          {mobileCategories.map((cat, i) => (
            <CategoryCard key={cat.key} category={cat} lang={lang} langPrompts={langPrompts} catIndex={i} onSelect={onSelect} compact />
          ))}
          {!showAll && (
            <button onClick={() => setShowAll(true)} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-primary font-medium rounded-xl border border-primary/15 bg-primary/5 hover:bg-primary/10 transition-colors">
              More topics <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          {showAll && categories.slice(2).map((cat, i) => (
            <CategoryCard key={cat.key} category={cat} lang={lang} langPrompts={langPrompts} catIndex={i + 2} onSelect={onSelect} compact />
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
          <Stars className="h-3 w-3 text-primary" />
          <p className="text-[10px] text-muted-foreground/60">Be specific for personalized guidance</p>
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
    <div className="animate-fade-in" style={{ animationDelay: `${280 + catIndex * 60}ms` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", category.iconBg)}>
          <category.icon className="h-3 w-3" />
        </div>
        <span className="font-semibold text-xs text-foreground">
          {category.labels[lang as keyof typeof category.labels] || category.labels.en}
        </span>
      </div>
      <div className="space-y-1">
        {(langPrompts[category.key as keyof typeof langPrompts] || []).slice(0, compact ? 1 : 2).map((prompt, pi) => (
          <button
            key={pi}
            onClick={() => onSelect(prompt)}
            className={cn(
              "group w-full text-left px-3 py-2.5 rounded-xl border border-border/50 bg-card/80",
              "text-xs transition-all duration-200 min-h-[40px]",
              "hover:bg-muted/50 hover:shadow-sm hover:-translate-y-0.5",
              category.hoverBorder
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">{prompt}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
