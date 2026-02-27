"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VehicleSchema = new mongoose_1.default.Schema({
    resident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
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
exports.default = mongoose_1.default.model('Vehicle', VehicleSchema);
