module.exports.messageReply = (sock, jid, m) => {
  return async (text, options = {}) => {
    try {
      const mentions = options.mentions || [];

      await sock.sendMessage(
        jid,
        {
          text,
          mentions
        },
        { quoted: m }
      );
    } catch (err) {
      console.error('[DEBUG] Failed to reply:', err);
    }
  };
};

module.exports.replyWithMentions = (sock, jid, m) => {
  return async (text, mentions = []) => {
    try {
      await sock.sendMessage(
        jid,
        {
          text,
          mentions
        },
        { quoted: m }
      );
    } catch (err) {
      console.error('[DEBUG] Failed to reply with mentions:', err);
    }
  };
};

module.exports.replyWithButtons = (sock, jid, m) => {
  return async (text, buttons = []) => {
    try {
      await sock.sendMessage(
        jid,
        {
          text,
          footer: 'Moonlight Bot',
          buttons,
          headerType: 1
        },
        { quoted: m }
      );
    } catch (err) {
      console.error('[DEBUG] Failed to reply with buttons:', err);
    }
  };
};

module.exports.replyWithImage = (sock, jid, m) => {
  return async (image, caption = '', options = {}) => {
    try {
      const mentions = options.mentions || [];

      await sock.sendMessage(
        jid,
        {
          image,
          caption,
          mentions
        },
        { quoted: m }
      );
    } catch (err) {
      console.error('[DEBUG] Failed to reply with image:', err);
    }
  };
};