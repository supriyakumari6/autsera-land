/**
 * models/User.js — Child user schema
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ScoreSchema = new mongoose.Schema({
  gameType: { type: String, enum: ['colors','shapes','memory','objects'], required: true },
  score:    { type: Number, default: 0 },
  level:    { type: String, enum: ['easy','medium','hard'] },
  date:     { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true, maxlength: 20 },
  nameKey:    { type: String, unique: true, index: true },   // lower-cased name → unique, no regex needed
  age:        { type: Number, min: 3, max: 18 },
  password:   { type: String, required: true, minlength: 3 },
  avatar:     { emoji: String, name: String },
  scores:     { colors: { type: Number, default: 0 },
                shapes: { type: Number, default: 0 },
                memory: { type: Number, default: 0 },
                objects:{ type: Number, default: 0 } },
  totalScore: { type: Number, default: 0 },
  history:    [ScoreSchema],
  parentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', default: null },
  createdAt:  { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('validate', function(next) {
  if (this.name) this.nameKey = this.name.trim().toLowerCase();
  next();
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
