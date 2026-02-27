const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/SecurityLog');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { type, date, severity } = req.query;
    const filter = { societyId: req.user.societyId };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const logs = await SecurityLog.find(filter)
      .populate('guard', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin', 'manager', 'security'), async (req, res) => {
  try {
    req.body.guard = req.user.id;
    req.body.societyId = req.user.societyId;
    const log = await SecurityLog.create(req.body);
    if (req.body.severity === 'high' || req.body.severity === 'critical') {
      const io = req.app.get('io');
      io.to(req.user.societyId).emit('security-alert', log);
    }
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const log = await SecurityLog.findById(req.params.id).populate('guard', 'name');
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager', 'security'), async (req, res) => {
  try {
    const log = await SecurityLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
