const { downloadMediaMessage } = require('@whiskeysockets/baileys');

moon({
  name: 'vv',
  category: 'tools',
  description: 'Reveal a view-once image, video, or voice note (group admins only)',
  usage: '.vv (reply to a view-once message)',
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      // ── 1. Group-only + admin-only check ─────────────────────────────────
      if (!jid.endsWith('@g.us')) {
        return reply('❌ This command can only be used in groups.');
      }

      let isAdmin = false;
      try {
        const meta = await sock.groupMetadata(jid);
        const participant = meta.participants.find(p => p.id === sender);
        isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
      } catch {
        return reply('❌ Could not verify group permissions.');
      }

      if (!isAdmin) {
        return reply('⛔ Only group admins can use this command.');
      }

      // ── 2. Must be a reply ────────────────────────────────────────────────
      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const quotedMsg   = contextInfo?.quotedMessage;

      if (!quotedMsg) {
        return reply('❌ Reply to a view-once message to reveal it.');
      }

      // ── 3. Find the view-once content ─────────────────────────────────────
      const viewOnce =
        quotedMsg.viewOnceMessage?.message ||
        quotedMsg.viewOnceMessageV2?.message ||
        quotedMsg.viewOnceMessageV2Extension?.message ||
        null;

      if (!viewOnce) {
        return reply('❌ The replied message is not a view-once message.');
      }

      const imageMsg  = viewOnce.imageMessage;
      const videoMsg  = viewOnce.videoMessage;
      const audioMsg  = viewOnce.audioMessage;

      if (!imageMsg && !videoMsg && !audioMsg) {
        return reply('❌ No supported media found in the view-once message.');
      }

      // ── 4. Download ───────────────────────────────────────────────────────
      const buffer = await downloadMediaMessage(
        {
          message: viewOnce,
          key: {
            ...m.key,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant,
            remoteJid: jid
          }
        },
        'buffer',
        {},
        {
          logger: require('pino')({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      // ── 5. Re-send as normal media ────────────────────────────────────────
      if (imageMsg) {
        await sock.sendMessage(jid, {
          image:   buffer,
          caption: '👁️ *View-once revealed by admin*'
        }, { quoted: m });
      } else if (videoMsg) {
        await sock.sendMessage(jid, {
          video:   buffer,
          caption: '👁️ *View-once video revealed by admin*'
        }, { quoted: m });
      } else if (audioMsg) {
        await sock.sendMessage(jid, {
          audio:   buffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt:     true
        }, { quoted: m });
      }

    } catch (err) {
      console.error('vv command error:', err);
      reply('❌ Failed to reveal the view-once message.');
    }
  }
});
