moon({
  name: 'setage',
  category: 'profile',
  description: 'Set your age',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp }) {
    try {
      const user = await findOrCreateWhatsApp(sender);

      const age = parseInt(args[0]);

      if (!age || age < 1) {
        return reply('❌ Enter a valid age.');
      }

      user.age = age;
      await user.save();

      return reply(`✅ Age set to ${age}`);

    } catch {
      return reply('❌ Failed to set age.');
    }
  }
});