import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Problem } from '@/types';

interface ProblemMatcherProps {
  problems: Problem[];
  onMatchFound: (problemSlug: string) => void;
}

const questions = [
  {
    id: 'feeling',
    question: "What's the primary feeling you're experiencing?",
    options: [
      { label: 'Worried about the future', maps: ['anxiety', 'fear'] },
      { label: 'Confused about what to do', maps: ['confusion', 'decision-making'] },
      { label: 'Frustrated or angry', maps: ['anger'] },
      { label: 'Doubting myself', maps: ['self-doubt'] },
    ],
  },
  {
    id: 'context',
    question: "Where is this affecting you most?",
    options: [
      { label: 'Work or career', maps: ['leadership', 'decision-making'] },
      { label: 'Relationships', maps: ['relationships', 'anger'] },
      { label: 'Personal growth', maps: ['self-doubt', 'confusion'] },
      { label: 'Life decisions', maps: ['fear', 'anxiety'] },
    ],
  },
  {
    id: 'duration',
    question: "How long have you been dealing with this?",
    options: [
      { label: 'Just happened recently', maps: ['confusion', 'anger'] },
      { label: 'A few weeks', maps: ['anxiety', 'decision-making'] },
      { label: 'Months or longer', maps: ['self-doubt', 'fear'] },
      { label: 'It comes and goes', maps: ['relationships', 'leadership'] },
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
      // Calculate best match
      const scores: Record<string, number> = {};
      Object.values(newAnswers).flat().forEach((slug) => {
        scores[slug] = (scores[slug] || 0) + 1;
      });
      
      const bestMatch = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      
      if (bestMatch) {
        onMatchFound(bestMatch);
      }
      
      // Reset for next use
      setTimeout(() => {
        setIsOpen(false);
        setCurrentQuestion(0);
        setAnswers({});
      }, 500);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
  };

  if (!isOpen) {
    return (
      <Card className="group relative overflow-hidden border-dashed border-2 border-primary/30 hover:border-primary/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent 
          className="relative p-8 text-center"
          onClick={() => setIsOpen(true)}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 text-primary mb-6 transition-transform group-hover:scale-110">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Not sure where to start?</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Answer 3 quick questions to find the most relevant wisdom for your situation.
          </p>
          <Button className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 group/btn">
            Find My Problem
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="relative overflow-hidden border-primary/30 shadow-xl shadow-primary/10">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold">Personal Problem Matcher</CardTitle>
          <Button variant="ghost" size="icon" onClick={reset} className="hover:bg-primary/10">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-amber-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>
      
      <CardContent className="pt-2">
        <h3 className="font-semibold text-lg mb-5">{question.question}</h3>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={option.label}
              onClick={() => handleAnswer(option.maps)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        {currentQuestion > 0 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mt-6 hover:bg-primary/10">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
