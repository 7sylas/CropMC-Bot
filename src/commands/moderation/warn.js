import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail, dm } from '../../utils/reply.js';
import { addWarning, getWarnings } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Issue a warning to a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to warn').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const reason = interaction.options.getString('reason');

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (target.id === interaction.user.id) return fail(interaction, 'You cannot warn yourself.');

  await addWarning({
    guildId: interaction.guildId,
    userId: target.id,
    userTag: target.user.username,
    modId: interaction.user.id,
    modTag: interaction.user.username,
    reason,
  });

  const warnings = await getWarnings(interaction.guildId, target.id);
  await dm(target.user, `You were warned in **${interaction.guild.name}** for **${reason}** (warning #${warnings.length})`);

  return ok(interaction, `Warned **${target.user.username}** for **${reason}** — they now have **${warnings.length}** warning(s)`);
}
