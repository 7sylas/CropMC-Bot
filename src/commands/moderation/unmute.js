import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Remove a timeout from a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to unmute').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (!target.communicationDisabledUntil) return fail(interaction, 'That member is not muted.');

  await target.timeout(null, reason);

  await logAction({
    guildId: interaction.guildId,
    action: 'UNMUTE',
    target: { id: target.id, tag: target.user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
  });

  return ok(interaction, `Unmuted **${target.user.username}**`);
}
