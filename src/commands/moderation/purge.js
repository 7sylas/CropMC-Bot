import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Bulk delete messages from a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(o =>
    o.setName('amount').setDescription('Number of messages to delete (1–100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .addUserOption(o =>
    o.setName('user').setDescription('Only delete messages from this user').setRequired(false)
  );

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const amount = interaction.options.getInteger('amount');
  const user   = interaction.options.getUser('user');

  // Fetch messages
  let messages = await interaction.channel.messages.fetch({ limit: 100 });

  // Filter by user if provided
  if (user) messages = messages.filter(m => m.author.id === user.id);

  // Discord only allows bulk-delete on messages < 14 days old
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const eligible = [...messages.values()]
    .filter(m => m.createdTimestamp > twoWeeksAgo)
    .slice(0, amount);

  if (!eligible.length) return fail(interaction, 'No eligible messages found (messages older than 14 days cannot be bulk deleted).');

  const deleted = await interaction.channel.bulkDelete(eligible, true);

  await logAction({
    guildId: interaction.guildId,
    action: 'PURGE',
    target: { id: user?.id ?? interaction.channelId, tag: user?.username ?? `#${interaction.channel.name}` },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason: `Purged ${deleted.size} message(s)${user ? ` from ${user.username}` : ''}`,
  });

  return ok(interaction, `Deleted **${deleted.size}** message(s)${user ? ` from **${user.username}**` : ''}`);
}
