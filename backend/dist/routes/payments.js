"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Payment_1 = __importDefault(require("../models/Payment"));
const Bill_1 = __importDefault(require("../models/Bill"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const payments = await Payment_1.default.find({ societyId: req.user.societyId })
            .populate('unit', 'unitNumber building')
            .populate('resident', 'name')
            .populate('bill', 'billNumber month year')
            .sort('-createdAt');
        res.json({ success: true, count: payments.length, data: payments });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/create-order', auth_1.protect, async (req, res) => {
    try {
        const { billId, amount } = req.body;
        const orderId = `order_${Date.now()}`;
        res.json({ success: true, orderId, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/verify', auth_1.protect, async (req, res) => {
    try {
        const { billId, razorpayOrderId, razorpayPaymentId, amount } = req.body;
        const bill = await Bill_1.default.findById(billId);
        if (!bill)
            return res.status(404).json({ success: false, message: 'Bill not found' });
        const payment = await Payment_1.default.create({
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
        if (bill.status === 'paid')
            bill.paidDate = new Date();
        await bill.save();
        res.json({ success: true, data: payment });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/cash', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const { billId, amount, paymentMethod } = req.body;
        const bill = await Bill_1.default.findById(billId);
        if (!bill)
            return res.status(404).json({ success: false, message: 'Bill not found' });
        const payment = await Payment_1.default.create({
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
        if (bill.status === 'paid')
            bill.paidDate = new Date();
        await bill.save();
        res.json({ success: true, data: payment });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/summary', auth_1.protect, async (req, res) => {
    try {
        const { year } = req.query;
        const filter = { societyId: req.user.societyId, status: 'success' };
        if (year) {
            filter.createdAt = {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${parseInt(year) + 1}-01-01`)
            };
        }
        const payments = await Payment_1.default.find(filter);
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        res.json({ success: true, total, count: payments.length });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
