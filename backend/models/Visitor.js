const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: { type: String, required: true },
  hostResident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  hostUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  visitDate: { type: Date },
  expectedArrival: { type: Date },
  expectedDeparture: { type: Date },
  actualArrival: { type: Date },
  actualDeparture: { type: Date },
  vehicleNumber: { type: String },
  photo: { type: String },
  idProof: { type: String },
  qrCode: { type: String },
  status: { type: String, enum: ['pre-approved', 'checked-in', 'checked-out', 'denied'], default: 'pre-approved' },
  type: { type: String, enum: ['visitor', 'delivery', 'cab', 'service', 'emergency'], default: 'visitor' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
