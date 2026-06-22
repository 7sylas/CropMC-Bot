import winston from 'winston';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { combine, timestamp, printf, errors } = winston.format;

const levelColors = {
  error: chalk.red.bold,
  warn:  chalk.yellow.bold,
  info:  chalk.cyan,
  debug: chalk.gray,
};

const icons = {
  error: '✖',
  warn:  '⚠',
  info:  '●',
  debug: '○',
};

const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const color  = levelColors[level] ?? chalk.white;
  const icon   = icons[level] ?? '·';
  const time   = chalk.dim(new Date(ts).toLocaleTimeString('en-US', { hour12: false }));
  const tag    = color(`${icon} ${level.toUpperCase().padEnd(5)}`);
  const body   = stack ?? message;
  return `${time}  ${tag}  ${body}`;
});

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), consoleFormat),
    }),
    new winston.transports.File({
      filename: join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: join(__dirname, '../../logs/combined.log'),
      format: fileFormat,
    }),
  ],
});

export default logger;
