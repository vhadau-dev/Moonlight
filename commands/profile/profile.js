const User = require('../../models/User');
const config = require('../../config');
const { generateProfileImage } = require('../../utils/profileGenerator');
const moment = require('moment-timezone');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

// ── Helper: check if a number is an owner ──────────────────────────────────
function isOwner(number) {
  return config.OWNER_NUMBERS?.includes(number);
}

// ── Helper: upload buffer to Catbox.moe ────────────────────────────────────
async function uploadToCatbox(buffer, extension = 'mp4') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('userhash', '');
  form.append('fileToUpload', buffer, {
    filename: `vbg.${extension}`,
    contentType: extension === 'mp4' ? 'video/mp4' : `image/${extension}`
  });

  const response = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 60000
  });

  return (response.data || '').trim();
}

// ── Helper: overlay image onto video using ffmpeg ──────────────────────────
async function overlayImageOnVideo(videoUrl, imageBuffer) {
  const tmpDir    = os.tmpdir();
  const timestamp = Date.now();
  const imgFile   = path.join(tmpDir, `ml_overlay_${timestamp}.png`);
  const outFile   = path.join(tmpDir, `ml_final_${timestamp}.mp4`);

  try {
    fs.writeFileSync(imgFile, imageBuffer);

    // ffmpeg command:
    // 1. Take video from URL
    // 2. Take image from file
    // 3. Scale image to fit video width (maintaining aspect ratio)
    // 4. Overlay image in the center
    // 5. Output as mp4
    execSync(
      `ffmpeg -y -i "${videoUrl}" -i "${imgFile}" -filter_complex "[1:v]scale=800:-1[img];[0:v][img]overlay=(W-w)/2:(H-h)/2" -c:a copy -t 5 "${outFile}"`,
      { stdio: 'pipe' }
    );

    return fs.readFileSync(outFile);
  } finally {
    try { fs.unlinkSync(imgFile); } catch {}
    try { fs.unlinkSync(outFile); } catch {}
  }
}

