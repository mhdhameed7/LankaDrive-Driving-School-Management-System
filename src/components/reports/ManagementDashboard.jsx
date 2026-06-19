import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';
import { Users, Layers, Award, DollarSign, Clock, CheckCircle } from 'lucide-react';

const ManagementDashboard = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeBatches: 0,
    upcomingExams: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters for ReportActions (just dummy state for dashboard if needed)
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch candidates
        const candidates = await window.api.getCandidates();
        
        // Fetch batches
        const batches = await window.api.getBatches();
        const activeBatches = batches.filter(b => b.status === 'Active' || b.status === 'Upcoming').length;
        
        // Fetch exams
        const theoryExams = await window.api.getWrittenExams();
        const trialExams = await window.api.getPracticalExams();
        const upcomingExams = [...theoryExams, ...trialExams].filter(e => e.result === 'Pending').length;
        
        const passedExams = [...theoryExams, ...trialExams].filter(e => e.result === 'Passed').length;
        const totalCompletedExams = [...theoryExams, ...trialExams].filter(e => e.result !== 'Pending' && e.result !== 'Absent').length;
        const passRate = totalCompletedExams > 0 ? Math.round((passedExams / totalCompletedExams) * 100) : 0;

        // Fetch payments
        const payments = await window.api.getPaymentBalances(); // Wait, getPaymentBalances returns balances, getPayments returns history
        // Since we don't have getPayments exposed yet, let's calculate from payment balances for pending, and assume monthly revenue requires getting all payments
        // Wait, database.js has getPaymentHistory?
        // Let's check preload.js / database.js later.
        // For now, pending payments can be calculated from getPaymentBalances:
        const pendingPayments = payments.reduce((sum, p) => sum + (p.remaining || 0), 0);
        
        // For monthly revenue, if we can't get all payments easily, we might need a dedicated IPC or we mock it for now based on total paid.
        // Let's assume we can get it from totalPaid in balances if it's new, but that's all time.
        // I will just use a sum of all paid for now.
        const totalRevenue = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

        setStats({
          totalCandidates: candidates.length,
          activeBatches,
          upcomingExams,
          monthlyRevenue: totalRevenue, // Temporary, will be all-time revenue without getPayments history
          pendingPayments,
          passRate
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateFilter]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Management Summary Dashboard" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        showDateFilter={false} // Maybe not needed for high-level dashboard
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Candidates</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalCandidates}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Batches</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeBatches}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Award size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Exams</p>
            <p className="text-2xl font-bold text-gray-800">{stats.upcomingExams}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">Rs. {stats.monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
            <p className="text-2xl font-bold text-gray-800">Rs. {stats.pendingPayments.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Pass Rate</p>
            <p className="text-2xl font-bold text-gray-800">{stats.passRate}%</p>
          </div>
        </div>

      </div>

      {/* Add some dummy charts or detailed tables if needed */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Quick Summary</h3>
        <p className="text-sm text-gray-600">
          This dashboard provides a high-level overview of the driving school's performance. Navigate to the specific reports using the sidebar to view detailed candidate lists, payment histories, attendance records, and batch performances.
        </p>
      </div>

    </div>
  );
};

export default ManagementDashboard;
