import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Eye, EyeOff, CheckCircle, XCircle, Volume2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getAdminSettings,
  updateSettings,
  testGeminiConnection,
  testElevenLabsConnection,
  generateTTS,
  playBase64Audio,
  type AdminSetting,
} from '@/lib/adminSettings';

const AI_MODELS = [
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast)' },
  { value: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro (Quality)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

const ELEVENLABS_VOICES = [
  { value: 'JBFqnCBsd6RMkjVDRZzb', label: 'George (Deep, Clear)' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel (Clear Articulation)' },
  { value: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah (Warm)' },
  { value: 'N2lVS1w4EtoT3dr4eOWO', label: 'Callum (Calm)' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily (Gentle)' },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingElevenLabs, setTestingElevenLabs] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [elevenLabsStatus, setElevenLabsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAdminSettings();
      const settingsMap = data.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, string>);
      setSettings(settingsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestGemini = async () => {
    const apiKey = settings['gemini_api_key'];
    if (!apiKey) {
      toast({ title: 'No API Key', description: 'Please enter a Gemini API key first', variant: 'destructive' });
      return;
    }

    setTestingGemini(true);
    setGeminiStatus('idle');

    const result = await testGeminiConnection(apiKey);

    if (result.success) {
      setGeminiStatus('success');
      toast({ title: 'Connection Successful', description: 'Gemini API key is valid!' });
    } else {
      setGeminiStatus('error');
      toast({ title: 'Connection Failed', description: result.error, variant: 'destructive' });
    }

    setTestingGemini(false);
  };

  const handleTestElevenLabs = async () => {
    const apiKey = settings['elevenlabs_api_key'];
    if (!apiKey) {
      toast({ title: 'No API Key', description: 'Please enter an ElevenLabs API key first', variant: 'destructive' });
      return;
    }

    setTestingElevenLabs(true);
    setElevenLabsStatus('idle');

    const result = await testElevenLabsConnection(apiKey);

    if (result.success) {
      setElevenLabsStatus('success');
      toast({ title: 'Connection Successful', description: 'ElevenLabs API key is valid!' });
    } else {
      setElevenLabsStatus('error');
      toast({ title: 'Connection Failed', description: result.error, variant: 'destructive' });
    }

    setTestingElevenLabs(false);
  };

  const handleTestVoice = async () => {
    setPlayingAudio(true);
    try {
      const result = await generateTTS(
        'Om. The Bhagavad Gita speaks eternal wisdom.',
        'english',
        settings['elevenlabs_voice_id']
      );
      playBase64Audio(result.audioContent);
      toast({ title: 'Playing Audio', description: 'Voice sample is playing...' });
    } catch (error) {
      toast({
        title: 'Audio Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setPlayingAudio(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Settings" />
        <div className="container flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Settings" subtitle="Configure AI content generation and voice settings" />
      <div className="container">
        <div className="max-w-4xl">
          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai">AI Content</TabsTrigger>
              <TabsTrigger value="voice">Voice (TTS)</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            {/* AI Content Settings */}
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generation</CardTitle>
                  <CardDescription>
                    Configure Gemini AI for generating shlok content. Leave API key empty to use Lovable's built-in AI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gemini_api_key">Gemini API Key (Optional)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="gemini_api_key"
                          type={showGeminiKey ? 'text' : 'password'}
                          placeholder="Enter your Google Gemini API key..."
                          value={settings['gemini_api_key'] || ''}
                          onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowGeminiKey(!showGeminiKey)}
                        >
                          {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleTestGemini}
                        disabled={testingGemini}
                      >
                        {testingGemini ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : geminiStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : geminiStatus === 'error' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get your API key from{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai_model">AI Model</Label>
                    <Select
                      value={settings['ai_model'] || 'google/gemini-3-flash-preview'}
                      onValueChange={(value) => handleChange('ai_model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map(model => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <span className="text-sm font-medium">{settings['ai_temperature'] || '0.7'}</span>
                    </div>
                    <Slider
                      value={[parseFloat(settings['ai_temperature'] || '0.7')]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={([value]) => handleChange('ai_temperature', value.toString())}
                    />
                    <p className="text-sm text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai_max_tokens">Max Tokens</Label>
                    <Input
                      id="ai_max_tokens"
                      type="number"
                      min={100}
                      max={4000}
                      value={settings['ai_max_tokens'] || '1000'}
                      onChange={(e) => handleChange('ai_max_tokens', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice (TTS) Settings */}
            <TabsContent value="voice">
              <Card>
                <CardHeader>
                  <CardTitle>ElevenLabs Text-to-Speech</CardTitle>
                  <CardDescription>
                    Configure voice generation for Sanskrit verses and meanings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs_api_key">ElevenLabs API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="elevenlabs_api_key"
                          type={showElevenLabsKey ? 'text' : 'password'}
                          placeholder="Enter your ElevenLabs API key..."
                          value={settings['elevenlabs_api_key'] || ''}
                          onChange={(e) => handleChange('elevenlabs_api_key', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                        >
                          {showElevenLabsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleTestElevenLabs}
                        disabled={testingElevenLabs}
                      >
                        {testingElevenLabs ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : elevenLabsStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : elevenLabsStatus === 'error' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get your API key from{' '}
                      <a
                        href="https://elevenlabs.io/app/settings/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        ElevenLabs Dashboard
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="elevenlabs_voice_id">Default Voice</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings['elevenlabs_voice_id'] || 'JBFqnCBsd6RMkjVDRZzb'}
                        onValueChange={(value) => handleChange('elevenlabs_voice_id', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ELEVENLABS_VOICES.map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={handleTestVoice}
                        disabled={playingAudio || !settings['elevenlabs_api_key']}
                      >
                        {playingAudio ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select a voice optimized for spiritual content
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure default behavior for the admin panel and site.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Donate Button Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Donate Button</Label>
                        <p className="text-sm text-muted-foreground">
                          Display the donate button in the header navigation
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings['show_donate_button'] !== 'false'}
                      onCheckedChange={(checked) =>
                        handleChange('show_donate_button', checked ? 'true' : 'false')
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_language">Default Language</Label>
                    <Select
                      value={settings['default_language'] || 'en'}
                      onValueChange={(value) => handleChange('default_language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="sa">Sanskrit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
