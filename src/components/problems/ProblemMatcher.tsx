import { useState } from 'react';
import { ChevronLeft, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Problem } from '@/types';

interface ProblemMatcherProps {
  problems: Problem[];
  onMatchFound: (problemSlug: string) => void;
}

const questions = [
  {
    id: 'feeling',
    question: "What's the primary feeling you're experiencing?",
    emoji: '🧘',
    options: [
      { label: 'Worried about the future', maps: ['anxiety', 'fear'], emoji: '😟' },
      { label: 'Confused about what to do', maps: ['confusion', 'decision-making'], emoji: '🤷' },
      { label: 'Frustrated or angry', maps: ['anger'], emoji: '😤' },
      { label: 'Doubting myself', maps: ['self-doubt'], emoji: '😔' },
    ],
  },
  {
    id: 'context',
    question: "Where is this affecting you most?",
    emoji: '🎯',
    options: [
      { label: 'Work or career', maps: ['leadership', 'decision-making'], emoji: '💼' },
      { label: 'Relationships', maps: ['relationships', 'anger'], emoji: '💞' },
      { label: 'Personal growth', maps: ['self-doubt', 'confusion'], emoji: '🌱' },
      { label: 'Life decisions', maps: ['fear', 'anxiety'], emoji: '🔮' },
    ],
  },
  {
    id: 'duration',
    question: "How long have you been dealing with this?",
    emoji: '⏳',
    options: [
      { label: 'Just happened recently', maps: ['confusion', 'anger'], emoji: '⚡' },
      { label: 'A few weeks', maps: ['anxiety', 'decision-making'], emoji: '📅' },
      { label: 'Months or longer', maps: ['self-doubt', 'fear'], emoji: '🕐' },
      { label: 'It comes and goes', maps: ['relationships', 'leadership'], emoji: '🔄' },
    ],
  },
];

export function ProblemMatcher({ problems, onMatchFound }: ProblemMatcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (maps: string[]) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: maps };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const scores: Record<string, number> = {};
      Object.values(newAnswers).flat().forEach((slug) => {
        scores[slug] = (scores[slug] || 0) + 1;
      });
      
      const bestMatch = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      
      if (bestMatch) {
        onMatchFound(bestMatch);
      }
      
      setTimeout(() => {
        setIsOpen(false);
        setCurrentQuestion(0);
        setAnswers({});
      }, 500);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 bg-card cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6 md:p-8 text-center">
          <div className="text-4xl mb-4">🧭</div>
          <h3 className="text-lg font-bold mb-2">Not sure where to start?</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Answer 3 quick questions to find the most relevant wisdom.
          </p>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-md">
            Find My Problem
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-xl shadow-primary/10 h-full flex flex-col">
      {/* Gradient Top */}
      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Problem Matcher
          </span>
          <Button variant="ghost" size="icon" onClick={reset} className="h-8 w-8 hover:bg-primary/10">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Progress */}
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-amber-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {currentQuestion + 1} of {questions.length}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <span className="text-xl">{question.emoji}</span>
              {question.question}
            </h3>
            <div className="grid gap-2">
              {question.options.map((option, index) => (
                <button
                  key={option.label}
                  onClick={() => handleAnswer(option.maps)}
                  className="w-full text-left p-3 rounded-xl border border-border/60 transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center gap-3"
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {currentQuestion > 0 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mt-4 self-start hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
