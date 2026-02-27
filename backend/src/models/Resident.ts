import mongoose, { Document } from 'mongoose';

export interface IFamilyMember {
  name: string;
  relation: string;
  age?: number;
  phone?: string;
  email?: string;
}

export interface IEmergencyContact {
  name: string;
  relation?: string;
  phone: string;
}

export interface IResident extends Document {
  user?: mongoose.Types.ObjectId;
  unit: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  photo?: string;
  type: 'owner' | 'tenant';
  familyMembers: IFamilyMember[];
  emergencyContacts: IEmergencyContact[];
  moveInDate: Date;
  moveOutDate?: Date;
  isActive: boolean;
  idProofType?: 'Aadhar' | 'PAN' | 'Passport' | 'DrivingLicense' | 'VoterID';
  idProofNumber?: string;
  societyId: string;
  createdAt: Date;
}

const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number },
  phone: { type: String },
  email: { type: String }
});

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String },
  phone: { type: String, required: true }
});

const ResidentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  photo: { type: String },
  type: { type: String, enum: ['owner', 'tenant'], default: 'owner' },
  familyMembers: [FamilyMemberSchema],
  emergencyContacts: [EmergencyContactSchema],
  moveInDate: { type: Date, default: Date.now },
  moveOutDate: { type: Date },
  isActive: { type: Boolean, default: true },
  idProofType: { type: String, enum: ['Aadhar', 'PAN', 'Passport', 'DrivingLicense', 'VoterID'] },
  idProofNumber: { type: String },
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IResident>('Resident', ResidentSchema);
