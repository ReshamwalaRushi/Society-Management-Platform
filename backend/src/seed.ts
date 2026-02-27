import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Unit from './models/Unit';
import Resident from './models/Resident';
import Bill from './models/Bill';
import Complaint from './models/Complaint';
import Announcement from './models/Announcement';
import Visitor from './models/Visitor';
import Vehicle from './models/Vehicle';
import FacilityBooking from './models/FacilityBooking';

dotenv.config();

const SOCIETY_ID = 'default';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society_management');
  console.log('Connected to MongoDB');

  // Clean existing data
  await Promise.all([
    User.deleteMany({}),
    Unit.deleteMany({}),
    Resident.deleteMany({}),
    Bill.deleteMany({}),
    Complaint.deleteMany({}),
    Announcement.deleteMany({}),
    Visitor.deleteMany({}),
    Vehicle.deleteMany({}),
    FacilityBooking.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create admin and manager users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@society.com',
    password: 'admin123',
    phone: '9000000001',
    role: 'admin',
    societyId: SOCIETY_ID
  });

  const manager = await User.create({
    name: 'Manager User',
    email: 'manager@society.com',
    password: 'manager123',
    phone: '9000000002',
    role: 'manager',
    societyId: SOCIETY_ID
  });

  // Create 5 units
  const units = await Unit.insertMany([
    { unitNumber: 'A-101', building: 'A', floor: 1, type: '2BHK', area: 900, monthlyMaintenance: 2500, occupancyType: 'owner', societyId: SOCIETY_ID },
    { unitNumber: 'A-102', building: 'A', floor: 1, type: '3BHK', area: 1200, monthlyMaintenance: 3000, occupancyType: 'tenant', societyId: SOCIETY_ID },
    { unitNumber: 'A-103', building: 'A', floor: 1, type: '1BHK', area: 600, monthlyMaintenance: 2000, occupancyType: 'owner', societyId: SOCIETY_ID },
    { unitNumber: 'B-201', building: 'B', floor: 2, type: '2BHK', area: 950, monthlyMaintenance: 2500, occupancyType: 'tenant', societyId: SOCIETY_ID },
    { unitNumber: 'B-202', building: 'B', floor: 2, type: '3BHK', area: 1300, monthlyMaintenance: 3500, occupancyType: 'vacant', societyId: SOCIETY_ID }
  ]);

  // Create 3 resident users and their profiles
  const residentUser1 = await User.create({
    name: 'Rahul Sharma',
    email: 'resident1@society.com',
    password: 'resident123',
    phone: '9000000003',
    role: 'resident',
    societyId: SOCIETY_ID,
    unit: units[0]._id
  });

  const residentUser2 = await User.create({
    name: 'Priya Singh',
    email: 'resident2@society.com',
    password: 'resident123',
    phone: '9000000004',
    role: 'resident',
    societyId: SOCIETY_ID,
    unit: units[1]._id
  });

  const residentUser3 = await User.create({
    name: 'Amit Kumar',
    email: 'resident3@society.com',
    password: 'resident123',
    phone: '9000000005',
    role: 'resident',
    societyId: SOCIETY_ID,
    unit: units[2]._id
  });

  const residents = await Resident.insertMany([
    {
      user: residentUser1._id,
      unit: units[0]._id,
      name: 'Rahul Sharma',
      email: 'resident1@society.com',
      phone: '9000000003',
      type: 'owner',
      idProofType: 'Aadhar',
      idProofNumber: 'XXXX-XXXX-0001',
      societyId: SOCIETY_ID
    },
    {
      user: residentUser2._id,
      unit: units[1]._id,
      name: 'Priya Singh',
      email: 'resident2@society.com',
      phone: '9000000004',
      type: 'tenant',
      idProofType: 'PAN',
      idProofNumber: 'ABCDE1234F',
      societyId: SOCIETY_ID
    },
    {
      user: residentUser3._id,
      unit: units[2]._id,
      name: 'Amit Kumar',
      email: 'resident3@society.com',
      phone: '9000000005',
      type: 'owner',
      idProofType: 'Passport',
      idProofNumber: 'P1234567',
      societyId: SOCIETY_ID
    }
  ]);

  // Update units with occupants
  await Unit.findByIdAndUpdate(units[0]._id, { owner: residents[0]._id, currentOccupant: residents[0]._id });
  await Unit.findByIdAndUpdate(units[1]._id, { currentOccupant: residents[1]._id });
  await Unit.findByIdAndUpdate(units[2]._id, { owner: residents[2]._id, currentOccupant: residents[2]._id });

  // Create bills
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const dueDate = new Date(year, month, 10);

  await Bill.insertMany([
    {
      unit: units[0]._id, resident: residents[0]._id, month, year,
      items: [{ description: 'Monthly Maintenance', amount: 2500, taxRate: 18, taxAmount: 450 }],
      baseAmount: 2500, gstAmount: 450, totalAmount: 2950,
      dueDate, status: 'pending', societyId: SOCIETY_ID
    },
    {
      unit: units[1]._id, resident: residents[1]._id, month, year,
      items: [{ description: 'Monthly Maintenance', amount: 3000, taxRate: 18, taxAmount: 540 }],
      baseAmount: 3000, gstAmount: 540, totalAmount: 3540,
      dueDate, status: 'paid', paidAmount: 3540, paidDate: new Date(), societyId: SOCIETY_ID
    },
    {
      unit: units[2]._id, resident: residents[2]._id, month: month, year: year - 1,
      items: [{ description: 'Monthly Maintenance', amount: 2000, taxRate: 18, taxAmount: 360 }],
      baseAmount: 2000, gstAmount: 360, totalAmount: 2360,
      dueDate: new Date(year - 1, month, 10), status: 'overdue', societyId: SOCIETY_ID
    }
  ]);

  // Create complaints
  await Complaint.insertMany([
    {
      resident: residents[0]._id, unit: units[0]._id,
      title: 'Water leakage in bathroom',
      description: 'There is a water leakage issue in the bathroom ceiling.',
      category: 'Plumbing', priority: 'high', status: 'open', societyId: SOCIETY_ID
    },
    {
      resident: residents[1]._id, unit: units[1]._id,
      title: 'Lift not working',
      description: 'The lift in Block A has been out of service since yesterday.',
      category: 'Lift', priority: 'urgent', status: 'in-progress',
      assignedTo: 'Elevator Services Pvt Ltd', societyId: SOCIETY_ID
    },
    {
      resident: residents[2]._id, unit: units[2]._id,
      title: 'Common area lighting issue',
      description: 'Several lights on the 3rd floor corridor are not working.',
      category: 'Electrical', priority: 'medium', status: 'resolved',
      resolutionNote: 'Bulbs replaced by maintenance team.', resolvedDate: new Date(), societyId: SOCIETY_ID
    }
  ]);

  // Create announcements
  await Announcement.insertMany([
    {
      title: 'Society Annual General Meeting',
      content: 'The Annual General Meeting will be held on the last Sunday of the month at 10:00 AM in the clubhouse.',
      type: 'event', author: admin._id, targetAudience: 'all', isActive: true, societyId: SOCIETY_ID
    },
    {
      title: 'Water Supply Interruption',
      content: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM due to pipeline maintenance.',
      type: 'notice', author: manager._id, targetAudience: 'all', isActive: true, societyId: SOCIETY_ID
    },
    {
      title: 'Security Advisory',
      content: 'Please ensure all visitors are registered at the security gate before entering the premises.',
      type: 'general', author: admin._id, targetAudience: 'all', isActive: true, societyId: SOCIETY_ID
    }
  ]);

  // Create visitors
  await Visitor.insertMany([
    {
      name: 'Delivery Agent', phone: '9111111111', purpose: 'Package delivery',
      hostResident: residents[0]._id, hostUnit: units[0]._id,
      type: 'delivery', status: 'checked-out',
      actualArrival: new Date(), actualDeparture: new Date(), societyId: SOCIETY_ID
    },
    {
      name: 'Ramesh Verma', phone: '9222222222', purpose: 'Personal visit',
      hostResident: residents[1]._id, hostUnit: units[1]._id,
      type: 'visitor', status: 'pre-approved',
      expectedArrival: new Date(Date.now() + 3600000), societyId: SOCIETY_ID
    }
  ]);

  // Create vehicles
  await Vehicle.insertMany([
    {
      resident: residents[0]._id, unit: units[0]._id,
      type: 'Car', make: 'Maruti', model: 'Swift',
      color: 'White', registrationNumber: 'MH12AB1234',
      parkingSlot: 'P-01', societyId: SOCIETY_ID
    },
    {
      resident: residents[1]._id, unit: units[1]._id,
      type: 'Motorcycle', make: 'Honda', model: 'Activa',
      color: 'Black', registrationNumber: 'MH12CD5678',
      parkingSlot: 'P-02', societyId: SOCIETY_ID
    }
  ]);

  // Create facility bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await FacilityBooking.insertMany([
    {
      facility: 'Clubhouse', resident: residents[0]._id, unit: units[0]._id,
      bookingDate: tomorrow, startTime: '18:00', endTime: '22:00',
      purpose: 'Birthday party', guestCount: 30,
      bookingCharge: 2000, deposit: 5000,
      status: 'approved', societyId: SOCIETY_ID
    },
    {
      facility: 'Gym', resident: residents[1]._id, unit: units[1]._id,
      bookingDate: tomorrow, startTime: '06:00', endTime: '08:00',
      purpose: 'Morning workout', guestCount: 0,
      bookingCharge: 0, deposit: 0,
      status: 'pending', societyId: SOCIETY_ID
    }
  ]);

  console.log('Seed data created successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin:   admin@society.com / admin123');
  console.log('Manager: manager@society.com / manager123');
  console.log('Resident 1: resident1@society.com / resident123');
  console.log('Resident 2: resident2@society.com / resident123');
  console.log('Resident 3: resident3@society.com / resident123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
