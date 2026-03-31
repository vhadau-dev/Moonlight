moon({
  name: "id",
  category: "tools",
  description: "Get user or group ID",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      let target = sender;

      // If user mentioned someone
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
      }

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