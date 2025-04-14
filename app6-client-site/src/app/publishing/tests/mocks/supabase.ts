import { ContentItem, PublishMetadata } from '../../types';
import { SupabaseClient } from '@supabase/supabase-js';

interface MockData {
  content: Record<string, ContentItem>;
  retryItems: ContentItem[];
  storage: Record<string, string>;
}

interface MockError extends Error {
  code: number;
}

export interface MockSupabaseResponse<T = any> {
  data: T | null;
  error: MockError | null;
}

const mockData: MockData = {
  content: {},
  retryItems: [],
  storage: {
    'published_index.json': JSON.stringify([])
  }
};

const createMockError = (message: string, code: number): MockError => {
  const error = new Error(message) as MockError;
  error.code = code;
  return error;
};

const mockSupabase = {
  from: (table: string) => {
    if (table === 'content') {
      return {
        select: (columns?: string) => ({
          eq: (field: keyof ContentItem, value: any) => {
            const query = {
              field,
              value,
              conditions: [] as { field: keyof ContentItem; value: any }[],
              eq: function(field: keyof ContentItem, value: any) {
                this.conditions.push({ field, value });
                return this;
              },
              single: function(): Promise<MockSupabaseResponse<ContentItem | null>> {
                const results = Object.values(mockData.content).filter(item => {
                  return this.checkConditions(item, this.field, this.value, this.conditions);
                });
                return Promise.resolve({
                  data: results[0] || null,
                  error: null
                });
              },
              then: function(resolve: (value: MockSupabaseResponse<ContentItem[]>) => void) {
                const results = Object.values(mockData.content).filter(item => {
                  return this.checkConditions(item, this.field, this.value, this.conditions);
                });

                if (field === 'status' && value === 'failed' && this.conditions.some(c => c.field === 'retry' && c.value === true)) {
                  resolve({
                    data: mockData.retryItems,
                    error: null
                  });
                  return;
                }

                resolve({
                  data: results,
                  error: null
                });
              },
              checkConditions: function(item: ContentItem, mainField: keyof ContentItem, mainValue: any, conditions: { field: keyof ContentItem; value: any }[]): boolean {
                const checkField = (field: keyof ContentItem, value: any): boolean => {
                  switch (field) {
                    case 'id':
                    case 'status':
                    case 'retry':
                      return item[field] === value;
                    case 'publish_metadata':
                      return item.publish_metadata && Object.entries(value as Partial<PublishMetadata>).every(([k, v]) => 
                        item.publish_metadata[k as keyof PublishMetadata] === v
                      );
                    default:
                      return false;
                  }
                };

                return checkField(mainField, mainValue) && conditions.every(c => checkField(c.field, c.value));
              }
            };
            return query;
          }
        }),
        upsert: (items: ContentItem[]) => {
          items.forEach(item => {
            mockData.content[item.id] = item;
          });
          return Promise.resolve({
            data: items,
            error: null
          });
        },
        update: (data: Partial<ContentItem>) => ({
          eq: (field: keyof ContentItem, value: any) => {
            if (field === 'id') {
              const item = mockData.content[value];
              if (item) {
                const updatedItem = {
                  ...item,
                  ...data,
                  publish_metadata: {
                    ...item.publish_metadata,
                    ...(data.publish_metadata || {})
                  }
                };
                mockData.content[value] = updatedItem;
                return Promise.resolve({
                  data: [updatedItem],
                  error: null
                });
              }
            }
            return Promise.resolve({
              data: [],
              error: null
            });
          }
        })
      };
    }
    throw new Error(`Table ${table} not implemented in mock`);
  },

  storage: {
    from: (bucket: string) => ({
      upload: (path: string, content: string): Promise<MockSupabaseResponse<{ path: string }>> => {
        mockData.storage[path] = content;
        return Promise.resolve({
          data: { path },
          error: null
        });
      },
      download: async (path: string): Promise<MockSupabaseResponse<Blob>> => {
        const content = mockData.storage[path] || '[]';
        const blob = new Blob([content], { type: 'application/json' });
        return {
          data: blob,
          error: null
        };
      },
      getPublicUrl: (path: string): MockSupabaseResponse<{ publicUrl: string }> => {
        return {
          data: { publicUrl: `https://mock-storage/${path}` },
          error: null
        };
      }
    })
  },

  mockRetryItems: (items: ContentItem[]) => {
    mockData.retryItems = items;
    items.forEach(item => {
      mockData.content[item.id] = item;
    });
  },

  reset: () => {
    mockData.content = {};
    mockData.retryItems = [];
    mockData.storage = {
      'published_index.json': JSON.stringify([])
    };
  }
};

export { mockSupabase };

export default mockSupabase as unknown as SupabaseClient;
