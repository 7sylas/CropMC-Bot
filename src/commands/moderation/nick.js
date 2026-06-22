import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { ok, fail } from '../../utils/reply.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription('Change or reset a member\'s nickname')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
  .addStringOption(o => o.setName('nickname').setDescription('New nickname (leave blank to reset)').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target = interaction.options.getMember('user');
  const nick   = interaction.options.getString('nickname') ?? null;

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (!target.manageable) return fail(interaction, 'I cannot manage that member\'s nickname.');

  try {
    await target.setNickname(nick);
    return nick
      ? ok(interaction, `Set **${target.user.username}**'s nickname to **${nick}**`)
      : ok(interaction, `Reset **${target.user.username}**'s nickname`);
  } catch (err) {
    return fail(interaction, `Failed: ${err.message}`);
  }
}
