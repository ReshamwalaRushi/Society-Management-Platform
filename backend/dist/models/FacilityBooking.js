"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const FacilityBookingSchema = new mongoose_1.default.Schema({
    facility: {
        type: String,
        enum: ['Clubhouse', 'Gym', 'PartyHall', 'SwimmingPool', 'TennisCourt', 'Badminton', 'Garden'],
        required: true
    },
    resident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
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
exports.default = mongoose_1.default.model('FacilityBooking', FacilityBookingSchema);
