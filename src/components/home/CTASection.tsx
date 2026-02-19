import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-amber-500 to-orange-500" />
          
          {/* Decorative patterns */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
          </div>

          {/* ॐ watermark */}
          <div className="absolute right-[5%] top-[10%] text-[12rem] font-bold text-white/[0.08] select-none pointer-events-none leading-none">
            ॐ
          </div>
          
          {/* Content */}
          <div className="relative px-8 py-16 md:px-20 md:py-24 text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-8 border border-white/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Guidance
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight">
              Talk to Your Personal <br className="hidden md:block" />Gita Coach
            </h2>
            
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Have a conversation with an AI guide trained on the wisdom of the Bhagavad Gita. 
              Get personalized guidance for your unique situation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 font-bold shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="h-5 w-5" />
                  Start Conversation
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/chapters">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-3 text-lg px-10 h-14 bg-transparent border-2 border-white/40 text-white hover:bg-white/10 font-bold transition-all duration-300"
                >
                  <BookOpen className="h-5 w-5" />
                  Browse Chapters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}