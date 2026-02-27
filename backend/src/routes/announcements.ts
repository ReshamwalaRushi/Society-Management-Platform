import { Router, Request, Response } from 'express';
import Announcement from '../models/Announcement';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { type, isActive } = req.query;
    const filter: any = { societyId: req.user.societyId };
    if (type) filter.type = type;
    filter.isActive = isActive !== 'false';
    const announcements = await Announcement.find(filter)
      .populate('author', 'name role')
      .sort('-createdAt');
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    req.body.author = req.user.id;
    req.body.societyId = req.user.societyId;
    const announcement = await Announcement.create(req.body);
    const io = req.app.get('io');
    io.to(req.user.societyId).emit('new-announcement', announcement);
    res.status(201).json({ success: true, data: announcement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('author', 'name role');
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    if (!announcement.readBy.includes(req.user.id)) {
      announcement.readBy.push(req.user.id);
      await announcement.save();
    }
    res.json({ success: true, data: announcement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager'), async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: announcement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/vote', protect, async (req: Request, res: Response) => {
  try {
    const { optionIndex } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement || announcement.type !== 'poll') {
      return res.status(400).json({ success: false, message: 'Not a poll' });
    }
    const alreadyVoted = announcement.pollOptions.some(opt =>
      opt.votedBy.some((userId: any) => userId.equals(req.user.id))
    );
    if (alreadyVoted) return res.status(400).json({ success: false, message: 'Already voted' });
    announcement.pollOptions[optionIndex].votes += 1;
    announcement.pollOptions[optionIndex].votedBy.push(req.user.id);
    await announcement.save();
    res.json({ success: true, data: announcement });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
