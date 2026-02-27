"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AnnouncementSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'emergency', 'event', 'notice', 'poll'], default: 'general' },
    author: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: { type: String, enum: ['all', 'owners', 'tenants', 'building'], default: 'all' },
    building: { type: String },
    attachments: [{ type: String }],
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
    readBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }],
    pollOptions: [{
            option: String,
            votes: { type: Number, default: 0 },
            votedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }]
        }],
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Announcement', AnnouncementSchema);
