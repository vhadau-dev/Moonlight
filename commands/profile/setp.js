moon({
  name: 'setp',
  category: 'profile',
  description: 'Set profile image',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp }) {
    try {
      const user = await findOrCreateWhatsApp(sender);

      if (!args[0]) {
        return reply('❌ Send image URL or reply to an image.');
      }

      user.profileImage = args[0];
      await user.save();

      return reply('✅ Profile image updated.');

    } catch (err) {
      console.error(err);
      return reply('❌ Failed to set profile image.');
    }
  }
});