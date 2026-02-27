import { Router, Request, Response } from 'express';
import Payment from '../models/Payment';
import Bill from '../models/Bill';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ societyId: req.user.societyId })
      .populate('unit', 'unitNumber building')
      .populate('resident', 'name')
      .populate('bill', 'billNumber month year')
      .sort('-createdAt');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/create-order', protect, async (req: Request, res: Response) => {
  try {
    const { billId, amount } = req.body;
    const orderId = `order_${Date.now()}`;
    res.json({ success: true, orderId, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/verify', protect, async (req: Request, res: Response) => {
  try {
    const { billId, razorpayOrderId, razorpayPaymentId, amount } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const payment = await Payment.create({
      bill: billId,
      unit: bill.unit,
      resident: bill.resident,
      amount,
      paymentMethod: 'online',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'success',
      societyId: req.user.societyId
    });

    bill.paidAmount += amount;
    bill.status = bill.paidAmount >= bill.totalAmount ? 'paid' : 'partial';
    if (bill.status === 'paid') bill.paidDate = new Date();
    await bill.save();

    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/cash', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const { billId, amount, paymentMethod } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const payment = await Payment.create({
      bill: billId,
      unit: bill.unit,
      resident: bill.resident,
      amount,
      paymentMethod: paymentMethod || 'cash',
      status: 'success',
      societyId: req.user.societyId
    });

    bill.paidAmount += amount;
    bill.status = bill.paidAmount >= bill.totalAmount ? 'paid' : 'partial';
    if (bill.status === 'paid') bill.paidDate = new Date();
    await bill.save();

    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/summary', protect, async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const filter: any = { societyId: req.user.societyId, status: 'success' };
    if (year) {
      filter.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year as string) + 1}-01-01`)
      };
    }
    const payments = await Payment.find(filter);
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ success: true, total, count: payments.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
