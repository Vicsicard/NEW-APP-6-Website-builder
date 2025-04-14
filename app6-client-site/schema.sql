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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published')),
  CONSTRAINT valid_section CHECK (section IN ('bio', 'blog'))
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL UNIQUE,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published'))
);

-- Insert test data
INSERT INTO client_profile (name, email, linkedin_url, twitter_url, instagram_url)
VALUES (
  'Jane Doe',
  'hello@janedoe.com',
  'https://linkedin.com/in/janedoe',
  'https://twitter.com/janedoe',
  'https://instagram.com/janedoe'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO content (section, title, content, status)
VALUES 
  ('bio', 'About Me', '# About Me\n\nI''m a seasoned brand strategist with a passion for helping people shape the narrative of their lives. My work blends creativity, clarity, and purpose — helping audiences connect deeply and take action.\n\nThrough Self Cast Studios, I''ve embraced the power of intentional storytelling, grounded in lived experience and strategic visibility.', 'published'),
  ('blog', 'The Moment I Took Back My Story', 'After years of following someone else''s script, I finally stepped into the lead role of my own narrative...', 'published'),
  ('blog', 'From Setback to Spotlight', 'We don''t grow in the light — we grow in the shadows. Here''s what I learned when the spotlight turned away...', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO videos (video_url, caption, status)
VALUES 
  ('/videos/highlight1.mp4', '🔥 30-second reel about purpose-driven pivots', 'published'),
  ('/videos/highlight2.mp4', '💬 Quick insight into personal branding from lived experience', 'published')
ON CONFLICT DO NOTHING;
