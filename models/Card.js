const mongoose = require('mongoose');

// Function to generate ID (CAPS + NUMBERS only)
function generateCardId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const cardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    unique: true,
    index: true,
    default: () => generateCardId()
  },

  // Basic info
  name: { type: String, required: true, index: true },
  description: { type: String, default: "No description" },

  // Stats
  atk: { type: Number, default: 0 },
  def: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  attribute: { type: String, default: "UNKNOWN" },
  race: { type: String, default: "UNKNOWN" },

  tier: { type: String, default: "C", index: true },
  price: { type: Number, default: 0 },

  image: { type: String, default: null },

  // Source tracking (important for your system)
  source: {
    type: String,
    enum: ["spawn", "crcd", "market", "event"],
    default: null,
    index: true
  },

  // Ownership
  owner: {
    type: String,
    default: null,
    index: true
  },

  claimedAt: { type: Date, default: null },

  // Deck / battle
  isEquipped: {
    type: Boolean,
    default: false,
    index: true
  },

  // Creator tracking
  createdBy: {
    type: String,
    default: null
  }

}, { timestamps: true });

/**
 * Compound indexes for faster queries
 */
cardSchema.index({ owner: 1, isEquipped: 1 });
cardSchema.index({ owner: 1, source: 1 });

module.exports = mongoose.model('Card', cardSchema);