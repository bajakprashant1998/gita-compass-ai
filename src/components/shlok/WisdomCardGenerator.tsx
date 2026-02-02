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

// Helper to truncate text to a maximum number of words
function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

const themes: Record<Theme, { bg: string; accent: string; text: string; name: string; decorative: string }> = {
  earth: { bg: '#F5F0E8', accent: '#8B4513', text: '#2D1810', name: 'Warm Earth', decorative: 'rgba(139, 69, 19, 0.1)' },
  ocean: { bg: '#1a365d', accent: '#63b3ed', text: '#ffffff', name: 'Deep Ocean', decorative: 'rgba(99, 179, 237, 0.15)' },
  forest: { bg: '#1a4731', accent: '#68d391', text: '#ffffff', name: 'Forest Calm', decorative: 'rgba(104, 211, 145, 0.15)' },
  sunset: { bg: '#744210', accent: '#f6ad55', text: '#ffffff', name: 'Sunset Glow', decorative: 'rgba(246, 173, 85, 0.15)' },
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
              {/* Decorative Background Elements */}
              <div
                style={{
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 400,
                  height: 400,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.decorative} 0%, transparent 70%)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -80,
                  left: -80,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.decorative} 0%, transparent 70%)`,
                }}
              />

              {/* Top Decorative Border */}
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  right: 20,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                  opacity: 0.5,
                }}
              />

              {/* Logo / Brand */}
              <div
                style={{
                  position: 'absolute',
                  top: selectedRatio === '16:9' ? 50 : 60,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: theme.accent,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                }}
              >
                ॐ Bhagavad Gita Gyan
              </div>

              {/* Main Quote */}
              <div
                style={{
                  textAlign: 'center',
                  maxWidth: selectedRatio === '16:9' ? '75%' : '85%',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Opening Quote Mark */}
                <div
                  style={{
                    fontSize: 80,
                    color: theme.accent,
                    opacity: 0.3,
                    lineHeight: 0.5,
                    marginBottom: 20,
                  }}
                >
                  "
                </div>
                <div
                  style={{
                    fontSize: selectedRatio === '1:1' ? 36 : selectedRatio === '4:5' ? 32 : 42,
                    fontWeight: 400,
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    marginBottom: 30,
                  }}
                >
                  {truncateToWords(shlok.life_application || shlok.english_meaning, 40)}
                </div>

                {/* Decorative Divider */}
                <div
                  style={{
                    width: 60,
                    height: 3,
                    background: theme.accent,
                    margin: '0 auto 20px',
                    borderRadius: 2,
                  }}
                />

                {/* Reference */}
                <div
                  style={{
                    fontSize: 18,
                    color: theme.accent,
                    fontWeight: 600,
                    letterSpacing: '1px',
                  }}
                >
                  Chapter {chapterNumber}, Verse {shlok.verse_number}
                </div>
              </div>

              {/* Bottom Decorative Border */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                  opacity: 0.5,
                }}
              />

              {/* Footer */}
              <div
                style={{
                  position: 'absolute',
                  bottom: selectedRatio === '16:9' ? 50 : 55,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 14,
                  opacity: 0.6,
                  letterSpacing: '1px',
                }}
              >
                bhagavadgitagyan.com
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
