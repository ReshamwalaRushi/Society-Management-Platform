"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentSchema = new mongoose_1.default.Schema({
    bill: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Bill' },
    unit: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Unit', required: true },
    resident: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Resident', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'cash', 'cheque', 'bank_transfer', 'upi'], default: 'online' },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    receiptNumber: { type: String },
    description: { type: String },
    societyId: { type: String, default: 'default' },
    createdAt: { type: Date, default: Date.now }
});
PaymentSchema.pre('save', function (next) {
    if (!this.receiptNumber) {
        this.receiptNumber = `REC-${Date.now()}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
