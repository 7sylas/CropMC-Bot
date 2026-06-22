import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail, dm } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the server')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to kick').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (!target.kickable) return fail(interaction, 'I cannot kick that member.');
  if (target.id === interaction.user.id) return fail(interaction, 'You cannot kick yourself.');

  await dm(target.user, `You were kicked from **${interaction.guild.name}** for **${reason}**`);
  await target.kick(reason);

  await logAction({
    guildId: interaction.guildId,
    action: 'KICK',
    target: { id: target.id, tag: target.user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
  });

  return ok(interaction, `Kicked **${target.user.username}** for **${reason}**`);
}
