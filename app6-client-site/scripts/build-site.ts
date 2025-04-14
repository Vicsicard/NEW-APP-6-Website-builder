import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fetchApprovedContent } from '../src/app/publishing/contentFetcher';
import { ContentStorage } from '../src/app/publishing/storage/contentStorage';
import { ContentItem } from '../src/app/publishing/types';

/**
 * Utility to replace content between section tags by ID.
 */
function injectSection(html: string, sectionId: string, content: string): string {
  const regex = new RegExp(
    `(<section[^>]+id=["']${sectionId}["'][^>]*>)([\\s\\S]*?)(<\\/section>)`,
    'im'
  );

  if (!regex.test(html)) {
    console.warn(`⚠️ Warning: Section ID "${sectionId}" not found in HTML template.`);
  }

  return html.replace(regex, `$1\n${content}\n$3`);
}

async function main() {
  // 1. Load base HTML template
  const templatePath = join(__dirname, '../site-template.html');
  let html = readFileSync(templatePath, 'utf-8');

  // 2. Inject bio content
  const bioResult = await fetchApprovedContent({ section: 'bio', skipPublished: false });
  const bioItem: ContentItem | undefined = bioResult.items?.[0];
  const bioHtml = bioItem?.content || '';
  html = injectSection(html, 'about', `<h2>About Me</h2>\n${bioHtml}`);

  // 3. Inject blog posts from Supabase storage
  const storage = new ContentStorage({});
  const blogFiles = await storage.getPublishedContent('blog');
  let blogHtml = '';
  for (const file of blogFiles) {
    const blogPath = join(__dirname, '../../published_content/blog/', file.metadata.name);
    if (existsSync(blogPath)) {
      blogHtml += readFileSync(blogPath, 'utf-8') + '\n';
    }
  }
  html = injectSection(html, 'blog', `<h2>Featured Blog Posts</h2>\n${blogHtml}`);

  // 4. Inject social posts
  const socialResult = await fetchApprovedContent({ section: 'social', skipPublished: false });
  let socialHtml = '';
  for (const post of socialResult.items || []) {
    const platform = post.platforms?.[0] || 'Unknown';
    socialHtml += `
      <div class="social-post">
        <h3>${platform}</h3>
        <p>${post.content || ''}</p>
        <small>Posted on ${platform}</small>
      </div>\n`;
  }
  html = injectSection(html, 'social-posts', `<h2>Social Media Highlights</h2>\n${socialHtml}`);

  // 5. Ensure /out directory exists
  const outDir = join(__dirname, '../../out');
  if (!existsSync(outDir)) mkdirSync(outDir);

  // 6. Write final output
  const outputPath = join(outDir, 'index.html');
  writeFileSync(outputPath, html, 'utf-8');
  console.log('✅ Site built successfully:', outputPath);
}

main().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
