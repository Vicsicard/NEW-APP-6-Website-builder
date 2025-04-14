export interface PublishMetadata {
  schedule?: string;
  lastRunId?: string;
  storagePath?: string;
  log?: Array<{
    timestamp: string;
    event: string;
    details: Record<string, any>;
  }>;
  last_error?: string;
  retries?: number;
  last_attempt_at?: string;
}

export interface ContentItem {
  id: string;
  section: string;
  title: string | null;
  content: string;
  status: 'draft' | 'approved' | 'published' | 'failed';
  platforms: string[];
  tags: string[];
  retry: boolean;
  publish_metadata: PublishMetadata;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishRunMetadata {
  runId: string;
  startTime: string;
  itemCount: number;
  skippedCount: number;
  deferredCount: number;
  isDryRun: boolean;
  status: 'started' | 'completed' | 'failed';
}

export interface PublishingManifest {
  runId: string;
  timestamp: string;
  isDryRun: boolean;
  totalItems: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  retryCount: number;
  deferredItems: Array<{
    id: string;
    title: string | null;
    scheduledFor: string;
  }>;
  results: Array<{
    contentId: string;
    title: string | null;
    status: 'success' | 'failure' | 'skipped' | 'deferred' | 'simulated';
    error?: string;
    wasRetry?: boolean;
    platformResults?: Record<string, { status: string; path?: string }>;
  }>;
}

export interface PublishOptions {
  isDryRun?: boolean;
  ignoreFutureScheduled?: boolean;
  platforms?: string[];
  includeRetry?: boolean;
}
