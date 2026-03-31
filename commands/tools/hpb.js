const config = require('../../config');

const FATHER_NUMBER = '27651070370@s.whatsapp.net';

// simple cooldown system
const cooldown = new Map();

moon({
  name: "hpb",
  alias: ["happybirthday"],
  category: "fun",
  desc: "Send birthday message to my dad",
  use: ".hpb <message>"
}, async (sock, m, text) => {
  try {
    if (!text) return m.reply("❌ Please provide a message!\nExample: .hpb Happy birthday dad ❤️");

    const sender = m.pushName || "Someone";
    const senderId = m.sender;

    // ⏱ Cooldown (10 seconds per user)
    const now = Date.now();
    const userCooldown = cooldown.get(senderId) || 0;

    if (now - userCooldown < 10000) {
      return m.reply("⏳ Chill... wait a few seconds before sending another message.");
    }

    cooldown.set(senderId, now);

    // 🕒 Time formatting
    const time = new Date().toLocaleTimeString();

    // 🎉 Message format
    const message = `
╭━━━★ 🎉 HAPPY BIRTHDAY 🎉
┃From: ${sender}
┃Time: ${time}
┣━━━━━━━━━━━━━━━
*💌 Message:*
${text}
╰━━━━━━━━━━━━━━━
`;

    // 📩 Send to your dad
    await sock.sendMessage(FATHER_NUMBER, { text: message });

    // ✅ Confirm to user
    await m.reply("✅ Your birthday message has been sent!");

  } catch (err) {
    console.error("HPB CMD ERROR:", err);
    m.reply("❌ Failed to send message.");
  }
});