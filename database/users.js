// database/users.js
const User = require('../models/User'); // points to your current User model

// ✅ In-memory cache for users
const userCache = new Map();
const CACHE_TTL = 60000; // 60 seconds

/**
 * Finds a user by WhatsApp ID (or Discord ID) or creates them if they don't exist
 * @param {string} whatsappNumber - the WhatsApp sender ID
 * @param {string} username - optional username
 * @returns {Promise<User>}
 */
async function findOrCreateWhatsApp(whatsappNumber, username = 'Unknown') {
  // ✅ Check cache first
  if (userCache.has(whatsappNumber)) {
    return userCache.get(whatsappNumber);
  }

  let user = await User.findOne({ whatsappNumber });
  if (!user) {
    user = await User.create({
      whatsappNumber,
      username
    });
  }

  // ✅ Store in cache
  userCache.set(whatsappNumber, user);

  // ✅ Auto-delete after TTL to prevent memory leaks
  setTimeout(() => {
    userCache.delete(whatsappNumber);
  }, CACHE_TTL);

  return user;
}

module.exports = { findOrCreateWhatsApp, userCache };
