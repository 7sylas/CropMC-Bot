import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send an announcement message to a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption(o => o.setName('message').setDescription('The announcement message').setRequired(true))
  .addChannelOption(o => o.setName('channel').setDescription('Channel to send to (defaults to current)').setRequired(false))
  .addBooleanOption(o => o.setName('ping_everyone').setDescription('Ping @everyone').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const message  = interaction.options.getString('message');
  const channel  = interaction.options.getChannel('channel') ?? interaction.channel;
  const ping     = interaction.options.getBoolean('ping_everyone') ?? false;

  try {
    const content = ping ? `@everyone\n${message}` : message;
    await channel.send({ content, allowedMentions: { parse: ping ? ['everyone'] : [] } });
    return ok(interaction, `Announcement sent to ${channel}`);
  } catch (err) {
    return fail(interaction, `Failed to send: ${err.message}`);
  }
}
