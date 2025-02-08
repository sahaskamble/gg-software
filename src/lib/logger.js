import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

class Logger {
  logDirg;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFilePath() {
    return path.join(this.logDir, `${format(new Date(), 'yyyy-MM-dd')}.log`);
  }

  formatMessage(level, message, details = null) {
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

  async writeToFile(message) {
    const filePath = this.getLogFilePath();
    await fs.promises.appendFile(filePath, message, 'utf8');
  }

  async log(level, message, details = null) {
    const formattedMessage = this.formatMessage(level, message, details);
    console.log(formattedMessage);
    await this.writeToFile(formattedMessage);
  }

  async info(message, details = null) {
    await this.log('INFO', message, details);
  }

  async warn(message, details = null) {
    await this.log('WARN', message, details);
  }

  async error(message, details = null) {
    await this.log('ERROR', message, details);
  }

  async debug(message, details = null) {
    if (process.env.NODE_ENV !== 'production') {
      await this.log('DEBUG', message, details);
    }
  }
}

export const logger = new Logger();
