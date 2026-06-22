import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail, dm } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to ban').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
  .addIntegerOption(o =>
    o.setName('delete_days').setDescription('Days of messages to delete (0–7)').setMinValue(0).setMaxValue(7)
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const user   = target?.user ?? interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const days   = interaction.options.getInteger('delete_days') ?? 0;

  if (!user) return fail(interaction, 'Could not resolve that user.');
  if (target && !target.bannable) return fail(interaction, 'I cannot ban that member.');
  if (user.id === interaction.user.id) return fail(interaction, 'You cannot ban yourself.');

  await dm(user, `You were banned from **${interaction.guild.name}** for **${reason}**`);
  await interaction.guild.members.ban(user.id, { reason, deleteMessageDays: days });

  await logAction({
    guildId: interaction.guildId,
    action: 'BAN',
    target: { id: user.id, tag: user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
  });

  return ok(interaction, `Banned **${user.username}** for **${reason}**`);
}
