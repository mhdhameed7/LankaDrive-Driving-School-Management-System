import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';

const TrialExams = () => {
  const [exams, setExams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examCenter, setExamCenter] = useState('Werahera RMV');
  const [eligibilityCheck, setEligibilityCheck] = useState(null);

  const fetchExams = async () => {
    try {
      const data = await window.api.getPracticalExams();
      setExams(data || []);
      const cands = await window.api.getCandidates();
      setCandidates(cands || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCandidateChange = async (e) => {
    const val = e.target.value;
    setSelectedCandidate(val);
    if (val) {
      setEligibilityCheck({ loading: true });
      try {
        // 1. Check Theory Exam
        const writtenExams = await window.api.getWrittenExams(val);
        const hasPassedTheory = writtenExams.some(ex => ex.result === 'Passed');

        // 2. Check Attendance (must be >= 80%)
        const attendanceRes = await window.api.getCandidateAttendanceStats({ candidateId: val });
        const attendanceStats = attendanceRes.success && attendanceRes.stats ? attendanceRes.stats : { attendancePercentage: 0 };
        const isAttendanceValid = attendanceStats.attendancePercentage >= 80;

        // 3. Check Payments (remaining must be 0)
        const paymentBalances = await window.api.getPaymentBalances();
        const candidateBalance = paymentBalances.find(p => p.candidateId === val);
        const remainingFee = candidateBalance ? candidateBalance.remaining : 0;
        const areFeesPaid = remainingFee === 0;

        const isEligible = hasPassedTheory && isAttendanceValid && areFeesPaid;

        setEligibilityCheck({
          loading: false,
          isEligible,
          hasPassedTheory,
          attendancePercentage: attendanceStats.attendancePercentage,
          isAttendanceValid,
          remainingFee,
          areFeesPaid
        });
      } catch (err) {
        console.error("Error checking eligibility", err);
        setEligibilityCheck({ loading: false, isEligible: false, error: true });
      }
    } else {
      setEligibilityCheck(null);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !examDate || !examCenter) return;
    
    if (eligibilityCheck && !eligibilityCheck.isEligible) {
      alert("Candidate is not fully eligible for a Trial Exam yet.");
      return;
    }

    const previousAttempts = exams.filter(ex => ex.candidateId === selectedCandidate);
    const attemptNumber = previousAttempts.length + 1;

    try {
      await window.api.addPracticalExam({
        candidateId: selectedCandidate,
        examDate,
        examCenter,
        attemptNumber,
        result: 'Pending',
        examinerNotes: '',
        licenseNumber: ''
      });
      setShowScheduleModal(false);
      setSelectedCandidate('');
      setExamDate('');
      setEligibilityCheck(null);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExams = exams.filter(ex => 
    ex.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.candidateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.examCenter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Passed':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1"><CheckCircle size={12}/> Passed</span>;
      case 'Failed':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1"><XCircle size={12}/> Failed</span>;
      case 'Absent':
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1"><XCircle size={12}/> Absent</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full flex items-center gap-1"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search trial exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 text-sm"
          />
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#1e3a5f]/90 transition-colors text-sm font-medium whitespace-nowrap"
        >
          <Plus size={18} />
          Schedule Trial Exam
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/30 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
        ) : filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <Car size={48} className="text-gray-300" />
            <p>No trial exams scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exam.candidateName}</h3>
                    <p className="text-xs text-gray-500">{exam.candidateId}</p>
                  </div>
                  {getStatusBadge(exam.result)}
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{exam.examDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{exam.examCenter}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="text-gray-500">Attempt: <span className="font-medium text-gray-700">{exam.attemptNumber}</span></span>
                  {exam.licenseNumber && <span className="font-medium text-green-600">License: {exam.licenseNumber}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-[#1e3a5f]">Schedule Trial Exam</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSchedule} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Candidate</label>
                <select 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  value={selectedCandidate}
                  onChange={handleCandidateChange}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {eligibilityCheck && (
                <div className={`p-3 rounded-lg text-sm border ${eligibilityCheck.loading ? 'bg-gray-50 border-gray-100 text-gray-500' : eligibilityCheck.isEligible ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                  {eligibilityCheck.loading ? (
                    <p className="flex items-center gap-2"><Clock size={14} className="animate-spin" /> Verifying candidate eligibility...</p>
                  ) : (
                    <>
                      <p className="font-semibold mb-2">{eligibilityCheck.isEligible ? 'Candidate is Eligible for Trial' : 'Candidate is Not Eligible'}</p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          {eligibilityCheck.hasPassedTheory ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500"/>} 
                          Theory Exam Passed
                        </li>
                        <li className="flex items-center gap-2">
                          {eligibilityCheck.isAttendanceValid ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500"/>} 
                          Attendance ({eligibilityCheck.attendancePercentage}%) - Minimum 80% required
                        </li>
                        <li className="flex items-center gap-2">
                          {eligibilityCheck.areFeesPaid ? <CheckCircle size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500"/>} 
                          Full Payment Settled (Due: Rs. {eligibilityCheck.remainingFee})
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Date</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Location</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eligibilityCheck && (!eligibilityCheck.isEligible || eligibilityCheck.loading)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    eligibilityCheck && (!eligibilityCheck.isEligible || eligibilityCheck.loading)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#f59e0b] text-[#1e3a5f] hover:bg-[#f59e0b]/90'
                  }`}
                >
                  Schedule Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialExams;
