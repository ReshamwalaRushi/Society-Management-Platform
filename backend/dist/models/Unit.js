"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UnitSchema = new mongoose_1.default.Schema({
    unitNumber: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: Number },
    type: { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Studio'], default: '2BHK' },
    area: { type: Number },
    owner: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident' },
    currentOccupant: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident' },
    occupancyType: { type: String, enum: ['owner', 'tenant', 'vacant'], default: 'vacant' },
    monthlyMaintenance: { type: Number, default: 0 },
    parkingSlots: [{ type: String }],
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Unit', UnitSchema);
