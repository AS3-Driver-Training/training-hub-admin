
import { useMemo } from 'react';

export function useProcessedMarkdown(rawContent: string): string {
  return useMemo(() => {
    if (!rawContent) return '';
    
    // Convert literal string sequences to actual newline characters
    return rawContent
      .replace(/\\n\\n/g, '\n\n')  // Convert double \n to paragraph breaks
      .replace(/\\n/g, '\n');      // Convert single \n to line breaks
  }, [rawContent]);
}
