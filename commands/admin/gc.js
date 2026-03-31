const { getGroup } = require('../../models/GroupSettings');

moon({
  name: 'gs',
  aliases: ['gstats', 'gcstats'],
  category: 'group',

  async execute(sock, jid, sender, args, m, context) {

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, {
        text: '❌ This command only works in groups.'
      });
    }

    const metadata = await sock.groupMetadata(jid);
    const group = getGroup(jid);

    const participants = metadata.participants || [];
    const admins = participants.filter(p => p.admin).length;

    // ---------------- GET GROUP PROFILE PICTURE ----------------
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(jid, 'image');
    } catch {
      pfp = null;
    }

    const text = `┌─❖
│「 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 」
└┬❖ 「 📊 𝗚𝗥𝗢𝗨𝗣 𝗦𝗧𝗔𝗧𝗦 」
   │ 👥 𝗡𝗮𝗺𝗲 :${metadata.subject}
   │ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀 : ${participants.length}
   │ 🛡️ 𝗔𝗱𝗺𝗶𝗻𝘀 :${admins}
   │
   │ 🔗 𝗔𝗻𝘁𝗶-𝗟𝗶𝗻𝗸 :${group.antilink?.enabled ? 'on' : 'off'}
   │ 🚫 𝗔𝗻𝘁𝗶-𝗟𝗶𝗻𝗸 𝗔𝗰𝘁𝗶𝗼𝗻 :
   │✑ ${group.antilink?.action || 'warn'}
   │ ⚠️ 𝗔𝗻𝘁𝗶-𝗟𝗶𝗻𝗸 𝗪𝗮𝗿𝗻𝘀 : 
   │✑${group.antilink?.warnLimit || 0}
   │
   │ 🕵️‍♂️ 𝗔𝗻𝘁𝗶-𝗠𝗲𝗻𝘁𝗶𝗼𝗻 :${group.antimention?.enabled ? 'on' : 'off'}
   │ ⚠️ 𝗔𝗻𝘁𝗶-𝗠𝗲𝗻𝘁𝗶𝗼𝗻 𝗔𝗰𝘁𝗶𝗼𝗻 : 
   │✑ ${group.antimention?.action || 'warn'}
   │ ⚠️ 𝗔𝗻𝘁𝗶-𝗠𝗲𝗻𝘁𝗶𝗼𝗻 𝗪𝗮𝗿𝗻𝘀 : 
   │✑${group.antimention?.warnLimit || 0}
   │
   │✉️ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 : ${group.welcomeEnabled ? 'on' : 'off'}
   │ 📨 𝗠𝘀𝗴 : 
   │✑${group.welcomeMessage}
   │
   │✉️ 𝗟𝗲𝗮𝘃𝗲 : ${group.leaveEnabled ? 'on' : 'off'}
   │✑ 📨 𝗠𝘀𝗴 : 
   │✑${group.leaveMessage}
   │
   └────────────┈ ⳹`;

    // ---------------- SEND WITH IMAGE ----------------
    if (pfp) {
      await sock.sendMessage(jid, {
        image: { url: pfp },
        caption: text,
        mentions: [sender]
      }, { quoted: m });
    } else {
      await sock.sendMessage(jid, {
        text,
        mentions: [sender]
      }, { quoted: m });
    }
  }
});