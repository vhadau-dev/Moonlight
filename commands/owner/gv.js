const config = require('../../config');
const { addMoney } = require('../../utils/economy');

moon({
  name: 'gv',
  category: 'owner',
  description: 'Give money to a user (owner only)',
  usage: '.gv @user <amount>',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp }) {
    try {

      // ---------------- OWNER CHECK ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      if (!ownerNumbers.includes(senderNumber)) {
        return reply('❌ Only the owner can use this command.');
      }

      // ---------------- TARGET ----------------
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const target = mentioned?.[0];

      if (!target) {
        return reply('❌ Please mention a user.\nExample: .gv @user 10000');
      }

      // ---------------- AMOUNT ----------------
      const amount = parseInt(args[1]);

      if (!amount || amount <= 0) {
        return reply('❌ Please provide a valid amount.\nExample: .gv @user 10000');
      }

      // Optional safety cap
      const MAX_GIVE = 10_000_000;
      if (amount > MAX_GIVE) {
        return reply(`❌ Amount too large. Max allowed is *${MAX_GIVE.toLocaleString()} coins*.`);
      }

      // ---------------- GET USER ----------------
      const user = await findOrCreateWhatsApp(target, target.split('@')[0]);

      // ---------------- GIVE MONEY ----------------
      const credited = addMoney(user, amount);

      user.totalEarned = (user.totalEarned || 0) + credited;

      await user.save();

      // ---------------- RESPONSE ----------------
      return reply(
        `✅ Successfully given *${credited.toLocaleString()}* coins to @${target.split('@')[0]}`,
        { mentions: [target] }
      );

    } catch (err) {
      console.error('GV command error:', err);
      return reply('❌ Failed to give money due to a system error.');
    }
  }
});