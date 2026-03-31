const QRCode = require("qrcode");

moon({
  name: "qr",
  category: "tools",
  description: "Generate a QR code",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!args.length) {
        return reply("❌ Example: .qr https://example.com");
      }

      const text = args.join(" ");

      // Generate QR as buffer
      const qrBuffer = await QRCode.toBuffer(text);

      await sock.sendMessage(jid, {
        image: qrBuffer,
        caption: `📱 *QR Code Generated*\n\n🔗 Data: ${text}`
      }, { quoted: m });

    } catch (err) {
      console.error("qr error:", err);
      return reply("❌ Failed to generate QR.");
    }
  }
});