import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-amber-500 to-orange-500" />
          
          {/* Decorative pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
          </div>
          
          {/* Content */}
          <div className="relative px-8 py-16 md:px-20 md:py-24 text-center text-white">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-xl">
              <MessageCircle className="h-10 w-10" />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Guidance
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight">
              Talk to Your Personal Gita Coach
            </h2>
            
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Have a conversation with an AI guide trained on the wisdom of the Bhagavad Gita. 
              Get personalized guidance for your unique situation.
            </p>
            
            <Link to="/chat">
              <Button 
                size="lg" 
                className="gap-3 text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 font-bold shadow-xl transition-all duration-300 hover:scale-105"
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
