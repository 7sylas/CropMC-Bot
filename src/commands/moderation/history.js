import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { getModLogs, getWarnings } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('history')
  .setDescription('View moderation history for a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const user = interaction.options.getUser('user');

  const [logs, warnings] = await Promise.all([
    getModLogs(interaction.guildId, user.id, 15),
    getWarnings(interaction.guildId, user.id),
  ]);

  if (!logs.length && !warnings.length) {
    return ok(interaction, `No moderation history for **${user.username}**`);
  }

  const logLines = logs.map(l => {
    const ts = Math.floor(new Date(l.created_at).getTime() / 1000);
    const dur = l.duration ? ` [${l.duration}]` : '';
    return `\`${l.action}${dur}\` <t:${ts}:R> — ${l.reason ?? 'No reason'} *(${l.mod_tag})*`;
  }).join('\n');

  const warnLine = warnings.length
    ? `\n\n**Warnings:** ${warnings.length}`
    : '';

  return ok(interaction, `**Moderation history for ${user.username}**\n${logLines}${warnLine}`);
}
