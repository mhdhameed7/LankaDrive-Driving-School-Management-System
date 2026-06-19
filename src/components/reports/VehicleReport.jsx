import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const VehicleReport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await window.api.getVehicles();
        setVehicles(data || []);
      } catch (error) {
        console.error("Failed to load vehicles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = String(v.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(v.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(v.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(v.model || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeCount = filteredVehicles.filter(v => v.status === 'Active').length;
  const maintenanceCount = filteredVehicles.filter(v => v.status === 'Maintenance').length;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Vehicle Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Vehicle Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={''}
        onDateChange={() => {}}
        showDateFilter={false} // Vehicles list doesn't strictly need date filter
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</p>
          <p className="text-2xl font-bold text-gray-800">{filteredVehicles.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-900">{activeCount}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p className="text-sm font-medium text-amber-800 mb-1">In Maintenance</p>
          <p className="text-2xl font-bold text-amber-900">{maintenanceCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Registration No.</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Make & Model</th>
                <th className="px-4 py-3 font-medium">Transmission</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.plateNumber}</td>
                    <td className="px-4 py-3 text-gray-800">{v.type || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.make} {v.model}</td>
                    <td className="px-4 py-3 text-gray-600">{v.transmission}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        v.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        v.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No vehicles found.
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

export default VehicleReport;
