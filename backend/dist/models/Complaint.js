"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CommentSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ComplaintSchema = new mongoose_1.default.Schema({
    ticketNumber: { type: String, unique: true },
    resident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Lift', 'Parking', 'Garden', 'Internet', 'Other'],
        required: true
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed', 'reopened'], default: 'open' },
    attachments: [{ type: String }],
    assignedTo: { type: String },
    resolvedDate: { type: Date },
    resolutionNote: { type: String },
    comments: [CommentSchema],
    rating: { type: Number, min: 1, max: 5 },
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
ComplaintSchema.pre('save', function (next) {
    if (!this.ticketNumber) {
        this.ticketNumber = `TICKET-${Date.now()}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Complaint', ComplaintSchema);
