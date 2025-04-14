-- Insert sample client profile
INSERT INTO client_profile (name, email, linkedin_url, twitter_url, instagram_url)
VALUES (
  'Self Cast Client',
  'client@selfcast.studio',
  'https://linkedin.com/in/selfcast',
  'https://twitter.com/selfcast',
  'https://instagram.com/selfcast'
) ON CONFLICT (email) DO NOTHING;

-- Insert bio content (using correct 'bio' section)
INSERT INTO content (section, title, content, status)
VALUES (
  'bio',  -- Using allowed 'bio' section
  'About Me',
  '# Welcome to My Story\n\nAs a Self Cast client, I''ve learned that authentic storytelling is the key to meaningful connections. Through strategic personal branding and intentional content creation, I help others find their voice and share their unique perspectives.\n\n## My Journey\n\nFrom navigating career transitions to building a personal brand, I understand the power of owning your narrative. Now, I''m here to help you do the same.',
  'published'
) ON CONFLICT DO NOTHING;

-- Insert blog posts (using correct 'blog' section)
INSERT INTO content (section, title, content, status)
VALUES 
  (
    'blog',  -- Using allowed 'blog' section
    'Finding Your Authentic Voice',
    'In a world of endless noise, authenticity cuts through. Here''s how I discovered my unique voice and built a brand that resonates...\n\n## The Challenge\n\nFor years, I struggled to find the right way to present myself professionally. Should I be more formal? More casual? More technical?\n\n## The Discovery\n\nThe answer was simple: be authentically me. When I stopped trying to fit a mold and started sharing my genuine experiences, everything changed.\n\n## The Impact\n\nNow, my content connects deeper because it comes from a place of truth. My audience doesn''t just hear my words - they feel my journey.',
    'published'
  ),
  (
    'blog',  -- Using allowed 'blog' section
    'Building a Personal Brand That Matters',
    'Your personal brand is more than a logo or a tagline - it''s your story in action. Here''s how to build one that truly matters...\n\n## Start With Why\n\nBefore choosing colors or designing business cards, ask yourself: What drives me? What change do I want to create?\n\n## Share Your Journey\n\nYour path, including the stumbles and setbacks, is what makes your story relatable. Don''t hide the journey - showcase it.\n\n## Stay Consistent\n\nConsistency isn''t about posting every day - it''s about maintaining your core message and values in everything you do.',
    'published'
  )
ON CONFLICT DO NOTHING;

-- Insert sample videos
INSERT INTO videos (video_url, caption, status)
VALUES 
  (
    'https://example.com/videos/brand-story.mp4',
    '🎯 How I Built My Personal Brand | 60-Second Strategy',
    'published'
  ),
  (
    'https://example.com/videos/authentic-content.mp4',
    '💡 Creating Content That Connects | Quick Tips',
    'published'
  )
ON CONFLICT DO NOTHING;
