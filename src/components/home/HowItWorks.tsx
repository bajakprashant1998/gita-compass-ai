import { Search, BookOpen, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Describe Your Situation',
    description: 'Share what\'s troubling you in your own words—career stress, relationship issues, or life decisions.',
  },
  {
    icon: BookOpen,
    title: 'Get Matched Wisdom',
    description: 'Our AI connects your challenge to relevant verses from the Bhagavad Gita with practical interpretations.',
  },
  {
    icon: Lightbulb,
    title: 'Apply to Your Life',
    description: 'Receive actionable guidance you can use today, with modern stories that make ancient wisdom relatable.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform ancient wisdom into practical guidance in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="relative text-center group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="h-10 w-10" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
