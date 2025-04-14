import { writeFileSync } from 'fs';
import { join } from 'path';
import { ContentItem, PublishingManifest, PublishOptions } from './types';
import supabase from '../utils/supabaseClient';
import { ContentStorage } from './storage/contentStorage';
import { formatContent } from './formatters';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import { ErrorLogger } from './utils/errorLogger';

export class ContentPublisher {
  private runId: string;
  private outputDir: string;
  private manifest: PublishingManifest;
  private isDryRun: boolean;
  private includeRetry: boolean;
  private storage: ContentStorage;
  private errorLogger: ErrorLogger;

  constructor(runId: string, outputDir: string, options: PublishOptions = {}) {
    this.runId = runId;
    this.outputDir = outputDir;
    this.isDryRun = options.isDryRun || false;
    this.includeRetry = options.includeRetry || false;
    this.storage = new ContentStorage({ 
      isDryRun: this.isDryRun,
      outputDir: this.outputDir
    });
    this.errorLogger = new ErrorLogger(this.outputDir);

    this.manifest = {
      runId,
      timestamp: new Date().toISOString(),
      isDryRun: this.isDryRun,
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      retryCount: 0,
      deferredItems: [],
      results: []
    };
  }

  private async renderMarkdownToHtml(content: string): Promise<string> {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkHtml)
      .process(content);

