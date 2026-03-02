import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import {
  Download,
  Smartphone,
  Chrome,
  MoreVertical,
  Plus,
  Share,
  CheckCircle2,
  Zap,
  Wifi,
  Bell,
} from 'lucide-react';

const benefits = [
  { icon: Zap, title: 'Instant Access', desc: 'Launch from your home screen like a native app' },
  { icon: Wifi, title: 'Works Offline', desc: 'Read cached verses even without internet' },
  { icon: Bell, title: 'Full Screen', desc: 'No browser bars — immersive experience' },
];

export default function InstallPage() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [skipped, setSkipped] = useState(false);
  const navigate = useNavigate();

  // If user skipped or app is installed, store flag and redirect
  if (skipped || isInstalled) {
    if (skipped) sessionStorage.setItem('install-skipped', '1');
    if (!isInstalled && skipped) {
      // Allow browsing for this session
    }
  }

  return (
    <Layout>
      <SEOHead
        title="Install App | Bhagavad Gita Gyan"
        description="Install Bhagavad Gita Gyan on your phone for a native app experience with offline access."
      />

      <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2">
            <Download className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Install the App</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Add Bhagavad Gita Gyan to your home screen for a fast, native-like experience.
          </p>

          {isInstalled ? (
            <div className="inline-flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-full">
              <CheckCircle2 className="h-5 w-5" />
              App is already installed!
            </div>
          ) : isInstallable ? (
            <Button
              size="lg"
              onClick={promptInstall}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/20"
            >
              <Download className="h-5 w-5" />
              Install Now
            </Button>
          ) : null}
        </div>

        {/* Benefits */}
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border/50 bg-card/50">
              <CardContent className="p-5 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Android Instructions */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Chrome className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Android (Chrome)</h2>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                <span>Open this website in <strong>Chrome</strong> browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                <span className="flex items-center gap-1.5">Tap the <MoreVertical className="h-4 w-4 inline" /> menu (three dots) at the top right</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">4</span>
                <span>Tap <strong>Install</strong> — done! Find it on your home screen</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* iOS Instructions */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">iPhone / iPad (Safari)</h2>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
                <span>Open this website in <strong>Safari</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
                <span className="flex items-center gap-1.5">Tap the <Share className="h-4 w-4 inline" /> Share button at the bottom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">3</span>
                <span className="flex items-center gap-1.5">Scroll down and tap <Plus className="h-4 w-4 inline" /> <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">4</span>
                <span>Tap <strong>Add</strong> — the app icon appears on your home screen</span>
              </li>
            </ol>
          </CardContent>
        </Card>
        {/* Skip / Continue without installing */}
        {!isInstalled && (
          <div className="text-center pt-2 pb-4">
            <button
              onClick={() => {
                sessionStorage.setItem('install-skipped', '1');
                navigate('/');
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Continue without installing →
            </button>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Some features may be limited in the browser
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
