import winston from 'winston';

/**
 * Default logger for the app
 */
class Logger {
    constructor(filename) {
        this.filename = filename.substring(filename.lastIndexOf('/') + 1);

        const consoleTransport = new winston.transports.Console({
            stderrLevels: ['error', 'debug'],
        });

        this.logger = winston.createLogger({
            level: 'verbose',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS',
                }),
                winston.format.align(),
                winston.format.printf((info) => {
                    const {
                        timestamp, level, functionName, message, ...args
                    } = info;

                    const ts = timestamp.replace('T', ' ');

                    if (args && Object.keys(args).length > 0) {
                        return `${ts} [${level.padStart(17)}] [${this.filename.padStart(25)}] ${message}  ==> ${JSON.stringify(args)}`;
                    }
                    return `${ts} [${level.padStart(17)}] [${this.filename.padStart(25)}] ${message}`;
                }),
            ),
            transports: [consoleTransport],
        });
    }
    verbose(message, data) {
        this.logger.verbose(`${message} ${data ? `==> ${JSON.stringify(data)}` : ''}`);
    };
    info(message, data) {
        this.logger.info(`${message} ${data ? `==> ${JSON.stringify(data)}` : ''}`);
    };
    warn(message, data) {
        this.logger.warn(`${message} ${data ? `==> ${JSON.stringify(data)}` : ''}`);
    };
    error(message, data) {
        this.logger.error(`${message} ${data ? `==> ${JSON.stringify(data)}` : ''}`);
    };
}

export default Logger;