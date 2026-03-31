const { getGroup, updateGroup } = require('../../models/GroupSettings');

moon({
  name: 'antilink',
  category: 'group',
  description: 'Manage anti-link protection.',
  usage: '.antilink <on|off|warn|delete|kick>',

  async execute(sock, jid, sender, args, message, { reply }) {
    try {

      if (!jid.endsWith('@g.us')) {
        return reply('❌ This command only works in groups.');
      }

      const sub = args[0]?.toLowerCase();
      const group = getGroup(jid);

      if (!sub) {
        return reply(
`📛 *Anti-Link Settings*

.antilink on
.antilink off
.antilink warn <number>
.antilink delete
.antilink kick`
        );
      }

      switch (sub) {

        case 'on':
          updateGroup(jid, {
            antilink: { ...group.antilink, enabled: true }
          });
          return reply('✅ Anti-link enabled.');

        case 'off':
          updateGroup(jid, {
            antilink: { ...group.antilink, enabled: false }
          });
          return reply('❌ Anti-link disabled.');

        case 'warn': {
          const limit = parseInt(args[1]);
          if (!limit) return reply('❌ Usage: .antilink warn <number>');

          updateGroup(jid, {
            antilink: {
              ...group.antilink,
              enabled: true,
              action: 'warn',
              warnLimit: limit
            }
          });

          return reply(`⚠️ Anti-link set to warn (${limit}).`);
        }

        case 'delete':
          updateGroup(jid, {
            antilink: {
              ...group.antilink,
              enabled: true,
              action: 'delete'
            }
          });
          return reply('🗑️ Anti-link set to delete.');

        case 'kick':
          updateGroup(jid, {
            antilink: {
              ...group.antilink,
              enabled: true,
              action: 'kick'
            }
          });
          return reply('🚫 Anti-link set to kick.');

        default:
          return reply('❌ Invalid option.');
      }

    } catch (err) {
      console.error('AntiLink error:', err);
      return reply('❌ Error executing anti-link.');
    }
  }
});