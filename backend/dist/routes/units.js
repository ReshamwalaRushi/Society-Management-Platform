"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Unit_1 = __importDefault(require("../models/Unit"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const units = await Unit_1.default.find({ societyId: req.user.societyId })
            .populate('owner', 'name phone')
            .populate('currentOccupant', 'name phone')
            .sort('unitNumber');
        res.json({ success: true, count: units.length, data: units });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const unit = await Unit_1.default.create(req.body);
        res.status(201).json({ success: true, data: unit });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const unit = await Unit_1.default.findById(req.params.id).populate('owner').populate('currentOccupant');
        if (!unit)
            return res.status(404).json({ success: false, message: 'Unit not found' });
        res.json({ success: true, data: unit });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const unit = await Unit_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!unit)
            return res.status(404).json({ success: false, message: 'Unit not found' });
        res.json({ success: true, data: unit });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
