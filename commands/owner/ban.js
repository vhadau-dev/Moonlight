const User = require('../../models/User');
const config = require('../../config');

moon({
  name: 'ban',
  category: 'owner',
  description: 'Global ban system',
  usage: '.ban <@user|number> | list | check | un',

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp }) {
    try {

      // ---------------- OWNER CHECK ----------------
      const ownerNumbers = config.OWNER_NUMBERS || [];
      const senderNumber = sender.split('@')[0];

      if (!ownerNumbers.includes(senderNumber)) {
        return reply('⛔ You don't have permission for that.');
      }

      const sub = (args[0] || '').toLowerCase();

      // ---------------- GET TARGET FUNCTION ----------------
      const getTarget = () => {
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (mentioned) return mentioned;

        if (args[0] && args[0].match(/^\d+$/)) {
          return args[0] + '@s.whatsapp.net';
        }

        return null;
      };

      // ================================
      // 📌 BAN LIST
      // ================================
      if (sub === 'list') {
        const users = await User.find({ banned: true });

        if (!users.length) return reply('✅ No banned users.');

        let text = `📛 *Moonlight Ban List*\n\n`;
        const mentions = [];

        users.forEach((u, i) => {
          const jidUser = u.whatsappNumber + '@s.whatsapp.net';
          mentions.push(jidUser);

          text += `${i + 1}. @${u.whatsappNumber}\n`;
          text += `📝 ${u.banReason || 'No reason'}\n\n`;
        });

        return reply(text.trim(), { mentions });
      }

      // ================================
      // 📌 BAN CHECK (SELF)
      // ================================
      if (sub === 'check') {
        const user = await findOrCreateWhatsApp(sender, m.pushName || 'User');

        if (!user.banned) {
          return reply('✅ You are not banned.');
        }

        return reply(
          `⛔ *You are banned*\n\n📝 Reason: ${user.banReason || 'No reason'}`
        );
      }

      // ================================
      // 📌 UNBAN
      // ================================
      if (sub === 'un') {
        const target = getTarget() || (args[1] ? args[1] + '@s.whatsapp.net' : null);

        if (!target) {
          return reply('❌ Usage: .ban un @user');
        }

        const user = await findOrCreateWhatsApp(target, target.split('@')[0]);

        if (!user.banned) {
          return reply('❌ User is not banned.');
        }

        user.banned = false;
        user.banReason = null;
        user.bannedAt = null;
        user.banSync = Date.now(); // sync across bots

        await user.save();

        return reply(
          `✅ *User Unbanned*\n\n👤 @${target.split('@')[0]}`,
          { mentions: [target] }
        );
      }

      // ================================
      // 📌 NORMAL BAN
      // ================================
      const target = getTarget();

      if (!target) {
        return reply('❌ Usage:\n.ban @user <reason>\n.ban list\n.ban check\n.ban un @user');
      }

      const reason = args.slice(1).join(' ') || 'No reason provided';

      const user = await findOrCreateWhatsApp(target, target.split('@')[0]);

      user.banned = true;
      user.banReason = reason;
      user.bannedAt = new Date();
      user.banSync = Date.now(); // 🔥 cross-bot sync

      await user.save();

      // ---------------- DM USER ----------------
      try {
        await sock.sendMessage(target, {
          text: `⛔ *You have been banned*\n\n📝 Reason: ${reason}`
        });
      } catch {}

      // ---------------- KICK CURRENT GROUP ----------------
      if (jid.endsWith('@g.us')) {
        try {
          await sock.groupParticipantsUpdate(jid, [target], 'remove');
        } catch {
          await sock.sendMessage(jid, {
            text: `⚠️ @${target.split('@')[0]} is banned but I am not admin.`,
            mentions: [target]
          });
        }
      }

      return reply(
        `⛔ *User Banned*\n\n👤 @${target.split('@')[0]}\n📝 ${reason}`,
        { mentions: [target] }
      );

    } catch (err) {
      console.error('Ban command error:', err);
      return reply('❌ Ban failed.');
    }
  }
});