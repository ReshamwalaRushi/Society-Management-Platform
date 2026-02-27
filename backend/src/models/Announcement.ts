import mongoose, { Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'event' | 'notice' | 'poll';
  author: mongoose.Types.ObjectId;
  targetAudience: 'all' | 'owners' | 'tenants' | 'building';
  building?: string;
  attachments: string[];
  isActive: boolean;
  expiryDate?: Date;
  readBy: mongoose.Types.ObjectId[];
  pollOptions: {
    option: string;
    votes: number;
    votedBy: mongoose.Types.ObjectId[];
  }[];
  societyId: string;
  createdAt: Date;
}

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'emergency', 'event', 'notice', 'poll'], default: 'general' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: { type: String, enum: ['all', 'owners', 'tenants', 'building'], default: 'all' },
  building: { type: String },
  attachments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pollOptions: [{
    option: String,
    votes: { type: Number, default: 0 },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
