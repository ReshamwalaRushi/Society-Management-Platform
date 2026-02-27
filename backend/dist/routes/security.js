"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SecurityLog_1 = __importDefault(require("../models/SecurityLog"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { type, date, severity } = req.query;
        const filter = { societyId: req.user.societyId };
        if (type)
            filter.type = type;
        if (severity)
            filter.severity = severity;
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.createdAt = { $gte: start, $lt: end };
        }
        const logs = await SecurityLog_1.default.find(filter)
            .populate('guard', 'name')
            .sort('-createdAt');
        res.json({ success: true, count: logs.length, data: logs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'security'), async (req, res) => {
    try {
        req.body.guard = req.user.id;
        req.body.societyId = req.user.societyId;
        const log = await SecurityLog_1.default.create(req.body);
        if (req.body.severity === 'high' || req.body.severity === 'critical') {
            const io = req.app.get('io');
            io.to(req.user.societyId).emit('security-alert', log);
        }
        res.status(201).json({ success: true, data: log });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const log = await SecurityLog_1.default.findById(req.params.id).populate('guard', 'name');
        if (!log)
            return res.status(404).json({ success: false, message: 'Log not found' });
        res.json({ success: true, data: log });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'security'), async (req, res) => {
    try {
        const log = await SecurityLog_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!log)
            return res.status(404).json({ success: false, message: 'Log not found' });
        res.json({ success: true, data: log });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
