import 'dotenv/config';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error(chalk.red('✖  Missing DISCORD_TOKEN or CLIENT_ID'));
  process.exit(1);
}

const commands = [];
const commandsPath = join(__dirname, 'commands');
const categories   = readdirSync(commandsPath, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

for (const cat of categories) {
  const files = readdirSync(join(commandsPath, cat)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const { data } = await import(`file://${join(commandsPath, cat, file)}`);
    if (data) {
      commands.push(data.toJSON());
      console.log(chalk.dim(`  + /${data.name}`));
    }
  }
}

const rest  = new REST().setToken(DISCORD_TOKEN);
const route = GUILD_ID
  ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
  : Routes.applicationCommands(CLIENT_ID);

console.log(chalk.cyan(`\nDeploying ${commands.length} command(s)…`));
try {
  const result = await rest.put(route, { body: commands });
  console.log(chalk.green(`✓  Deployed ${result.length} command(s) ${GUILD_ID ? '(guild-scoped)' : '(global)'}\n`));
} catch (e) {
  console.error(chalk.red('✖  Deploy failed:'), e.message);
  process.exit(1);
}
