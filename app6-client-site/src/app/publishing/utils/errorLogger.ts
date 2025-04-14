import { appendFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

export interface PublishingError {
  timestamp: string;
  content_id: string;
  platform: string;
  error: string;
  section?: string;
  title?: string;
  retries?: number;
}

export class ErrorLogger {
  private logPath: string;

  constructor(basePath: string) {
    this.logPath = join(basePath, 'logs', 'publishing_errors.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const dir = dirname(this.logPath);
    mkdirSync(dir, { recursive: true });
  }

  logError(error: PublishingError): void {
    const logEntry = JSON.stringify({
      ...error,
      timestamp: error.timestamp || new Date().toISOString()
    }, null, 2);

    try {
      appendFileSync(this.logPath, logEntry + '\n');
    } catch (err) {
      console.error('Failed to write to error log:', err);
    }
  }

  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
