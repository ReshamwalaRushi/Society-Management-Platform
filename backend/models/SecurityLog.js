const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['gate-entry', 'gate-exit', 'patrol', 'incident', 'guard-attendance'], required: true },
  guard: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  location: { type: String },
  vehicleNumber: { type: String },
  personName: { type: String },
  photo: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
