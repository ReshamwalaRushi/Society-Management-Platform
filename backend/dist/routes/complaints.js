"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Complaint_1 = __importDefault(require("../models/Complaint"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { status, category, priority } = req.query;
        const filter = { societyId: req.user.societyId };
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (priority)
            filter.priority = priority;
        const complaints = await Complaint_1.default.find(filter)
            .populate('resident', 'name phone')
            .populate('unit', 'unitNumber building')
            .sort('-createdAt');
        res.json({ success: true, count: complaints.length, data: complaints });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, async (req, res) => {
    try {
        req.body.societyId = req.user.societyId;
        const complaint = await Complaint_1.default.create(req.body);
        const io = req.app.get('io');
        io.to(req.user.societyId).emit('new-complaint', complaint);
        res.status(201).json({ success: true, data: complaint });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const complaint = await Complaint_1.default.findById(req.params.id).populate('resident').populate('unit');
        if (!complaint)
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        res.json({ success: true, data: complaint });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        const complaint = await Complaint_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!complaint)
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        const io = req.app.get('io');
        io.to(req.user.societyId).emit('complaint-updated', complaint);
        res.json({ success: true, data: complaint });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/:id/comments', auth_1.protect, async (req, res) => {
    try {
        const complaint = await Complaint_1.default.findById(req.params.id);
        if (!complaint)
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        complaint.comments.push({ user: req.user.id, text: req.body.text, createdAt: new Date() });
        await complaint.save();
        res.json({ success: true, data: complaint });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id/status', auth_1.protect, (0, auth_1.authorize)('admin', 'manager', 'staff'), async (req, res) => {
    try {
        const { status, resolutionNote, assignedTo } = req.body;
        const update = { status };
        if (resolutionNote)
            update.resolutionNote = resolutionNote;
        if (assignedTo)
            update.assignedTo = assignedTo;
        if (status === 'resolved')
            update.resolvedDate = new Date();
        const complaint = await Complaint_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ success: true, data: complaint });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
