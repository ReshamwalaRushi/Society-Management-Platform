const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ societyId: req.user.societyId })
      .populate('unit', 'unitNumber building')
      .populate('resident', 'name')
      .populate('bill', 'billNumber month year')
      .sort('-createdAt');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { billId, amount } = req.body;
    // Razorpay integration - in production, use actual Razorpay SDK
    const orderId = `order_${Date.now()}`;
    res.json({ success: true, orderId, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record cash payment
router.post('/cash', protect, authorize('admin', 'manager'), async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/summary', protect, async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { societyId: req.user.societyId, status: 'success' };
    if (year) {
      filter.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }
    const payments = await Payment.find(filter);
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ success: true, total, count: payments.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
