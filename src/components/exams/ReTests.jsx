import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, FileText, Car, Calendar, MapPin } from 'lucide-react';

const ReTests = () => {
  const [theoryExams, setTheoryExams] = useState([]);
  const [trialExams, setTrialExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examType, setExamType] = useState('theory');
  const [examDate, setExamDate] = useState('');
  const [examCenter, setExamCenter] = useState('');
  
  // Payment state
  const [recordFee, setRecordFee] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const fetchExams = async () => {
    try {
      const tExams = await window.api.getWrittenExams();
      const pExams = await window.api.getPracticalExams();
      
      // Filter only failed exams that don't have a newer attempt
      setTheoryExams(getLatestFailedOnly(tExams || []));
      setTrialExams(getLatestFailedOnly(pExams || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to only show candidates who failed their LATEST attempt and haven't scheduled a new one
  const getLatestFailedOnly = (examsList) => {
    const candidateAttempts = {};
    
    // Group by candidate
    examsList.forEach(ex => {
      if (!candidateAttempts[ex.candidateId]) {
        candidateAttempts[ex.candidateId] = [];
      }
      candidateAttempts[ex.candidateId].push(ex);
    });

    const failedLatest = [];
    Object.keys(candidateAttempts).forEach(candidateId => {
      // Sort by attempt number descending
      const attempts = candidateAttempts[candidateId].sort((a, b) => b.attemptNumber - a.attemptNumber);
      const latest = attempts[0];
      
      // If the latest attempt is Failed, they need a re-test
      if (latest && latest.result === 'Failed') {
        failedLatest.push(latest);
      }
    });

    return failedLatest;
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openScheduleModal = (exam, type) => {
    setSelectedExam(exam);
    setExamType(type);
    setExamCenter(exam.examCenter || ''); // Default to same center
    setExamDate('');
    setRecordFee(true);
    setPaymentMethod('Cash');
    setShowScheduleModal(true);
  };

  const handleScheduleReTest = async (e) => {
    e.preventDefault();
    if (!selectedExam || !examDate || !examCenter) return;

    try {
      if (examType === 'theory') {
        await window.api.addWrittenExam({
          candidateId: selectedExam.candidateId,
          examDate,
          examCenter,
          attemptNumber: selectedExam.attemptNumber + 1,
          result: 'Pending',
          score: '',
          notes: `Re-test (Attempt ${selectedExam.attemptNumber + 1})`
        });
      } else {
        await window.api.addPracticalExam({
          candidateId: selectedExam.candidateId,
          examDate,
          examCenter,
          attemptNumber: selectedExam.attemptNumber + 1,
          result: 'Pending',
          examinerNotes: `Re-test (Attempt ${selectedExam.attemptNumber + 1})`,
          licenseNumber: ''
        });
      }
      
      if (recordFee) {
        const receiptNo = await window.api.getNextReceiptNumber();
        const paymentDate = new Date().toISOString().split('T')[0];
        await window.api.addPayment({
          receiptNo,
          candidateId: selectedExam.candidateId,
          paymentDate,
          amount: 1500,
          totalFee: 1500,
          paymentMethod,
          referenceNumber: '',
          remarks: `${examType === 'theory' ? 'Theory' : 'Trial'} Exam Re-test Fee (Attempt ${selectedExam.attemptNumber + 1})`,
          paymentStage: 'Re-test Fee'
        });
      }
      
      setShowScheduleModal(false);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTheory = theoryExams.filter(ex => 
    ex.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.candidateId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrial = trialExams.filter(ex => 
    ex.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.candidateId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search failed candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
          <AlertCircle size={16} />
          <span className="font-medium">Candidates Requiring Re-Tests</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Theory Re-Tests */}
            <section>
              <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#f59e0b]" /> 
                Theory Exam Re-Tests ({filteredTheory.length})
              </h2>
              
              {filteredTheory.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500 text-sm shadow-sm">
                  No candidates currently need a theory re-test.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTheory.map(ex => (
                    <div key={`th-${ex.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{ex.candidateName}</h3>
                          <p className="text-xs text-gray-500">{ex.candidateId}</p>
                        </div>
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Failed</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>Last Attempt: <span className="font-medium">{ex.attemptNumber}</span></p>
                        <p>Date: <span className="font-medium">{ex.examDate}</span></p>
                        {ex.score && <p>Score: <span className="font-medium text-red-600">{ex.score}</span></p>}
                      </div>

                      <button
                        onClick={() => openScheduleModal(ex, 'theory')}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <RefreshCw size={16} />
                        Schedule Re-Test
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Trial Re-Tests */}
            <section>
              <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2 pt-4 border-t border-gray-200">
                <Car size={20} className="text-[#f59e0b]" /> 
                Trial Exam Re-Tests ({filteredTrial.length})
              </h2>
              
              {filteredTrial.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500 text-sm shadow-sm">
                  No candidates currently need a trial re-test.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTrial.map(ex => (
                    <div key={`tr-${ex.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{ex.candidateName}</h3>
                          <p className="text-xs text-gray-500">{ex.candidateId}</p>
                        </div>
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Failed</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>Last Attempt: <span className="font-medium">{ex.attemptNumber}</span></p>
                        <p>Date: <span className="font-medium">{ex.examDate}</span></p>
                        {ex.examinerNotes && <p className="line-clamp-2" title={ex.examinerNotes}>Notes: {ex.examinerNotes}</p>}
                      </div>

                      <button
                        onClick={() => openScheduleModal(ex, 'trial')}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <RefreshCw size={16} />
                        Schedule Re-Test
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Schedule Re-Test Modal */}
      {showScheduleModal && selectedExam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#1e3a5f]/5">
              <h3 className="font-semibold text-lg text-[#1e3a5f] flex items-center gap-2">
                <RefreshCw size={20} className="text-[#f59e0b]" />
                Schedule {examType === 'theory' ? 'Theory' : 'Trial'} Re-Test
              </h3>
            </div>
            
            <form onSubmit={handleScheduleReTest} className="p-6 space-y-5">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Candidate</p>
                  <p className="font-medium text-gray-800">{selectedExam.candidateName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Attempt</p>
                  <p className="font-medium text-red-600">{selectedExam.attemptNumber + 1}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Exam Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Center</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    value={examCenter}
                    onChange={(e) => setExamCenter(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={recordFee}
                    onChange={(e) => setRecordFee(e.target.checked)}
                    className="w-4 h-4 text-[#f59e0b] focus:ring-[#f59e0b] rounded"
                  />
                  <span className="text-sm font-medium text-amber-900">
                    Record Rs. 1500 Re-test Fee Payment
                  </span>
                </label>
                
                {recordFee && (
                  <div className="pl-6 pt-1">
                    <label className="block text-xs font-medium text-amber-800 mb-1">Payment Method</label>
                    <select 
                      className="w-full p-2 border border-amber-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 bg-white"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                )}
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
                  className="px-6 py-2 text-sm font-medium bg-[#1e3a5f] text-white rounded-lg hover:bg-[#1e3a5f]/90 transition-colors shadow-sm"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReTests;
