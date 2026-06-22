import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok } from '../../utils/reply.js';
import { getWarnings } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get information about a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to look up').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const member = interaction.options.getMember('user') ?? interaction.member;
  const user   = member.user;

  const joinedAt  = Math.floor(member.joinedTimestamp / 1000);
  const createdAt = Math.floor(user.createdTimestamp / 1000);
  const warnings  = await getWarnings(interaction.guildId, user.id);
  const roles     = member.roles.cache
    .filter(r => r.id !== interaction.guildId)
    .sort((a, b) => b.position - a.position)
    .map(r => r.name)
    .slice(0, 8)
    .join(', ') || 'None';

  const muted    = member.communicationDisabledUntil
    ? `<t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:R>`
    : 'No';

  const lines = [
    `**${user.username}** \`${user.id}\``,
    `Account created: <t:${createdAt}:R>`,
    `Joined server: <t:${joinedAt}:R>`,
    `Roles: ${roles}`,
    `Warnings: ${warnings.length}`,
    `Muted: ${muted}`,
  ];

  return ok(interaction, lines.join('\n'));
}
