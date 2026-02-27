"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const FamilyMemberSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    relation: { type: String, required: true },
    age: { type: Number },
    phone: { type: String },
    email: { type: String }
});
const EmergencyContactSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    relation: { type: String },
    phone: { type: String, required: true }
});
const ResidentSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
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
exports.default = mongoose_1.default.model('Resident', ResidentSchema);
