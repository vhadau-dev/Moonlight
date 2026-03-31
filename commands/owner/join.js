const config = require('../../config');

moon({
  name: 'join',
  category: 'owner',
  description: 'Join a WhatsApp group using invite link',

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      // ---------------- OWNER CHECK (FIXED) ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      const isOwner = ownerNumbers.includes(senderNumber);

      if (!isOwner) {
        return reply('❌ Only the owner can use this command.');
      }

      // ---------------- LINK CHECK ----------------
      const link = args[0];

      if (!link) {
        return reply('❌ Usage: .join <group invite link>');
      }

      const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);

      if (!match) {
        return reply('❌ Invalid invite link.');
      }

      const inviteCode = match[1];

      // ---------------- JOIN GROUP ----------------
      const groupJid = await sock.groupAcceptInvite(inviteCode);

      // ---------------- MESSAGE ----------------
      const ReadMore = String.fromCharCode(8206).repeat(4001);

      const text = `
╭━━★ 𝓜𝓸𝓸𝓷𝓵𝓲𝓰𝓱𝓽 ★━━╮
┃ *${config.BOT_NAME}* has joined the group
┃ 👑 Creator: ${config.OWNER_NAME}
╰━━━━━━━━━━━━━━╯

${ReadMore}

📌 *Important Setup Instructions:*

• Make the bot an *Admin*
• Grant necessary permissions
• Do NOT spam or DM the bot
• Ensure proper configuration for full functionality

⚠️ If setup is not completed correctly,
the bot may leave within 24 hours.

🌙 *Moonlight Guard Activated*
      `.trim();

      // ---------------- SEND MESSAGE ----------------
      if (config.MENU_IMAGE) {
        await sock.sendMessage(groupJid, {
          image: { url: config.MENU_IMAGE },
          caption: text
        });
      } else {
        await sock.sendMessage(groupJid, { text });
      }

      return reply('✅ Successfully joined the group.');

    } catch (err) {
      console.error('Join command error:', err);
      return reply('❌ Failed to join the group.');
    }
  }
});