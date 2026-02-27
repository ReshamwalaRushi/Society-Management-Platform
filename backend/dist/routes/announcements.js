"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Announcement_1 = __importDefault(require("../models/Announcement"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const filter = { societyId: req.user.societyId };
        if (type)
            filter.type = type;
        filter.isActive = isActive !== 'false';
        const announcements = await Announcement_1.default.find(filter)
            .populate('author', 'name role')
            .sort('-createdAt');
        res.json({ success: true, count: announcements.length, data: announcements });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        req.body.author = req.user.id;
        req.body.societyId = req.user.societyId;
        const announcement = await Announcement_1.default.create(req.body);
        const io = req.app.get('io');
        io.to(req.user.societyId).emit('new-announcement', announcement);
        res.status(201).json({ success: true, data: announcement });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/:id', auth_1.protect, async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findById(req.params.id).populate('author', 'name role');
        if (!announcement)
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        if (!announcement.readBy.includes(req.user.id)) {
            announcement.readBy.push(req.user.id);
            await announcement.save();
        }
        res.json({ success: true, data: announcement });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin', 'manager'), async (req, res) => {
    try {
        const announcement = await Announcement_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement)
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, data: announcement });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/:id/vote', auth_1.protect, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const announcement = await Announcement_1.default.findById(req.params.id);
        if (!announcement || announcement.type !== 'poll') {
            return res.status(400).json({ success: false, message: 'Not a poll' });
        }
        const alreadyVoted = announcement.pollOptions.some(opt => opt.votedBy.some((userId) => userId.equals(req.user.id)));
        if (alreadyVoted)
            return res.status(400).json({ success: false, message: 'Already voted' });
        announcement.pollOptions[optionIndex].votes += 1;
        announcement.pollOptions[optionIndex].votedBy.push(req.user.id);
        await announcement.save();
        res.json({ success: true, data: announcement });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
