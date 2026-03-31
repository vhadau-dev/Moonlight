const { getGroup, updateGroup } = require('../../models/GroupSettings');

moon({
  name: 'antimention',
  category: 'group',
  description: 'Manage anti-mention protection.',
  usage: '.antimention <on|off|warn|delete|kick>',

  async execute(sock, jid, sender, args, message, { reply }) {
    try {

      if (!jid.endsWith('@g.us')) {
        return reply('❌ This command only works in groups.');
      }

      const sub = args[0]?.toLowerCase();
      const group = getGroup(jid);

      if (!sub) {
        return reply(
`📛 *Anti-Mention Settings*

.antimention on
.antimention off
.antimention warn <number>
.antimention delete
.antimention kick`
        );
      }

      switch (sub) {

        case 'on':
          updateGroup(jid, {
            antimention: { ...group.antimention, enabled: true }
          });
          return reply('✅ Anti-mention enabled.');

        case 'off':
          updateGroup(jid, {
            antimention: { ...group.antimention, enabled: false }
          });
          return reply('❌ Anti-mention disabled.');

        case 'warn': {
          const limit = parseInt(args[1]);
          if (!limit) return reply('❌ Usage: .antimention warn <number>');

          updateGroup(jid, {
            antimention: {
              ...group.antimention,
              enabled: true,
              action: 'warn',
              warnLimit: limit
            }
          });

          return reply(`⚠️ Anti-mention set to warn (${limit}).`);
        }

        case 'delete':
          updateGroup(jid, {
            antimention: {
              ...group.antimention,
              enabled: true,
              action: 'delete'
            }
          });
          return reply('🗑️ Anti-mention set to delete.');

        case 'kick':
          updateGroup(jid, {
            antimention: {
              ...group.antimention,
              enabled: true,
              action: 'kick'
            }
          });
          return reply('🚫 Anti-mention set to kick.');

        default:
          return reply('❌ Invalid option.');
      }

    } catch (err) {
      console.error('AntiMention error:', err);
      return reply('❌ Error executing anti-mention.');
    }
  }
});