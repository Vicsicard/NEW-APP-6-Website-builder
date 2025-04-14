# App 6: Personal Brand Website Generator

A single-page website generator that pulls content from Supabase and creates a beautiful, responsive personal brand website.

## Tech Stack

- Next.js 15.3.0 with TypeScript
- Tailwind CSS for styling
- Supabase for database
- react-markdown with remark-gfm for content
- Playfair Display font

## Features

### Core Features
1. Single-page responsive design
2. Dynamic content from Supabase:
   - Bio section
   - Latest blog posts
   - Featured videos
3. Social media integration
4. Error handling and fallbacks
5. Mobile-first approach

### Publishing System
1. Content Publishing
   - Markdown to HTML conversion
   - Platform-specific formatting
   - Storage path management
   - Status tracking

2. Error Handling & Retry System
   - Centralized error logging at `/logs/publishing_errors.log`
   - Structured JSON error entries
   - Automatic retry mechanism for failed content
   - Maximum 5 retry attempts per item
   - Status tracking with metadata

3. Content Status Management
   - Published
   - Failed (with retry)
   - Deferred (scheduled)
   - Retry exhausted

## Project Structure

```
app6-client-site/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── publishing/     # Content publishing system
│   │   │   ├── cli.ts     # Command-line interface
│   │   │   ├── publisher.ts# Main publishing logic
│   │   │   ├── types.ts   # Type definitions
│   │   │   ├── storage/   # Storage management
│   │   │   ├── utils/     # Utilities
│   │   │   └── tests/     # Test files
│   │   └── utils/         # Shared utilities
│   ├── pages/             # Next.js pages
│   └── styles/            # Global styles
├── public/               
│   └── icons/            # Social media icons
└── logs/                 # Error logs
```

## Database Schema

1. client_profile
   - Profile information
   - Social media links

2. content
   - Bio and blog posts
   - Status: draft/published/failed
   - Metadata for publishing

3. videos
   - Short-form video content
   - Status tracking
   - Platform information

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. Run development server:
```bash
npm run dev
```

## Publishing Content

### Basic Publishing
```bash
npm run publish-content
```

### Publishing with Retries
```bash
npm run retry-failed
```

### CLI Options
- `--dry-run`: Simulate publishing without making changes
- `--include-retry`: Include failed content marked for retry
- `--output-dir`: Specify custom output directory

## Error Handling

1. Error Logging
   - All errors are logged to `/logs/publishing_errors.log`
   - JSON format with timestamp, content ID, and error details
   - Append-only to preserve history

2. Retry Mechanism
   - Failed content is automatically marked for retry
   - Maximum 5 retry attempts
   - Retry status cleared on successful publish
   - `retry_exhausted` flag set after max attempts

3. Status Updates
   - Content status updated in Supabase
   - Metadata tracks attempts and errors
   - Last error message preserved for debugging

## Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- Content publishing flow
- Error handling
- Retry mechanism
- Storage operations
- Status updates

## Integration Points

1. App 3: Content generation (draft)
2. App 4: Video content (future)
3. App 5: Content approval/publishing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

Private - All rights reserved
