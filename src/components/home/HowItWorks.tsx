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
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform ancient wisdom into practical guidance in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5">
                  <div className="h-full bg-gradient-to-r from-primary/50 to-primary/10" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
                </div>
              )}
              
              {/* Card */}
              <div className="relative rounded-2xl border border-border/50 bg-card p-8 text-center group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-9 w-9" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
