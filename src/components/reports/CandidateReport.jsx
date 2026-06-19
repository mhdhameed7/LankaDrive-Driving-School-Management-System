import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const CandidateReport = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // Empty means all, or YYYY-MM

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const data = await window.api.getCandidates();
        setCandidates(data || []);
      } catch (error) {
        console.error("Failed to load candidates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Filter logic
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = String(c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(c.nic || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // For date filter, we'll check registeredDate (assuming it's YYYY-MM-DD)
    const matchesDate = dateFilter ? c.registeredDate?.startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  const newRegistrationsCount = filteredCandidates.length;
  
  // Progress status counts
  const stageCounts = filteredCandidates.reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Candidate Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Candidate Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Total in List</p>
          <p className="text-2xl font-bold text-blue-900">{newRegistrationsCount}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">New (Stage 0)</p>
          <p className="text-2xl font-bold text-gray-800">{stageCounts[0] || 0}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p className="text-sm font-medium text-amber-800 mb-1">Training (Stage 4)</p>
          <p className="text-2xl font-bold text-amber-900">{stageCounts[4] || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm font-medium text-green-800 mb-1">Certified (Stage 6)</p>
          <p className="text-2xl font-bold text-green-900">{stageCounts[6] || 0}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">NIC</th>
                <th className="px-4 py-3 font-medium">Reg. Date</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status / Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.id}</td>
                    <td className="px-4 py-3 text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.nic}</td>
                    <td className="px-4 py-3 text-gray-600">{c.registeredDate || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {String(c.status || 'Unknown').replace(/_/g, ' ')} (Stage {c.stage})
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No candidates found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidateReport;
