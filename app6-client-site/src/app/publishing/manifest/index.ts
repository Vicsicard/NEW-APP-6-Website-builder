import { writeFile } from 'fs/promises';
import { join } from 'path';
import supabase from '../../utils/supabaseClient';
import { ContentItem } from '../types';
import { Platform } from '../formatters/types';
import { PublishingManifest, PublishingManifestItem, PublishingResult } from './types';

export class PublishingManifestManager {
  private manifest: PublishingManifest;
  private manifestPath: string;

  constructor(runId: string, outputDir: string) {
    this.manifest = {
      runId,
      startTime: new Date().toISOString(),
      items: [],
      status: 'in_progress',
      totalItems: 0,
      successCount: 0,
      failureCount: 0
    };
    this.manifestPath = join(outputDir, `publishing_manifest_${runId}.json`);
  }

  addItem(content: ContentItem, platforms: Platform[]): void {
    const item: PublishingManifestItem = {
      contentId: content.id,
      section: content.section,
      platforms,
      scheduledDate: content.publish_metadata?.schedule,
      retryCount: 0
    };
    this.manifest.items.push(item);
    this.manifest.totalItems++;
  }

  async updateItemResult(
    contentId: string,
    result: PublishingResult
  ): Promise<void> {
    const item = this.manifest.items.find(i => i.contentId === contentId);
    if (!item) return;

    item.result = result;
    
    if (result.success) {
      this.manifest.successCount++;
      await this.updateContentStatus(contentId, 'published');
    } else {
      this.manifest.failureCount++;
      await this.updateContentStatus(contentId, 'failed', true);
    }

    await this.saveManifest();
    await this.logPublishingResult(contentId, result);
  }

  private async updateContentStatus(
    contentId: string,
    status: 'published' | 'failed',
    retry: boolean = false
  ): Promise<void> {
    const { error } = await supabase
      .from('content')
      .update({
        status,
        retry,
        updated_at: new Date().toISOString(),
        publish_metadata: {
          lastPublishAttempt: new Date().toISOString(),
          lastRunId: this.manifest.runId,
          ...(status === 'failed' ? { lastError: 'Publishing failed' } : {})
        }
      })
      .eq('id', contentId);

    if (error) {
      console.error(`Failed to update content status: ${error.message}`);
    }
  }

  private async logPublishingResult(
    contentId: string,
    result: PublishingResult
  ): Promise<void> {
    const { error } = await supabase
      .from('publishing_logs')
      .insert({
        content_id: contentId,
        run_id: this.manifest.runId,
        timestamp: result.timestamp,
        success: result.success,
        error: result.error,
        platform_results: result.platformResults
      });

    if (error) {
      console.error(`Failed to log publishing result: ${error.message}`);
    }
  }

  async complete(status: 'completed' | 'failed'): Promise<void> {
    this.manifest.status = status;
    await this.saveManifest();
  }

  private async saveManifest(): Promise<void> {
    try {
      await writeFile(
        this.manifestPath,
        JSON.stringify(this.manifest, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`Failed to save manifest: ${error}`);
    }
  }

  getManifest(): PublishingManifest {
    return this.manifest;
  }
}
