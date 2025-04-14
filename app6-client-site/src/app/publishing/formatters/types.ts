import { ContentItem } from '../types';

export type Platform = 
  | 'blog'
  | 'newsletter'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'ad'
  | 'show_notes'
  | 'website'
  | 'seo'
  | 'email';  // Added email platform

export interface FormattedContent {
  platform: Platform;
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    seoMetadata?: {
      titleTag?: string;
      metaDescription?: string;
      keywords?: string[];
    };
    truncated?: boolean;
    characterCount?: number;
  };
}

export interface FormattingOptions {
  preserveMarkdown?: boolean;
  maxLength?: number;
  addHashtags?: boolean;
  maxHashtags?: number;
  addCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  tone?: 'professional' | 'friendly' | 'neutral';
  includeEmojis?: boolean;
}
