import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const InstructorReport = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const data = await window.api.getInstructors();
        setInstructors(data || []);
      } catch (error) {
        console.error("Failed to load instructors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  const filteredInstructors = instructors.filter(i => {
    const matchesSearch = String(i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(i.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeCount = filteredInstructors.filter(i => i.status === 'Active').length;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Instructor Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Instructor Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={''}
        onDateChange={() => {}}
        showDateFilter={false} // Instructor list is generally static
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Instructors</p>
          <p className="text-2xl font-bold text-gray-800">{filteredInstructors.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Active Instructors</p>
          <p className="text-2xl font-bold text-blue-900">{activeCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Instructor ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">NIC</th>
                <th className="px-4 py-3 font-medium">License Classes</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.id}</td>
                    <td className="px-4 py-3 text-gray-800">{i.name}</td>
                    <td className="px-4 py-3 text-gray-600">{i.nic}</td>
                    <td className="px-4 py-3 text-gray-600">{i.licenseClasses}</td>
                    <td className="px-4 py-3 text-gray-600">{i.contactNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        i.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No instructors found.
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

export default InstructorReport;
