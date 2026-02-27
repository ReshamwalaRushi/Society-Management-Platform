const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  unitNumber: { type: String, required: true },
  building: { type: String, required: true },
  floor: { type: Number },
  type: { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Studio'], default: '2BHK' },
  area: { type: Number }, // in sq ft
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  currentOccupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  occupancyType: { type: String, enum: ['owner', 'tenant', 'vacant'], default: 'vacant' },
  monthlyMaintenance: { type: Number, default: 0 },
  parkingSlots: [{ type: String }],
  societyId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Unit', UnitSchema);
