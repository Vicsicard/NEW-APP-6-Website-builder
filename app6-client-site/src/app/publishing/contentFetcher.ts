import { v4 as uuidv4 } from 'uuid';
import supabase from '../utils/supabaseClient';
import { ContentItem, PublishRunMetadata } from './types';

export interface FetchOptions {
  section?: string;
  platforms?: string[];
  includeRetry?: boolean;
  skipPublished?: boolean;
  ignoreFutureScheduled?: boolean;
}

export interface FetchResult {
  items: ContentItem[];
  skippedItems: ContentItem[];
  deferredItems: ContentItem[];
  runMetadata: PublishRunMetadata;
}

export async function fetchApprovedContent(options: FetchOptions): Promise<FetchResult> {
  const { 
    section, 
    platforms, 
    includeRetry = false, 
    skipPublished = true,
    ignoreFutureScheduled = false 
  } = options;
  
  const currentTime = new Date().toISOString();
  
  let query = supabase
    .from('content')
    .select('*');

  // Base status filter
  if (skipPublished) {
    query = query.eq('status', 'approved');
  } else {
    query = query.in('status', ['approved', 'published']);
  }

  // Additional filters
  if (section) {
    query = query.eq('section', section);
  }

  if (platforms && platforms.length > 0) {
    query = query.contains('platforms', platforms);
  }

  if (includeRetry) {
    query = query.or(`status.eq.failed,retry.eq.true`);
  }

  const { data: items, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  const allItems = items || [];

  // Separate items into published, scheduled, and ready to publish
  const skippedItems = skipPublished ? 
    allItems.filter(item => item.status === 'published') : 
    [];

  const remainingItems = skipPublished ?
    allItems.filter(item => item.status !== 'published') :
    allItems;

  // Filter scheduled items
  const deferredItems = ignoreFutureScheduled ? [] :
    remainingItems.filter(item => {
      const scheduledTime = item.publish_metadata?.schedule;
      return scheduledTime && scheduledTime > currentTime;
    });

  const publishableItems = remainingItems.filter(item => {
    const scheduledTime = item.publish_metadata?.schedule;
    return !scheduledTime || scheduledTime <= currentTime || ignoreFutureScheduled;
  });

  const runMetadata: PublishRunMetadata = {
    runId: uuidv4(),
    startTime: currentTime,
    itemCount: publishableItems.length,
    skippedCount: skippedItems.length,
    deferredCount: deferredItems.length,
    status: 'started'
  };

  // Log the run metadata to Supabase
  await logPublishRun(runMetadata, deferredItems);

  return {
    items: publishableItems,
    skippedItems,
    deferredItems,
    runMetadata
  };
}

async function logPublishRun(metadata: PublishRunMetadata, deferredItems: ContentItem[]) {
  const deferredDetails = deferredItems.map(item => ({
    id: item.id,
    title: item.title,
    scheduledFor: item.publish_metadata.schedule
  }));

  const { error } = await supabase
    .from('content')
    .update({
      publish_metadata: (prev: any) => ({
        ...prev,
        lastRunId: metadata.runId,
        log: [
          ...(prev?.log || []),
          {
            timestamp: metadata.startTime,
            event: 'publish_run_started',
            details: {
              runId: metadata.runId,
              itemCount: metadata.itemCount,
              skippedCount: metadata.skippedCount,
              deferredCount: metadata.deferredCount,
              deferredItems: deferredDetails
            }
          }
        ]
      })
    })
    .eq('status', 'approved');

  if (error) {
    console.error('Failed to log publish run:', error);
  }
}
