import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your admin email and we'll send you a password reset link
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-700">Reset link sent!</p>
              <p className="text-xs text-green-600 mt-1">
                Check your inbox for <strong>{email}</strong>. The link will expire in 1 hour.
              </p>
            </div>
          </div>
        ) : (
          <>
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
                    disabled={isLoading} autoComplete="email" autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>) : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}

        <div className="pt-2 text-center">
          <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
