import mongoose, { Document } from 'mongoose';

export interface IVehicle extends Omit<Document, 'model'> {
  resident: mongoose.Types.ObjectId;
  unit: mongoose.Types.ObjectId;
  type: 'Car' | 'Motorcycle' | 'Scooter' | 'Bicycle' | 'Other';
  make?: string;
  model?: string;
  color?: string;
  registrationNumber: string;
  parkingSlot?: string;
  isActive: boolean;
  societyId: string;
  createdAt: Date;
}

const VehicleSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  type: { type: String, enum: ['Car', 'Motorcycle', 'Scooter', 'Bicycle', 'Other'], required: true },
  make: { type: String },
  model: { type: String },
  color: { type: String },
  registrationNumber: { type: String, required: true, unique: true },
  parkingSlot: { type: String },
  isActive: { type: Boolean, default: true },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
