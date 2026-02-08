import { Link } from 'react-router-dom';

const moods = [
  { emoji: '😰', label: 'Anxious', slug: 'anxiety', color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/60' },
  { emoji: '😢', label: 'Sad', slug: 'self-doubt', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/60' },
  { emoji: '😠', label: 'Angry', slug: 'anger', color: 'from-red-500/20 to-red-500/5 border-red-500/30 hover:border-red-500/60' },
  { emoji: '😕', label: 'Confused', slug: 'confusion', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/60' },
  { emoji: '😨', label: 'Fearful', slug: 'fear', color: 'from-slate-500/20 to-slate-500/5 border-slate-500/30 hover:border-slate-500/60' },
  { emoji: '🤔', label: 'Undecided', slug: 'decision-making', color: 'from-teal-500/20 to-teal-500/5 border-teal-500/30 hover:border-teal-500/60' },
];

export function MoodSelector() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            How are you feeling?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Explore by <span className="text-gradient">Mood</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tap your current mood and discover verses that speak directly to you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {moods.map((mood) => (
            <Link
              key={mood.slug}
              to={`/problems/${mood.slug}`}
              className={`group flex flex-col items-center gap-2 p-5 sm:p-6 rounded-2xl border-2 bg-gradient-to-b ${mood.color} transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                {mood.emoji}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {mood.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
