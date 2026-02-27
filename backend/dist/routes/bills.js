"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Bill_1 = __importDefault(require("../models/Bill"));
const Unit_1 = __importDefault(require("../models/Unit"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { month, year, status, unitId } = req.query;
        const filter = { societyId: req.user.societyId };
        if (month)
            filter.month = parseInt(month);
        if (year)
            filter.year = parseInt(year);
        if (status)
            filter.status = status;
        if (unitId)
            filter.unit = unitId;
        const bills = await Bill_1.default.find(filter)
            .populate('unit', 'unitNumber building')
            .populate('resident', 'name phone')
            .sort('-createdAt');
        res.json({ success: true, count: bills.length, data: bills });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const bill = await Bill_1.default.create(req.body);
        res.status(201).json({ success: true, data: bill });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/generate', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const { month, year, dueDate, items } = req.body;
        const units = await Unit_1.default.find({ societyId: req.user.societyId, occupancyType: { $ne: 'vacant' } })
            .populate('currentOccupant');
        const bills = [];
        for (const unit of units) {
            if (!unit.currentOccupant)
                continue;
            const existing = await Bill_1.default.findOne({ unit: unit._id, month, year });
            if (existing)
                continue;
            const baseAmount = unit.monthlyMaintenance || 0;
            const gstAmount = baseAmount * 0.18;
            const totalAmount = baseAmount + gstAmount;
            bills.push({
                unit: unit._id,
                resident: unit.currentOccupant._id,
                month, year, dueDate,
                items: items || [{ description: 'Monthly Maintenance', amount: baseAmount, taxRate: 18, taxAmount: gstAmount }],
                baseAmount, gstAmount, totalAmount,
                societyId: req.user.societyId
            });
        }
        const createdBills = await Bill_1.default.insertMany(bills);
        res.status(201).json({ success: true, count: createdBills.length, data: createdBills });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/pending/dues', auth_1.protect, async (req, res) => {
    try {
        const bills = await Bill_1.default.find({ societyId: req.user.societyId, status: { $in: ['pending', 'overdue'] } })
            .populate('unit', 'unitNumber building')
            .populate('resident', 'name phone email');
        const totalDues = bills.reduce((sum, bill) => sum + (bill.totalAmount - bill.paidAmount), 0);
        res.json({ success: true, count: bills.length, totalDues, data: bills });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const bill = await Bill_1.default.findById(req.params.id).populate('unit').populate('resident');
        if (!bill)
            return res.status(404).json({ success: false, message: 'Bill not found' });
        res.json({ success: true, data: bill });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const bill = await Bill_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!bill)
            return res.status(404).json({ success: false, message: 'Bill not found' });
        res.json({ success: true, data: bill });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
