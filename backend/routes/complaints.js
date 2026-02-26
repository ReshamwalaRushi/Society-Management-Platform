const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = { societyId: req.user.societyId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    const complaints = await Complaint.find(filter)
      .populate('resident', 'name phone')
      .populate('unit', 'unitNumber building')
      .sort('-createdAt');
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    req.body.societyId = req.user.societyId;
    const complaint = await Complaint.create(req.body);
    const io = req.app.get('io');
    io.to(req.user.societyId).emit('new-complaint', complaint);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('resident').populate('unit');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    const io = req.app.get('io');
    io.to(req.user.societyId).emit('complaint-updated', complaint);
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    complaint.comments.push({ user: req.user.id, text: req.body.text });
    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update status
router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    const { status, resolutionNote, assignedTo } = req.body;
    const update = { status };
    if (resolutionNote) update.resolutionNote = resolutionNote;
    if (assignedTo) update.assignedTo = assignedTo;
    if (status === 'resolved') update.resolvedDate = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
