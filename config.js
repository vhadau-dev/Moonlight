// config.js
module.exports = {
  /* =========================
     🧩 BASIC SETTINGS
  ========================= */
  PREFIX: "-",
  BOT_NAME: "-",
  BOT_JID: "-",
  MODE: "-",

  /* =========================
     👑 OWNER SETTINGS
  ========================= */
  OWNER_NAME: "*Royal Boy*",

  // Multi owners
  OWNER_NUMBERS: [
    "232942517371050",
    "268874264133709",
    "83795499814957"
  ],

  /* =========================
     🛡️ PERMISSIONS
  ========================= */

  // Guards (string → convert to array if possible later)
  GUARDS: "255794091180,27642735109,2349097466410,27675859928,27635399480,233536658010,2349042594658,2347035665904,233546703808",

  // Card creators
  CARDS_CREATERS: [
    "205093966217387",
    "268874264133709",
    "268874264133709"
  ],

  /* =========================
     💰 ECONOMY
  ========================= */
  ECONOMY_GROUPS: [
    "120363423446381521@g.us",
    "120363402830334439@g.us"
  ],
  
  // Groups where antilink/antimention are allowed to run
  // Leave empty [] to allow in all groups
  MODERATION_GROUPS: [
    "120363423446381521@g.us",
    "120363402830334439@g.us"
  ],

  /* =========================
     🖼️ MEDIA / IMAGES
  ========================= */

  // Menu images
  MENU_IMAGE: "https://files.catbox.moe/ozsqyf.jpg",
  MOONLIGHT_IMAGE: "https://i.postimg.cc/xdcMLbR3/IMG-20260327-WA0502.jpg",

  // Bot stickers
  BOT_STICKERS: [
    "https://o.uguu.se/fMOzuEZN.jpg",
    "https://d.uguu.se/GQjNjLlk.png"
  ],

  // Owner stickers
  OWNER_STICKERS: [
    "https://files.catbox.moe/0eim1a.jpg",
    "https://files.catbox.moe/fnv765.jpg",
    "https://files.catbox.moe/o8i5dp.jpg"
  ],

  /* =========================
     📂 STORAGE
  ========================= */
  SESSION_FOLDER: "./sessions"
};