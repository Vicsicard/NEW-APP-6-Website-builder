# Supabase Content Mapping

## Content Table Structure

Each content type is stored in the `content` table with specific section identifiers and required fields.

### 1. Site Configuration
- **Section:** `site_config`
- **Status:** `published`
- **Required Fields:**
  - `title`: "Annie Sicard"
  - `content`: Contains JSON with:
    ```json
    {
      "name": "Annie Sicard",
      "tagline": "Storyteller. Strategist. Self Cast Client."
    }
    ```
- **Display Location:** Header section of the website
  - Name appears in `<h1 id="clientName">`
  - Tagline appears in `<p id="tagline">`
  - Also sets the page title

### 2. Bio/About Content
- **Section:** `bio`
- **Status:** `published`
- **Required Fields:**
  - `content`: Markdown formatted text
- **Display Location:** About section with id="bioContent"
- **Formatting:** Rendered as HTML from Markdown

### 3. Blog Posts
- **Section:** `blog`
- **Status:** `published`
- **Required Fields:**
  - `title`: Post title
  - `content`: Markdown formatted text
  - `excerpt`: Optional short description
  - `tags`: Array of tag strings
  - `published_at`: Timestamp
- **Display Location:** Blog section with id="blogPosts"
- **Layout:** Displayed in responsive grid with class="content-grid"
- **Ordering:** Most recent first by published_at

### 4. Social Media Posts
- **Section:** `social`
- **Status:** `published`
- **Required Fields:**
  - `title`: Post title
  - `content`: Post content in Markdown
  - `platform`: Social media platform name
  - `thumbnail`: Optional image URL
  - `caption`: Optional short text
  - `tags`: Array of tag strings
  - `published_at`: Timestamp
- **Display Location:** Social section with id="socialPosts"
- **Layout:** Displayed in responsive grid with class="social-grid"
- **Ordering:** Most recent first by published_at

## Content Display Rules
1. Only content with status='published' is displayed
2. All markdown content is rendered using marked.js
3. Missing optional fields fall back to sensible defaults
4. Each content type has its own error handling and loading states
