import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Share2, Check, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Shlok } from '@/types';

interface WisdomCardGeneratorProps {
  shlok: Shlok;
}

type Theme = 'earth' | 'ocean' | 'forest' | 'sunset';
type AspectRatio = '1:1' | '4:5' | '16:9';

const themes: Record<Theme, { bg: string; accent: string; text: string; name: string }> = {
  earth: { bg: '#F5F0E8', accent: '#8B4513', text: '#2D1810', name: 'Warm Earth' },
  ocean: { bg: '#1a365d', accent: '#63b3ed', text: '#ffffff', name: 'Deep Ocean' },
  forest: { bg: '#1a4731', accent: '#68d391', text: '#ffffff', name: 'Forest Calm' },
  sunset: { bg: '#744210', accent: '#f6ad55', text: '#ffffff', name: 'Sunset Glow' },
};

const aspectRatios: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '1:1': { width: 1080, height: 1080, label: 'Square' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait' },
  '16:9': { width: 1920, height: 1080, label: 'Landscape' },
};

export function WisdomCardGenerator({ shlok }: WisdomCardGeneratorProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('earth');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = themes[selectedTheme];
  const ratio = aspectRatios[selectedRatio];
  const chapterNumber = shlok.chapter?.chapter_number || 1;

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: ratio.width,
        height: ratio.height,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
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
      if (!dataUrl) {
        toast.error('Failed to generate image');
        return;
      }

      const link = document.createElement('a');
      link.download = `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Wisdom card downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        toast.error('Failed to generate image');
        return;
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        toast.error('Failed to generate image');
        return;
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Bhagavad Gita Chapter ${chapterNumber}, Verse ${shlok.verse_number}`,
          text: shlok.life_application || shlok.english_meaning,
          files: [file],
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share');
      }
    } finally {
    setIsGenerating(false);
  }
};

  const handleWhatsAppShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        toast.error('Failed to generate image');
        return;
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `bhagavadgitagyan-${chapterNumber}-${shlok.verse_number}.png`, { type: 'image/png' });

      // Try Web Share API with file first (works on mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Bhagavad Gita Chapter ${chapterNumber}, Verse ${shlok.verse_number}`,
          text: shlok.life_application || shlok.english_meaning,
          files: [file],
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: Open WhatsApp with text and download image
        const text = encodeURIComponent(`${shlok.life_application || shlok.english_meaning}\n\n— Bhagavad Gita, Chapter ${chapterNumber}, Verse ${shlok.verse_number}\n\nwww.bhagavadgitagyan.com`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        await handleDownload();
        toast.info('Image downloaded! Attach it in WhatsApp');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share to WhatsApp');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview scale for display
  const previewScale = selectedRatio === '16:9' ? 0.25 : 0.35;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Wisdom Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div>
          <p className="text-sm font-medium mb-3">Theme</p>
          <Tabs value={selectedTheme} onValueChange={(v) => setSelectedTheme(v as Theme)}>
            <TabsList className="grid grid-cols-4">
              {Object.entries(themes).map(([key, value]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <span
                    className="w-3 h-3 rounded-full mr-1.5"
                    style={{ backgroundColor: value.accent }}
                  />
                  {value.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Aspect Ratio Selection */}
        <div>
          <p className="text-sm font-medium mb-3">Size</p>
          <Tabs value={selectedRatio} onValueChange={(v) => setSelectedRatio(v as AspectRatio)}>
            <TabsList className="grid grid-cols-3">
              {Object.entries(aspectRatios).map(([key, value]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {key} ({value.label})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center overflow-hidden rounded-lg border bg-muted/50 p-4">
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              width: ratio.width,
              height: ratio.height,
            }}
          >
            <div
              ref={cardRef}
              style={{
                width: ratio.width,
                height: ratio.height,
                backgroundColor: theme.bg,
                color: theme.text,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: selectedRatio === '16:9' ? '60px 120px' : '80px 60px',
                boxSizing: 'border-box',
              }}
            >
              {/* Logo / Brand */}
              <div
                style={{
                  position: 'absolute',
                  top: selectedRatio === '16:9' ? 40 : 50,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 600,
                  color: theme.accent,
                  letterSpacing: '2px',
                }}
              >
                ॐ BHAGAVAD GITA GYAN
              </div>

              {/* Main Quote */}
              <div
                style={{
                  textAlign: 'center',
                  maxWidth: selectedRatio === '16:9' ? '80%' : '90%',
                }}
              >
                <div
                  style={{
                    fontSize: selectedRatio === '1:1' ? 42 : selectedRatio === '4:5' ? 38 : 48,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    marginBottom: 40,
                  }}
                >
                  "{shlok.life_application || shlok.english_meaning}"
                </div>

                {/* Reference */}
                <div
                  style={{
                    fontSize: 22,
                    color: theme.accent,
                    fontWeight: 600,
                  }}
                >
                  — Bhagavad Gita, Chapter {chapterNumber}, Verse {shlok.verse_number}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  position: 'absolute',
                  bottom: selectedRatio === '16:9' ? 40 : 50,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 18,
                  opacity: 0.7,
                }}
              >
                www.bhagavadgitagyan.com
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={handleWhatsAppShare} disabled={isGenerating} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="h-4 w-4" />
            Share to WhatsApp
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isGenerating} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button variant="outline" onClick={handleCopyToClipboard} disabled={isGenerating} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={isGenerating} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
