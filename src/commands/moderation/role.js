import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Add or remove a role from a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand(s =>
    s.setName('add')
      .setDescription('Give a role to a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role to add').setRequired(true))
  )
  .addSubcommand(s =>
    s.setName('remove')
      .setDescription('Remove a role from a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const sub    = interaction.options.getSubcommand();
  const target = interaction.options.getMember('user');
  const role   = interaction.options.getRole('role');

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (role.managed) return fail(interaction, 'That role is managed by an integration and cannot be assigned manually.');
  if (role.position >= interaction.guild.members.me.roles.highest.position) {
    return fail(interaction, 'That role is higher than or equal to my highest role.');
  }

  try {
    if (sub === 'add') {
      if (target.roles.cache.has(role.id)) return fail(interaction, `**${target.user.username}** already has that role.`);
      await target.roles.add(role);
      await logAction({ guildId: interaction.guildId, action: 'ROLE_ADD',
        target: { id: target.id, tag: target.user.username },
        mod: { id: interaction.user.id, tag: interaction.user.username }, reason: `Added ${role.name}` });
      return ok(interaction, `Added **${role.name}** to **${target.user.username}**`);
    } else {
      if (!target.roles.cache.has(role.id)) return fail(interaction, `**${target.user.username}** doesn't have that role.`);
      await target.roles.remove(role);
      await logAction({ guildId: interaction.guildId, action: 'ROLE_REMOVE',
        target: { id: target.id, tag: target.user.username },
        mod: { id: interaction.user.id, tag: interaction.user.username }, reason: `Removed ${role.name}` });
      return ok(interaction, `Removed **${role.name}** from **${target.user.username}**`);
    }
  } catch (err) {
    return fail(interaction, `Failed: ${err.message}`);
  }
}
