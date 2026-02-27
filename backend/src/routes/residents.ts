import { Router, Request, Response } from 'express';
import Resident from '../models/Resident';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { societyId, isActive, type } = req.query;
    const filter: any = { societyId: societyId || req.user.societyId };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;
    const residents = await Resident.find(filter).populate('unit', 'unitNumber building').sort('-createdAt');
    res.json({ success: true, count: residents.length, data: residents });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    req.body.societyId = req.user.societyId;
    const resident = await Resident.create(req.body);
    res.status(201).json({ success: true, data: resident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const resident = await Resident.findById(req.params.id).populate('unit');
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    res.json({ success: true, data: resident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const resident = await Resident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    res.json({ success: true, data: resident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const resident = await Resident.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    res.json({ success: true, message: 'Resident deactivated' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/moveout', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      { moveOutDate: new Date(), isActive: false },
      { new: true }
    );
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    res.json({ success: true, data: resident });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
