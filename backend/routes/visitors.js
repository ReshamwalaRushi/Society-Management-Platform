const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { status, type, date } = req.query;
    const filter = { societyId: req.user.societyId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const visitors = await Visitor.find(filter)
      .populate('hostResident', 'name phone')
      .populate('hostUnit', 'unitNumber building')
      .sort('-createdAt');
    res.json({ success: true, count: visitors.length, data: visitors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    req.body.societyId = req.user.societyId;
    const visitor = await Visitor.create(req.body);
    const io = req.app.get('io');
    io.to(req.user.societyId).emit('new-visitor', visitor);
    res.status(201).json({ success: true, data: visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('hostResident').populate('hostUnit');
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check-in visitor
router.put('/:id/checkin', protect, authorize('admin', 'manager', 'security'), async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in', actualArrival: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check-out visitor
router.put('/:id/checkout', protect, authorize('admin', 'manager', 'security'), async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-out', actualDeparture: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
