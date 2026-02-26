const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Lift', 'Parking', 'Garden', 'Internet', 'Other'],
    required: true
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed', 'reopened'], default: 'open' },
  attachments: [{ type: String }],
  assignedTo: { type: String }, // Vendor or staff name
  resolvedDate: { type: Date },
  resolutionNote: { type: String },
  comments: [CommentSchema],
  rating: { type: Number, min: 1, max: 5 },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

ComplaintSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TICKET-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
