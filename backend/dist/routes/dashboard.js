"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Resident_1 = __importDefault(require("../models/Resident"));
const Bill_1 = __importDefault(require("../models/Bill"));
const Complaint_1 = __importDefault(require("../models/Complaint"));
const Visitor_1 = __importDefault(require("../models/Visitor"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const FacilityBooking_1 = __importDefault(require("../models/FacilityBooking"));
const SecurityLog_1 = __importDefault(require("../models/SecurityLog"));
const Unit_1 = __importDefault(require("../models/Unit"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.protect, async (req, res) => {
    try {
        const societyId = req.user.societyId;
        const [totalResidents, totalUnits, pendingBills, openComplaints, todayVisitors, recentAnnouncements, pendingBookings, todaySecurityLogs] = await Promise.all([
            Resident_1.default.countDocuments({ societyId, isActive: true }),
            Unit_1.default.countDocuments({ societyId }),
            Bill_1.default.countDocuments({ societyId, status: { $in: ['pending', 'overdue'] } }),
            Complaint_1.default.countDocuments({ societyId, status: { $in: ['open', 'in-progress'] } }),
            Visitor_1.default.countDocuments({ societyId, createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            Announcement_1.default.find({ societyId, isActive: true }).sort('-createdAt').limit(5).populate('author', 'name'),
            FacilityBooking_1.default.countDocuments({ societyId, status: 'pending' }),
            SecurityLog_1.default.countDocuments({ societyId, createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
        ]);
        const billStats = await Bill_1.default.aggregate([
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
