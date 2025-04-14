import { jest } from '@jest/globals';
import { ContentPublisher } from '../publisher';
import { ContentItem } from '../types';
import { join } from 'path';
import { mockSupabase } from './mocks/supabase';
import type { MockSupabaseResponse } from './mocks/supabase';

// Mock unified and its plugins
jest.mock('unified', () => ({
  unified: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
    process: jest.fn().mockImplementation(() => Promise.resolve('Processed Markdown'))
  })
}));

jest.mock('remark-parse', () => jest.fn());
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-html', () => jest.fn());

const mockFsData = {
  files: new Map<string, string>()
};

jest.mock('fs', () => {
  const writeFileSync = jest.fn().mockImplementation((...args: unknown[]) => {
    const [path, content] = args;
    mockFsData.files.set(String(path), String(content));
  });

  const appendFileSync = jest.fn().mockImplementation((...args: unknown[]) => {
    const [path, content] = args;
    const existingContent = mockFsData.files.get(String(path)) || '';
    mockFsData.files.set(String(path), existingContent + String(content));
  });

  const mkdirSync = jest.fn();
  const rmSync = jest.fn();

  return {
    writeFileSync,
    appendFileSync,
    mkdirSync,
    rmSync,
    promises: {
      writeFile: jest.fn(),
      readFile: jest.fn()
    },
    readFileSync: jest.fn().mockImplementation((...args: unknown[]) => {
      const [path] = args;
      const pathStr = String(path);
      if (pathStr.includes('base.html')) {
        return '<!DOCTYPE html><html><body>{{content}}</body></html>';
      }
      return mockFsData.files.get(pathStr) || '';
    }),
    existsSync: jest.fn().mockImplementation((...args: unknown[]) => {
      const [path] = args;
      const pathStr = String(path);
      if (pathStr.includes('published_index.json')) {
        return true;
      }
      return mockFsData.files.has(pathStr);
    })
  };
});

const mockFs = jest.mocked(require('fs'));

describe('ContentPublisher', () => {
  let publisher: ContentPublisher;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFsData.files.clear();
    publisher = new ContentPublisher('test-run-123', join(__dirname, 'test_output'), { includeRetry: false });
    mockSupabase.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockItems: ContentItem[] = [
    {
      id: '1',
      title: 'Test Blog Post',
      content: '# Test Content\n\nThis is a test blog post.',
      section: 'blog',
      status: 'approved',
      platforms: ['blog'],
      tags: ['test'],
      retry: false,
      user_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      publish_metadata: {
        schedule: undefined,
        lastRunId: undefined,
        storagePath: undefined,
        retries: 0
      }
    },
    {
      id: '2',
      title: 'About Me',
      content: '# About\n\nThis is my bio.',
      section: 'bio',
      status: 'approved',
      platforms: ['website'],
      tags: ['bio'],
      retry: false,
      user_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      publish_metadata: {
        schedule: undefined,
        lastRunId: undefined,
        storagePath: undefined,
        retries: 0
      }
    }
  ];

  it('publishes blog post and website content', async () => {
    await publisher.publishBatch(mockItems);
    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(5);
  });

  it('skips already published content', async () => {
    const publishedItems = mockItems.map(item => ({
      ...item,
      status: 'published' as const
    }));

    await publisher.publishBatch(publishedItems);
    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('defers future content', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const futureItems = mockItems.map(item => ({
      ...item,
      publish_metadata: {
        ...item.publish_metadata,
        schedule: futureDate.toISOString()
      }
    }));

    await publisher.publishBatch(futureItems);
    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('should handle retries when includeRetry is true', async () => {
    publisher = new ContentPublisher('test-run-123', join(__dirname, 'test_output'), { includeRetry: true });
    mockSupabase.mockRetryItems([{
      id: '2',
      title: 'Failed Content',
      content: '# Failed Content',
      section: 'blog',
      status: 'failed',
      platforms: ['website'],
      publish_metadata: { retries: 1 },
      tags: [],
      retry: true,
      user_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as ContentItem]);

    await publisher.publishBatch(mockItems);

    const manifest = publisher.getManifest();
    expect(manifest.totalItems).toBe(3);
    expect(manifest.retryCount).toBe(1);
    expect(manifest.successCount).toBe(3);
    expect(manifest.failureCount).toBe(0);

    // Verify that retry item was published
    const retryResult = manifest.results.find(r => r.contentId === '2');
    expect(retryResult?.status).toBe('success');
  });

  it('should clear error state on successful retry', async () => {
    publisher = new ContentPublisher('test-run-123', join(__dirname, 'test_output'), { includeRetry: true });

    const retryItem: ContentItem = {
      id: '1',
      title: 'Failed Content',
      content: '# Failed Content',
      section: 'blog',
      status: 'failed',
      platforms: ['website'],
      publish_metadata: {
        retries: 1,
        last_error: 'Previous error'
      },
      tags: [],
      retry: true,
      user_id: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockSupabase.mockRetryItems([retryItem]);
    await publisher.publishBatch(mockItems);

    const manifest = publisher.getManifest();
    expect(manifest.totalItems).toBe(3);
    expect(manifest.retryCount).toBe(1);
    expect(manifest.successCount).toBe(3);

    // Verify content was updated correctly
    const response = await mockSupabase.from('content').select('*').eq('id', '1') as MockSupabaseResponse<ContentItem[]>;
    if (!response?.data?.[0]) {
      throw new Error('Failed to get updated content');
    }

    const updatedContent = response.data[0];
    expect(updatedContent.status).toBe('published');
    expect(updatedContent.retry).toBe(false);
    expect(updatedContent.publish_metadata.last_error).toBeUndefined();
  });
});
