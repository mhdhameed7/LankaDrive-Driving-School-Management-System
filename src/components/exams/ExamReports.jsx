import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, FileText, Car, CheckCircle, XCircle } from 'lucide-react';

const ExamReports = () => {
  const [theoryExams, setTheoryExams] = useState([]);
  const [trialExams, setTrialExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const tExams = await window.api.getWrittenExams();
        const pExams = await window.api.getPracticalExams();
        setTheoryExams(tExams || []);
        setTrialExams(pExams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const calculateStats = (exams) => {
    const total = exams.length;
    const passed = exams.filter(e => e.result === 'Passed').length;
    const failed = exams.filter(e => e.result === 'Failed').length;
    const pending = exams.filter(e => e.result === 'Pending' || e.result === 'Absent').length;
    
    const passRate = total > 0 ? Math.round((passed / (passed + failed)) * 100) || 0 : 0;
    
    return { total, passed, failed, pending, passRate };
  };

  const theoryStats = calculateStats(theoryExams);
  const trialStats = calculateStats(trialExams);

  return (
    <div className="flex flex-col h-full bg-white relative overflow-auto p-6 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-full text-gray-400">Loading reports...</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e3a5f]">Exam Analytics</h2>
              <p className="text-sm text-gray-500">Overview of exam performance and statistics</p>
            </div>
          </div>

          {/* Theory vs Trial Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Theory Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText size={100} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#1e3a5f]" /> Theory Exams
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Total Exams</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{theoryStats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-700">{theoryStats.passRate}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><CheckCircle size={16} className="text-green-500"/> Passed</span>
                  <span className="font-semibold">{theoryStats.passed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(theoryStats.passed / theoryStats.total) * 100 || 0}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="flex items-center gap-2 text-gray-600"><XCircle size={16} className="text-red-500"/> Failed</span>
                  <span className="font-semibold">{theoryStats.failed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(theoryStats.failed / theoryStats.total) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Trial Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Car size={100} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Car size={20} className="text-[#1e3a5f]" /> Trial Exams
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Total Exams</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{trialStats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-700">{trialStats.passRate}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-600"><CheckCircle size={16} className="text-green-500"/> Passed</span>
                  <span className="font-semibold">{trialStats.passed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(trialStats.passed / trialStats.total) * 100 || 0}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="flex items-center gap-2 text-gray-600"><XCircle size={16} className="text-red-500"/> Failed</span>
                  <span className="font-semibold">{trialStats.failed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(trialStats.failed / trialStats.total) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Insights */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Quick Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Theory</p>
                  <p className="text-xl font-bold text-gray-800">{theoryStats.pending}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Car size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Trials</p>
                  <p className="text-xl font-bold text-gray-800">{trialStats.pending}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Failed Attempts</p>
                  <p className="text-xl font-bold text-gray-800">{theoryStats.failed + trialStats.failed}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamReports;
