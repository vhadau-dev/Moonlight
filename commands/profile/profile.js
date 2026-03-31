const User = require('../../models/User');
const config = require('../../config');
const { generateProfileImage } = require('../../utils/profileGenerator');
const moment = require('moment-timezone');

moon({
  name: "profile",
  category: "profile",
  aliases: ["p"],
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const context = m.message?.extendedTextMessage?.contextInfo;
      let target = sender;
      if (context?.mentionedJid?.length) target = context.mentionedJid[0];
      else if (context?.participant) target = context.participant;

      const targetNumber = target.split('@')[0];

      let user = await User.findOne({ userId: targetNumber });
      if (!user) {
        user = await User.create({
          userId: targetNumber,
          username: 'Unknown',
          balance: 1000,
          bank: 0,
          role: 'User'
        });
      }

      // Determine Role
      let role = "Lord 👑";
      if (config.OWNER_NUMBERS?.includes(targetNumber)) {
        role = "Owner";
      } else if (config.CARDS_CREATERS?.includes(targetNumber)) {
        role = "Card Creator";
      }

      // Fetch Profile Picture
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(target, 'image');
      } catch (err) {
        pfp = 'https://i.imgur.com/6VBx3io.png'; // Fallback
      }

      // Generate stylized profile image
      const profileBuffer = await generateProfileImage({
        username: user.username || 'N/A',
        role: role,
        pfp: pfp,
        background: user.backgroundImage
      });

      const registeredDate = moment(user.createdAt).format('DD/MM/YYYY');
      const bannedStatus = user.banned ? "Yes ❌" : "No ✅";

      const msg = `
╭━━━★彡 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻
 *Name*    : ${user.username || 'N/A'}
 *Age*      : ${user.age || 'N/A'}

*⳹─❖────────❖─⳹*
 *Status*  : ${user.bio || 'Active'}
 *Role*    : ${role}

 *Wallet*  : ${user.balance?.toLocaleString() || 0}
 *Bank*    : ${user.bank?.toLocaleString() || 0}
 *Total*   : ${( (user.balance || 0) + (user.bank || 0) ).toLocaleString()}

 *Registered* : ${registeredDate}
 *Banned*     : ${bannedStatus}

*⳹─❖────────❖─⳹*
        *ꕥ     Bio      ꕥ*
${user.bio || 'No bio set'}

*⳹─❖──「 🌛 」──❖─⳹*
🌙 Moonlight Haven
      `.trim();

      return sock.sendMessage(
        jid,
        { 
          image: profileBuffer, 
          caption: msg,
          mentions: [target]
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("profile error:", err);
      reply("❌ An error occurred while fetching the profile.");
    }
  }
});

moon({
  name: "setbc",
  category: "profile",
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const senderNumber = sender.split('@')[0];
      const url = args[0];

      if (!url || !url.startsWith('http')) {
        return reply("❌ Please provide a direct image URL to set your background.\nExample: .setbc https://example.com/image.jpg");
      }

      await User.findOneAndUpdate({ userId: senderNumber }, { backgroundImage: url }, { upsert: true });
      reply("✅ Your profile background has been updated!");

    } catch (err) {
      console.error("setbc error:", err);
      reply("❌ Failed to set background.");
    }
  }
});
