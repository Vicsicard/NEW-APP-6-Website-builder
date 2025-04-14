process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-key';

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => require('./src/app/publishing/tests/mocks/supabase').default
}));
