"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BillItemSchema = new mongoose_1.default.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 }
});
const BillSchema = new mongoose_1.default.Schema({
    billNumber: { type: String, unique: true },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
    resident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    items: [BillItemSchema],
    baseAmount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'overdue', 'partial'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: Date },
    lateFee: { type: Number, default: 0 },
    remindersSent: { type: Number, default: 0 },
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
BillSchema.pre('save', function (next) {
    if (!this.billNumber) {
        this.billNumber = `BILL-${this.year}${String(this.month).padStart(2, '0')}-${Date.now()}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Bill', BillSchema);
