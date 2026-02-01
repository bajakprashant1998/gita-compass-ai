import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border border-current rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border border-current rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-current rounded-full" />
          </div>
          
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-8">
              <MessageCircle className="h-8 w-8" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
              Talk to Your Personal Gita Coach
            </h2>
            
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Have a conversation with an AI guide trained on the wisdom of the Bhagavad Gita. 
              Get personalized guidance for your unique situation.
            </p>
            
            <Link to="/chat">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 text-lg px-8"
              >
                Start Conversation
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
