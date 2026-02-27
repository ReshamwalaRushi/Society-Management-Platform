const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'emergency', 'event', 'notice', 'poll'], default: 'general' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: { type: String, enum: ['all', 'owners', 'tenants', 'building'], default: 'all' },
  building: { type: String },
  attachments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pollOptions: [{
    option: String,
    votes: { type: Number, default: 0 },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
