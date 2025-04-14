import { ErrorLogger } from '../utils/errorLogger';
import { join } from 'path';
import { readFileSync, unlinkSync, existsSync } from 'fs';

describe('ErrorLogger', () => {
  const testDir = join(__dirname, 'test_logs');
  let logger: ErrorLogger;

  beforeEach(() => {
    logger = new ErrorLogger(testDir);
  });

  afterEach(() => {
    const logPath = join(testDir, 'logs', 'publishing_errors.log');
    if (existsSync(logPath)) {
      unlinkSync(logPath);
    }
  });

  it('logs errors correctly', () => {
    const testError = {
      timestamp: '2025-04-14T16:37:48.000Z',
      content_id: 'test123',
      platform: 'blog',
      error: 'Test error message',
      section: 'blog',
      title: 'Test Blog Post',
      retry_count: 0
    };

    logger.logError(testError);

    const logPath = join(testDir, 'logs', 'publishing_errors.log');
    const logContent = readFileSync(logPath, 'utf-8');
    const loggedError = JSON.parse(logContent);

    expect(loggedError).toEqual(testError);
  });

  it('formats error objects correctly', () => {
    const error = new Error('Test error');
    const formatted = ErrorLogger.formatError(error);
    expect(formatted).toBe('Test error');

    const stringError = 'String error';
    const formattedString = ErrorLogger.formatError(stringError);
    expect(formattedString).toBe('String error');
  });
});
