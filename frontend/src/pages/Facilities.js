import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Textarea, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const facilities = ['Clubhouse', 'Gym', 'PartyHall', 'SwimmingPool', 'TennisCourt', 'Badminton', 'Garden'];
const facilityCharges = { Clubhouse: 2000, Gym: 0, PartyHall: 5000, SwimmingPool: 500, TennisCourt: 300, Badminton: 200, Garden: 0 };

const Facilities = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterFacility, setFilterFacility] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    facility: 'Clubhouse', bookingDate: '', startTime: '09:00',
    endTime: '11:00', purpose: '', guestCount: 0
  });
  const [residents, setResidents] = useState([]);

  const fetchBookings = () => {
    setLoading(true);
    const params = {};
    if (filterFacility) params.facility = filterFacility;
    if (filterStatus) params.status = filterStatus;
    api.get('/facilities', { params })
      .then(res => setBookings(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filterFacility, filterStatus]);
  useEffect(() => {
    api.get('/residents').then(res => setResidents(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const charge = facilityCharges[form.facility] || 0;
      await api.post('/facilities', { ...form, bookingCharge: charge });
      toast.success('Booking submitted for approval');
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'cancel') {
        await api.put(`/facilities/${id}/cancel`, { reason: 'Cancelled by admin' });
        toast.success('Booking cancelled');
      } else {
        await api.put(`/facilities/${id}`, { status: action });
        toast.success(`Booking ${action}`);
      }
      fetchBookings();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facility Booking</h1>
          <p className="text-gray-500 text-sm">Manage society facility reservations</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Booking
        </Button>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {facilities.map(f => (
          <Card key={f} className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterFacility(filterFacility === f ? '' : f)}>
            <Calendar size={24} className="mx-auto text-indigo-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">{f}</p>
            <p className="text-xs text-gray-400 mt-1">
              {facilityCharges[f] ? `₹${facilityCharges[f]}/booking` : 'Free'}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filterFacility} onChange={e => setFilterFacility(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Facilities</option>
            {facilities.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['pending', 'approved', 'rejected', 'cancelled', 'completed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.length === 0 ? <EmptyState message="No bookings found" /> : bookings.map(booking => (
            <Card key={booking._id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{booking.facility}</p>
                  <p className="text-sm text-gray-500">{booking.resident?.name} | {booking.unit?.building}-{booking.unit?.unitNumber}</p>
                </div>
                <Badge status={booking.status} />
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={13} />
                  <span>{new Date(booking.bookingDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                {booking.purpose && <p className="text-xs text-gray-400">{booking.purpose}</p>}
              </div>
              {booking.bookingCharge > 0 && (
                <p className="text-sm font-semibold text-indigo-600 mt-2">Charge: ₹{booking.bookingCharge}</p>
              )}
              {booking.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="success" onClick={() => handleAction(booking._id, 'approved')}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => handleAction(booking._id, 'rejected')}>Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(booking._id, 'cancel')}>Cancel</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Facility Booking">
        <form onSubmit={handleSubmit}>
          <Select label="Facility" value={form.facility} onChange={e => setForm({ ...form, facility: e.target.value })}>
            {facilities.map(f => <option key={f}>{f}</option>)}
          </Select>
          <Select label="Resident" value={form.resident || ''} onChange={e => setForm({ ...form, resident: e.target.value })} required>
            <option value="">Select Resident</option>
            {residents.map(r => <option key={r._id} value={r._id}>{r.name} - {r.unit?.unitNumber}</option>)}
          </Select>
          <Input label="Booking Date" type="date" value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
            <Input label="End Time" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
          </div>
          <Textarea label="Purpose" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
          <Input label="Expected Guests" type="number" value={form.guestCount} onChange={e => setForm({ ...form, guestCount: parseInt(e.target.value) })} />
          {facilityCharges[form.facility] > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">Booking Charge: <strong>₹{facilityCharges[form.facility]}</strong></p>
            </div>
          )}
          <Button type="submit" loading={saving} className="w-full">Submit Booking</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Facilities;
