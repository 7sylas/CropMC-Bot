import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { getWarnings, deleteWarning, clearWarnings } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('Manage warnings for a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(s =>
    s.setName('list')
      .setDescription('List all warnings for a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
  )
  .addSubcommand(s =>
    s.setName('remove')
      .setDescription('Remove a specific warning by ID')
      .addIntegerOption(o => o.setName('id').setDescription('Warning ID').setRequired(true))
  )
  .addSubcommand(s =>
    s.setName('clear')
      .setDescription('Clear all warnings for a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
  );

export async function execute(interaction) {
  await interaction.deferReply();
  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    const user     = interaction.options.getUser('user');
    const warnings = await getWarnings(interaction.guildId, user.id);
    if (!warnings.length) return ok(interaction, `**${user.username}** has no warnings.`);

    const lines = warnings.map((w, i) =>
      `\`#${w.id}\` · ${w.reason} — <@${w.mod_id}> <t:${Math.floor(new Date(w.created_at).getTime()/1000)}:R>`
    ).join('\n');

    return ok(interaction, `**${user.username}** has **${warnings.length}** warning(s):\n${lines}`);
  }

  if (sub === 'remove') {
    const id      = interaction.options.getInteger('id');
    const success = await deleteWarning(id);
    return success
      ? ok(interaction, `Removed warning \`#${id}\``)
      : fail(interaction, `No warning found with ID \`#${id}\`.`);
  }

  if (sub === 'clear') {
    const user    = interaction.options.getUser('user');
    const success = await clearWarnings(interaction.guildId, user.id);
    return success
      ? ok(interaction, `Cleared all warnings for **${user.username}**`)
      : fail(interaction, 'Failed to clear warnings.');
  }
}
