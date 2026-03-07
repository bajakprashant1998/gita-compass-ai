import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Users, Brain, GitCompareArrows, Code2 } from 'lucide-react';

const links = [
  { href: '/bhagavad-gita-for-students', label: 'Bhagavad Gita for Students', icon: Users, description: 'Academic stress, exam anxiety & career guidance' },
  { href: '/bhagavad-gita-on-anxiety', label: 'Gita on Anxiety', icon: Brain, description: 'Ancient techniques to overcome modern anxiety' },
  { href: '/krishna-quotes-on-love', label: 'Krishna Quotes on Love', icon: Heart, description: 'Divine teachings on love, relationships & devotion' },
  { href: '/compare', label: 'Compare Verses', icon: GitCompareArrows, description: 'Side-by-side verse comparison tool' },
  { href: '/bhagavad-gita-on-fear', label: 'Gita on Fear', icon: BookOpen, description: 'Conquer fear with timeless Gita wisdom' },
  { href: '/embed/verse', label: 'Embed Widget', icon: Code2, description: 'Add daily verse widget to your website' },
];

export function SEOInternalLinks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Explore More
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Discover <span className="text-gradient">Gita Wisdom</span> for Every Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated collections of verses and guidance for specific life situations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                <link.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
