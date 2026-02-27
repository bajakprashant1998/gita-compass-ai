import { Link } from 'react-router-dom';

const moods = [
  { emoji: '😰', label: 'Anxious', slug: 'anxiety', border: 'border-amber-500/20 hover:border-amber-500/50', bg: 'hover:bg-amber-500/5' },
  { emoji: '😢', label: 'Sad', slug: 'self-doubt', border: 'border-blue-500/20 hover:border-blue-500/50', bg: 'hover:bg-blue-500/5' },
  { emoji: '😠', label: 'Angry', slug: 'anger', border: 'border-red-500/20 hover:border-red-500/50', bg: 'hover:bg-red-500/5' },
  { emoji: '😕', label: 'Confused', slug: 'confusion', border: 'border-purple-500/20 hover:border-purple-500/50', bg: 'hover:bg-purple-500/5' },
  { emoji: '😨', label: 'Fearful', slug: 'fear', border: 'border-slate-500/20 hover:border-slate-500/50', bg: 'hover:bg-slate-500/5' },
  { emoji: '🤔', label: 'Undecided', slug: 'decision-making', border: 'border-teal-500/20 hover:border-teal-500/50', bg: 'hover:bg-teal-500/5' },
];

export function MoodSelector() {
  return (
    <section className="py-14 sm:py-18">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            How are you feeling?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Explore by <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">Mood</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tap your current mood and discover verses that speak directly to you.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {moods.map((mood) => (
            <Link
              key={mood.slug}
              to={`/problems/${mood.slug}`}
              className={`group flex flex-col items-center gap-2 p-5 sm:p-6 rounded-2xl border-2 ${mood.border} ${mood.bg} bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                {mood.emoji}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {mood.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
