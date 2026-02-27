import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Button } from '../components/common';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'resident' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Building2 size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" placeholder="+91 9876543210" value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <Select label="Role" value={form.role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, role: e.target.value })}>
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="security">Security</option>
            <option value="staff">Staff</option>
          </Select>
          <Button type="submit" loading={loading} className="w-full">Register</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
