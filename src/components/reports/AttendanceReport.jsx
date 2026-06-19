import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); 

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Using window.api.getAttendance() if available.
        // Assuming database.js has getAttendance implemented from previous work.
        const data = await window.api.getAttendance();
        setAttendance(data || []);
      } catch (error) {
        console.error("Failed to load attendance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filteredAttendance = attendance.filter(a => {
    const matchesSearch = String(a.personId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(a.personName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? a.date?.startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  const totalRecords = filteredAttendance.length;
  const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Attendance Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Attendance Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm font-medium text-green-800 mb-1">Total Present</p>
          <p className="text-2xl font-bold text-green-900">{presentCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-800 mb-1">Total Absent</p>
          <p className="text-2xl font-bold text-red-900">{absentCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Batch / Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((a, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-800">{a.date}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{a.personType}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{a.personId}</td>
                    <td className="px-4 py-3 text-gray-800">{a.personName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.batchId || a.timeSlot || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        a.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No attendance records found.
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

export default AttendanceReport;
