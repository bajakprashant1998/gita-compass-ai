import { Search, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Describe Your Struggle',
    description: 'Share what\'s troubling you—career stress, relationship issues, or life decisions.',
    accent: 'border-primary/30 hover:border-primary/60',
  },
  {
    icon: BookOpen,
    title: 'Get Matched Wisdom',
    description: 'Our AI matches your challenge to relevant verses with practical interpretations.',
    accent: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    icon: Lightbulb,
    title: 'Apply to Your Life',
    description: 'Receive actionable guidance with modern stories that make wisdom relatable.',
    accent: 'border-orange-500/30 hover:border-orange-500/60',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            How It <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform ancient wisdom into practical guidance in three simple steps
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/30 via-amber-500/30 to-orange-500/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className={`rounded-2xl border-2 ${step.accent} bg-card p-7 text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform">
                    <step.icon className="h-7 w-7" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>

                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-5">
                      <ArrowRight className="h-5 w-5 text-primary/40" />
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
