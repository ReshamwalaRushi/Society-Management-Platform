import React, { useEffect, useState } from 'react';
import { AlertCircle, Plus, Search } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Textarea, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Lift', 'Parking', 'Garden', 'Internet', 'Other'];

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [residents, setResidents] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Plumbing', priority: 'medium',
    resident: '', unit: ''
  });
  const [commentText, setCommentText] = useState('');

  const fetchComplaints = () => {
    setLoading(true);
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    if (filterCategory) params.category = filterCategory;
    if (filterPriority) params.priority = filterPriority;
    api.get('/complaints', { params })
      .then(res => setComplaints(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [filterStatus, filterCategory, filterPriority]);
  useEffect(() => {
    api.get('/residents').then(res => setResidents(res.data.data || [])).catch(() => {});
  }, []);

  const handleResidentChange = (residentId: string) => {
    const resident = residents.find(r => r._id === residentId);
    setForm({ ...form, resident: residentId, unit: resident?.unit?._id || '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/complaints', form);
      toast.success('Complaint submitted');
      setShowModal(false);
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, note: string, assignedTo: string) => {
    try {
      await api.put(`/complaints/${id}/status`, { status, resolutionNote: note, assignedTo });
      toast.success('Status updated');
      fetchComplaints();
      if (selectedComplaint?._id === id) {
        const updated = await api.get(`/complaints/${id}`);
        setSelectedComplaint(updated.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/complaints/${selectedComplaint._id}/comments`, { text: commentText });
      setSelectedComplaint(res.data.data);
      setCommentText('');
      toast.success('Comment added');
    } catch (err: any) {
      toast.error('Failed to add comment');
    }
  };

  const filtered = complaints.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.ticketNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const priorityColor: Record<string, string> = { low: 'border-l-green-400', medium: 'border-l-yellow-400', high: 'border-l-orange-400', urgent: 'border-l-red-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaint Management</h1>
          <p className="text-gray-500 text-sm">{complaints.length} total complaints</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Complaint
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['open', 'in-progress', 'resolved', 'closed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filterCategory} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterPriority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All Priority</option>
            {['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? <EmptyState message="No complaints found" /> : filtered.map(complaint => (
            <Card key={complaint._id} className={`p-4 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${priorityColor[complaint.priority]}`}
              onClick={() => { setSelectedComplaint(complaint); setShowDetailModal(true); }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{complaint.title}</p>
                    <Badge status={complaint.priority} />
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{complaint.ticketNumber}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{complaint.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge status={complaint.category?.toLowerCase()} />
                    <span className="text-xs text-gray-400">{complaint.resident?.name} | {complaint.unit?.building}-{complaint.unit?.unitNumber}</span>
                    <span className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <Badge status={complaint.status} />
              </div>
              {complaint.assignedTo && (
                <p className="text-xs text-blue-600 mt-2">Assigned to: {complaint.assignedTo}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit New Complaint">
        <form onSubmit={handleSubmit}>
          <Input label="Title *" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description *" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} rows={3} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}
            </Select>
          </div>
          <Select label="Resident" value={form.resident} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleResidentChange(e.target.value)} required>
            <option value="">Select Resident</option>
            {residents.map(r => <option key={r._id} value={r._id}>{r.name} - Unit {r.unit?.unitNumber}</option>)}
          </Select>
          <Button type="submit" loading={saving} className="w-full">Submit Complaint</Button>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedComplaint && (
        <Modal open={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedComplaint(null); }}
          title={`Complaint: ${selectedComplaint.ticketNumber}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge status={selectedComplaint.status} />
              <Badge status={selectedComplaint.priority} />
              <Badge status={selectedComplaint.category?.toLowerCase()} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{selectedComplaint.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedComplaint.description}</p>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Resident: {selectedComplaint.resident?.name}</p>
              <p>Unit: {selectedComplaint.unit?.building}-{selectedComplaint.unit?.unitNumber}</p>
              <p>Filed: {new Date(selectedComplaint.createdAt).toLocaleString('en-IN')}</p>
              {selectedComplaint.assignedTo && <p>Assigned to: {selectedComplaint.assignedTo}</p>}
              {selectedComplaint.resolvedDate && <p>Resolved: {new Date(selectedComplaint.resolvedDate).toLocaleString('en-IN')}</p>}
            </div>
            {/* Quick Status Update */}
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {['in-progress', 'resolved', 'closed'].map(s => (
                  <Button key={s} size="sm" variant={s === 'resolved' ? 'success' : s === 'closed' ? 'secondary' : 'primary'}
                    onClick={() => handleStatusUpdate(selectedComplaint._id, s, '', '')}>
                    Mark {s}
                  </Button>
                ))}
              </div>
            </div>
            {/* Comments */}
            {selectedComplaint.comments?.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Comments</p>
                <div className="space-y-2">
                  {selectedComplaint.comments.map((c: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-700">{c.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input value={commentText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
                placeholder="Add a comment..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <Button onClick={handleAddComment}>Post</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Complaints;
