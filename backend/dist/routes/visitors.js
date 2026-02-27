"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Visitor_1 = __importDefault(require("../models/Visitor"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { status, type, date } = req.query;
        const filter = { societyId: req.user.societyId };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.createdAt = { $gte: start, $lt: end };
        }
        const visitors = await Visitor_1.default.find(filter)
            .populate('hostResident', 'name phone')
            .populate('hostUnit', 'unitNumber building')
            .sort('-createdAt');
        res.json({ success: true, count: visitors.length, data: visitors });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const visitor = await Visitor_1.default.create(req.body);
        const io = req.app.get('io');
        io.to(req.user.societyId).emit('new-visitor', visitor);
        res.status(201).json({ success: true, data: visitor });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const visitor = await Visitor_1.default.findById(req.params.id).populate('hostResident').populate('hostUnit');
        if (!visitor)
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        res.json({ success: true, data: visitor });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/checkin', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'security'), async (req, res) => {
    try {
        const visitor = await Visitor_1.default.findByIdAndUpdate(req.params.id, { status: 'checked-in', actualArrival: new Date() }, { new: true });
        if (!visitor)
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        res.json({ success: true, data: visitor });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/checkout', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'security'), async (req, res) => {
    try {
        const visitor = await Visitor_1.default.findByIdAndUpdate(req.params.id, { status: 'checked-out', actualDeparture: new Date() }, { new: true });
        if (!visitor)
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        res.json({ success: true, data: visitor });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
