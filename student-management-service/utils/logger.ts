import winston from 'winston';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'magenta'
};

const ansiColors = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    reset: '\x1b[0m'
};

winston.addColors(colors);

const consoleFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    const ts = typeof timestamp === 'string' ? timestamp.slice(0, 19).replace('T', ' ') : '';
    const metaStr = Object.keys(metadata).length ? `\n${JSON.stringify(metadata, null, 2)}` : '';

    const levelColor = (() => {
        switch (level) {
            case 'error': return `${ansiColors.red}${ansiColors.bold}[${level.toUpperCase()}]${ansiColors.reset}`;
            case 'warn': return `${ansiColors.yellow}${ansiColors.bold}[${level.toUpperCase()}]${ansiColors.reset}`;
            case 'info': return `${ansiColors.green}${ansiColors.bold}[${level.toUpperCase()}]${ansiColors.reset}`;
            case 'http': return `${ansiColors.cyan}${ansiColors.bold}[${level.toUpperCase()}]${ansiColors.reset}`;
            case 'debug': return `${ansiColors.magenta}${ansiColors.bold}[${level.toUpperCase()}]${ansiColors.reset}`;
            default: return `[${level.toUpperCase()}]`;
        }
    })();

    return `${ansiColors.gray}${ts}${ansiColors.reset} ${levelColor}: ${ansiColors.white}${message}${ansiColors.reset}${ansiColors.gray}${metaStr}${ansiColors.reset}`;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                consoleFormat
            )
        })
    ]
});