// ── .profile / .p ──────────────────────────────────────────────────────────
moon({
  name: "profile",
  category: "profile",
  aliases: ["p"],
  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const context = m.message?.extendedTextMessage?.contextInfo;
      let target = sender;
      if (context?.mentionedJid?.length) target = context.mentionedJid[0];
      else if (context?.participant) target = context.participant;

      const targetNumber = target.split('@')[0];

      const user = await findOrCreateWhatsApp(target, pushName);
      if (!user) return reply('❌ User not found.');

      // Determine Role
      let role = "citizen";
      if (isOwner(targetNumber)) {
        role = "Owner 👑";
      } else if (config.CARDS_CREATERS?.includes(targetNumber)) {
        role = "Card Creator";
      }

      // Fetch live profile picture from WhatsApp
      let pfp;
      try {
        pfp = await sock.profilePictureUrl(target, 'image');
      } catch {
        pfp = user.profileImage || 'https://i.imgur.com/6VBx3io.png';
      }

      const wallet = user.balance || 0;
      const bank   = user.bank   || 0;

      const registeredDate = moment(user.createdAt).format('DD/MM/YYYY');
      const bannedStatus   = user.banned ? "Yes ❌" : "No ✅";
      const total          = wallet + bank;

      const cleanStatus = user.bio && user.bio !== '.'
        ? (user.bio.length > 30 ? user.bio.substring(0, 27) + '...' : user.bio)
        : 'Active';

      const msg = `
╭━━━★彡 𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻
 *Name*    : ${user.username || pushName || 'N/A'}
 *Age*      : ${user.age || 'N/A'}

*⳹─❖────────❖─⳹*
 *Status*  : ${cleanStatus}
 *Role*    : ${role}

 *Wallet*  : ${wallet.toLocaleString()}
 *Bank*    : ${bank.toLocaleString()}
 *Total*   : ${total.toLocaleString()}

 *Registered* : ${registeredDate}
 *Banned*     : ${bannedStatus}

*⳹─❖────────❖─⳹*
        *ꕥ     Bio      ꕥ*
${user.bio || 'No bio set'}

*⳹─❖──「 🌛 」──❖─⳹*
🌙 Moonlight Haven
      `.trim();

      // ── Handle Video Background for Owners ────────────────────────────────
      if (isOwner(targetNumber) && user.videoBackground) {
        try {
          // Generate transparent profile card
          const transparentCard = await generateProfileImage({
            username:     user.username || pushName || 'N/A',
            role:         role,
            pfp:          pfp,
            transparent:  true,
            bio:          user.bio || '.',
            wallet:       wallet,
            bank:         bank,
            messageCount: user.messageCount || 0
          });

          // Overlay onto video
          const finalVideoBuffer = await overlayImageOnVideo(user.videoBackground, transparentCard);

          return sock.sendMessage(
            jid,
            {
              video:    finalVideoBuffer,
              gifPlayback: true,
              caption:  msg,
              mentions: [target]
            },
            { quoted: m }
          );
        } catch (err) {
          console.error("Video overlay error:", err);
          // Fallback to static image if overlay fails
        }
      }

      // ── Default: Static Image Card ────────────────────────────────────────
      const profileBuffer = await generateProfileImage({
        username:     user.username || pushName || 'N/A',
        role:         role,
        pfp:          pfp,
        background:   user.backgroundImage || null,
        bio:          user.bio || '.',
        wallet:       wallet,
        bank:         bank,
        messageCount: user.messageCount || 0
      });

      return sock.sendMessage(
        jid,
        {
          image:    profileBuffer,
          caption:  msg,
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

// ── .setbc – set background image (all users) ──────────────────────────────
moon({
  name: "setbc",
  category: "profile",
  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const url = args[0];

      if (!url || !url.startsWith('http')) {
        return reply("❌ Please provide a direct image URL.\nExample: .setbc https://example.com/image.jpg");
      }

      const user = await findOrCreateWhatsApp(sender, pushName);
      if (!user) return reply("❌ User not found.");

      user.backgroundImage = url;
      await user.save();

      reply("✅ Your profile background has been updated!");
    } catch (err) {
      console.error("setbc error:", err);
      reply("❌ Failed to set background. Please try again.");
    }
  }
});

// ── .setvbc – set video background (OWNERS ONLY) ───────────────────────────
moon({
  name: "setvbc",
  category: "profile",
  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const senderNumber = sender.split('@')[0];

      if (!isOwner(senderNumber)) {
        return reply("⛔ Only bot owners can set a video background.");
      }

      const contextInfo = m.message?.extendedTextMessage?.contextInfo;
      const quotedMsg   = contextInfo?.quotedMessage;

      if (!quotedMsg?.videoMessage) {
        return reply("❌ Please *reply to a video* with `.setvbc` to set your video background.");
      }

      await reply("⏳ Processing your video background...");

      const videoBuffer = await downloadMediaMessage(
        {
          message: quotedMsg,
          key: {
            remoteJid: jid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant || sender
          }
        },
        'buffer',
        {},
        {
          logger: require('pino')({ level: 'silent' }),
          reuploadRequest: sock.updateMediaMessage
        }
      );

      if (!videoBuffer || !videoBuffer.length) {
        return reply("❌ Failed to download the video.");
      }

      // Upload original video to Catbox
      const catboxUrl = await uploadToCatbox(videoBuffer, 'mp4');

      const user = await findOrCreateWhatsApp(sender, pushName);
      if (!user) return reply("❌ User not found.");

      user.videoBackground = catboxUrl;
      await user.save();

      reply("✅ Your *video background* has been set! It will now be integrated into your profile card. 🎬");

    } catch (err) {
      console.error("setvbc error:", err);
      reply("❌ Failed to set video background.");
    }
  }
});

// ── .clearvbc – remove video background (OWNERS ONLY) ─────────────────────
moon({
  name: "clearvbc",
  category: "profile",
  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const senderNumber = sender.split('@')[0];

      if (!isOwner(senderNumber)) {
        return reply("⛔ Only bot owners can use this command.");
      }

      const user = await findOrCreateWhatsApp(sender, pushName);
      if (!user) return reply("❌ User not found.");

      user.videoBackground = null;
      await user.save();

      reply("✅ Your video background has been removed.");
    } catch (err) {
      console.error("clearvbc error:", err);
      reply("❌ Failed to clear video background.");
    }
  }
});

// ── .setp – set middle (profile) image ─────────────────────────────────────
moon({
  name: "setp",
  category: "profile",
  async execute(sock, jid, sender, args, m, { reply, findOrCreateWhatsApp, pushName }) {
    try {
      const url = args[0];

      if (!url || !url.startsWith('http')) {
        return reply("❌ Please provide a direct image URL.\nExample: .setp https://example.com/image.jpg");
      }

      const user = await findOrCreateWhatsApp(sender, pushName);
      if (!user) return reply("❌ User not found.");

      user.profileImage = url;
      await user.save();

      reply("✅ Your profile picture has been updated!");
    } catch (err) {
      console.error("setp error:", err);
      reply("❌ Failed to set profile image. Please try again.");
    }
  }
});
