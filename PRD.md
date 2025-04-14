SELF CAST STUDIOS – APP 6: SINGLE-PAGE WEBSITE BUILDER (FINAL)

Module 6 of 7 → A Next.js + Tailwind CSS web app that renders a single-page personal brand site from published content in Supabase. No multi-page logic, no Python references, no advanced route expansions.

🎯 Purpose

App 6 pulls published text and video content from Supabase (approved in App 5) and generates a single-page personal brand website. This site highlights the client’s Bio/About, short-form videos, and featured blog content.

🎨 Tech Stack

Next.js (App Router) for rendering

Tailwind CSS for styling

Supabase for data storage & retrieval

react-markdown + remark-gfm for optional markdown parsing

Deployed on Vercel

No mention of Python or multi-page routes.

📦 Content Flow & Sources

Apps 3 & 4

App 3 (Content Generators): Produces blog posts, bios (About), or other text-based content in .md format, stored in Supabase with status='draft'. App 5 client dashboard can then approve → 'published'.

App 4 (Shortform Video): (Future or partial) Produces short videos stored in videos table with status='published'.

App 5 (Client Dashboard)

Client reviews & approves content → 'published'

Only 'published' content is displayed by App 6

Supabase

content table: textual items (blog, bio)

Fields used: section, title, content, status, user_id

Filter: status='published' and user_id=[client_id]

videos table: shortform .mp4 or .webm

Fields used: video_url, caption, status, user_id

Filter: status='published' and user_id=[client_id]

📄 Single-Page HTML Template

Below is the exact HTML code used for the site’s single page:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Self Cast Client Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      font-family: 'Playfair Display', serif;
      background-color: #ffffff;
      color: #111;
    }
    header, footer {
      background-color: #000;
      color: #fff;
      text-align: center;
      padding: 2rem 1rem;
    }
    nav {
      margin-top: 0.5rem;
    }
    nav a {
      color: #fff;
      margin: 0 1rem;
      text-decoration: none;
      font-weight: bold;
    }
    section {
      padding: 4rem 2rem;
      max-width: 900px;
      margin: auto;
    }
    h1, h2 {
      font-weight: 700;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    h2 {
      font-size: 2rem;
      margin-top: 2rem;
    }
    .blog-post, .video {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #ddd;
    }
    .video video {
      width: 100%;
      border-radius: 12px;
    }
    .contact {
      background-color: #f9f9f9;
      padding: 3rem 2rem;
      text-align: center;
      border-radius: 12px;
    }
    .contact a {
      color: #000;
      text-decoration: underline;
    }
    footer p {
      font-size: 0.9rem;
      color: #aaa;
    }
    .socials a {
      margin: 0 0.5rem;
      color: #aaa;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <header>
    <h1>Jane Doe</h1>
    <p>Storyteller. Strategist. Self Cast Client.</p>
  </header>

  <section id="about">
    <h2>About Me</h2>
    <p>
      I'm a seasoned brand strategist with a passion for helping people shape the narrative of their lives.
      My work blends creativity, clarity, and purpose — helping audiences connect deeply and take action.
    </p>
    <p>
      Through Self Cast Studios, I’ve embraced the power of intentional storytelling, grounded in lived experience and strategic visibility.
    </p>
  </section>

  <section id="blog">
    <h2>Featured Blog Posts</h2>
    <div class="blog-post">
      <h3>The Moment I Took Back My Story</h3>
      <p>After years of following someone else's script, I finally stepped into the lead role of my own narrative...</p>
    </div>
    <div class="blog-post">
      <h3>From Setback to Spotlight</h3>
      <p>We don’t grow in the light — we grow in the shadows. Here's what I learned when the spotlight turned away...</p>
    </div>
  </section>

  <section id="videos">
    <h2>Shortform Videos</h2>
    <div class="video">
      <video controls src="videos/highlight1.mp4"></video>
      <p>🔥 30-second reel about purpose-driven pivots</p>
    </div>
    <div class="video">
      <video controls src="videos/highlight2.mp4"></video>
      <p>💬 Quick insight into personal branding from lived experience</p>
    </div>
  </section>

  <section id="contact" class="contact">
    <h2>Let’s Connect</h2>
    <p>Interested in working together or just want to say hi?</p>
    <p>Email me at <a href="mailto:hello@janedoe.com">hello@janedoe.com</a></p>
    <div class="socials">
      <a href="#">LinkedIn</a> |
      <a href="#">Instagram</a> |
      <a href="#">Twitter</a>
    </div>
  </section>

  <footer class="mt-16 px-6 py-8 border-t border-gray-300 bg-white text-center">
    <p class="text-sm text-gray-600 mb-4">
      Connect with {{client_name}}
    </p>
    <div class="flex justify-center gap-6 mb-4">
      <a href="{{linkedin_url}}" target="_blank" aria-label="LinkedIn">
        <img src="/icons/linkedin.svg" alt="LinkedIn" class="h-6 w-6 hover:opacity-80" />
      </a>
      <a href="{{twitter_url}}" target="_blank" aria-label="Twitter/X">
        <img src="/icons/twitter.svg" alt="Twitter" class="h-6 w-6 hover:opacity-80" />
      </a>
      <a href="{{instagram_url}}" target="_blank" aria-label="Instagram">
        <img src="/icons/instagram.svg" alt="Instagram" class="h-6 w-6 hover:opacity-80" />
      </a>
    </div>
    <p class="text-xs text-gray-400">
      &copy; {{current_year}} {{client_name}}. All rights reserved.
    </p>
  </footer>

</body>
</html>

 Implementation Plan

Next.js + Tailwind Setup: No mention of Python or multi-page routes.

Supabase Integration: Load bio (for About), blog (for Featured Posts), video (for shortform reels) from content and videos tables.

No Additional Pages: Single-page site only.

Deployed to Vercel with environment variables for Supabase.

Clerk used only in App 5, not in App 6.

✅ Success Criteria

Single-page site with sections mapped to bio, blog, video content.

All code in Next.js + Tailwind, no Python.

Real-time fetch from Supabase with status='published'.

Simple, mobile-friendly layout matches the provided HTML design.