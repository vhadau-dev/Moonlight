const config = require('../../config');

moon({
  name: 'delete',
  aliases: ['del'],
  category: 'group',
  description: 'Delete a message (reply to it)',

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!jid.endsWith('@g.us')) {
        return reply('❌ This command only works in groups.');
      }

      const metadata = await sock.groupMetadata(jid);

      const senderNumber = sender.split('@')[0];
      const isOwner = (config.OWNER_NUMBERS || []).includes(senderNumber);

      const isAdmin = metadata.participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      if (!isOwner && !isAdmin) {
        return reply('❌ Only admins or owner can delete messages.');
      }

      // ---------------- MUST REPLY ----------------
      const quoted = m.message?.extendedTextMessage?.contextInfo;

      if (!quoted || !quoted.stanzaId) {
        return reply('❌ Reply to a message to delete it.');
      }

      // ---------------- DELETE ----------------
      await sock.sendMessage(jid, {
        delete: {
          remoteJid: jid,
          fromMe: false,
          id: quoted.stanzaId,
          participant: quoted.participant
        }
      });

    } catch (err) {
      console.error('Delete command error:', err);
      return reply('❌ Failed to delete message.');
    }
  }
}); 