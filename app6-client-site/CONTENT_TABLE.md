# Content Table Documentation

## Current Structure

The `content` table is designed to store different types of content for the personal brand website. Here's its current structure:

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Fields Explanation:
- `id`: Unique identifier for each content piece
- `section`: Type of content (bio, blog)
- `title`: Optional title for the content
- `content`: The actual content in Markdown format
- `status`: Publication status ('draft' or 'published')
- `created_at`: Timestamp when content was created
- `updated_at`: Timestamp when content was last updated

### Current Constraints:
```sql
CONSTRAINT valid_status CHECK (status IN ('draft', 'published')),
CONSTRAINT valid_section CHECK (section IN ('bio', 'blog'))
```

## Error We're Encountering
When trying to insert content, we're getting a constraint violation error because the existing table only allows 'bio' and 'blog' sections.

## Proposed Changes

### 1. Update Section Constraints
```sql
ALTER TABLE content
  ADD CONSTRAINT valid_section 
  CHECK (section IN ('bio', 'blog', 'about'));
```

This change:
- Keeps existing sections ('bio', 'blog')
- Adds 'about' as a valid section
- Maintains data integrity while being more flexible

### 2. Content Organization

#### Bio Section
- Purpose: Main biography content
- Example: Personal story and background
- Usage: Displayed in the "About Me" section

#### Blog Section
- Purpose: Regular content updates
- Example: Articles, thoughts, insights
- Usage: Displayed in the "Blog Posts" section

#### About Section
- Purpose: Additional profile information
- Example: Mission statement, values
- Usage: Can be used for different sections of the site

## Data Flow
1. Content starts as 'draft' in App 5 (Content Management)
2. Goes through approval process
3. Gets marked as 'published'
4. Appears on the website (App 6)

## Integration with Website
The website (App 6) only displays content where:
```sql
status = 'published'
```

This ensures that only approved content appears on the public site.

## Best Practices
1. Always use the section constraint when inserting content
2. Set appropriate status ('draft' by default)
3. Use Markdown formatting for rich content
4. Keep content well-organized by section

## Next Steps
1. Drop existing constraints
2. Add new, more flexible constraints
3. Insert sample content
4. Verify website display
