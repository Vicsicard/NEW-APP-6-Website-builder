#!/usr/bin/env node
import { Command } from 'commander';
import { join } from 'path';
import { fetchApprovedContent } from './contentFetcher';
import { ContentPublisher } from './publisher';

interface PublishOptions {
  section?: string;
  platforms?: string[];
  includeRetry?: boolean;
  outputDir?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  includePublished?: boolean;
  ignoreFutureScheduled?: boolean;
  dryRun?: boolean;
}

const program = new Command();

program
  .name('publish-content')
  .description('CLI to trigger content publishing')
  .version('1.0.0');

program
  .command('start')
  .description('Start a publishing run')
  .option('-s, --section <section>', 'Filter by section (e.g., blog, bio)')
  .option('-p, --platforms <platforms...>', 'Filter by platforms (e.g., linkedin twitter)')
  .option('-r, --include-retry', 'Include failed items marked for retry')
  .option('-o, --output-dir <dir>', 'Output directory for manifest files', './publishing_manifests')
  .option('--supabase-url <url>', 'Supabase URL')
  .option('--supabase-key <key>', 'Supabase anon key')
  .option('--include-published', 'Include already published content')
  .option('--ignore-schedule', 'Ignore future scheduled dates and publish immediately')
  .option('--dry-run', 'Simulate publishing without making any changes')
  .action(async (options: PublishOptions) => {
    try {
      // Set environment variables if provided
      if (options.supabaseUrl) {
        process.env.NEXT_PUBLIC_SUPABASE_URL = options.supabaseUrl;
      }
      if (options.supabaseKey) {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = options.supabaseKey;
      }

      // Validate required environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Error: Supabase URL and anon key are required. Provide them via:');
        console.error('1. Environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
        console.error('2. Command line options (--supabase-url, --supabase-key)');
        process.exit(1);
      }

      if (options.dryRun) {
        console.log('\n DRY RUN MODE: No changes will be made to content or database\n');
      }

      console.log('Starting publishing run...');
      
      const { items, skippedItems, deferredItems, runMetadata } = await fetchApprovedContent({
        section: options.section,
        platforms: options.platforms,
        includeRetry: options.includeRetry,
        skipPublished: !options.includePublished,
        ignoreFutureScheduled: options.ignoreFutureScheduled
      });

      if (items.length === 0 && skippedItems.length === 0 && deferredItems.length === 0) {
        console.log('No items found to process.');
        return;
      }

      console.log(`
Publishing Run Started:
Run ID: ${runMetadata.runId}
Start Time: ${runMetadata.startTime}
Mode: ${options.dryRun ? 'Dry Run (Simulated)' : 'Live'}
Items to Process: ${runMetadata.itemCount}
Items Skipped: ${runMetadata.skippedCount}
Items Deferred: ${runMetadata.deferredCount}
      `);

      if (skippedItems.length > 0) {
        console.log('\nSkipped Items (already published):');
        skippedItems.forEach(item => {
          console.log(`- ${item.title || 'Untitled'} (${item.id})`);
        });
      }

      if (deferredItems.length > 0) {
        console.log('\nDeferred Items (scheduled for future):');
        deferredItems.forEach(item => {
          const scheduledDate = new Date(item.publish_metadata.schedule || '').toLocaleString();
          console.log(`- ${item.title || 'Untitled'} (${item.id}) → ${scheduledDate}`);
        });
      }

      if (items.length === 0) {
        console.log('\nNo items ready for immediate publishing.');
        return;
      }

      const outputDir = options.outputDir ? 
        join(process.cwd(), options.outputDir) :
        join(process.cwd(), 'publishing_manifests');

      const publisher = new ContentPublisher(runMetadata.runId, outputDir, {
        isDryRun: options.dryRun
      });
      
      if (deferredItems.length > 0) {
        publisher.addDeferredItems(deferredItems);
      }

      console.log('\nStarting content publishing...');
      await publisher.publishBatch(items);
      
      const manifest = publisher.getManifest();
      
      console.log(`
Publishing Complete:
Mode: ${options.dryRun ? 'Dry Run (Simulated)' : 'Live'}
Total Items: ${manifest.totalItems}
${options.dryRun ? 'Simulated: ' + manifest.successCount : 'Successful: ' + manifest.successCount}
Failed: ${manifest.failureCount}
Skipped: ${runMetadata.skippedCount}
Deferred: ${runMetadata.deferredCount}
Manifest Location: ${join(outputDir, `publishing_manifest_${runMetadata.runId}.json`)}
      `);

      if (options.dryRun) {
        console.log('\n DRY RUN COMPLETE: No changes were made to content or database');
      }

    } catch (error) {
      console.error('Error during publishing:', error);
      process.exit(1);
    }
  });

program.parse();
