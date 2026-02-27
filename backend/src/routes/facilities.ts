import { Router, Request, Response } from 'express';
import FacilityBooking from '../models/FacilityBooking';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { facility, date, status } = req.query;
    const filter: any = { societyId: req.user.societyId };
    if (facility) filter.facility = facility;
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.bookingDate = { $gte: start, $lt: end };
    }
    const bookings = await FacilityBooking.find(filter)
      .populate('resident', 'name phone')
      .populate('unit', 'unitNumber building')
      .sort('bookingDate');
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req: Request, res: Response) => {
  try {
    req.body.societyId = req.user.societyId;
    const conflict = await FacilityBooking.findOne({
      facility: req.body.facility,
      bookingDate: req.body.bookingDate,
      status: { $in: ['pending', 'approved'] },
      startTime: { $lt: req.body.endTime },
      endTime: { $gt: req.body.startTime }
    });
    if (conflict) {
      return res.status(400).json({ success: false, message: 'Time slot is already booked' });
    }
    const booking = await FacilityBooking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const booking = await FacilityBooking.findById(req.params.id).populate('resident').populate('unit');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req: Request, res: Response) => {
  try {
    const booking = await FacilityBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/cancel', protect, async (req: Request, res: Response) => {
  try {
    const booking = await FacilityBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancellationReason: req.body.reason },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/checkin', protect, async (req: Request, res: Response) => {
  try {
    const booking = await FacilityBooking.findByIdAndUpdate(
      req.params.id,
      { checkedIn: true, checkedInTime: new Date(), status: 'completed' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
