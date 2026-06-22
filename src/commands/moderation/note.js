import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { addNote, getNotes } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('note')
  .setDescription('Add or view staff notes on a member (never shown to the member)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(s =>
    s.setName('add')
      .setDescription('Add a note to a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
      .addStringOption(o => o.setName('text').setDescription('Note content').setRequired(true))
  )
  .addSubcommand(s =>
    s.setName('view')
      .setDescription('View all notes on a member')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const sub  = interaction.options.getSubcommand();
  const user = interaction.options.getUser('user');

  if (sub === 'add') {
    const text = interaction.options.getString('text');
    await addNote({
      guildId: interaction.guildId,
      userId: user.id, userTag: user.username,
      modId: interaction.user.id, modTag: interaction.user.username,
      note: text,
    });
    return ok(interaction, `Note added for **${user.username}**`);
  }

  if (sub === 'view') {
    const notes = await getNotes(interaction.guildId, user.id);
    if (!notes.length) return ok(interaction, `No notes for **${user.username}**`);
    const lines = notes.map(n =>
      `\`#${n.id}\` <t:${Math.floor(new Date(n.created_at).getTime()/1000)}:R> — ${n.note} *(${n.mod_tag})*`
    ).join('\n');
    return ok(interaction, `**Notes for ${user.username}:**\n${lines}`);
  }
}
