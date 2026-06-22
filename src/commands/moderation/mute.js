import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { ok, fail, dm } from '../../utils/reply.js';
import { logAction } from '../../utils/supabase.js';

const MAX_MS = 28 * 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeout a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o => o.setName('user').setDescription('Member to mute').setRequired(true))
  .addStringOption(o => o.setName('duration').setDescription('e.g. 10m, 2h, 1d').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();
  const target   = interaction.options.getMember('user');
  const rawDur   = interaction.options.getString('duration');
  const reason   = interaction.options.getString('reason') ?? 'No reason provided';
  const duration = ms(rawDur);

  if (!target) return fail(interaction, 'That user is not in this server.');
  if (!duration || isNaN(duration) || duration <= 0) return fail(interaction, `Invalid duration \`${rawDur}\`. Try \`10m\`, \`2h\`, \`1d\`.`);
  if (duration > MAX_MS) return fail(interaction, 'Maximum timeout duration is 28 days.');
  if (!target.moderatable) return fail(interaction, 'I cannot mute that member.');

  const expiresAt = new Date(Date.now() + duration);
  await target.timeout(duration, reason);

  await dm(target.user, `You were muted in **${interaction.guild.name}** for **${rawDur}** for **${reason}**`);

  await logAction({
    guildId: interaction.guildId,
    action: 'MUTE',
    target: { id: target.id, tag: target.user.username },
    mod: { id: interaction.user.id, tag: interaction.user.username },
    reason,
    duration: rawDur,
    expiresAt,
  });

  return ok(interaction, `Muted **${target.user.username}** for **${rawDur}** for **${reason}**`);
}
