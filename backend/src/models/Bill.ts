import mongoose, { Document } from 'mongoose';

export interface IBillItem {
  description: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export interface IBill extends Document {
  billNumber?: string;
  unit: mongoose.Types.ObjectId;
  resident: mongoose.Types.ObjectId;
  month: number;
  year: number;
  items: IBillItem[];
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  paidDate?: Date;
  lateFee: number;
  remindersSent: number;
  societyId: string;
  createdAt: Date;
}

const BillItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 }
});

const BillSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
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

export default mongoose.model<IBill>('Bill', BillSchema);
