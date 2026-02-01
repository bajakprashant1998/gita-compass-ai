import { Search, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Describe Your Situation',
    description: 'Share what\'s troubling you in your own words—career stress, relationship issues, or life decisions.',
    color: 'from-primary to-amber-500',
  },
  {
    icon: BookOpen,
    title: 'Get Matched Wisdom',
    description: 'Our AI connects your challenge to relevant verses from the Bhagavad Gita with practical interpretations.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Lightbulb,
    title: 'Apply to Your Life',
    description: 'Receive actionable guidance you can use today, with modern stories that make ancient wisdom relatable.',
    color: 'from-orange-500 to-red-500',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4 animate-fade-in">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in animation-delay-100">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-200">
            Transform ancient wisdom into practical guidance in three simple steps
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-32 left-[20%] right-[20%] h-1">
            <div className="h-full bg-gradient-to-r from-primary via-amber-500 to-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div 
                key={step.title} 
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card */}
                <div className="relative rounded-2xl border-2 border-border/50 bg-card p-8 text-center group hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  {/* Step number badge */}
                  <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} text-white text-lg font-bold flex items-center justify-center shadow-lg`}>
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-9 w-9" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
