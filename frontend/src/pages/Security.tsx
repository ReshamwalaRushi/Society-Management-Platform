import React, { useEffect, useState } from 'react';
import { Shield, Plus, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Textarea, Button, LoadingSpinner, EmptyState, StatCard } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const logTypes = ['gate-entry', 'gate-exit', 'patrol', 'incident', 'guard-attendance'];

const Security: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [form, setForm] = useState({
    type: 'gate-entry', description: '', location: '', personName: '',
    vehicleNumber: '', severity: ''
  });

  const fetchLogs = () => {
    setLoading(true);
    const params: any = {};
    if (filterType) params.type = filterType;
    if (filterSeverity) params.severity = filterSeverity;
    api.get('/security', { params })
      .then(res => setLogs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [filterType, filterSeverity]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/security', form);
      toast.success('Security log added');
      setShowModal(false);
      setForm({ type: 'gate-entry', description: '', location: '', personName: '', vehicleNumber: '', severity: '' });
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add log');
    } finally {
      setSaving(false);
    }
  };

  const incidents = logs.filter(l => l.type === 'incident').length;
  const entries = logs.filter(l => l.type === 'gate-entry').length;
  const exits = logs.filter(l => l.type === 'gate-exit').length;
  const alerts = logs.filter(l => l.severity === 'high' || l.severity === 'critical').length;

  const typeIcons: Record<string, string> = { 'gate-entry': '🔑', 'gate-exit': '🚪', 'patrol': '🔍', 'incident': '🚨', 'guard-attendance': '👮' };
  const severityBorder: Record<string, string> = { low: 'border-l-green-400', medium: 'border-l-yellow-400', high: 'border-l-orange-500', critical: 'border-l-red-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Security Management</h1>
          <p className="text-gray-500 text-sm">Gate logs, incidents, and patrol records</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Log
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Gate Entries" value={entries} icon={Shield} color="bg-green-500" />
        <StatCard title="Gate Exits" value={exits} icon={Shield} color="bg-blue-500" />
        <StatCard title="Incidents" value={incidents} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="High Alerts" value={alerts} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filterType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>
            {logTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterSeverity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterSeverity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Severity</option>
            {['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {logs.length === 0 ? <EmptyState message="No security logs found" /> : logs.map(log => (
            <Card key={log._id} className={`p-4 border-l-4 ${log.severity ? severityBorder[log.severity] : 'border-l-gray-300'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{typeIcons[log.type] || '📋'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 capitalize">{log.type.replace(/-/g, ' ')}</p>
                      {log.severity && <Badge status={log.severity} />}
                    </div>
                    {log.personName && <p className="text-sm text-gray-600 mt-0.5">Person: {log.personName}</p>}
                    {log.vehicleNumber && <p className="text-sm text-gray-600">Vehicle: {log.vehicleNumber}</p>}
                    {log.description && <p className="text-sm text-gray-500 mt-1">{log.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {log.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {log.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {new Date(log.createdAt).toLocaleString('en-IN')}
                      </span>
                      {log.guard && <span>Guard: {log.guard.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Security Log">
        <form onSubmit={handleSubmit}>
          <Select label="Log Type *" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
            {logTypes.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Person Name" value={form.personName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, personName: e.target.value })} placeholder="Name of person" />
          <Input label="Vehicle Number" value={form.vehicleNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="Vehicle registration" />
          <Input label="Location" value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, location: e.target.value })} placeholder="Gate 1, Parking, etc." />
          <Select label="Severity" value={form.severity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, severity: e.target.value })}>
            <option value="">None</option>
            {['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}
          </Select>
          <Textarea label="Description" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} placeholder="Details about the log entry..." />
          <Button type="submit" loading={saving} className="w-full">Add Security Log</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Security;
