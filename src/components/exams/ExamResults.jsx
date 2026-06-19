import React, { useState, useEffect } from 'react';
import { Search, Award, FileText, Car, CheckCircle, XCircle } from 'lucide-react';

const ExamResults = () => {
  const [theoryExams, setTheoryExams] = useState([]);
  const [trialExams, setTrialExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [examType, setExamType] = useState('theory'); // 'theory' or 'trial'
  
  const [resultStatus, setResultStatus] = useState('Passed');
  const [score, setScore] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchExams = async () => {
    try {
      const tExams = await window.api.getWrittenExams();
      const pExams = await window.api.getPracticalExams();
      
      // Filter only pending or recently updated exams
      setTheoryExams(tExams || []);
      setTrialExams(pExams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSelectExam = (exam, type) => {
    setSelectedExam(exam);
    setExamType(type);
    setResultStatus(exam.result === 'Pending' ? 'Passed' : exam.result);
    setScore(exam.score || '');
    setRemarks(exam.notes || exam.examinerNotes || '');
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    try {
      if (examType === 'theory') {
        await window.api.updateWrittenExam({
          id: selectedExam.id,
          result: resultStatus,
          score: score,
          notes: remarks
        });
        
        // Update candidate stage if passed
        if (resultStatus === 'Passed') {
          await window.api.updateCandidateStatus({
            id: selectedExam.candidateId,
            status: 'ELIGIBLE_FOR_TRIAL',
            stage: 5
          });
        }
      } else {
        await window.api.updatePracticalExam({
          id: selectedExam.id,
          result: resultStatus,
          examinerNotes: remarks,
          licenseNumber: '' // Could be added later
        });
        
        if (resultStatus === 'Passed') {
          await window.api.updateCandidateStatus({
            id: selectedExam.candidateId,
            status: 'CERTIFIED',
            stage: 6
          });
        }
      }
      
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTheory = theoryExams.filter(ex => 
    ex.result === 'Pending' &&
    (ex.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ex.candidateId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTrial = trialExams.filter(ex => 
    ex.result === 'Pending' &&
    (ex.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ex.candidateId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-white relative">
      {/* List of Pending Exams */}
      <div className="w-full md:w-1/2 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search pending exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center text-gray-400 mt-10">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                  <FileText size={18} /> Theory Exams ({filteredTheory.length})
                </h3>
                {filteredTheory.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No pending theory exams.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTheory.map(ex => (
                      <div 
                        key={`th-${ex.id}`} 
                        onClick={() => handleSelectExam(ex, 'theory')}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedExam?.id === ex.id && examType === 'theory' ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-gray-200 hover:border-[#f59e0b]/50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{ex.candidateName}</p>
                            <p className="text-xs text-gray-500">{ex.candidateId}</p>
                          </div>
                          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pending</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Date: {ex.examDate} | Attempt: {ex.attemptNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                  <Car size={18} /> Trial Exams ({filteredTrial.length})
                </h3>
                {filteredTrial.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No pending trial exams.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTrial.map(ex => (
                      <div 
                        key={`tr-${ex.id}`} 
                        onClick={() => handleSelectExam(ex, 'trial')}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedExam?.id === ex.id && examType === 'trial' ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-gray-200 hover:border-[#f59e0b]/50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{ex.candidateName}</p>
                            <p className="text-xs text-gray-500">{ex.candidateId}</p>
                          </div>
                          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pending</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Date: {ex.examDate} | Attempt: {ex.attemptNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Result Form */}
      <div className="w-full md:w-1/2 p-6 bg-gray-50/30 overflow-auto">
        {selectedExam ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-[#1e3a5f]/5">
              <h2 className="text-lg font-semibold text-[#1e3a5f] flex items-center gap-2">
                <Award size={20} className="text-[#f59e0b]" />
                Record Result
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedExam.candidateName} ({selectedExam.candidateId})
              </p>
            </div>

            <form onSubmit={handleSaveResult} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Exam Type</p>
                  <p className="font-medium text-gray-800 capitalize">{examType} Exam</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Attempt</p>
                  <p className="font-medium text-gray-800">{selectedExam.attemptNumber}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Result Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="resultStatus" 
                      value="Passed" 
                      checked={resultStatus === 'Passed'}
                      onChange={(e) => setResultStatus(e.target.value)}
                      className="w-4 h-4 text-[#f59e0b] focus:ring-[#f59e0b]"
                    />
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-medium text-sm border border-green-200">
                      <CheckCircle size={14} /> Passed
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="resultStatus" 
                      value="Failed" 
                      checked={resultStatus === 'Failed'}
                      onChange={(e) => setResultStatus(e.target.value)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md font-medium text-sm border border-red-200">
                      <XCircle size={14} /> Failed
                    </span>
                  </label>
                  
                  {examType === 'trial' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="resultStatus" 
                        value="Absent" 
                        checked={resultStatus === 'Absent'}
                        onChange={(e) => setResultStatus(e.target.value)}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md font-medium text-sm border border-gray-200">
                        <XCircle size={14} /> Absent
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {examType === 'theory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score / Marks</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 35/40"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examiner Remarks</label>
                <textarea 
                  rows="3"
                  placeholder="Enter any notes or feedback..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 resize-none"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a5f]/90 transition-colors shadow-sm"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Award size={32} className="text-gray-300" />
            </div>
            <p>Select a pending exam from the list to record results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResults;
