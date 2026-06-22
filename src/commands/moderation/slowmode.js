import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { ok, fail } from '../../utils/reply.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Set or remove slowmode in a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption(o =>
    o.setName('duration').setDescription('Slowmode duration (e.g. 5s, 1m) or "off"').setRequired(true)
  )
  .addChannelOption(o =>
    o.setName('channel').setDescription('Target channel (defaults to current)').setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const raw     = interaction.options.getString('duration');
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  if (raw.toLowerCase() === 'off') {
    await channel.setRateLimitPerUser(0);
    return ok(interaction, `Removed slowmode in ${channel}`);
  }

  const secs = Math.floor((ms(raw) ?? 0) / 1000);
  if (!secs || secs < 0) return fail(interaction, `Invalid duration \`${raw}\`. Try \`5s\`, \`30s\`, \`1m\`.`);
  if (secs > 21600) return fail(interaction, 'Maximum slowmode is 6 hours (21600s).');

  await channel.setRateLimitPerUser(secs);
  return ok(interaction, `Set slowmode to **${raw}** in ${channel}`);
}
