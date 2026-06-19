import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const PaymentReport = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // Using getPaymentBalances as proxy for overall payment report if detailed history is not available
        const data = await window.api.getPaymentBalances();
        setPayments(data || []);
      } catch (error) {
        console.error("Failed to load payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => {
    const matchesSearch = String(p.candidateId || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(p.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // For date filter, since we only have balances, we might not be able to filter by exact month accurately 
    // without a full getPayments history API. We will filter by any date fields if available.
    return matchesSearch;
  });

  const totalReceived = filteredPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalOutstanding = filteredPayments.reduce((sum, p) => sum + (p.remaining || 0), 0);
  const totalExpected = filteredPayments.reduce((sum, p) => sum + (p.totalFee || 0), 0);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Payment Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Payment Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-sm font-medium text-emerald-800 mb-1">Total Payments Received</p>
          <p className="text-2xl font-bold text-emerald-900">Rs. {totalReceived.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-800 mb-1">Total Outstanding Balances</p>
          <p className="text-2xl font-bold text-red-900">Rs. {totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Total Expected Revenue</p>
          <p className="text-2xl font-bold text-blue-900">Rs. {totalExpected.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Candidate ID</th>
                <th className="px-4 py-3 font-medium">Candidate Name</th>
                <th className="px-4 py-3 font-medium text-right">Total Fee</th>
                <th className="px-4 py-3 font-medium text-right">Paid Amount</th>
                <th className="px-4 py-3 font-medium text-right">Outstanding</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.candidateId}</td>
                    <td className="px-4 py-3 text-gray-800">{p.candidateName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-800 text-right">Rs. {(p.totalFee || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium text-right">Rs. {(p.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 font-medium text-right">Rs. {(p.remaining || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {p.remaining === 0 ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Fully Paid</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No payment records found.
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

export default PaymentReport;
