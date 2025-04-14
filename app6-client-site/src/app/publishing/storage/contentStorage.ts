import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import supabase from '../../utils/supabaseClient';
import { ContentItem } from '../types';
import slugify from 'slugify';

export interface StorageOptions {
  isDryRun?: boolean;
  outputDir?: string;
}

export class ContentStorage {
  private baseTemplate: string;
  private isDryRun: boolean;
  private outputDir: string;

  constructor(options: StorageOptions = {}) {
    this.isDryRun = options.isDryRun || false;
    this.outputDir = options.outputDir || join(__dirname, '../../../public');
    this.baseTemplate = readFileSync(
      join(__dirname, '../templates/base.html'),
      'utf-8'
    );
  }

  private getStoragePath(section: string, slug: string): string {
    const sectionMap: Record<string, string> = {
      blog: 'blog',
      bio: 'website',
      newsletter: 'newsletter',
      reputation: 'reputation'
    };

    const mappedSection = sectionMap[section] || section;
    return `published_content/${mappedSection}/${slug}.html`;
  }

  private generateSlug(title: string): string {
    return slugify(title || 'untitled', {
      lower: true,
      strict: true,
      trim: true
    });
  }

  private async uploadToStorage(path: string, content: string): Promise<string> {
    if (this.isDryRun) {
      console.log(`[DRY RUN] Would upload to: ${path}`);
      return path;
    }

    // Write to local filesystem
    const localPath = join(this.outputDir, path);
    writeFileSync(localPath, content);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('content')
      .upload(path, content, {
        contentType: 'text/html',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    return data.path;
  }

  private renderTemplate(
    content: string,
    metadata: {
      title: string;
      section: string;
      slug: string;
      publishDate: string;
    }
  ): string {
    return this.baseTemplate
      .replace('{{title}}', metadata.title)
      .replace('{{section}}', metadata.section)
      .replace('{{publish_date}}', metadata.publishDate)
      .replace('{{slug}}', metadata.slug)
      .replace('{{content}}', content)
      .replace('{{custom_head}}', '')
      .replace('{{custom_footer}}', '');
  }

  private async updatePublishedIndex(item: ContentItem, storagePath: string): Promise<void> {
    if (this.isDryRun) {
      console.log(`[DRY RUN] Would update published_index.json`);
      return;
    }

    try {
      // Try to get existing index
      const { data: existingData } = await supabase.storage
        .from('content')
        .download('published_content/published_index.json');

      let index: Array<{
        slug: string;
        section: string;
        platforms: string[];
        title: string;
        published_at: string;
        storage_path: string;
      }> = [];

      if (existingData) {
        const text = await existingData.text();
        index = JSON.parse(text);
      }

      // Only include blog and website content
      if (['blog', 'bio'].includes(item.section)) {
        // Remove existing entry if present
        index = index.filter(entry => entry.storage_path !== storagePath);

        // Add new entry
        index.push({
          slug: this.generateSlug(item.title || ''),
          section: item.section,
          platforms: item.platforms,
          title: item.title || 'Untitled',
          published_at: new Date().toISOString(),
          storage_path: storagePath
        });

        const indexContent = JSON.stringify(index, null, 2);

        // Write to local filesystem
        const localPath = join(this.outputDir, 'published_content/published_index.json');
        writeFileSync(localPath, indexContent);

        // Upload updated index
        await supabase.storage
          .from('content')
          .upload('published_content/published_index.json', 
            indexContent,
            { upsert: true, contentType: 'application/json' }
          );
      }
    } catch (error) {
      console.error('Failed to update published index:', error);
      throw error;
    }
  }

  async storeRenderedContent(item: ContentItem, renderedHtml: string): Promise<string> {
    const slug = this.generateSlug(item.title || '');
    const path = this.getStoragePath(item.section, slug);

    // Only store blog and website content for now
    if (!['blog', 'bio'].includes(item.section)) {
      if (this.isDryRun) {
        console.log(`[DRY RUN] Would store ${item.section} content for future use: ${path}`);
        return path;
      }
    }

    const fullHtml = this.renderTemplate(renderedHtml, {
      title: item.title || 'Untitled',
      section: item.section,
      slug,
      publishDate: new Date().toISOString()
    });

    try {
      const storagePath = await this.uploadToStorage(path, fullHtml);
      
      if (!this.isDryRun) {
        // Update content metadata with storage path
        await supabase
          .from('content')
          .update({
            publish_metadata: {
              ...item.publish_metadata,
              storagePath,
              lastPublished: new Date().toISOString()
            }
          })
          .eq('id', item.id);

        // Update published index
        await this.updatePublishedIndex(item, storagePath);
      }

      return storagePath;
    } catch (error) {
      throw new Error(`Failed to store rendered content: ${error}`);
    }
  }

  async getPublishedContent(section: string): Promise<Array<{ path: string; metadata: any }>> {
    const { data: files, error } = await supabase.storage
      .from('content')
      .list(`published_content/${section}`);

    if (error) {
      throw new Error(`Failed to list published content: ${error.message}`);
    }

    return files
      .filter(file => file.name.endsWith('.html'))
      .map(file => ({
        path: `published_content/${section}/${file.name}`,
        metadata: {
          name: file.name,
          size: file.metadata.size,
          created: file.metadata.created
        }
      }));
  }
}
