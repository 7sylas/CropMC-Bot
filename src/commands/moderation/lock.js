import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock or unlock a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addSubcommand(s =>
    s.setName('on').setDescription('Lock the channel — members cannot send messages')
      .addChannelOption(o => o.setName('channel').setDescription('Channel to lock').setRequired(false))
  )
  .addSubcommand(s =>
    s.setName('off').setDescription('Unlock the channel')
      .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').setRequired(false))
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const sub     = interaction.options.getSubcommand();
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  const role    = interaction.guild.roles.everyone;

  try {
    if (sub === 'on') {
      await channel.permissionOverwrites.edit(role, { SendMessages: false });
      return ok(interaction, `Locked ${channel}`);
    } else {
      await channel.permissionOverwrites.edit(role, { SendMessages: null });
      return ok(interaction, `Unlocked ${channel}`);
    }
  } catch (err) {
    return fail(interaction, `Failed to ${sub === 'on' ? 'lock' : 'unlock'} ${channel}: ${err.message}`);
  }
}
