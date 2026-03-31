const axios = require('axios');
const sharp = require('sharp');
const config = require('../../config');

const BG_URL = 'https://files.catbox.moe/wztao7.jpg';

const normalizeJid = (jid) => jid.split('@')[0];

moon({
  name: 'profile',
  category: 'profile',
  aliases: ['p'],

  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {

      const context = m.message?.extendedTextMessage?.contextInfo;

      let target = sender;
      if (context?.mentionedJid?.length) target = context.mentionedJid[0];
      else if (context?.participant) target = context.participant;

      const user = await findOrCreateWhatsApp(target, pushName);
      if (!user) return reply('❌ User not found.');

      const userId = normalizeJid(target);

      // ---------------- ROLE ----------------
      const isOwner = config.OWNER_NUMBERS?.includes(userId);
      const isCreator = config.CARDS_CREATERS?.includes(userId);

      let roleText = 'User';
      if (isOwner && isCreator) roleText = 'Creator 👑';
      else if (isOwner) roleText = 'Owner 👑';
      else if (isCreator) roleText = 'Card Creator 🎴';

      const cash = user.balance || 0;
      const bank = user.bank || 0;
      const total = cash + bank;

      // ---------------- GET IMAGES ----------------
      let pfpUrl;
      try {
        pfpUrl = await sock.profilePictureUrl(target, 'image');
      } catch {
        pfpUrl = 'https://files.catbox.moe/ydyexu.jpg';
      }

      const bgBuffer = (await axios.get(BG_URL, { responseType: 'arraybuffer' })).data;
      const pfpBuffer = (await axios.get(pfpUrl, { responseType: 'arraybuffer' })).data;

      // ---------------- MAKE CIRCLE AVATAR ----------------
      const avatarSize = 250;

      const circleAvatar = await sharp(pfpBuffer)
        .resize(avatarSize, avatarSize)
        .composite([{
          input: Buffer.from(
            `<svg width="${avatarSize}" height="${avatarSize}">
              <circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2}" fill="white"/>
            </svg>`
          ),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      // ---------------- COMPOSE FINAL IMAGE ----------------
      const finalImage = await sharp(bgBuffer)
        .resize(800, 500)
        .composite([
          {
            input: circleAvatar,
            top: 150, // 👈 move up/down
            left: 275 // 👈 center (adjust if needed)
          }
        ])
        .png()
        .toBuffer();

      // ---------------- TEXT (UNCHANGED) ----------------
      const text = `
╭━━━★彡 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻
 *Name*    : ${user.username || 'N/A'}
 *Age*      : ${user.age || 'N/A'}

*⳹─❖────────❖─⳹*
 *Status*  : Active
 *Role*    : *${roleText}*

 *Wallet*  : ${cash.toLocaleString()} mc
 *Bank*    : ${bank.toLocaleString()} mc
 *Total*   : ${total.toLocaleString()} mc

 *Registered* : Yes
 *Banned*     : ${user.banned ? 'Yes' : 'No'}

*⳹─❖────────❖─⳹*
        *ꕥ     Bio      ꕥ*
${user.bio || 'No bio set'}

*⳹─❖──「 🌛 」──❖─⳹*
🌙 Moonlight Haven
      `.trim();

      // ---------------- SEND ----------------
      await sock.sendMessage(jid, {
        image: finalImage,
        caption: text,
        mentions: [target]
      }, { quoted: m });

    } catch (err) {
      console.error("profile error:", err);
      return reply('❌ Failed to generate profile.');
    }
  }
});