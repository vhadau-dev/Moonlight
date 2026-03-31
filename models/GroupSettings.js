const fs = require('fs');
const path = require('path');

// ---------------- PATH ----------------
const filePath = path.join(__dirname, '../database/group.json');

// ---------------- ENSURE FILE EXISTS ----------------
function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }
}

// ---------------- LOAD DATA ----------------
function loadData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ---------------- SAVE DATA ----------------
function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------------- DEFAULT STRUCTURE ----------------
function defaultGroup() {
  return {
    // ✅ WELCOME
    welcomeEnabled: true,
    welcomeMessage: "👋 Welcome @user to *@gname*!.use `.memu` to start the fun\nProfile: @p",

    // ✅ LEAVE
    leaveEnabled: true,
    leaveMessage: "😢 @user left *@gname*\nProfile: @p",

    // ✅ ANTI-LINK
    antilink: {
      enabled: true,
      action: 'warn', // warn | delete | kick
      warnLimit: 3,
      warns: {}
    },

    // ✅ ANTI-MENTION / STATUS PROTECTION
    antimention: {
      enabled: false,
      action: 'warn', // warn | delete | kick
      warnLimit: 3,
      warns: {}
    }
  };
}

// ---------------- GET GROUP ----------------
function getGroup(groupId) {
  const data = loadData();

  if (!data[groupId]) {
    data[groupId] = defaultGroup();
    saveData(data);
  } else {
    const defaults = defaultGroup();

    if (!data[groupId].antilink) data[groupId].antilink = defaults.antilink;
    if (!data[groupId].antimention) data[groupId].antimention = defaults.antimention;

    if (typeof data[groupId].welcomeEnabled === 'undefined') {
      data[groupId].welcomeEnabled = defaults.welcomeEnabled;
    }
    if (typeof data[groupId].leaveEnabled === 'undefined') {
      data[groupId].leaveEnabled = defaults.leaveEnabled;
    }

    saveData(data);
  }

  return data[groupId];
}

// ---------------- UPDATE GROUP ----------------
function updateGroup(groupId, updates) {
  const data = loadData();

  if (!data[groupId]) {
    data[groupId] = defaultGroup();
  }

  data[groupId] = {
    ...data[groupId],
    ...updates
  };

  saveData(data);

  return data[groupId];
}

// ---------------- ANTI-LINK ----------------
function getAntilink(groupId) {
  return getGroup(groupId).antilink;
}

function updateAntilink(groupId, updates) {
  const data = loadData();

  if (!data[groupId]) data[groupId] = defaultGroup();

  data[groupId].antilink = {
    ...data[groupId].antilink,
    ...updates
  };

  saveData(data);
  return data[groupId].antilink;
}

// ---------------- ANTI-MENTION ----------------
function getAntimention(groupId) {
  return getGroup(groupId).antimention;
}

function updateAntimention(groupId, updates) {
  const data = loadData();

  if (!data[groupId]) data[groupId] = defaultGroup();

  data[groupId].antimention = {
    ...data[groupId].antimention,
    ...updates
  };

  saveData(data);
  return data[groupId].antimention;
}

// ---------------- GROUP EVENTS HANDLER ----------------
async function handleGroupEvents(sock, data) {
  try {
    const { id, participants, action } = data;
    const group = getGroup(id);
    const metadata = await sock.groupMetadata(id);

    for (const user of participants) {
      const isWelcome = action === "add" && group?.welcomeEnabled;
      const isLeave = action === "remove" && group?.leaveEnabled;

      if (!isWelcome && !isLeave) continue;

      let text = isWelcome ? group.welcomeMessage : group.leaveMessage;

      // ✅ SUPPORT @user, @gname, @count, @p
      text = text
        .replace(/@user/g, `@${user.split('@')[0]}`)
        .replace(/@gname/g, metadata.subject)
        .replace(/@count/g, metadata.participants.length)
        .replace(/@p/g, `@${user.split('@')[0]}`);

      await sock.sendMessage(id, {
        text,
        mentions: [user],
        contextInfo: {
          mentionedJid: [user]
        }
      });
    }

  } catch (err) {
    console.error("Group event error:", err);
  }
}

// ---------------- EXPORT ----------------
module.exports = {
  getGroup,
  updateGroup,
  loadData,

  getAntilink,
  updateAntilink,
  getAntimention,
  updateAntimention,

  handleGroupEvents
};