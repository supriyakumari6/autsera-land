/**
 * models/Setting.js — tiny key/value store (e.g. daily play-time limit)
 */
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
