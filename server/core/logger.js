// Configures chalk + winston (placeholder)

import chalk from 'chalk';
import winston from 'winston';
import ora from 'ora';

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({format: "Hh:mm:ss"}),
        winston.format.printf(({level, message, timestamp}) => {
            return `[${timestamp}] ${level.toUpperCase()} - ${message}`;
        })
    ),
    transports:[
        new winston.transports.Console({
            handleExceptions: true,
        }),
    ],
});

import { mkdirSync } from 'fs';
mkdirSync('logs', { recursive: true });


export const logInfo = (msg) => {
    logger.info(chalk.cyanBright(msg));
}

export const logWarn = (msg) => {
    logger.warn(chalk.yellowBright(msg));
}

export const logError = (msg) => {
    logger.error(chalk.redBright(msg));
  };
  
  export const logSuccess = (msg) => {
    logger.info(chalk.greenBright(msg));
  };

export const createSpinner = (text) => ora({text, spinner: 'dots', color: 'red'});



export default logger;


