import { Router, Request, Response } from 'express';
import Visitor from '../models/Visitor';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { status, type, date } = req.query;
    const filter: any = { societyId: req.user.societyId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const visitors = await Visitor.find(filter)
      .populate('hostResident', 'name phone')
      .populate('hostUnit', 'unitNumber building')
      .sort('-createdAt');
    res.json({ success: true, count: visitors.length, data: visitors });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req: Request, res: Response) => {
  try {
    req.body.societyId = req.user.societyId;
    const visitor = await Visitor.create(req.body);
    const io = req.app.get('io');
    io.to(req.user.societyId).emit('new-visitor', visitor);
    res.status(201).json({ success: true, data: visitor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('hostResident').populate('hostUnit');
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/checkin', protect, authorize('admin', 'manager', 'security'), async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in', actualArrival: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/checkout', protect, authorize('admin', 'manager', 'security'), async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-out', actualDeparture: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
