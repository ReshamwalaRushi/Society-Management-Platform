const mongoose = require('mongoose');

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

module.exports = mongoose.model('Resident', ResidentSchema);
