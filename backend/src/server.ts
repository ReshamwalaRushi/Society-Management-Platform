import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society_management')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-society', (societyId: string) => {
    socket.join(societyId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

import authRoutes from './routes/auth';
import residentRoutes from './routes/residents';
import unitRoutes from './routes/units';
import billRoutes from './routes/bills';
import paymentRoutes from './routes/payments';
import facilityRoutes from './routes/facilities';
import visitorRoutes from './routes/visitors';
import complaintRoutes from './routes/complaints';
import announcementRoutes from './routes/announcements';
import securityRoutes from './routes/security';
import vehicleRoutes from './routes/vehicles';
import dashboardRoutes from './routes/dashboard';

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/residents', apiLimiter, residentRoutes);
app.use('/api/units', apiLimiter, unitRoutes);
app.use('/api/bills', apiLimiter, billRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/facilities', apiLimiter, facilityRoutes);
app.use('/api/visitors', apiLimiter, visitorRoutes);
app.use('/api/complaints', apiLimiter, complaintRoutes);
app.use('/api/announcements', apiLimiter, announcementRoutes);
app.use('/api/security', apiLimiter, securityRoutes);
app.use('/api/vehicles', apiLimiter, vehicleRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
