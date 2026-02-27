import { Router, Request, Response } from 'express';
import Bill from '../models/Bill';
import Unit from '../models/Unit';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { month, year, status, unitId } = req.query;
    const filter: any = { societyId: req.user.societyId };
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);
    if (status) filter.status = status;
    if (unitId) filter.unit = unitId;
    const bills = await Bill.find(filter)
      .populate('unit', 'unitNumber building')
      .populate('resident', 'name phone')
      .sort('-createdAt');
    res.json({ success: true, count: bills.length, data: bills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    req.body.societyId = req.user.societyId;
    const bill = await Bill.create(req.body);
    res.status(201).json({ success: true, data: bill });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/generate', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const { month, year, dueDate, items } = req.body;
    const units = await Unit.find({ societyId: req.user.societyId, occupancyType: { $ne: 'vacant' } })
      .populate('currentOccupant');
    const bills: any[] = [];
    for (const unit of units) {
      if (!unit.currentOccupant) continue;
      const existing = await Bill.findOne({ unit: unit._id, month, year });
      if (existing) continue;
      const baseAmount = unit.monthlyMaintenance || 0;
      const gstAmount = baseAmount * 0.18;
      const totalAmount = baseAmount + gstAmount;
      bills.push({
        unit: unit._id,
        resident: (unit.currentOccupant as any)._id,
        month, year, dueDate,
        items: items || [{ description: 'Monthly Maintenance', amount: baseAmount, taxRate: 18, taxAmount: gstAmount }],
        baseAmount, gstAmount, totalAmount,
        societyId: req.user.societyId
      });
    }
    const createdBills = await Bill.insertMany(bills);
    res.status(201).json({ success: true, count: createdBills.length, data: createdBills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/pending/dues', protect, async (req: Request, res: Response) => {
  try {
    const bills = await Bill.find({ societyId: req.user.societyId, status: { $in: ['pending', 'overdue'] } })
      .populate('unit', 'unitNumber building')
      .populate('resident', 'name phone email');
    const totalDues = bills.reduce((sum, bill) => sum + (bill.totalAmount - bill.paidAmount), 0);
    res.json({ success: true, count: bills.length, totalDues, data: bills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('unit').populate('resident');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
