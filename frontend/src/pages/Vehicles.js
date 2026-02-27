import React, { useEffect, useState } from 'react';
import { Car, Plus, Trash2 } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const vehicleTypes = ['Car', 'Motorcycle', 'Scooter', 'Bicycle', 'Other'];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState({
    type: 'Car', make: '', model: '', color: '',
    registrationNumber: '', parkingSlot: '', resident: '', unit: ''
  });

  const fetchVehicles = () => {
    setLoading(true);
    api.get('/vehicles')
      .then(res => setVehicles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);
  useEffect(() => {
    api.get('/residents').then(res => setResidents(res.data.data || [])).catch(() => {});
  }, []);

  const handleResidentChange = (residentId) => {
    const resident = residents.find(r => r._id === residentId);
    setForm({ ...form, resident: residentId, unit: resident?.unit?._id || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/vehicles', form);
      toast.success('Vehicle registered');
      setShowModal(false);
      setForm({ type: 'Car', make: '', model: '', color: '', registrationNumber: '', parkingSlot: '', resident: '', unit: '' });
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed');
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to remove vehicle');
    }
  };

  const vehicleIcons = { Car: '🚗', Motorcycle: '🏍️', Scooter: '🛵', Bicycle: '🚲', Other: '🚐' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vehicle Management</h1>
          <p className="text-gray-500 text-sm">{vehicles.length} registered vehicles</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Vehicle
        </Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.length === 0 ? <EmptyState message="No vehicles registered" /> : vehicles.map(vehicle => (
            <Card key={vehicle._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{vehicleIcons[vehicle.type] || '🚗'}</span>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <Badge status={vehicle.type?.toLowerCase()} />
                  </div>
                </div>
                <button onClick={() => handleDelete(vehicle._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reg. Number</span>
                  <span className="font-mono font-semibold text-gray-800">{vehicle.registrationNumber}</span>
                </div>
                {vehicle.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Color</span>
                    <span className="text-gray-700">{vehicle.color}</span>
                  </div>
                )}
                {vehicle.parkingSlot && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parking</span>
                    <span className="text-gray-700">{vehicle.parkingSlot}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1.5 mt-2">
                  <span className="text-gray-500">Owner</span>
                  <span className="text-gray-700">{vehicle.resident?.name}</span>
                </div>
                {vehicle.unit && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit</span>
                    <span className="text-gray-700">{vehicle.unit.building}-{vehicle.unit.unitNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Vehicle">
        <form onSubmit={handleSubmit}>
          <Select label="Vehicle Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {vehicleTypes.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Select label="Resident *" value={form.resident} onChange={e => handleResidentChange(e.target.value)} required>
            <option value="">Select Resident</option>
            {residents.map(r => <option key={r._id} value={r._id}>{r.name} - Unit {r.unit?.unitNumber}</option>)}
          </Select>
          <Input label="Registration Number *" value={form.registrationNumber}
            onChange={e => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
            placeholder="MH 01 AB 1234" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="Maruti, Bajaj..." />
            <Input label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Swift, Pulsar..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="White, Black..." />
            <Input label="Parking Slot" value={form.parkingSlot} onChange={e => setForm({ ...form, parkingSlot: e.target.value })} placeholder="A-101" />
          </div>
          <Button type="submit" loading={saving} className="w-full">Register Vehicle</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
