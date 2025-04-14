import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import type { VFile } from 'vfile';
import { FormattingOptions } from './types';

export async function markdownToHtml(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .process(content) as VFile;
  return result.toString();
}

export function truncateText(text: string, maxLength: number, addEllipsis = true): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength - (addEllipsis ? 3 : 0)).trim();
  return addEllipsis ? `${truncated}...` : truncated;
}

export function extractHashtags(content: string, maxTags?: number): string[] {
  const matches = content.match(/#[\w-]+/g) || [];
  return maxTags ? matches.slice(0, maxTags) : matches;
}

export function addLineBreaks(text: string): string {
  return text.replace(/([.!?])\s+/g, '$1\n\n');
}

export function createCta(options: FormattingOptions): string {
  if (!options.addCta || !options.ctaText) return '';
  
  const ctaText = options.ctaText.trim();
  const ctaUrl = options.ctaUrl ? `\n${options.ctaUrl}` : '';
  
  return `\n\n${ctaText}${ctaUrl}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function addTailwindClasses(html: string): string {
  return html
    .replace(/<h1/g, '<h1 class="text-4xl font-bold mb-6"')
    .replace(/<h2/g, '<h2 class="text-3xl font-bold mb-4"')
    .replace(/<h3/g, '<h3 class="text-2xl font-bold mb-3"')
    .replace(/<p/g, '<p class="mb-4"')
    .replace(/<ul/g, '<ul class="list-disc ml-6 mb-4"')
    .replace(/<ol/g, '<ol class="list-decimal ml-6 mb-4"')
    .replace(/<li/g, '<li class="mb-2"')
    .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ');
}

export function generateSeoMetadata(content: string, title?: string): {
  titleTag: string;
  metaDescription: string;
  keywords: string[];
} {
  const plainText = stripHtml(content);
  const words = plainText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const wordFreq = words.reduce((acc: Record<string, number>, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  return {
    titleTag: title || truncateText(plainText, 60, false),
    metaDescription: truncateText(plainText, 160, false),
    keywords
  };
}
