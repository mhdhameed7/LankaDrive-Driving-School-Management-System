import React, { useState, useEffect } from 'react';
import ReportActions from './ReportActions';

const ExamReport = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const theory = await window.api.getWrittenExams();
        const trial = await window.api.getPracticalExams();
        
        const mappedTheory = (theory || []).map(e => ({ ...e, type: 'Theory' }));
        const mappedTrial = (trial || []).map(e => ({ ...e, type: 'Trial' }));
        
        setExams([...mappedTheory, ...mappedTrial]);
      } catch (error) {
        console.error("Failed to load exams", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesSearch = String(e.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(e.candidateId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(e.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? e.examDate?.startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  const passedCount = filteredExams.filter(e => e.result === 'Passed').length;
  const failedCount = filteredExams.filter(e => e.result === 'Failed').length;
  const pendingCount = filteredExams.filter(e => e.result === 'Pending' || e.result === 'Absent').length;
  const passRate = (passedCount + failedCount) > 0 ? Math.round((passedCount / (passedCount + failedCount)) * 100) : 0;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading Exam Report...</div>;
  }

  return (
    <div className="p-6">
      <ReportActions 
        title="Exam Report" 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Exams</p>
          <p className="text-2xl font-bold text-gray-800">{filteredExams.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm font-medium text-green-800 mb-1">Passed</p>
          <p className="text-2xl font-bold text-green-900">{passedCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-800 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-900">{failedCount}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 mb-1">Pass Rate</p>
          <p className="text-2xl font-bold text-blue-900">{passRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Attempt</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExams.length > 0 ? (
                filteredExams.map((e, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{e.type}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {e.candidateName}<br/>
                      <span className="text-xs text-gray-500">{e.candidateId}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.examDate}</td>
                    <td className="px-4 py-3 text-gray-600">{e.attemptNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        e.result === 'Passed' ? 'bg-green-100 text-green-800' : 
                        e.result === 'Failed' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.result}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={e.notes || e.examinerNotes}>
                      {e.notes || e.examinerNotes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No exam records found.
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

export default ExamReport;
