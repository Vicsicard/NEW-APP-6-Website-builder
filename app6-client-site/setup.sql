-- Create client_profile table
CREATE TABLE IF NOT EXISTS client_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  platforms TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  retry BOOLEAN DEFAULT false,
  publish_metadata JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'approved', 'published', 'failed')),
  CONSTRAINT valid_section CHECK (section IN ('bio', 'blog'))
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL UNIQUE,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  platforms TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  retry BOOLEAN DEFAULT false,
  publish_metadata JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'approved', 'published', 'failed'))
);

-- Create publishing_logs table
CREATE TABLE IF NOT EXISTS publishing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  run_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  success BOOLEAN NOT NULL,
  error TEXT,
  platform_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_content
    FOREIGN KEY (content_id)
    REFERENCES content(id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
CREATE INDEX IF NOT EXISTS idx_content_platforms ON content USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_content_tags ON content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_platforms ON videos USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_publishing_logs_content_id ON publishing_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_publishing_logs_run_id ON publishing_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_publishing_logs_timestamp ON publishing_logs(timestamp);

-- Insert sample client profile
INSERT INTO client_profile (name, email, linkedin_url, twitter_url, instagram_url)
VALUES (
  'Self Cast Client',
  'client@selfcast.studio',
  'https://linkedin.com/in/selfcast',
  'https://twitter.com/selfcast',
  'https://instagram.com/selfcast'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample content
INSERT INTO content (section, title, content, status, platforms, tags)
VALUES 
  (
    'bio',
    'About Me',
    '# About Me\n\nI help businesses tell their stories through compelling content.',
    'approved',
    ARRAY['website', 'linkedin'],
    ARRAY['bio', 'founderstory']
  ),
  (
    'blog',
    'Content Strategy 101',
    '# Content Strategy 101\n\nLearn how to create content that converts.',
    'approved',
    ARRAY['blog', 'linkedin', 'twitter'],
    ARRAY['marketing', 'social']
  )
ON CONFLICT DO NOTHING;
