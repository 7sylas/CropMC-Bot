import chalk from 'chalk';
import logger from '../utils/logger.js';

export const name = 'ready';
export const once = true;

export function execute(client) {
  logger.info(`Logged in as ${chalk.bold.cyan(client.user.tag)}`);
  logger.info(`Serving ${chalk.bold(client.guilds.cache.size)} guild(s)`);

  client.user.setPresence({
    status: 'online',
    activities: [{ name: 'CropMC', type: 0 }],
  });
}
