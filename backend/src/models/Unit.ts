import mongoose, { Document } from 'mongoose';

export interface IUnit extends Document {
  unitNumber: string;
  building: string;
  floor?: number;
  type: '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Penthouse' | 'Studio';
  area?: number;
  owner?: mongoose.Types.ObjectId;
  currentOccupant?: mongoose.Types.ObjectId;
  occupancyType: 'owner' | 'tenant' | 'vacant';
  monthlyMaintenance: number;
  parkingSlots: string[];
  societyId: string;
  createdAt: Date;
}

const UnitSchema = new mongoose.Schema({
  unitNumber: { type: String, required: true },
  building: { type: String, required: true },
  floor: { type: Number },
  type: { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Studio'], default: '2BHK' },
  area: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  currentOccupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  occupancyType: { type: String, enum: ['owner', 'tenant', 'vacant'], default: 'vacant' },
  monthlyMaintenance: { type: Number, default: 0 },
  parkingSlots: [{ type: String }],
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUnit>('Unit', UnitSchema);
