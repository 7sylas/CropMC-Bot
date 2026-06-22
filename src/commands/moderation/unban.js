import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a user by their ID')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addStringOption(o => o.setName('user_id').setDescription('User ID to unban').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const userId = interaction.options.getString('user_id');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
  if (!ban) return fail(interaction, `No ban found for user ID \`${userId}\`.`);

  await interaction.guild.members.unban(userId, reason);

  await logAction({
    guildId: interaction.guildId,
    action: 'UNBAN',
    target: { id: ban.user.id, tag: ban.user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
  });

  return ok(interaction, `Unbanned **${ban.user.username}** for **${reason}**`);
}
