import { ok, fail } from '../utils/reply.js';
import logger from '../utils/logger.js';

export const name = 'interactionCreate';

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
    logger.debug(`/${interaction.commandName} by ${interaction.user.username}`);
  } catch (err) {
    logger.error(`Error in /${interaction.commandName}: ${err.message}`);
    await fail(interaction, 'Something went wrong. Try again.');
  }
}
