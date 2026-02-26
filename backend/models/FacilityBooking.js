const mongoose = require('mongoose');

const FacilityBookingSchema = new mongoose.Schema({
  facility: {
    type: String,
    enum: ['Clubhouse', 'Gym', 'PartyHall', 'SwimmingPool', 'TennisCourt', 'Badminton', 'Garden'],
    required: true
  },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String },
  guestCount: { type: Number, default: 0 },
  bookingCharge: { type: Number, default: 0 },
  deposit: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  qrCode: { type: String },
  cancellationReason: { type: String },
  checkedIn: { type: Boolean, default: false },
  checkedInTime: { type: Date },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FacilityBooking', FacilityBookingSchema);
