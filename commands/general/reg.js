const User = require('../../models/User');
const config = require('../../config');

moon({
  name: 'reg',
  category: 'general',
  description: 'Register your account with your age (13-35) to unlock the economy.',
  usage: '.reg <age>',

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];
      const user = await User.findOne({ userId: senderNumber });

      if (!user) {
        return reply("❌ User not found in database. Please send a message first.");
      }

      if (user.isRegistered) {
        return reply(`✅ You are already registered as ${user.age} years old!`);
      }

      const age = parseInt(args[0]);

      if (isNaN(age)) {
        return reply("❌ Please provide a valid age.\nUsage: .reg <age>");
      }

      if (age < 13 || age > 35) {
        return reply("❌ Registration failed! You must be between 13 and 35 years old to register.");
      }

      user.age = age;
      user.isRegistered = true;
      await user.save();

      const caption = `
*「 🌙 𝓜𝓸𝓸𝓷𝓵𝓲𝓰𝓱𝓽 𝓗𝓪𝓿𝓮𝓷 」*

🎉 *REGISTRATION SUCCESSFUL!* 🎉

👤 *User:* @${senderNumber}
🎂 *Age:* ${age}
💰 *Status:* Economy Unlocked!

> Welcome to the family! You can now use all economy and card commands.
      `.trim();

      await sock.sendMessage(jid, {
        text: caption,
        mentions: [sender]
      }, { quoted: m });

    } catch (err) {
      console.error("Registration error:", err);
      reply("❌ An error occurred during registration.");
    }
  }
});
