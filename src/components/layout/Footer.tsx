import { Link } from 'react-router-dom';
import { Sparkles, Heart, Twitter, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Gita<span className="text-primary">Wisdom</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Ancient wisdom for modern problems. A calm mentor that understands 
              modern life, powered by timeless wisdom from the Bhagavad Gita.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/chapters" className="text-foreground hover:text-primary transition-colors">
                  All Chapters
                </Link>
              </li>
              <li>
                <Link to="/problems" className="text-foreground hover:text-primary transition-colors">
                  Life Problems
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-foreground hover:text-primary transition-colors">
                  AI Gita Coach
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/auth" className="text-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/favorites" className="text-foreground hover:text-primary transition-colors">
                  Saved Wisdom
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GitaWisdom. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for seekers of wisdom
          </p>
        </div>
      </div>
    </footer>
  );
}
