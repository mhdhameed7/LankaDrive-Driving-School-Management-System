import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CalendarDays, 
  Car, 
  CreditCard,
  UserPlus,
  CalendarPlus,
  Receipt
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    registered: 0,
    inTraining: 0,
    certified: 0
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const candidatesData = await window.api.getCandidates();
        setCandidates(candidatesData);
        const statsData = await window.api.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    };
    loadData();
  }, []);

  // Calculate Pipeline Stages based on candidate.stage (1 to 5)
  const stages = [
    { name: 'Registration', stage: 1, color: 'bg-blue-100 text-blue-800' },
    { name: 'Medicals', stage: 2, color: 'bg-amber-100 text-amber-800' },
    { name: 'Theory Exam', stage: 3, color: 'bg-purple-100 text-purple-800' },
    { name: 'Training', stage: 4, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Licensing', stage: 5, color: 'bg-green-100 text-green-800' },
  ];

  const pipelineCounts = stages.map(s => ({
    ...s,
    count: candidates.filter(candidate => candidate.stage === s.stage).length
  }));

  const getStatusBadge = (status) => {
    const badges = {
      'REGISTERED': 'bg-blue-100 text-blue-800',
      'MEDICAL_PENDING': 'bg-amber-100 text-amber-800',
      'MEDICAL_APPROVED': 'bg-emerald-100 text-emerald-800',
      'WRITTEN_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800',
      'WRITTEN_EXAM_PASSED': 'bg-emerald-100 text-emerald-800',
      'LEARNER_PERMIT_ISSUED': 'bg-indigo-100 text-indigo-800',
      'IN_TRAINING': 'bg-amber-100 text-amber-800',
      'ELIGIBLE_FOR_TRIAL': 'bg-orange-100 text-orange-800',
      'TRIAL_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800',
      'CERTIFIED': 'bg-green-100 text-green-800',
    };
    const style = badges[status] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${style}`}>{status.replace(/_/g, ' ')}</span>;
  };

  // Chart Data
  const chartData = [
    { name: 'Sep', income: 45000 },
    { name: 'Oct', income: 55000 },
    { name: 'Nov', income: 40000 },
    { name: 'Dec', income: 65000 },
    { name: 'Jan', income: 75000 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5">
          <UserPlus size={18} /> Add Candidate
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#f59e0b] hover:text-[#f59e0b] text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5">
          <CalendarPlus size={18} /> Schedule Batch
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#10b981] hover:text-[#10b981] text-gray-700 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5">
          <Receipt size={18} /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Candidates</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalCandidates}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-[#f59e0b]">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">In Training</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.inTraining}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Car size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Certified</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.certified}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">New Registrations</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.registered}</h3>
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Candidate Pipeline Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Current distribution of candidates across the licensing workflow</p>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="flex items-center min-w-[800px] gap-2">
            {pipelineCounts.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 text-center relative hover:shadow-md transition-shadow">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${stage.color} font-bold text-sm`}>
                    {stage.count}
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">{stage.name}</p>
                </div>
                {index < pipelineCounts.length - 1 && (
                  <div className="text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Recent Registrations</h3>
            <button className="text-sm font-medium text-[#f59e0b] hover:text-[#d97706]">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Candidate Info</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.slice(0, 5).map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800">{candidate.name}</div>
                      <div className="text-gray-500 text-xs">{candidate.id} • {candidate.nic}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-semibold">{candidate.licenseClass}</td>
                    <td className="px-5 py-3">
                      {getStatusBadge(candidate.status)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{candidate.registeredDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Report Mini Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Income</h3>
          </div>
          <div className="p-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
