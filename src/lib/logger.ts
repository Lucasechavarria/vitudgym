type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
    [key: string]: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private formatMessage(level: LogLevel, message: string, data?: LogData): string {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
    }

    info(message: string, data?: LogData): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('info', message, data));
        }
    }

    warn(message: string, data?: LogData): void {
        console.warn(this.formatMessage('warn', message, data));
    }

    error(message: string, data?: LogData): void {
        console.error(this.formatMessage('error', message, data));
    }

    debug(message: string, data?: LogData): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, data));
        }
    }
}

export const logger = new Logger();
