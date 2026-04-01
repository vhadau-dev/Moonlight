moon({
  name: "id",
  category: "tools",
  description: "Get user or group ID",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      let target = contextInfo?.mentionedJid?.[0] || contextInfo?.participant || sender;

      const userId = target;
      const groupId = jid.endsWith("@g.us") ? jid : "❌ Not in group";

      const text = `
🆔 *ID Information*

👤 User ID: ${userId}
💬 Chat ID: ${groupId}
      `.trim();

      return reply(text);

    } catch (err) {
      console.error("id cmd error:", err);
      return reply("❌ Failed to fetch ID.");
    }
  }
});