import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import chalk from 'chalk';
import logger from './utils/logger.js';
import { loadCommands, loadEvents } from './handlers/loader.js';

for (const key of ['DISCORD_TOKEN', 'CLIENT_ID', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY']) {
  if (!process.env[key]) {
    logger.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();

async function main() {
  console.log(chalk.bold.green('\n  CropMC Bot  🌾\n'));

  await loadEvents(client);
  await loadCommands(client);
  await client.login(process.env.DISCORD_TOKEN);
}

process.on('unhandledRejection', (r) => logger.error(`Unhandled rejection: ${r?.stack ?? r}`));
process.on('uncaughtException',  (e) => { logger.error(`Uncaught exception: ${e.stack}`); process.exit(1); });

main().catch((e) => { logger.error(`Startup error: ${e.message}`); process.exit(1); });
