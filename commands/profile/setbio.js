const User = require('../../models/User');

moon({
  name: 'setbio',
  category: 'profile',
  aliases: ['bio'],
  description: 'Set your profile bio',
  usage: '.setbio <text>',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      // Get bio text (from args or reply)
      let bio = args.join(' ');

      const context = m.message?.extendedTextMessage?.contextInfo;
      if (!bio && context?.quotedMessage) {
        bio = context.quotedMessage.conversation || context.quotedMessage.extendedTextMessage?.text;
      }

      if (!bio) {
        return reply('❌ Please provide a bio.\nExample: .setbio I am a Moonlight user');
      }

      if (bio.length > 150) {
        return reply('❌ Bio too long. Max 150 characters.');
      }

      // Get user from DB
      const user = await findOrCreateWhatsApp(sender, pushName);
      if (!user) return reply('❌ User not found.');

      // Update bio
      user.bio = bio;
      await user.save();

      return reply(`✅ Bio updated successfully:\n\n"${bio}"`);

    } catch (err) {
      console.error(err);
      reply('❌ Failed to set bio.');
    }
  }
});