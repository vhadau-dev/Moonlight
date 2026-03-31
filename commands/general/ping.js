moon({
  name: "ping",
  category: "general",
  description: "Check bot speed",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      const start = Date.now();

      // Initial message
      const sentMsg = await sock.sendMessage(jid, {
        text: "🏓 Testing speed..."
      }, { quoted: m });

      const steps = [
        "🔹 Connecting...",
        "🔹 Measuring latency...",
        "🔹 Processing...",
        "🔹 Finalizing...",
        "✅ Done!"
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(res => setTimeout(res, 500));

        const ping = Date.now() - start;

        const text = `
🏓 *Pong!*

${steps[i]}

⚡ Speed: ${ping} ms
        `.trim();

        try {
          // Try edit (if supported)
          await sock.sendMessage(jid, {
            text,
            edit: sentMsg.key
          });
        } catch {
          // Fallback (send new message)
          await sock.sendMessage(jid, { text }, { quoted: m });
        }
      }

    } catch (err) {
      console.error("ping error:", err);
      return reply("❌ Failed to check ping.");
    }
  }
});