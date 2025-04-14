// Use CommonJS require for Node.js compatibility
const fs = require('fs');
const path = require('path');
const contentFetcher = require('../src/app/publishing/contentFetcher');
const contentStorage = require('../src/app/publishing/storage/contentStorage');

// Utility to replace content between section tags
function injectSection(html, sectionId, content) {
  const regex = new RegExp(`(<section[^>]+id=["']${sectionId}["'][^>]*>)([\s\S]*?)(<\/section>)`, 'im');
  return html.replace(regex, `$1\n${content}\n$3`);
}

async function main() {
  // 1. Load base HTML template
  const templatePath = path.join(__dirname, '../site-template.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  // 2. Fetch rendered bio HTML (section = 'bio', status = 'published')
  const bioResult = await contentFetcher.fetchApprovedContent({ section: 'bio', skipPublished: false });
  const bioItem = bioResult.items && bioResult.items.length > 0 ? bioResult.items[0] : null;
  const bioHtml = bioItem ? bioItem.content : '';
  html = injectSection(html, 'about', `<h2>About Me</h2>\n${bioHtml}`);

  // 3. Fetch rendered blog HTML files from /published_content/blog/ using ContentStorage
  const storage = new contentStorage.ContentStorage({});
  const blogFiles = await storage.getPublishedContent('blog');
  let blogHtml = '';
  for (const file of blogFiles) {
    const blogPath = path.join(__dirname, '../../published_content/blog/', file.metadata.name);
    if (fs.existsSync(blogPath)) {
      blogHtml += fs.readFileSync(blogPath, 'utf-8') + '\n';
    }
  }
  html = injectSection(html, 'blog', `<h2>Featured Blog Posts</h2>\n${blogHtml}`);

  // 4. Fetch social posts (section = 'social', status = 'published')
  const socialResult = await contentFetcher.fetchApprovedContent({ section: 'social', skipPublished: false });
  let socialHtml = '';
  for (const post of socialResult.items || []) {
    const platform = post.platforms && post.platforms.length > 0 ? post.platforms[0] : 'Unknown';
    socialHtml += `<div class=\"social-post\">\n  <h3>${platform}</h3>\n  <p>${post.content || ''}</p>\n  <small>${platform ? `Posted on ${platform}` : ''}</small>\n</div>\n`;
  }
  html = injectSection(html, 'social-posts', `<h2>Social Media Highlights</h2>\n${socialHtml}`);

  // 5. Ensure /out directory exists
  const outDir = path.join(__dirname, '../../out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // 6. Write the final HTML to /out/index.html
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log('Site built successfully: /out/index.html');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
