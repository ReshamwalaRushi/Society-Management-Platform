"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const vehicles = await Vehicle_1.default.find({ societyId: req.user.societyId, isActive: true })
            .populate('resident', 'name phone')
            .populate('unit', 'unitNumber building');
        res.json({ success: true, count: vehicles.length, data: vehicles });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const vehicle = await Vehicle_1.default.create(req.body);
        res.status(201).json({ success: true, data: vehicle });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vehicle)
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, data: vehicle });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!vehicle)
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        res.json({ success: true, message: 'Vehicle removed' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
