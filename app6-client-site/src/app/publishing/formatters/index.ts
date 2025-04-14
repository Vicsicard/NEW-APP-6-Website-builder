import { ContentItem } from '../types';
import { FormattedContent, FormattingOptions, Platform } from './types';
import {
  markdownToHtml,
  truncateText,
  extractHashtags,
  addLineBreaks,
  createCta,
  stripHtml,
  addTailwindClasses,
  generateSeoMetadata
} from './utils';

async function formatBlogPost(content: ContentItem): Promise<FormattedContent> {
  const html = await markdownToHtml(content.content);
  const styledHtml = addTailwindClasses(html);
  
  return {
    platform: 'blog',
    content: styledHtml,
    metadata: {
      title: content.title,
      tags: content.tags
    }
  };
}

async function formatNewsletter(content: ContentItem, options: FormattingOptions): Promise<FormattedContent> {
  const html = await markdownToHtml(content.content);
  const plainText = stripHtml(html);
  
  return {
    platform: 'newsletter',
    content: html,
    metadata: {
      title: content.title,
      description: plainText.slice(0, 150)
    }
  };
}

function formatFacebook(content: ContentItem, options: FormattingOptions): FormattedContent {
  const text = content.content;
  const formatted = truncateText(text, 63206);
  const hashtags = extractHashtags(text, 5).join(' ');
  
  return {
    platform: 'facebook',
    content: `${formatted}\n\n${hashtags}${createCta(options)}`,
    metadata: {
      characterCount: formatted.length
    }
  };
}

function formatTwitter(content: ContentItem, options: FormattingOptions): FormattedContent {
  const maxLength = options.ctaText ? 280 - options.ctaText.length - 2 : 280;
  const text = content.content;
  const formatted = truncateText(text, maxLength);
  
  return {
    platform: 'twitter',
    content: `${formatted}${createCta(options)}`,
    metadata: {
      truncated: text.length > maxLength,
      characterCount: formatted.length
    }
  };
}

function formatLinkedIn(content: ContentItem, options: FormattingOptions): FormattedContent {
  const text = content.content;
  const formatted = truncateText(text, 2200);
  const hashtags = extractHashtags(text, 3).join(' ');
  
  return {
    platform: 'linkedin',
    content: `${formatted}\n\n${hashtags}${createCta(options)}`,
    metadata: {
      characterCount: formatted.length,
      tags: extractHashtags(text, 3)
    }
  };
}

function formatInstagram(content: ContentItem): FormattedContent {
  const text = content.content;
  const formatted = addLineBreaks(text);
  const hashtags = extractHashtags(text).join(' ');
  
  return {
    platform: 'instagram',
    content: `${formatted}\n\n${hashtags}`,
    metadata: {
      characterCount: formatted.length
    }
  };
}

function formatAd(content: ContentItem): FormattedContent {
  const lines = content.content.split('\n');
  const headline = truncateText(lines[0] || '', 60, false);
  const body = truncateText(lines.slice(1).join(' '), 150, false);
  const cta = lines[lines.length - 1];

  return {
    platform: 'ad',
    content: `${headline}\n\n${body}\n\n${cta}`,
    metadata: {
      title: headline
    }
  };
}

function formatShowNotes(content: ContentItem): FormattedContent {
  const lines = content.content.split('\n');
  const bulletPoints = lines.map(line => `• ${line.trim()}`).join('\n');
  
  return {
    platform: 'show_notes',
    content: bulletPoints
  };
}

async function formatWebsite(content: ContentItem): Promise<FormattedContent> {
  const html = await markdownToHtml(content.content);
  const styledHtml = addTailwindClasses(html);
  
  return {
    platform: 'website',
    content: styledHtml,
    metadata: {
      title: content.title
    }
  };
}

async function formatSeo(content: ContentItem): Promise<FormattedContent> {
  const html = await markdownToHtml(content.content);
  const seoMetadata = generateSeoMetadata(content.content, content.title);
  
  return {
    platform: 'seo',
    content: html,
    metadata: {
      title: content.title,
      seoMetadata
    }
  };
}

async function formatEmail(content: ContentItem, options: FormattingOptions): Promise<FormattedContent> {
  const html = await markdownToHtml(content.content);
  const plainText = stripHtml(content.content);
  
  return {
    platform: 'email',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  ${html}
  ${options.addCta ? `
  <div style="margin-top: 20px; text-align: center;">
    <a href="${options.ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
      ${options.ctaText}
    </a>
  </div>
  ` : ''}
</body>
</html>`,
    metadata: {
      title: content.title,
      description: plainText.slice(0, 150)
    }
  };
}

export async function formatContent(
  content: ContentItem,
  platform: Platform,
  options: FormattingOptions = {}
): Promise<FormattedContent> {
  const formatters: Record<Platform, (content: ContentItem, options: FormattingOptions) => Promise<FormattedContent> | FormattedContent> = {
    blog: formatBlogPost,
    newsletter: formatNewsletter,
    facebook: formatFacebook,
    twitter: formatTwitter,
    linkedin: formatLinkedIn,
    instagram: formatInstagram,
    ad: formatAd,
    show_notes: formatShowNotes,
    website: formatWebsite,
    seo: formatSeo,
    email: formatEmail
  };

  const formatter = formatters[platform];
  return formatter(content, options);
}

export function routeContent(content: ContentItem): Platform[] {
  const platforms = new Set<Platform>(content.platforms as Platform[]);
  
  // Add platform routing based on tags
  content.tags.forEach(tag => {
    switch (tag.toLowerCase()) {
      case 'founderstory':
        platforms.add('blog');
        platforms.add('linkedin');
        break;
      case 'reputationdefense':
        platforms.add('blog');
        platforms.add('linkedin');
        platforms.add('seo');
        break;
      case 'podcast':
        platforms.add('show_notes');
        platforms.add('website');
        break;
      case 'newsletter':
        platforms.add('newsletter');
        platforms.add('email');
        break;
      case 'social':
        platforms.add('twitter');
        platforms.add('facebook');
        platforms.add('instagram');
        break;
    }
  });

  return Array.from(platforms);
}
