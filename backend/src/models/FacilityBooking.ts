import mongoose, { Document } from 'mongoose';

export interface IFacilityBooking extends Document {
  facility: 'Clubhouse' | 'Gym' | 'PartyHall' | 'SwimmingPool' | 'TennisCourt' | 'Badminton' | 'Garden';
  resident: mongoose.Types.ObjectId;
  unit: mongoose.Types.ObjectId;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  purpose?: string;
  guestCount: number;
  bookingCharge: number;
  deposit: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  qrCode?: string;
  cancellationReason?: string;
  checkedIn: boolean;
  checkedInTime?: Date;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  societyId: string;
  createdAt: Date;
}

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

export default mongoose.model<IFacilityBooking>('FacilityBooking', FacilityBookingSchema);
