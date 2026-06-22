import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail, dm } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

// Softban = ban + immediate unban, used to purge messages without permanently banning
export const data = new SlashCommandBuilder()
  .setName('softban')
  .setDescription('Kick a member and delete their recent messages')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to softban').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (!target.bannable) return fail(interaction, 'I cannot ban that member.');

  await dm(target.user, `You were kicked from **${interaction.guild.name}** for **${reason}**`);
  await interaction.guild.members.ban(target.id, { reason, deleteMessageDays: 7 });
  await interaction.guild.members.unban(target.id, 'Softban — auto-unban');

  await logAction({
    guildId: interaction.guildId,
    action: 'SOFTBAN',
    target: { id: target.id, tag: target.user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
  });

  return ok(interaction, `Softbanned **${target.user.username}** for **${reason}**`);
}
