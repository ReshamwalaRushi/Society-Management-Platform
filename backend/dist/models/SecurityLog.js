"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SecurityLogSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ['gate-entry', 'gate-exit', 'patrol', 'incident', 'guard-attendance'],
        required: true
    },
    guard: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
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
exports.default = mongoose_1.default.model('SecurityLog', SecurityLogSchema);
