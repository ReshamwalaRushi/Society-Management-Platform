import React, { useEffect, useState } from 'react';
import { Bell, Plus, Vote } from 'lucide-react';
import { Card, Badge, Modal, Input, Select, Textarea, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const Communication: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    title: '', content: '', type: 'general', targetAudience: 'all',
    expiryDate: '', pollOptions: [] as { option: string; votes: number }[]
  });
  const [pollOptionText, setPollOptionText] = useState('');

  const fetchAnnouncements = () => {
    setLoading(true);
    const params: any = { isActive: true };
    if (filterType) params.type = filterType;
    api.get('/announcements', { params })
      .then(res => setAnnouncements(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, [filterType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement posted');
      setShowModal(false);
      setForm({ title: '', content: '', type: 'general', targetAudience: 'all', expiryDate: '', pollOptions: [] });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setSaving(false);
    }
  };

  const handleVote = async (announcementId: string, optionIndex: number) => {
    try {
      await api.post(`/announcements/${announcementId}/vote`, { optionIndex });
      toast.success('Vote recorded');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    }
  };

  const addPollOption = () => {
    if (pollOptionText.trim()) {
      setForm({ ...form, pollOptions: [...form.pollOptions, { option: pollOptionText.trim(), votes: 0 }] });
      setPollOptionText('');
    }
  };

  const typeColors: Record<string, string> = {
    emergency: 'border-red-400 bg-red-50',
    event: 'border-purple-400 bg-purple-50',
    notice: 'border-yellow-400 bg-yellow-50',
    general: 'border-blue-400 bg-blue-50',
    poll: 'border-teal-400 bg-teal-50'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Communication Hub</h1>
          <p className="text-gray-500 text-sm">Announcements, notices & polls</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Announcement
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'general', 'emergency', 'event', 'notice', 'poll'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {announcements.length === 0 ? <EmptyState message="No announcements found" /> : (
            announcements.map(a => (
              <Card key={a._id} className={`p-5 border-l-4 ${typeColors[a.type] || 'border-blue-400 bg-blue-50'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      By {a.author?.name} &bull; {new Date(a.createdAt).toLocaleDateString('en-IN')}
                      {a.targetAudience !== 'all' && ` &bull; For ${a.targetAudience}`}
                    </p>
                  </div>
                  <Badge status={a.type} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{a.content}</p>

                {a.type === 'poll' && a.pollOptions?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1"><Vote size={12} /> Vote:</p>
                    {a.pollOptions.map((opt: any, i: number) => {
                      const totalVotes = a.pollOptions.reduce((s: number, o: any) => s + o.votes, 0);
                      const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <button onClick={() => handleVote(a._id, i)} className="text-indigo-600 hover:underline font-medium">{opt.option}</button>
                            <span className="text-gray-500">{opt.votes} votes ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Bell size={11} />
                  <span>{a.readBy?.length || 0} read</span>
                  {a.expiryDate && <span>&bull; Expires {new Date(a.expiryDate).toLocaleDateString('en-IN')}</span>}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Announcement">
        <form onSubmit={handleSubmit}>
          <Input label="Title *" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Content *" value={form.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, content: e.target.value })} rows={4} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, type: e.target.value })}>
              {['general', 'emergency', 'event', 'notice', 'poll'].map(t => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Audience" value={form.targetAudience} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="all">All</option>
              <option value="owners">Owners</option>
              <option value="tenants">Tenants</option>
            </Select>
          </div>
          <Input label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, expiryDate: e.target.value })} />
          {form.type === 'poll' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Poll Options</label>
              <div className="flex gap-2 mb-2">
                <input value={pollOptionText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollOptionText(e.target.value)}
                  placeholder="Add option..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                <Button type="button" variant="secondary" onClick={addPollOption}>Add</Button>
              </div>
              {form.pollOptions.map((opt, i) => (
                <p key={i} className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded mb-1">{i + 1}. {opt.option}</p>
              ))}
            </div>
          )}
          <Button type="submit" loading={saving} className="w-full">Post Announcement</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Communication;
