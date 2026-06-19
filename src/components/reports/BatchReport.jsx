import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const BatchReport = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await window.api.getBatches();
        setBatches(data || []);
      } catch (error) {
        console.error("Failed to load batches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(b => {
    const matchesSearch = String(b.batchCode || b.id).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.type && b.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (b.instructorId && b.instructorId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter ? b.startDate?.startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  const activeCount = filteredBatches.filter(b => b.status === 'Active' || b.status === 'Upcoming').length;
  const completedCount = filteredBatches.filter(b => b.status === 'Completed').length;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Batch Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Batch Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Batches</p>
          <p className="text-2xl font-bold text-gray-800">{filteredBatches.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Active Batches</p>
          <p className="text-2xl font-bold text-blue-900">{activeCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm font-medium text-green-800 mb-1">Completed Batches</p>
          <p className="text-2xl font-bold text-green-900">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Batch ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Vehicle Type</th>
                <th className="px-4 py-3 font-medium">Instructor</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.batchCode || b.id}</td>
                    <td className="px-4 py-3 text-gray-800">{b.type || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.vehicleId || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.instructorName || b.instructorId || 'Not Assigned'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.startDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No batches found.
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

export default BatchReport;
