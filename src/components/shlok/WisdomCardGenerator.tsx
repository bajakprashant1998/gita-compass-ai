import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Copy, Share2, Check, Sparkles, MessageCircle, Wand2, Loader2, Type, Palette, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Shlok } from '@/types';
import { cn } from '@/lib/utils';

interface WisdomCardGeneratorProps {
  shlok: Shlok;
}

type Theme = 'earth' | 'ocean' | 'forest' | 'sunset' | 'lotus' | 'night' | 'royal' | 'saffron';
type AspectRatio = '1:1' | '4:5' | '16:9';

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

const themes: Record<Theme, { bg: string; accent: string; text: string; name: string; decorative: string; emoji: string }> = {
  earth: { bg: '#F5F0E8', accent: '#8B4513', text: '#2D1810', name: 'Earth', decorative: 'rgba(139, 69, 19, 0.1)', emoji: '🌿' },
  ocean: { bg: '#1a365d', accent: '#63b3ed', text: '#ffffff', name: 'Ocean', decorative: 'rgba(99, 179, 237, 0.15)', emoji: '🌊' },
  forest: { bg: '#1a4731', accent: '#68d391', text: '#ffffff', name: 'Forest', decorative: 'rgba(104, 211, 145, 0.15)', emoji: '🌲' },
  sunset: { bg: '#744210', accent: '#f6ad55', text: '#ffffff', name: 'Sunset', decorative: 'rgba(246, 173, 85, 0.15)', emoji: '🌅' },
  lotus: { bg: '#fdf2f8', accent: '#ec4899', text: '#831843', name: 'Lotus', decorative: 'rgba(236, 72, 153, 0.1)', emoji: '🪷' },
  night: { bg: '#0f172a', accent: '#a78bfa', text: '#e2e8f0', name: 'Night', decorative: 'rgba(167, 139, 250, 0.15)', emoji: '🌙' },
  royal: { bg: '#1e1b4b', accent: '#fbbf24', text: '#fef3c7', name: 'Royal', decorative: 'rgba(251, 191, 36, 0.12)', emoji: '👑' },
  saffron: { bg: '#fff7ed', accent: '#ea580c', text: '#431407', name: 'Saffron', decorative: 'rgba(234, 88, 12, 0.1)', emoji: '🔥' },
};

const aspectRatios: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '1:1': { width: 1080, height: 1080, label: 'Square' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait' },
  '16:9': { width: 1920, height: 1080, label: 'Wide' },
};

