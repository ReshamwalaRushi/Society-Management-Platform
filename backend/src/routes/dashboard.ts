import { Router, Request, Response } from 'express';
import Resident from '../models/Resident';
import Bill from '../models/Bill';
import Complaint from '../models/Complaint';
import Visitor from '../models/Visitor';
import Announcement from '../models/Announcement';
import FacilityBooking from '../models/FacilityBooking';
import SecurityLog from '../models/SecurityLog';
import Unit from '../models/Unit';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, async (req: Request, res: Response) => {
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
        totalResidents, totalUnits, pendingBills, openComplaints,
        todayVisitors, pendingBookings, todaySecurityLogs,
        recentAnnouncements, billStats
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
