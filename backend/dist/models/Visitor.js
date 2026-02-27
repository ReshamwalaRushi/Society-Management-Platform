"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VisitorSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    hostResident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    hostUnit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
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
    approvedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Visitor', VisitorSchema);
