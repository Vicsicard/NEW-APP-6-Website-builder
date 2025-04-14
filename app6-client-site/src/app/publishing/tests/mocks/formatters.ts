import { jest } from '@jest/globals';

export const formatBlogPost = jest.fn().mockImplementation((content) => ({
  html: `<article>${content}</article>`,
  metadata: {
    title: 'Test Blog Post',
    description: 'A test blog post',
    date: new Date().toISOString()
  }
}));

export const formatWebsiteContent = jest.fn().mockImplementation((content) => ({
  html: `<div>${content}</div>`,
  metadata: {
    title: 'Test Page',
    description: 'A test page'
  }
}));