export function WisdomCardGenerator({ shlok }: WisdomCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('earth');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = themes[selectedTheme];
  const ratio = aspectRatios[selectedRatio];
  const chapterNumber = shlok.chapter?.chapter_number || 1;
  const displayText = customText || truncateToWords(shlok.life_application || shlok.english_meaning, 40);

  const generateAIBackground = async () => {
    setIsGeneratingBg(true);
    try {
      const themePrompts: Record<Theme, string> = {
        earth: 'serene mountain landscape at golden hour with warm earth tones',
        ocean: 'calm deep blue ocean with gentle waves at twilight',
        forest: 'mystical forest with rays of light filtering through dense canopy',
        sunset: 'dramatic sunset with orange and gold clouds over horizon',
        lotus: 'beautiful pink lotus flowers floating on still water',
        night: 'starry night sky with purple nebula and constellations',
        royal: 'ornate golden temple architecture with deep indigo sky',
        saffron: 'sacred saffron colored temple with morning light rays',
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-wisdom-bg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: themePrompts[selectedTheme],
          width: ratio.width,
          height: ratio.height,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      if (data.imageUrl) {
        setBgImageUrl(data.imageUrl);
        toast.success('Background generated!');
      }
    } catch {
      toast.error('Failed to generate background. Using solid color.');
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: ratio.width,
        height: ratio.height,
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) { toast.error('Failed to generate image'); return; }
      const link = document.createElement('a');
      link.download = `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Wisdom card downloaded!');
    } catch { toast.error('Failed to download image'); }
    finally { setIsGenerating(false); }
  };

  const handleCopyToClipboard = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) { toast.error('Failed to generate image'); return; }
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Failed to copy to clipboard'); }
    finally { setIsGenerating(false); }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) { toast.error('Failed to generate image'); return; }
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `Bhagavad Gita Chapter ${chapterNumber}, Verse ${shlok.verse_number}`, text: displayText, files: [file] });
      } else { handleDownload(); }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') toast.error('Failed to share');
    } finally { setIsGenerating(false); }
  };

  const handleWhatsAppShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) { toast.error('Failed to generate image'); return; }
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: `Bhagavad Gita Chapter ${chapterNumber}, Verse ${shlok.verse_number}`, text: displayText, files: [file] });
        toast.success('Shared successfully!');
      } else {
        const text = encodeURIComponent(`${displayText}\n\n— Bhagavad Gita, Chapter ${chapterNumber}, Verse ${shlok.verse_number}\n\nwww.bhagavadgitagyan.com`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        await handleDownload();
        toast.info('Image downloaded! Attach it in WhatsApp');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') toast.error('Failed to share to WhatsApp');
    } finally { setIsGenerating(false); }
  };

  const previewScale = selectedRatio === '16:9' ? 0.22 : 0.3;
  const previewHeight = ratio.height * previewScale;

  return (
    <Card className="mt-8 overflow-hidden border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Wisdom Card
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Design a shareable card with this verse's wisdom</p>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Controls Row - Theme & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Selection */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-primary" />
              Theme
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(themes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedTheme(key as Theme); setBgImageUrl(null); }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs",
                    selectedTheme === key
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/50"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center text-sm"
                    style={{ backgroundColor: value.bg, color: value.text }}
                  >
                    {value.emoji}
                  </div>
                  <span className="text-[10px] font-medium">{value.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size + Custom Text */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                Size
              </p>
              <Tabs value={selectedRatio} onValueChange={(v) => { setSelectedRatio(v as AspectRatio); setBgImageUrl(null); }}>
                <TabsList className="grid grid-cols-3 h-9">
                  {Object.entries(aspectRatios).map(([key, value]) => (
                    <TabsTrigger key={key} value={key} className="text-xs py-1">
                      {value.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Custom Text Toggle */}
            <div>
              <button
                onClick={() => setIsEditingText(!isEditingText)}
                className="text-sm font-medium flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
              >
                <Type className="h-3.5 w-3.5" />
                {isEditingText ? 'Use default text' : 'Customize text'}
              </button>
              {isEditingText && (
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom wisdom text..."
                  className="mt-2 text-sm min-h-[60px] resize-none"
                  maxLength={200}
                />
              )}
            </div>
          </div>
        </div>

        {/* AI Background Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIBackground}
            disabled={isGeneratingBg}
            className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
          >
            {isGeneratingBg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-primary" />}
            {isGeneratingBg ? 'Generating...' : 'AI Background'}
          </Button>
          {bgImageUrl && (
            <Button variant="ghost" size="sm" onClick={() => setBgImageUrl(null)} className="text-xs text-muted-foreground">
              Remove background
            </Button>
          )}
        </div>

        {/* Card Preview */}
        <div className="flex justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-3">
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              width: ratio.width,
              height: ratio.height,
              marginBottom: -(ratio.height - previewHeight),
            }}
          >
            <div
              ref={cardRef}
              style={{
                width: ratio.width,
                height: ratio.height,
                backgroundColor: theme.bg,
                backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: theme.text,
                fontFamily: 'Georgia, "Times New Roman", serif',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: selectedRatio === '16:9' ? '60px 120px' : '80px 60px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Overlay for readability when using background image */}
              {bgImageUrl && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(135deg, ${theme.bg}dd, ${theme.bg}bb)`,
                }} />
              )}

              {/* Decorative Background Elements */}
              <div style={{
                position: 'absolute', top: -100, right: -100,
                width: 400, height: 400, borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.decorative} 0%, transparent 70%)`,
              }} />
              <div style={{
                position: 'absolute', bottom: -80, left: -80,
                width: 300, height: 300, borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.decorative} 0%, transparent 70%)`,
              }} />

              {/* Top Border */}
              <div style={{
                position: 'absolute', top: 20, left: 20, right: 20, height: 3,
                background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                opacity: 0.5,
              }} />

              {/* Logo */}
              <div style={{
                position: 'absolute',
                top: selectedRatio === '16:9' ? 50 : 60,
                left: 0, right: 0, textAlign: 'center',
                fontSize: 20, fontWeight: 700, color: theme.accent,
                letterSpacing: '4px', textTransform: 'uppercase',
                zIndex: 1,
              }}>
                ॐ Bhagavad Gita Gyan
              </div>

              {/* Main Quote */}
              <div style={{
                textAlign: 'center',
                maxWidth: selectedRatio === '16:9' ? '75%' : '85%',
                position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  fontSize: 80, color: theme.accent, opacity: 0.3,
                  lineHeight: 0.5, marginBottom: 20,
                }}>"</div>
                <div style={{
                  fontSize: selectedRatio === '1:1' ? 38 : selectedRatio === '4:5' ? 34 : 44,
                  fontWeight: 700, fontStyle: 'normal',
                  lineHeight: 1.5, letterSpacing: '0.5px',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.15)',
                  marginBottom: 30,
                }}>
                  {displayText}
                </div>

                <div style={{
                  width: 60, height: 3, background: theme.accent,
                  margin: '0 auto 20px', borderRadius: 2,
                }} />

                <div style={{
                  fontSize: 18, color: theme.accent,
                  fontWeight: 600, letterSpacing: '1px',
                }}>
                  Chapter {chapterNumber}, Verse {shlok.verse_number}
                </div>
              </div>

              {/* Bottom Border */}
              <div style={{
                position: 'absolute', bottom: 20, left: 20, right: 20, height: 3,
                background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                opacity: 0.5,
              }} />

              {/* Footer */}
              <div style={{
                position: 'absolute',
                bottom: selectedRatio === '16:9' ? 50 : 55,
                left: 0, right: 0, textAlign: 'center',
                fontSize: 14, opacity: 0.6, letterSpacing: '1px',
                zIndex: 1,
              }}>
                bhagavadgitagyan.com
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleWhatsAppShare} disabled={isGenerating} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGenerating} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard} disabled={isGenerating} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} disabled={isGenerating} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
