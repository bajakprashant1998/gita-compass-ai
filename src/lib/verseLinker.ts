/**
 * Converts "Chapter X, Verse Y" references in text to markdown links.
 * Handles variations like "Chapter 3, Verse 7", "chapter 13, verse 24", etc.
 */
export function linkVerseReferences(text: string): string {
  // Match patterns like "Chapter X, Verse Y" (case-insensitive)
  const pattern = /Chapter\s+(\d+),?\s*Verse\s+(\d+)/gi;
  
  return text.replace(pattern, (match, chapter, verse) => {
    const url = `/chapters/${chapter}/verse/${verse}`;
    return `[${match}](${url})`;
  });
}
