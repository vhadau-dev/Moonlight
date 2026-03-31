const mongoose = require('mongoose');

const groupSpawnSchema = new mongoose.Schema({
  jid: {
    type: String,
    unique: true,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('GroupSpawn', groupSpawnSchema);