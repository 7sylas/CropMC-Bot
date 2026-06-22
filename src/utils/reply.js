export function ok(interaction, msg) {
  return interaction.editReply({ content: msg });
}

export function fail(interaction, msg) {
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ content: `⚠ ${msg}` });
  }
  return interaction.reply({ content: `⚠ ${msg}`, ephemeral: true });
}

export async function dm(user, msg) {
  try { await user.send(msg); } catch {  }
}
