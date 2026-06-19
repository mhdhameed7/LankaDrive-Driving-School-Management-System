import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const TheoryExams = () => {
  const [exams, setExams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examCenter, setExamCenter] = useState('Colombo RMV');

  const fetchExams = async () => {
    try {
      const data = await window.api.getWrittenExams();
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

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !examDate || !examCenter) return;
    
    // Find attempt number
    const previousAttempts = exams.filter(ex => ex.candidateId === selectedCandidate);
    const attemptNumber = previousAttempts.length + 1;

    try {
      await window.api.addWrittenExam({
        candidateId: selectedCandidate,
        examDate,
        examCenter,
        attemptNumber,
        result: 'Pending',
        score: '',
        notes: attemptNumber === 1 ? 'First attempt' : `Attempt ${attemptNumber}`
      });
      setShowScheduleModal(false);
      setSelectedCandidate('');
      setExamDate('');
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
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full flex items-center gap-1"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header Actions */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search exams by candidate or center..."
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
          Schedule Theory Exam
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-gray-50/30 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">Loading...</div>
        ) : filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <FileText size={48} className="text-gray-300" />
            <p>No theory exams scheduled.</p>
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
                  {exam.score && <span className="font-medium text-[#1e3a5f]">Score: {exam.score}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-[#1e3a5f]">Schedule Theory Exam</h3>
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
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Center</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  placeholder="e.g. Werahera RMV"
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
                  className="px-4 py-2 text-sm font-medium bg-[#f59e0b] text-[#1e3a5f] rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheoryExams;
