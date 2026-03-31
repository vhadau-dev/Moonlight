require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { connectDB } = require('./database'); // Ensure your database.js exports connectDB

// ----------------- Config -----------------
const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Aqua';
const SESSION_FOLDER = process.env.SESSION_FOLDER || './sessions';

// ----------------- Commands Setup -----------------
const commands = new Map();
const aliases = new Map();
global.moon = (command) => {
  if (command.name) {
    commands.set(command.name, command);
    if (command.aliases) command.aliases.forEach(a => aliases.set(a, command));
  }
  return command;
};

// Load commands recursively
const loadCommands = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      require(fullPath);
    }
  }
};
loadCommands(path.join(__dirname, 'commands'));

// ----------------- Bot Start -----------------
async function startBot() {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Fetch WhatsApp version and auth
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

    const sock = makeWASocket({
      version,
      logger: P({ level: 'silent' }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
      },
      browser: ['Moonlight Bot', 'Chrome', '1.0.0'],
      markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    // ----------------- Connection Updates -----------------
    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;

      if (qr) {
        console.log('📱 Scan this QR in WhatsApp Web (Desktop Mode on your phone):');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        console.log('⚠️ Disconnected, reconnecting...');
        startBot();
      } else if (connection === 'open') {
        console.log(`✅ ${BOT_NAME} is now online!`);
      }
    });

    // ----------------- Message Handling -----------------
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue;

        const jid = m.key.remoteJid;
        const sender = m.key.participant || jid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        if (!body.startsWith(PREFIX)) continue;

        const args = body.slice(PREFIX.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const command = commands.get(cmdName) || aliases.get(cmdName);

        if (command) {
          try {
            await command.execute(sock, jid, sender, args, m);
          } catch (e) {
            console.error('❌ Command Error:', e);
            await sock.sendMessage(jid, { text: '❌ There was an error executing this command.' });
          }
        }
      }
    });

  } catch (err) {
    console.error('❌ Bot failed to start:', err);
    process.exit(1);
  }
}

// ----------------- Initialize -----------------
startBot();