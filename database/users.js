// database/users.js
const User = require('../models/User'); // points to your current User model

/**
 * Finds a user by WhatsApp ID (or Discord ID) or creates them if they don't exist
 * @param {string} whatsappNumber - the WhatsApp sender ID
 * @param {string} username - optional username
 * @returns {Promise<User>}
 */
async function findOrCreateWhatsApp(whatsappNumber, username = 'Unknown') {
  let user = await User.findOne({ whatsappNumber });
  if (!user) {
    user = await User.create({
      whatsappNumber,
      username
    });
  }
  return user;
}

module.exports = { findOrCreateWhatsApp };