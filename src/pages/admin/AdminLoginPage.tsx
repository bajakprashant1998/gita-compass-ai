import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { setAdminCache, getAdminCache } from '@/lib/adminAuth';

async function verifyAdminViaRest(userId: string, accessToken: string): Promise<boolean> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const resp = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${userId}&role=eq.admin`,
    { headers: { 'apikey': apiKey, 'Authorization': `Bearer ${accessToken}` } }
  );
  const data = await resp.json();
  return Array.isArray(data) && data.length > 0;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated as admin, redirect immediately
  useEffect(() => {
    const checkExisting = async () => {
      const cache = getAdminCache();
      if (cache?.verified) {
        navigate('/admin', { replace: true });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isAdmin = await verifyAdminViaRest(session.user.id, session.access_token);
        if (isAdmin) {
          setAdminCache(session.user.id);
          navigate('/admin', { replace: true });
        }
      }
    };
    checkExisting();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const session = data.session;
      if (!session?.user) throw new Error('No session returned');

      // Verify admin role BEFORE navigating
      const isAdmin = await verifyAdminViaRest(session.user.id, session.access_token);
      if (!isAdmin) {
        setError('Access denied. You do not have admin privileges.');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Set cache so AdminAuthContext picks it up instantly
      setAdminCache(session.user.id);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AdminLoginBranding />
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="lg:hidden flex justify-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Enter your credentials to access the admin panel</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/8 border border-destructive/15 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="email" type="email" placeholder="admin@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-border/50 focus:bg-background focus:border-primary/40 transition-all"
                  disabled={isLoading} autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-muted/30 border-border/50 focus:bg-background focus:border-primary/40 transition-all"
                  disabled={isLoading} autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                  disabled={isLoading} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>) : 'Sign In'}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLoginBranding() {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-lg font-bold text-primary-foreground/90 tracking-tight">GitaAdmin</span>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/20">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Secure Admin Portal</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight text-primary-foreground">
              Sacred Content<br /><span className="text-primary">Management</span>
            </h2>
            <p className="text-primary-foreground/50 text-base max-w-sm leading-relaxed">
              Curate verses, manage wisdom content, and guide seekers on their spiritual journey.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Chapters', value: '18' }, { label: 'Verses', value: '700+' }, { label: 'Languages', value: '10+' }].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-primary-foreground/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/30">© {new Date().getFullYear()} Bhagavad Gita Gyan. All rights reserved.</p>
      </div>
    </div>
  );
}
