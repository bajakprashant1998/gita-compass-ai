/**
 * Converts verse references in text to markdown links.
 * Supports English and all major Indian languages.
 */

// Multilingual patterns for "Chapter X, Verse Y"
const VERSE_PATTERNS: RegExp[] = [
  // English: Chapter 3, Verse 7 / Chapter 3 Verse 7
  /Chapter\s+(\d+),?\s*Verse\s+(\d+)/gi,
  // Hindi/Sanskrit/Marathi: अध्याय 3, श्लोक 7
  /अध्याय\s+(\d+),?\s*श्लोक\s+(\d+)/gi,
  // Tamil: அத்தியாயம் 3, வசனம் 7
  /அத்தியாயம்\s+(\d+),?\s*வசனம்\s+(\d+)/gi,
  // Telugu: అధ్యాయం 3, శ్లోకం 7
  /అధ్యాయం\s+(\d+),?\s*శ్లోకం\s+(\d+)/gi,
  // Bengali/Assamese: অধ্যায় 3, শ্লোক 7
  /অধ্যায়\s+(\d+),?\s*শ্লোক\s+(\d+)/gi,
  // Gujarati: અધ્યાય 3, શ્લોક 7
  /અધ્યાય\s+(\d+),?\s*શ્લોક\s+(\d+)/gi,
  // Kannada: ಅಧ್ಯಾಯ 3, ಶ್ಲೋಕ 7
  /ಅಧ್ಯಾಯ\s+(\d+),?\s*ಶ್ಲೋಕ\s+(\d+)/gi,
  // Malayalam: അധ്യായം 3, ശ്ലോകം 7
  /അധ്യായം\s+(\d+),?\s*ശ്ലോകം\s+(\d+)/gi,
  // Punjabi: ਅਧਿਆਇ 3, ਸ਼ਲੋਕ 7
  /ਅਧਿਆਇ\s+(\d+),?\s*ਸ਼ਲੋਕ\s+(\d+)/gi,
  // Odia: ଅଧ୍ୟାୟ 3, ଶ୍ଳୋକ 7
  /ଅଧ୍ୟାୟ\s+(\d+),?\s*ଶ୍ଳୋକ\s+(\d+)/gi,
  // Urdu: باب 3، آیت 7
  /باب\s+(\d+)[،,]?\s*آیت\s+(\d+)/gi,
];

export function linkVerseReferences(text: string): string {
  let result = text;
  for (const pattern of VERSE_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match, chapter, verse) => {
      const url = `/chapters/${chapter}/verse/${verse}`;
      return `[${match}](${url})`;
    });
  }
  return result;
}
