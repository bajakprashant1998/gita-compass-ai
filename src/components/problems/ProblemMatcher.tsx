import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent 
          className="p-6 text-center"
          onClick={() => setIsOpen(true)}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-semibold mb-2">Not sure where to start?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Answer 3 quick questions to find the most relevant wisdom for your situation.
          </p>
          <Button>
            Find My Problem
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">Personal Problem Matcher</CardTitle>
          <Button variant="ghost" size="icon" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-medium mb-4">{question.question}</h3>
        <div className="grid gap-2">
          {question.options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleAnswer(option.maps)}
              className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
        {currentQuestion > 0 && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
