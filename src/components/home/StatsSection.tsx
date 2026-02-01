import { useQuery } from '@tanstack/react-query';
import { getStats } from '@/lib/api';
import { BookOpen, FileText, Users, Sparkles } from 'lucide-react';

export function StatsSection() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  const statItems = [
    { 
      label: 'Chapters', 
      value: stats?.chapters || 18, 
      icon: BookOpen,
      description: 'of timeless wisdom'
    },
    { 
      label: 'Verses', 
      value: stats?.shloks || 700, 
      icon: FileText,
      description: 'for every situation'
    },
    { 
      label: 'Life Problems', 
      value: stats?.problems || 8, 
      icon: Sparkles,
      description: 'addressed by Gita'
    },
    { 
      label: 'Seekers Helped', 
      value: '10K+', 
      icon: Users,
      description: 'and counting'
    },
  ];

  return (
    <section className="py-16 border-y border-border/50 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
