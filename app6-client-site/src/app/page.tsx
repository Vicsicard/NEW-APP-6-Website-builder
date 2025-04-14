import supabase from './utils/supabaseClient'
import MarkdownContent from './components/MarkdownContent'

export default async function HomePage() {
  const currentYear = new Date().getFullYear()

  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Attempting to fetch profile...')

  // Fetch client profile
  const { data: profile, error: profileError } = await supabase
    .from('client_profile')
    .select('name, email, linkedin_url, twitter_url, instagram_url')
    .single()

  if (profileError) {
    console.error('Profile Error:', profileError)
  } else {
    console.log('Profile Data:', profile)
  }

  console.log('Attempting to fetch bio content...')

  // Fetch bio content
  const { data: bioRecords, error: bioError } = await supabase
    .from('content')
    .select('content')
    .eq('section', 'bio')
    .eq('status', 'published')
    .single()

  if (bioError) {
    console.error('Bio Error:', bioError)
  } else {
    console.log('Bio Data:', bioRecords)
  }

  console.log('Attempting to fetch blog posts...')

  // Fetch blog posts
  const { data: blogPosts, error: blogError } = await supabase
    .from('content')
    .select('title, content')
    .eq('section', 'blog')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(2)

  if (blogError) {
    console.error('Blog Error:', blogError)
  } else {
    console.log('Blog Data:', blogPosts)
  }

  console.log('Attempting to fetch videos...')

  // Fetch videos
  const { data: videoData, error: videoError } = await supabase
    .from('videos')
    .select('video_url, caption')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(2)

  if (videoError) {
    console.error('Video Error:', videoError)
  } else {
    console.log('Video Data:', videoData)
  }

  // Fallback values for profile
  const clientName = profile?.name || 'Jane Doe'
  const clientEmail = profile?.email || 'hello@janedoe.com'
  const socialLinks = {
    linkedin: profile?.linkedin_url || '#',
    twitter: profile?.twitter_url || '#',
    instagram: profile?.instagram_url || '#'
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black text-white text-center py-8">
        <h1 className="text-5xl font-playfair mb-2">{clientName}</h1>
        <p className="text-lg">Storyteller. Strategist. Self Cast Client.</p>
      </header>

      {/* About Section */}
      <section id="about" className="py-16 px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-playfair font-bold mb-6">About Me</h2>
        {bioError ? (
          <p className="text-red-600">Failed to load bio content. Please try again later.</p>
        ) : bioRecords ? (
          <div className="prose prose-lg max-w-none">
            <MarkdownContent content={bioRecords.content} />
          </div>
        ) : (
          <p className="text-gray-600">Loading bio content...</p>
        )}
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold mb-8">Featured Blog Posts</h2>
          {blogError ? (
            <p className="text-red-600">Failed to load blog posts. Please try again later.</p>
          ) : blogPosts?.length ? (
            <div className="space-y-8">
              {blogPosts.map((post, index) => (
                <div key={index} className="blog-post">
                  <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                  <div className="prose prose-gray max-w-none">
                    <MarkdownContent 
                      content={post.content.length > 200 
                        ? `${post.content.slice(0, 200)}...` 
                        : post.content
                      } 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No blog posts available.</p>
          )}
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-16 px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-playfair font-bold mb-8">Shortform Videos</h2>
        {videoError ? (
          <p className="text-red-600">Failed to load videos. Please try again later.</p>
        ) : videoData?.length ? (
          <div className="space-y-8">
            {videoData.map((video, index) => (
              <div key={index} className="video">
                <video 
                  controls 
                  className="w-full rounded-xl shadow-lg"
                  preload="metadata"
                >
                  <source src={video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="mt-2 text-center text-gray-600">{video.caption}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No videos available.</p>
        )}
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-4">Let's Connect</h2>
          <p className="mb-4">Interested in working together or just want to say hi?</p>
          <p className="mb-8">
            Email me at <a href={`mailto:${clientEmail}`} className="text-blue-600 hover:text-blue-800">{clientEmail}</a>
          </p>
          <div className="flex justify-center gap-6">
            {socialLinks.linkedin !== '#' && (
              <>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">LinkedIn</a>
                <span className="text-gray-300">|</span>
              </>
            )}
            {socialLinks.instagram !== '#' && (
              <>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">Instagram</a>
                <span className="text-gray-300">|</span>
              </>
            )}
            {socialLinks.twitter !== '#' && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">Twitter</a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-gray-300 bg-white text-center">
        <p className="text-sm text-gray-600 mb-4">
          Connect with {clientName}
        </p>
        <div className="flex justify-center gap-6 mb-4">
          {socialLinks.linkedin !== '#' && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src="/icons/linkedin.svg" alt="LinkedIn" className="h-6 w-6 hover:opacity-80" />
            </a>
          )}
          {socialLinks.twitter !== '#' && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
              <img src="/icons/twitter.svg" alt="Twitter" className="h-6 w-6 hover:opacity-80" />
            </a>
          )}
          {socialLinks.instagram !== '#' && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="/icons/instagram.svg" alt="Instagram" className="h-6 w-6 hover:opacity-80" />
            </a>
          )}
        </div>
        <p className="text-xs text-gray-400">
          &copy; {currentYear} {clientName}. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
