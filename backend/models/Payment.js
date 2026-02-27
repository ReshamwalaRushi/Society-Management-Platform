const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
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

PaymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `REC-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
