import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, BookOpen, Heart, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email, password, displayName);
      toast.success('Account created! Please check your email to confirm.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: BookOpen, text: 'Save your reading progress' },
    { icon: Heart, text: 'Bookmark favorite verses' },
    { icon: Users, text: 'Personalized recommendations' },
  ];

  return (
    <Layout>
      {/* Hero Section with WebFX styling */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <RadialGlow position="top-right" color="primary" className="opacity-40" />
          <RadialGlow position="bottom-left" color="amber" className="opacity-30" />
          <FloatingOm className="top-20 left-10 hidden lg:block" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_40%)]" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left side - Benefits */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                Join Our Community
              </div>
              
              <h1 className="headline-bold text-4xl md:text-5xl lg:text-6xl mb-6">
                Your Spiritual <span className="text-gradient">Journey</span> Awaits
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Create an account to save your progress, bookmark verses, and receive personalized guidance from the Bhagavad Gita.
              </p>

              {/* Benefits list */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Auth Card */}
            <div className="animate-fade-in">
              <Card className="border-2 border-border/50 shadow-2xl shadow-primary/10 hover:border-primary/30 transition-all duration-300">
                <Tabs defaultValue="signin">
                  <CardHeader className="pb-2">
                    {/* Logo */}
                    <div className="text-center mb-4">
                      <Link to="/" className="inline-flex items-center gap-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-500 shadow-lg shadow-primary/30">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                      </Link>
                      <h2 className="text-xl font-bold mt-4">Welcome to Bhagavad Gita Gyan</h2>
                      <p className="text-sm text-muted-foreground">
                        Sign in or create an account to continue
                      </p>
                    </div>
                    
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Sign Up
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <TabsContent value="signin" className="mt-0">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-background border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-0">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Display Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="bg-background border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-background border-border/50 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-background border-border/50 focus:border-primary/50"
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum 6 characters
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Create Account
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