    return result.toString();
  }

  async publishBatch(items: ContentItem[]): Promise<void> {
    // If includeRetry is true, fetch failed items that need retry
    if (this.includeRetry) {
      const { data: retryItems } = await supabase
        .from('content')
        .select('*')
        .eq('status', 'failed')
        .eq('retry', true);

      if (retryItems && retryItems.length > 0) {
        this.manifest.retryCount = retryItems.length;
        items = [...items, ...retryItems.map(item => ({
          id: item.id || '',
          title: item.title || '',
          content: item.content || '',
          section: item.section || '',
          status: item.status || 'failed',
          platforms: item.platforms || [],
          publish_metadata: item.publish_metadata || {},
          tags: item.tags || [],
          retry: item.retry || false,
          user_id: item.user_id || '',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        } as ContentItem))];
      }
    }

    this.manifest.totalItems = items.length;

    for (const item of items) {
      try {
        // Skip already published content
        if (item.status === 'published') {
          this.manifest.skippedCount++;
          continue;
        }

        // Check if content is scheduled for future
        const publishDate = new Date(item.publish_metadata?.schedule || Date.now());
        if (publishDate > new Date()) {
          this.addDeferredItems([item]);
          this.manifest.skippedCount++;
          continue;
        }

        // Format content for each platform
        const formattedContent = await formatContent(item.content, item.platforms);

        // For blog and website content, render to HTML and store
        if (['blog', 'bio'].includes(item.section)) {
          const renderedHtml = await this.renderMarkdownToHtml(item.content);
          const storagePath = await this.storage.storeRenderedContent(item, renderedHtml);

          if (this.isDryRun) {
            this.manifest.successCount++;
            this.manifest.results.push({
              contentId: item.id,
              title: item.title,
              status: 'simulated',
              wasRetry: item.status === 'failed' && item.retry,
              platformResults: {
                storage: { status: 'simulated', path: storagePath },
                ...item.platforms.reduce((acc, platform) => ({
                  ...acc,
                  [platform]: { status: 'simulated' }
                }), {})
              }
            });
            continue;
          }

          // Update content status in Supabase
          await this.updateContentStatus(item.id, 'published', storagePath);
          
          this.manifest.successCount++;
          this.manifest.results.push({
            contentId: item.id,
            title: item.title,
            status: 'success',
            wasRetry: item.status === 'failed' && item.retry,
            platformResults: {
              storage: { status: 'published', path: storagePath }
            }
          });
        }
        // For newsletter and reputation repair content, just store for future use
        else if (['newsletter', 'reputation'].includes(item.section)) {
          const renderedHtml = await this.renderMarkdownToHtml(item.content);
          const storagePath = await this.storage.storeRenderedContent(item, renderedHtml);

          if (!this.isDryRun) {
            await this.updateContentStatus(item.id, 'published', storagePath);
          }

          this.manifest.successCount++;
          this.manifest.results.push({
            contentId: item.id,
            title: item.title,
            status: 'success',
            wasRetry: item.status === 'failed' && item.retry,
            platformResults: {
              storage: { 
                status: 'published',
                path: storagePath
              }
            }
          });
        }
        // For other content types (social, etc.), just publish to platforms
        else {
          if (this.isDryRun) {
            this.manifest.successCount++;
            this.manifest.results.push({
              contentId: item.id,
              title: item.title,
              status: 'simulated',
              wasRetry: item.status === 'failed' && item.retry,
              platformResults: item.platforms.reduce((acc, platform) => ({
                ...acc,
                [platform]: { status: 'simulated' }
              }), {})
            });
            continue;
          }

          const success = await this.publishToAllPlatforms(item);

          if (success) {
            await this.updateContentStatus(item.id, 'published');
            this.manifest.successCount++;
            this.manifest.results.push({
              contentId: item.id,
              title: item.title,
              status: 'success',
              wasRetry: item.status === 'failed' && item.retry,
              platformResults: item.platforms.reduce((acc, platform) => ({
                ...acc,
                [platform]: { status: 'published' }
              }), {})
            });
          } else {
            throw new Error('Failed to publish to one or more platforms');
          }
        }
      } catch (error) {
        this.manifest.failureCount++;
        const errorMessage = ErrorLogger.formatError(error);

        // Log the error
        this.errorLogger.logError({
          timestamp: new Date().toISOString(),
          content_id: item.id,
          platform: item.platforms[0] || 'unknown',
          error: errorMessage,
          section: item.section,
          title: item.title,
          retries: item.publish_metadata.retries || 0
        });

        this.manifest.results.push({
          contentId: item.id,
          title: item.title,
          status: 'failure',
          wasRetry: item.status === 'failed' && item.retry,
          error: errorMessage
        });

        if (!this.isDryRun) {
          await this.updateContentStatus(item.id, 'failed', undefined, errorMessage);
        }
      }
    }

    // Write manifest to file
    this.writeManifest();
  }

  private async publishToAllPlatforms(item: ContentItem): Promise<boolean> {
    try {
      // Simulate platform publishing with 90% success rate
      const success = Math.random() > 0.1;
      if (!success) {
        throw new Error('Platform publishing failed');
      }
      return true;
    } catch (error) {
      this.errorLogger.logError({
        timestamp: new Date().toISOString(),
        content_id: item.id,
        platform: item.platforms[0] || 'unknown',
        error: ErrorLogger.formatError(error),
        section: item.section,
        title: item.title,
        retries: item.publish_metadata.retries || 0
      });
      return false;
    }
  }

  private async updateContentStatus(
    contentId: string, 
    status: 'published' | 'failed', 
    storagePath?: string,
    errorMessage?: string
  ): Promise<void> {
    if (this.isDryRun) {
      console.log(`[DRY RUN] Would update content ${contentId} status to: ${status}`);
      return;
    }

    try {
      // Get current content to check retries
      const { data: currentContent } = await supabase
        .from('content')
        .select('publish_metadata')
        .eq('id', contentId)
        .single();

      const currentRetries = currentContent?.publish_metadata?.retries || 0;
      const now = new Date().toISOString();

      // Cap retries at 5 attempts
      const maxRetries = 5;
      const shouldRetry = status === 'failed' && currentRetries < maxRetries;

      const { error } = await supabase
        .from('content')
        .update({ 
          status,
          retry: shouldRetry,
          publish_metadata: {
            lastRunId: this.runId,
            last_attempt_at: now,
            ...(storagePath && { storagePath }),
            ...(errorMessage && { last_error: errorMessage }),
            ...(status === 'published' ? { last_error: undefined } : {}),
            retries: status === 'failed' ? currentRetries + 1 : 0,
            ...(currentRetries >= maxRetries ? { retry_exhausted: true } : {})
          }
        })
        .eq('id', contentId);

      if (error) {
        throw error;
      }
    } catch (error) {
      this.errorLogger.logError({
        timestamp: new Date().toISOString(),
        content_id: contentId,
        platform: 'system',
        error: `Failed to update content status: ${ErrorLogger.formatError(error)}`,
        retries: 0
      });
    }
  }

  addDeferredItems(items: ContentItem[]): void {
    this.manifest.deferredItems = items.map(item => ({
      id: item.id,
      title: item.title,
      scheduledFor: item.publish_metadata.schedule || ''
    }));
  }

  getManifest(): PublishingManifest {
    return this.manifest;
  }

  private writeManifest(): void {
    const manifestPath = join(this.outputDir, `publishing_manifest_${this.runId}.json`);
    writeFileSync(manifestPath, JSON.stringify(this.manifest, null, 2));
  }
}
