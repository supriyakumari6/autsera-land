
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ParentSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 4 },
  settings: {
    dailyLimitMinutes: { type: Number, default: 30 },
    notificationsOn:   { type: Boolean, default: true },
  },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

ParentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

ParentSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Parent', ParentSchema);
