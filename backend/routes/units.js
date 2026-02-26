const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const units = await Unit.find({ societyId: req.user.societyId })
      .populate('owner', 'name phone')
      .populate('currentOccupant', 'name phone')
      .sort('unitNumber');
    res.json({ success: true, count: units.length, data: units });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    req.body.societyId = req.user.societyId;
    const unit = await Unit.create(req.body);
    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate('owner').populate('currentOccupant');
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, data: unit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
