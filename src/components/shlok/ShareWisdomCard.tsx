import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Linkedin, Twitter, Download, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Shlok } from '@/types';

interface ShareWisdomCardProps {
  shlok: Shlok;
}

function truncateWords(text: string, max: number) {
  const words = text.split(/\s+/);
  return words.length <= max ? text : words.slice(0, max).join(' ') + '...';
}

export function ShareWisdomCard({ shlok }: ShareWisdomCardProps) {
  const shareText = shlok.life_application || shlok.english_meaning;
  const shareUrl = window.location.href;
  const shareTitle = `Bhagavad Gita - Chapter ${shlok.chapter?.chapter_number}, Verse ${shlok.verse_number}`;
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const quickCardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(`${shareText}\n\n— ${shareTitle}`);
    const encodedUrl = encodeURIComponent(shareUrl);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareTitle}\n${shareUrl}`);
        toast.success('Copied to clipboard!');
      } catch {
        toast.error('Failed to copy');
      }
      return;
    }

    if (platform === 'native') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or not supported
      }
      return;
    }

    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const handleQuickImageDownload = useCallback(async () => {
    if (!quickCardRef.current) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(quickCardRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });
      const link = document.createElement('a');
      link.download = `gita-${shlok.chapter?.chapter_number}-${shlok.verse_number}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Wisdom card downloaded!');
    } catch {
      toast.error('Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [shlok]);

  const chapterNum = shlok.chapter?.chapter_number || 1;
  const displayQuote = truncateWords(shlok.english_meaning || shlok.life_application || '', 35);

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Share as Wisdom Card</h3>
        </div>

        {/* Preview Quote */}
        <div className="bg-background rounded-lg p-4 mb-4 border">
          <blockquote className="text-lg italic text-center">
            "{shareText?.slice(0, 150)}{shareText && shareText.length > 150 ? '...' : ''}"
          </blockquote>
          <p className="text-sm text-muted-foreground text-center mt-2">
            — {shareTitle}
          </p>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Quick Image Download */}
          <Button
            variant="default"
            size="sm"
            onClick={handleQuickImageDownload}
            disabled={isGeneratingImage}
            className="gap-2"
          >
            {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isGeneratingImage ? 'Generating...' : 'Download Image'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="gap-2"
          >
            <Twitter className="h-4 w-4" />
            X (Twitter)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('whatsapp')}
            className="gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('copy')}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </CardContent>

      {/* Hidden offscreen card for quick image generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={quickCardRef}
          style={{
            width: 1080,
            height: 1080,
            backgroundColor: '#F5F0E8',
            color: '#2D1810',
            fontFamily: 'Georgia, "Times New Roman", serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px 60px',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,69,19,0.1) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, left: -80,
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,69,19,0.1) 0%, transparent 70%)',
          }} />
          {/* Top border */}
          <div style={{
            position: 'absolute', top: 20, left: 20, right: 20, height: 3,
            background: 'linear-gradient(90deg, transparent, #8B4513, transparent)',
            opacity: 0.5,
          }} />
          {/* Logo */}
          <div style={{
            position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center',
            fontSize: 20, fontWeight: 700, color: '#8B4513',
            letterSpacing: '4px', textTransform: 'uppercase',
          }}>
            ॐ Bhagavad Gita Gyan
          </div>
          {/* Sanskrit text */}
          {shlok.sanskrit_text && (
            <div style={{
              fontSize: 22, color: '#8B4513', opacity: 0.6, textAlign: 'center',
              marginBottom: 30, maxWidth: '85%', lineHeight: 1.6,
            }}>
              {truncateWords(shlok.sanskrit_text, 20)}
            </div>
          )}
          {/* Quote */}
          <div style={{ textAlign: 'center', maxWidth: '85%', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 80, color: '#8B4513', opacity: 0.3, lineHeight: 0.5, marginBottom: 20 }}>"</div>
            <div style={{
              fontSize: 38, fontWeight: 700, lineHeight: 1.5, letterSpacing: '0.5px',
              textShadow: '1px 1px 3px rgba(0,0,0,0.15)', marginBottom: 30,
            }}>
              {displayQuote}
            </div>
            <div style={{ width: 60, height: 3, background: '#8B4513', margin: '0 auto 20px', borderRadius: 2 }} />
            <div style={{ fontSize: 18, color: '#8B4513', fontWeight: 600, letterSpacing: '1px' }}>
              Chapter {chapterNum}, Verse {shlok.verse_number}
            </div>
          </div>
          {/* Bottom border */}
          <div style={{
            position: 'absolute', bottom: 20, left: 20, right: 20, height: 3,
            background: 'linear-gradient(90deg, transparent, #8B4513, transparent)',
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', bottom: 55, left: 0, right: 0, textAlign: 'center',
            fontSize: 14, opacity: 0.6, letterSpacing: '1px',
          }}>
            bhagavadgitagyan.com
          </div>
        </div>
      </div>
    </Card>
  );
}
