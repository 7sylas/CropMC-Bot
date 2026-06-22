import { EmbedBuilder } from 'discord.js';

// ─── Palette ───────────────────────────────────────────────────────────────
export const Colors = {
  primary:  0x5865F2,   // blurple
  success:  0x57F287,   // green
  warning:  0xFEE75C,   // yellow
  danger:   0xED4245,   // red
  neutral:  0x2B2D31,   // neutral
  subtle:   0x4E5058,   // gray
};

function base(color) {
  return new EmbedBuilder()
    .setColor(color)
    .setTimestamp();
}


export function infoEmbed(title, description) {
  return base(Colors.primary)
    .setTitle(title)
    .setDescription(description);
}


export function successEmbed(title, description) {
  return base(Colors.success)
    .setTitle(`✓  ${title}`)
    .setDescription(description);
}


export function warnEmbed(title, description) {
  return base(Colors.warning)
    .setTitle(`⚠  ${title}`)
    .setDescription(description);
}


export function errorEmbed(title, description) {
  return base(Colors.danger)
    .setTitle(`✖  ${title}`)
    .setDescription(description);
}


export function modEmbed({ action, target, moderator, reason, duration }) {
  const embed = base(Colors.neutral)
    .setTitle(`Moderation — ${action}`)
    .addFields(
      { name: 'User',       value: `<@${target.id}> \`${target.tag}\``, inline: true },
      { name: 'Moderator',  value: `<@${moderator.id}>`,                 inline: true },
    );

  if (duration) embed.addFields({ name: 'Duration', value: duration, inline: true });
  if (reason)   embed.addFields({ name: 'Reason',   value: reason });

  return embed;
}


export function welcomeEmbed(member) {
  return base(Colors.primary)
    .setTitle('Welcome to the server')
    .setDescription(
      `Hey <@${member.id}>, glad you're here.\n` +
      `You're member **#${member.guild.memberCount}** — make yourself at home.`
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }));
}


export function pollEmbed({ question, options, author }) {
  const lines = options.map((opt, i) => `${numberEmoji(i)}  ${opt}`).join('\n');
  return base(Colors.primary)
    .setTitle('Poll')
    .setDescription(`**${question}**\n\n${lines}`)
    .setFooter({ text: `Started by ${author.tag}` });
}

const NUMBER_EMOJIS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
export function numberEmoji(i) { return NUMBER_EMOJIS[i] ?? `${i + 1}.`; }
