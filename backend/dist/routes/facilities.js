"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FacilityBooking_1 = __importDefault(require("../models/FacilityBooking"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { facility, date, status } = req.query;
        const filter = { societyId: req.user.societyId };
        if (facility)
            filter.facility = facility;
        if (status)
            filter.status = status;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.bookingDate = { $gte: start, $lt: end };
        }
        const bookings = await FacilityBooking_1.default.find(filter)
            .populate('resident', 'name phone')
            .populate('unit', 'unitNumber building')
            .sort('bookingDate');
        res.json({ success: true, count: bookings.length, data: bookings });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const conflict = await FacilityBooking_1.default.findOne({
            facility: req.body.facility,
            bookingDate: req.body.bookingDate,
            status: { $in: ['pending', 'approved'] },
            startTime: { $lt: req.body.endTime },
            endTime: { $gt: req.body.startTime }
        });
        if (conflict) {
            return res.status(400).json({ success: false, message: 'Time slot is already booked' });
        }
        const booking = await FacilityBooking_1.default.create(req.body);
        res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const booking = await FacilityBooking_1.default.findById(req.params.id).populate('resident').populate('unit');
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        const booking = await FacilityBooking_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/cancel', auth_1.protect, async (req, res) => {
    try {
        const booking = await FacilityBooking_1.default.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancellationReason: req.body.reason }, { new: true });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/checkin', auth_1.protect, async (req, res) => {
    try {
        const booking = await FacilityBooking_1.default.findByIdAndUpdate(req.params.id, { checkedIn: true, checkedInTime: new Date(), status: 'completed' }, { new: true });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
