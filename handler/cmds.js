const fs = require('fs');
const path = require('path');
const config = require('../config');

// ---------------- STORAGE ----------------
const commands = new Map();
const aliases = new Map();

// ---------------- REGISTER FUNCTION ----------------
function moon(cmd) {
  try {
    if (!cmd || !cmd.name) return;

    cmd.name = cmd.name.toLowerCase();

    // Save main command
    commands.set(cmd.name, cmd);

    // Save aliases
    if (cmd.aliases && Array.isArray(cmd.aliases)) {
      for (const alias of cmd.aliases) {
        aliases.set(alias.toLowerCase(), cmd);
      }
    }

  } catch (err) {
    console.error('❌ Error registering command:', err);
  }
}

// 🌍 MAKE GLOBAL (VERY IMPORTANT)
global.moon = moon;

// ---------------- LOAD COMMANDS ----------------
function loadCommands(dir = path.join(__dirname, '../commands')) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        require(fullPath);
        console.log(`✅ Loaded: ${file}`);
      } catch (err) {
        console.error(`❌ Failed to load ${file}:`, err);
      }
    }
  }
}

// Load all commands
loadCommands();

// ---------------- GAMBLING LOCK ----------------
function isAllowedGroup(jid) {
  if (!jid.endsWith('@g.us')) return true;

  const allowed = config.ECONOMY_GROUPS || [];
  return allowed.includes(jid);
}

// ---------------- WRAP EXECUTE ----------------
for (const cmd of commands.values()) {
  const originalExecute = cmd.execute;

  cmd.execute = async function (sock, jid, sender, args, m, context) {

    try {
      // 🔒 LOCK GAMBLING CMDS
      if (cmd.category === 'gambling') {
        if (!isAllowedGroup(jid)) {
          return context.reply(
`❌ Sorry this command is locked you can only use it on the following groups 

*𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 casino ( l )*
https://chat.whatsapp.com/KAG8xDAJmYODIZPWEcntCX

*𝚳𝚯𝚯𝚴𝐋𝚰𝐆𝚮𝚻 casino ( ll)*
https://chat.whatsapp.com/KAG8xDAJmYODIZPWEcntCX`
          );
        }
      }

      // ▶️ RUN COMMAND
      return await originalExecute(sock, jid, sender, args, m, context);

    } catch (err) {
      console.error(`❌ Error in command ${cmd.name}:`, err);
      return context.reply('❌ Command crashed.');
    }
  };
}

// ---------------- EXPORT ----------------
module.exports = {
  commands,
  aliases
};