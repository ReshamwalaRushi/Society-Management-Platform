const express = require('express');
const router = express.Router();
const Resident = require('../models/Resident');
const Bill = require('../models/Bill');
const Complaint = require('../models/Complaint');
const Visitor = require('../models/Visitor');
const Announcement = require('../models/Announcement');
const FacilityBooking = require('../models/FacilityBooking');
const SecurityLog = require('../models/SecurityLog');
const Unit = require('../models/Unit');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const societyId = req.user.societyId;
    const [
      totalResidents,
      totalUnits,
      pendingBills,
      openComplaints,
      todayVisitors,
      recentAnnouncements,
      pendingBookings,
      todaySecurityLogs
    ] = await Promise.all([
      Resident.countDocuments({ societyId, isActive: true }),
      Unit.countDocuments({ societyId }),
      Bill.countDocuments({ societyId, status: { $in: ['pending', 'overdue'] } }),
      Complaint.countDocuments({ societyId, status: { $in: ['open', 'in-progress'] } }),
      Visitor.countDocuments({ societyId, createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Announcement.find({ societyId, isActive: true }).sort('-createdAt').limit(5).populate('author', 'name'),
      FacilityBooking.countDocuments({ societyId, status: 'pending' }),
      SecurityLog.countDocuments({ societyId, createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
    ]);

    const billStats = await Bill.aggregate([
      { $match: { societyId } },
      { $group: { _id: '$status', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalResidents,
        totalUnits,
        pendingBills,
        openComplaints,
        todayVisitors,
        pendingBookings,
        todaySecurityLogs,
        recentAnnouncements,
        billStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
