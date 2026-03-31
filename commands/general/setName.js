const User = require('../../models/User');

moon({
  name: 'setname',
  category: 'general',
  description: 'Set your display name',

  async execute(sock, jid, sender, args, m, db) {
    const name = args.join(' ').trim();

    if (!name) {
      return sock.sendMessage(jid, {
        text: '❌ Usage: .setname <your name>'
      });
    }

    try {
      // Find user by WhatsApp number
      let user = await User.findOne({ whatsappNumber: sender });

      if (!user) {
        return sock.sendMessage(jid, {
          text: '❌ You need to link your account first using .link'
        });
      }

      // Save name
      user.username = name;
      await user.save();

      return sock.sendMessage(jid, {
        text: `✅ Your display name has been set to: *${name}*`
      });

    } catch (err) {
      console.error('Setname error:', err);

      return sock.sendMessage(jid, {
        text: '❌ Failed to set name.'
      });
    }
  }
});