import mongoose, { Document } from 'mongoose';

export interface ISecurityLog extends Document {
  type: 'gate-entry' | 'gate-exit' | 'patrol' | 'incident' | 'guard-attendance';
  guard?: mongoose.Types.ObjectId;
  description?: string;
  location?: string;
  vehicleNumber?: string;
  personName?: string;
  photo?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  societyId: string;
  createdAt: Date;
}

const SecurityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gate-entry', 'gate-exit', 'patrol', 'incident', 'guard-attendance'],
    required: true
  },
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

export default mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);
