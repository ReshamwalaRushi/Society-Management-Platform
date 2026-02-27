import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone, Mail, Home } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ResidentFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const ResidentForm: React.FC<ResidentFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = useState<any>({
    name: '', email: '', phone: '', type: 'owner',
    idProofType: 'Aadhar', idProofNumber: '', moveInDate: ''
  });
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    api.get('/units').then(res => setUnits(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Full Name *" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Email *" type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} required />
      <Input label="Phone *" value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })} required />
      <Select label="Unit" value={form.unit || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, unit: e.target.value })} required>
        <option value="">Select Unit</option>
        {units.map((u: any) => <option key={u._id} value={u._id}>{u.building} - {u.unitNumber}</option>)}
      </Select>
      <Select label="Type" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
        <option value="owner">Owner</option>
        <option value="tenant">Tenant</option>
      </Select>
      <Select label="ID Proof Type" value={form.idProofType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, idProofType: e.target.value })}>
        {['Aadhar', 'PAN', 'Passport', 'DrivingLicense', 'VoterID'].map(t => <option key={t}>{t}</option>)}
      </Select>
      <Input label="ID Proof Number" value={form.idProofNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, idProofNumber: e.target.value })} />
      <Input label="Move-In Date" type="date" value={form.moveInDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, moveInDate: e.target.value })} />
      <div className="flex gap-2 mt-2">
        <Button type="submit" loading={loading} className="flex-1">Add Resident</Button>
      </div>
    </form>
  );
};

const Residents: React.FC = () => {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchResidents = () => {
    setLoading(true);
    api.get('/residents')
      .then(res => setResidents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResidents(); }, []);

  const handleAdd = async (data: any) => {
    setSaving(true);
    try {
      await api.post('/residents', data);
      toast.success('Resident added successfully');
      setShowModal(false);
      fetchResidents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add resident');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveOut = async (id: string) => {
    if (!window.confirm('Mark this resident as moved out?')) return;
    try {
      await api.put(`/residents/${id}/moveout`);
      toast.success('Resident moved out');
      fetchResidents();
    } catch (err: any) {
      toast.error('Failed to update');
    }
  };

  const filtered = residents.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search) || r.email?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resident Management</h1>
          <p className="text-gray-500 text-sm">{residents.length} total residents</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Resident
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="owner">Owners</option>
            <option value="tenant">Tenants</option>
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? <EmptyState message="No residents found" /> : filtered.map(resident => (
            <Card key={resident._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {resident.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{resident.name}</p>
                    <Badge status={resident.type} />
                  </div>
                </div>
                <Badge status={resident.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={13} />
                  <span>{resident.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} />
                  <span className="truncate">{resident.email}</span>
                </div>
                {resident.unit && (
                  <div className="flex items-center gap-2">
                    <Home size={13} />
                    <span>{resident.unit.building} - {resident.unit.unitNumber}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Move-in: {new Date(resident.moveInDate).toLocaleDateString('en-IN')}
                </p>
                {resident.isActive && (
                  <Button variant="outline" size="sm" onClick={() => handleMoveOut(resident._id)}>
                    Move Out
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Resident">
        <ResidentForm onSubmit={handleAdd} loading={saving} />
      </Modal>
    </div>
  );
};

export default Residents;
