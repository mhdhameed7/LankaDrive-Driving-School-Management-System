import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  Layers, 
  Award, 
  UserSquare2, 
  CarFront 
} from 'lucide-react';

// Sub-components
import ManagementDashboard from '../components/reports/ManagementDashboard';
import CandidateReport from '../components/reports/CandidateReport';
import PaymentReport from '../components/reports/PaymentReport';
import AttendanceReport from '../components/reports/AttendanceReport';
import BatchReport from '../components/reports/BatchReport';
import ExamReport from '../components/reports/ExamReport';
import InstructorReport from '../components/reports/InstructorReport';
import VehicleReport from '../components/reports/VehicleReport';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Management Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidate Report', icon: Users },
    { id: 'payments', label: 'Payment Report', icon: CreditCard },
    { id: 'attendance', label: 'Attendance Report', icon: CalendarCheck },
    { id: 'batches', label: 'Batch Report', icon: Layers },
    { id: 'exams', label: 'Exam Report', icon: Award },
    { id: 'instructors', label: 'Instructor Report', icon: UserSquare2 },
    { id: 'vehicles', label: 'Vehicle Report', icon: CarFront }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ManagementDashboard />;
      case 'candidates':
        return <CandidateReport />;
      case 'payments':
        return <PaymentReport />;
      case 'attendance':
        return <AttendanceReport />;
      case 'batches':
        return <BatchReport />;
      case 'exams':
        return <ExamReport />;
      case 'instructors':
        return <InstructorReport />;
      case 'vehicles':
        return <VehicleReport />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-gray-50/50">
      {/* Reports Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col hide-on-print">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1e3a5f]">Reports</h2>
          <p className="text-xs text-gray-500">System Analytics & Data</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#1e3a5f] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1e3a5f]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Report Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden report-content-area">
        <div className="flex-1 overflow-auto bg-white">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
