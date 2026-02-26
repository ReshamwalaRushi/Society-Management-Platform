import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, StatCard, Badge, Modal, Input, Select, Button, LoadingSpinner, EmptyState } from '../components/common';
import api from '../services/api';
import toast from 'react-hot-toast';

const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const Financial = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: ''
  });

  const fetchBills = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterMonth) params.month = filterMonth;
    api.get('/bills', { params })
      .then(res => setBills(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBills(); }, [filterStatus, filterMonth]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/bills/generate', genForm);
      toast.success(`Generated ${res.data.count} bills`);
      setShowGenModal(false);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bills');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const method = e.target.method.value;
    setSaving(true);
    try {
      await api.post('/payments/cash', { billId: selectedBill._id, amount, paymentMethod: method });
      toast.success('Payment recorded successfully');
      setShowPayModal(false);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0);
  const paidAmount = bills.reduce((s, b) => s + b.paidAmount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Management</h1>
          <p className="text-gray-500 text-sm">Bills, payments and dues</p>
        </div>
        <Button onClick={() => setShowGenModal(true)}>
          <Plus size={16} /> Generate Bills
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Billed" value={`₹${totalAmount.toLocaleString('en-IN')}`} icon={DollarSign} color="bg-blue-500" />
        <StatCard title="Collected" value={`₹${paidAmount.toLocaleString('en-IN')}`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Pending Dues" value={`₹${pendingAmount.toLocaleString('en-IN')}`} icon={AlertTriangle} color="bg-red-500" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {['pending', 'paid', 'overdue', 'partial'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Months</option>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <LoadingSpinner /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Bill No.', 'Unit', 'Resident', 'Month', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No bills found</td></tr>
                ) : bills.map(bill => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{bill.billNumber}</td>
                    <td className="px-4 py-3">{bill.unit?.building}-{bill.unit?.unitNumber}</td>
                    <td className="px-4 py-3">{bill.resident?.name}</td>
                    <td className="px-4 py-3">{months[bill.month - 1]} {bill.year}</td>
                    <td className="px-4 py-3 font-semibold">₹{bill.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">{new Date(bill.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3"><Badge status={bill.status} /></td>
                    <td className="px-4 py-3">
                      {bill.status !== 'paid' && (
                        <Button size="sm" variant="success" onClick={() => { setSelectedBill(bill); setShowPayModal(true); }}>
                          Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Generate Bills Modal */}
      <Modal open={showGenModal} onClose={() => setShowGenModal(false)} title="Generate Maintenance Bills">
        <form onSubmit={handleGenerate}>
          <Select label="Month" value={genForm.month} onChange={e => setGenForm({ ...genForm, month: parseInt(e.target.value) })}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </Select>
          <Input label="Year" type="number" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: parseInt(e.target.value) })} required />
          <Input label="Due Date" type="date" value={genForm.dueDate} onChange={e => setGenForm({ ...genForm, dueDate: e.target.value })} required />
          <p className="text-xs text-gray-500 mb-4">Bills will be generated for all occupied units using their configured monthly maintenance amount.</p>
          <Button type="submit" loading={saving} className="w-full">Generate Bills</Button>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal open={showPayModal} onClose={() => { setShowPayModal(false); setSelectedBill(null); }} title="Record Payment">
        {selectedBill && (
          <form onSubmit={handlePayment}>
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-800">{selectedBill.billNumber}</p>
              <p className="text-xs text-blue-600">{selectedBill.resident?.name} | {selectedBill.unit?.building}-{selectedBill.unit?.unitNumber}</p>
              <p className="text-lg font-bold text-blue-800 mt-1">₹{selectedBill.totalAmount?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-blue-600">Paid: ₹{selectedBill.paidAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input name="amount" type="number" defaultValue={selectedBill.totalAmount - selectedBill.paidAmount}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="method" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>
            <Button type="submit" loading={saving} className="w-full">Record Payment</Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Financial;
