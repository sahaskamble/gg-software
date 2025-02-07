import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
type LogDetails = Error | Record<string, any> | null;

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    return path.join(this.logDir, `${format(new Date(), 'yyyy-MM-dd')}.log`);
  }

  private formatMessage(level: LogLevel, message: string, details: LogDetails = null): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${level}: ${message}`;

    if (details) {
      if (details instanceof Error) {
        logMessage += `\nStack: ${details.stack}`;
      } else if (typeof details === 'object') {
        logMessage += `\nDetails: ${JSON.stringify(details, null, 2)}`;
      }
    }

    return logMessage + '\n';
  }

  private async writeToFile(message: string): Promise<void> {
    const filePath = this.getLogFilePath();
    await fs.promises.appendFile(filePath, message, 'utf8');
  }

  private async log(level: LogLevel, message: string, details: LogDetails = null): Promise<void> {
    const formattedMessage = this.formatMessage(level, message, details);
    console.log(formattedMessage);
    await this.writeToFile(formattedMessage);
  }

  public async info(message: string, details: LogDetails = null): Promise<void> {
    await this.log('INFO', message, details);
  }

  public async warn(message: string, details: LogDetails = null): Promise<void> {
    await this.log('WARN', message, details);
  }

  public async error(message: string, details: LogDetails = null): Promise<void> {
    await this.log('ERROR', message, details);
  }

  public async debug(message: string, details: LogDetails = null): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      await this.log('DEBUG', message, details);
    }
  }
}

export const logger = new Logger();
