import React, { useEffect, useState } from 'react';
import { Users, DollarSign, AlertCircle, UserCheck, Calendar, Shield, Building2, Bell } from 'lucide-react';
import { StatCard, Card, Badge, LoadingSpinner } from '../components/common';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Residents', value: stats?.totalResidents || 0, icon: Users, color: 'bg-blue-500', subtitle: 'Active residents' },
    { title: 'Total Units', value: stats?.totalUnits || 0, icon: Building2, color: 'bg-indigo-500', subtitle: 'All units' },
    { title: 'Pending Bills', value: stats?.pendingBills || 0, icon: DollarSign, color: 'bg-yellow-500', subtitle: 'Awaiting payment' },
    { title: 'Open Complaints', value: stats?.openComplaints || 0, icon: AlertCircle, color: 'bg-red-500', subtitle: 'Need attention' },
    { title: "Today's Visitors", value: stats?.todayVisitors || 0, icon: UserCheck, color: 'bg-green-500', subtitle: 'Today' },
    { title: 'Pending Bookings', value: stats?.pendingBookings || 0, icon: Calendar, color: 'bg-purple-500', subtitle: 'Awaiting approval' },
    { title: 'Security Logs', value: stats?.todaySecurityLogs || 0, icon: Shield, color: 'bg-gray-600', subtitle: 'Today' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Society Management Platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-700">Recent Announcements</h3>
          </div>
          {stats?.recentAnnouncements?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAnnouncements.map((a: any) => (
                <div key={a._id} className="border-l-4 border-indigo-400 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">{a.title}</p>
                    <Badge status={a.type} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.author?.name} &bull; {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No announcements yet</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-green-600" />
            <h3 className="font-semibold text-gray-700">Bill Statistics</h3>
          </div>
          {stats?.billStats?.length > 0 ? (
            <div className="space-y-2">
              {stats.billStats.map((stat: any) => (
                <div key={stat._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge status={stat._id} />
                    <span className="text-sm text-gray-600">{stat.count} bills</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ₹{stat.total?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No bill data available</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
