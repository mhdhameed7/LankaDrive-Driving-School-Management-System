import React, { useState } from 'react';
import TheoryExams from '../components/exams/TheoryExams';
import TrialExams from '../components/exams/TrialExams';
import ExamResults from '../components/exams/ExamResults';
import ReTests from '../components/exams/ReTests';
import ExamReports from '../components/exams/ExamReports';
import { FileText, Car, Award, RefreshCw, BarChart3 } from 'lucide-react';

const Exams = () => {
  const [activeTab, setActiveTab] = useState('theory');

  const tabs = [
    { id: 'theory', label: 'Theory Exams', icon: <FileText size={18} /> },
    { id: 'trial', label: 'Trial Exams', icon: <Car size={18} /> },
    { id: 'results', label: 'Results', icon: <Award size={18} /> },
    { id: 'retests', label: 'Re-Tests', icon: <RefreshCw size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'theory':
        return <TheoryExams />;
      case 'trial':
        return <TrialExams />;
      case 'results':
        return <ExamResults />;
      case 'retests':
        return <ReTests />;
      case 'reports':
        return <ExamReports />;
      default:
        return <TheoryExams />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Exams Management</h1>
      </div>

      <div className="bg-white p-1 rounded-lg inline-flex flex-wrap shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#1e3a5f] hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default Exams;
