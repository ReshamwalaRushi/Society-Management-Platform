import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Search } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', purpose: '', type: 'visitor',
    vehicleNumber: '', hostResident: '', hostUnit: ''
  });

  const fetchVisitors = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    api.get('/visitors', { params })
      .then(res => setVisitors(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVisitors(); }, [filterStatus, filterType]);

  useEffect(() => {
    api.get('/residents').then(res => setResidents(res.data.data || [])).catch(() => {});
  }, []);

  const handleResidentChange = (residentId) => {
    const resident = residents.find(r => r._id === residentId);
    setForm({ ...form, hostResident: residentId, hostUnit: resident?.unit?._id || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/visitors', form);
      toast.success('Visitor pre-approved successfully');
      setShowModal(false);
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add visitor');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await api.put(`/visitors/${id}/checkin`);
      toast.success('Visitor checked in');
      fetchVisitors();
    } catch (err) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/visitors/${id}/checkout`);
      toast.success('Visitor checked out');
      fetchVisitors();
    } catch (err) {
      toast.error('Failed to check out');
    }
  };

  const filtered = visitors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visitor Management</h1>
          <p className="text-gray-500 text-sm">{visitors.length} total visitors</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Pre-Approve Visitor
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['pre-approved', 'checked-in', 'checked-out', 'denied'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>
            {['visitor', 'delivery', 'cab', 'service', 'emergency'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Phone', 'Type', 'Purpose', 'Host', 'Arrival', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No visitors found</td></tr>
                ) : filtered.map(visitor => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{visitor.name}</td>
                    <td className="px-4 py-3">{visitor.phone}</td>
                    <td className="px-4 py-3"><Badge status={visitor.type} /></td>
                    <td className="px-4 py-3 text-gray-500">{visitor.purpose}</td>
                    <td className="px-4 py-3">{visitor.hostResident?.name}</td>
                    <td className="px-4 py-3 text-xs">
                      {visitor.actualArrival ? new Date(visitor.actualArrival).toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3"><Badge status={visitor.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {visitor.status === 'pre-approved' && (
                          <Button size="sm" variant="success" onClick={() => handleCheckIn(visitor._id)}>Check In</Button>
                        )}
                        {visitor.status === 'checked-in' && (
                          <Button size="sm" variant="outline" onClick={() => handleCheckOut(visitor._id)}>Check Out</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Pre-Approve Visitor">
        <form onSubmit={handleSubmit}>
          <Input label="Visitor Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Purpose *" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {['visitor', 'delivery', 'cab', 'service', 'emergency'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Select label="Host Resident *" value={form.hostResident} onChange={e => handleResidentChange(e.target.value)} required>
            <option value="">Select Resident</option>
            {residents.map(r => <option key={r._id} value={r._id}>{r.name} - Unit {r.unit?.unitNumber}</option>)}
          </Select>
          <Input label="Vehicle Number (optional)" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} />
          <Button type="submit" loading={saving} className="w-full">Pre-Approve</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Visitors;
