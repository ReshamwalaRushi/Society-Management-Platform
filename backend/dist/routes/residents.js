"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Resident_1 = __importDefault(require("../models/Resident"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { societyId, isActive, type } = req.query;
        const filter = { societyId: societyId || req.user.societyId };
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        if (type)
            filter.type = type;
        const residents = await Resident_1.default.find(filter).populate('unit', 'unitNumber building').sort('-createdAt');
        res.json({ success: true, count: residents.length, data: residents });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const resident = await Resident_1.default.create(req.body);
        res.status(201).json({ success: true, data: resident });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const resident = await Resident_1.default.findById(req.params.id).populate('unit');
        if (!resident)
            return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, data: resident });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const resident = await Resident_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!resident)
            return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, data: resident });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const resident = await Resident_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!resident)
            return res.status(404).json({ success: false, message: 'Resident not found' });
        res.json({ success: true, message: 'Resident deactivated' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/moveout', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const resident = await Resident_1.default.findByIdAndUpdate(req.params.id, { moveOutDate: new Date(), isActive: false }, { new: true });
        res.json({ success: true, data: resident });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
