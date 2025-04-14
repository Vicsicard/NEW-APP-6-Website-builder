import { Platform } from '../formatters/types';

export interface PublishingResult {
  success: boolean;
  error?: string;
  timestamp: string;
  platformResults?: {
    [key in Platform]?: {
      success: boolean;
      error?: string;
      url?: string;
    };
  };
}

export interface PublishingManifestItem {
  contentId: string;
  section: string;
  platforms: Platform[];
  scheduledDate?: string;
  result?: PublishingResult;
  retryCount?: number;
}

export interface PublishingManifest {
  runId: string;
  startTime: string;
  items: PublishingManifestItem[];
  status: 'in_progress' | 'completed' | 'failed';
  totalItems: number;
  successCount: number;
  failureCount: number;
}
