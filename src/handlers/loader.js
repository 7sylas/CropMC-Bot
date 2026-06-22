import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commandsPath = join(__dirname, '../commands');
  const categories   = readdirSync(commandsPath, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);

  let loaded = 0;
  for (const category of categories) {
    const files = readdirSync(join(commandsPath, category)).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const fp = join(commandsPath, category, file);
      try {
        const mod = await import(`file://${fp}`);
        if (!mod.data || !mod.execute) { logger.warn(`Skipping ${file}`); continue; }
        client.commands.set(mod.data.name, mod);
        logger.debug(`Loaded /${mod.data.name}`);
        loaded++;
      } catch (e) { logger.error(`Failed to load ${file}: ${e.message}`); }
    }
  }
  logger.info(`Commands loaded: ${loaded}`);
}

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const files      = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  let loaded = 0;
  for (const file of files) {
    const fp = join(eventsPath, file);
    try {
      const mod = await import(`file://${fp}`);
      if (!mod.name || !mod.execute) { logger.warn(`Skipping event ${file}`); continue; }
      mod.once
        ? client.once(mod.name, (...a) => mod.execute(...a, client))
        : client.on(mod.name,   (...a) => mod.execute(...a, client));
      logger.debug(`Event: ${mod.name}`);
      loaded++;
    } catch (e) { logger.error(`Failed to load event ${file}: ${e.message}`); }
  }
  logger.info(`Events loaded: ${loaded}`);
}
