import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  FileText, 
  Plus, 
  Check, 
  X, 
  Search, 
  ArrowRight,
  Shield,
  ShieldAlert,
  Loader2,
  Download,
  AlertCircle
} from 'lucide-react';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [loading, setLoading] = useState(false);

  // Common dates
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // 1. Candidate Attendance States
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessionType, setSessionType] = useState('Theory Class');
  const [candidates, setCandidates] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [candidateStats, setCandidateStats] = useState({}); // overall stats for candidates
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [savingCandidates, setSavingCandidates] = useState(false);
  const [selectedCandidateHistory, setSelectedCandidateHistory] = useState([]);

  // 2. Instructor Attendance States
  const [instructors, setInstructors] = useState([]);
  const [instructorAttendance, setInstructorAttendance] = useState({});
  const [savingInstructors, setSavingInstructors] = useState({});

  // 3. Staff Attendance States
  const [staffList, setStaffList] = useState([]);
  const [staffAttendance, setStaffAttendance] = useState({});
  const [savingStaff, setSavingStaff] = useState({});
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffData, setNewStaffData] = useState({ name: '', phone: '', role: '' });
  const [addingStaff, setAddingStaff] = useState(false);

  // 4. Reports States
  const [reportType, setReportType] = useState('Candidate');
  const [reportStartDate, setReportStartDate] = useState(todayStr);
  const [reportEndDate, setReportEndDate] = useState(todayStr);
  const [reportBatchId, setReportBatchId] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [reportData, setReportData] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load basic reference data
  useEffect(() => {
    loadBatches();
    loadInstructors();
    loadStaff();
  }, [selectedDate]);

  const loadBatches = async () => {
    try {
      const data = await window.api.getBatches();
      setBatches(data || []);
      if (data && data.length > 0 && !selectedBatch) {
        setSelectedBatch(data[0].batchCode);
      }
    } catch (err) {
      console.error('Failed to load batches', err);
    }
  };

  const loadInstructors = async () => {
    try {
      const data = await window.api.getInstructors();
      setInstructors(data || []);
      
      // Load attendance for selected date
      const attendanceRes = await window.api.getInstructorAttendance({ startDate: selectedDate, endDate: selectedDate });
      if (attendanceRes.success) {
        const mapped = {};
        attendanceRes.attendance.forEach(rec => {
          mapped[rec.instructorId] = rec;
        });
        setInstructorAttendance(mapped);
      }
    } catch (err) {
      console.error('Failed to load instructors', err);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await window.api.getStaffList();
      if (res.success) {
        setStaffList(res.staff || []);
      }
      
      // Load attendance for selected date
      const attendanceRes = await window.api.getStaffAttendance({ startDate: selectedDate, endDate: selectedDate });
      if (attendanceRes.success) {
        const mapped = {};
        attendanceRes.attendance.forEach(rec => {
          mapped[rec.staffId] = rec;
        });
        setStaffAttendance(mapped);
      }
    } catch (err) {
      console.error('Failed to load staff list', err);
    }
  };

  // Load Candidates when selected batch changes
  useEffect(() => {
    if (selectedBatch) {
      loadBatchCandidates();
    }
  }, [selectedBatch, selectedDate, sessionType]);

  const loadBatchCandidates = async () => {
    setLoading(true);
    try {
      // 1. Get candidates in the batch
      const cands = await window.api.getBatchCandidates(selectedBatch);
      setCandidates(cands || []);
      if (cands && cands.length > 0) {
        setSelectedCandidateId(prev => {
          if (prev && cands.some(c => c.id === prev)) return prev;
          return cands[0].id;
        });
      } else {
        setSelectedCandidateId(null);
      }

      // 2. Get existing attendance for this date and batch
      const resAttendance = await window.api.getCandidateAttendance({ sessionDate: selectedDate });
      const currentDayRecords = {};
      if (resAttendance.success && resAttendance.attendance) {
        resAttendance.attendance.forEach(rec => {
          if (rec.sessionType === sessionType) {
            currentDayRecords[rec.candidateId] = rec;
          }
        });
      }
      setAttendanceRecords(currentDayRecords);

      // 3. Get overall attendance stats for eligibility check
      const resStats = await window.api.getCandidateAttendanceStats();
      if (resStats.success && resStats.stats) {
        const statsMap = {};
        resStats.stats.forEach(s => {
          statsMap[s.candidateId] = s;
        });
        setCandidateStats(statsMap);
      }
    } catch (err) {
      console.error('Failed to load batch candidates', err);
      showNotification('Failed to load candidates data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch selected candidate's full attendance history when selected candidate changes
  useEffect(() => {
    if (selectedCandidateId) {
      loadCandidateHistory(selectedCandidateId);
    } else {
      setSelectedCandidateHistory([]);
    }
  }, [selectedCandidateId, selectedDate]); // reload if selected date or candidate changes

  const loadCandidateHistory = async (candidateId) => {
    try {
      const res = await window.api.getCandidateAttendance({ candidateId });
      if (res.success) {
        // Sort history by date descending
        const sorted = (res.attendance || []).sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
        setSelectedCandidateHistory(sorted);
      }
    } catch (err) {
      console.error('Failed to load candidate attendance history', err);
    }
  };

  // 1. Mark candidate attendance in local state
  const handleMarkCandidate = (candidateId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        candidateId,
        batchId: batches.find(b => b.batchCode === selectedBatch)?.id,
        sessionDate: selectedDate,
        sessionType,
        status,
        remarks: prev[candidateId]?.remarks || ''
      }
    }));
  };

  const handleCandidateRemarks = (candidateId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        remarks
      }
    }));
  };

  const handleBulkMarkCandidates = (status) => {
    const newRecords = { ...attendanceRecords };
    candidates.forEach(c => {
      newRecords[c.id] = {
        candidateId: c.id,
        batchId: batches.find(b => b.batchCode === selectedBatch)?.id,
        sessionDate: selectedDate,
        sessionType,
        status,
        remarks: attendanceRecords[c.id]?.remarks || ''
      };
    });
    setAttendanceRecords(newRecords);
    showNotification(`Marked all candidates as ${status}`);
  };

  const saveCandidateAttendance = async () => {
    setSavingCandidates(true);
    try {
      const recordsToSave = candidates.map(c => {
        const rec = attendanceRecords[c.id];
        return rec || {
          candidateId: c.id,
          batchId: batches.find(b => b.batchCode === selectedBatch)?.id,
          sessionDate: selectedDate,
          sessionType,
          status: 'Absent',
          remarks: ''
        };
      });

      const res = await window.api.addCandidateAttendance({ records: recordsToSave });
      if (res.success) {
        showNotification('Candidate attendance saved successfully.');
        loadBatchCandidates(); // Reload to refresh percentages
        if (selectedCandidateId) {
          loadCandidateHistory(selectedCandidateId);
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSavingCandidates(false);
    }
  };

  // 2. Save Instructor Attendance check-in/out
  const handleInstructorAction = async (instructorId, action, val) => {
    const current = instructorAttendance[instructorId] || {
      instructorId,
      attendanceDate: selectedDate,
      checkIn: '',
      checkOut: '',
      status: 'Present'
    };

    let updated = { ...current };
    if (action === 'checkIn') updated.checkIn = val;
    if (action === 'checkOut') updated.checkOut = val;
    if (action === 'status') updated.status = val;

    // Auto set status if checking in
    if (action === 'checkIn' && val && !current.checkIn) {
      updated.status = 'Present';
    }

    setInstructorAttendance(prev => ({ ...prev, [instructorId]: updated }));

    setSavingInstructors(prev => ({ ...prev, [instructorId]: true }));
    try {
      const res = await window.api.addInstructorAttendance(updated);
      if (res.success) {
        // Fetch updated ID if new record
        loadInstructors();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update attendance', 'error');
    } finally {
      setSavingInstructors(prev => ({ ...prev, [instructorId]: false }));
    }
  };

  // 3. Save Staff Attendance check-in/out
  const handleStaffAction = async (staffId, action, val) => {
    const current = staffAttendance[staffId] || {
      staffId,
      attendanceDate: selectedDate,
      checkIn: '',
      checkOut: '',
      status: 'Present'
    };

    let updated = { ...current };
    if (action === 'checkIn') updated.checkIn = val;
    if (action === 'checkOut') updated.checkOut = val;
    if (action === 'status') updated.status = val;

    if (action === 'checkIn' && val && !current.checkIn) {
      updated.status = 'Present';
    }

    setStaffAttendance(prev => ({ ...prev, [staffId]: updated }));

    setSavingStaff(prev => ({ ...prev, [staffId]: true }));
    try {
      const res = await window.api.addStaffAttendance(updated);
      if (res.success) {
        loadStaff();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update attendance', 'error');
    } finally {
      setSavingStaff(prev => ({ ...prev, [staffId]: false }));
    }
  };

  // Add new staff registry inline
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffData.name || !newStaffData.role) {
      showNotification('Please fill in Name and Role', 'warning');
      return;
    }
    setAddingStaff(true);
    try {
      const staffId = `STF-${String(staffList.length + 1).padStart(3, '0')}`;
      const res = await window.api.addStaff({
        id: staffId,
        name: newStaffData.name,
        phone: newStaffData.phone || '',
        role: newStaffData.role,
        status: 'Active'
      });
      if (res.success) {
        showNotification(`Staff member ${newStaffData.name} registered.`);
        setNewStaffData({ name: '', phone: '', role: '' });
        setShowAddStaffModal(false);
        loadStaff();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to add staff', 'error');
    } finally {
      setAddingStaff(false);
    }
  };

  // 4. Generate Reports
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await window.api.getAttendanceReport({
        type: reportType,
        startDate: reportStartDate,
        endDate: reportEndDate,
        batchId: reportBatchId ? parseInt(reportBatchId) : null,
        status: reportStatus || null
      });
      if (res.success) {
        setReportData(res.data || []);
        if (res.data.length === 0) {
          showNotification('No records found for the selected criteria.', 'warning');
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to generate report', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate quick attendance stats for candidate view
  const getCandidateMarkingStats = () => {
    if (candidates.length === 0) return { present: 0, absent: 0, late: 0, leave: 0, halfDay: 0, totalMarked: 0 };
    let present = 0, absent = 0, late = 0, leave = 0, halfDay = 0;
    candidates.forEach(c => {
      const r = attendanceRecords[c.id];
      if (r) {
        if (r.status === 'Present') present++;
        if (r.status === 'Absent') absent++;
        if (r.status === 'Late') late++;
        if (r.status === 'Leave') leave++;
        if (r.status === 'Half Day') halfDay++;
      } else {
        absent++; // default is absent
      }
    });
    return { present, absent, late, leave, halfDay, totalMarked: Object.keys(attendanceRecords).length };
  };

  const markingStats = getCandidateMarkingStats();

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] overflow-hidden flex-1">
      {/* Top Banner notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
          notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 
          notification.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1e3a5f]">Attendance Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track daily check-ins, class schedules, and review eligibility reports</p>
        </div>

        {/* Date picker for daily registers */}
        {activeTab !== 'reports' && (
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-700 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 flex justify-between items-center shrink-0">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('candidates')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'candidates' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Candidate Attendance
          </button>
          <button 
            onClick={() => setActiveTab('instructors')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'instructors' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Instructor Attendance
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'staff' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Staff Attendance
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === 'reports' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reports & Summary
          </button>
        </div>

        {activeTab === 'staff' && (
          <button 
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center gap-1.5 bg-[#1e3a5f] text-white hover:bg-[#152a45] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <Plus size={14} /> Add Staff Member
          </button>
        )}
      </div>

      {/* Main Tab content areas */}
      <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
        
        {/* CANDIDATE TAB */}
        {activeTab === 'candidates' && (
          <div className="flex-1 flex flex-col min-h-0 gap-6">
            
            {/* Filter control bar */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-4 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Batch</label>
                    <select 
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-1.5 outline-none focus:border-[#1e3a5f]"
                    >
                      {batches.map(b => (
                        <option key={b.id} value={b.batchCode}>{b.name} ({b.batchCode})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Session Type</label>
                    <select 
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-1.5 outline-none focus:border-[#1e3a5f]"
                    >
                      <option value="Theory Class">Theory Class</option>
                      <option value="Practical Session">Practical Session</option>
                      <option value="Trial Practice">Trial Practice</option>
                    </select>
                  </div>
                </div>

                {/* Bulk actions */}
                {candidates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold mr-1">Bulk Mark:</span>
                    <button 
                      onClick={() => handleBulkMarkCandidates('Present')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      All Present
                    </button>
                    <button 
                      onClick={() => handleBulkMarkCandidates('Absent')}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      All Absent
                    </button>
                  </div>
                )}
              </div>

              {/* Compact horizontal stats row inside the card */}
              {candidates.length > 0 && (
                <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-6 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <span className="text-gray-400">Total in Batch:</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-705 font-bold">{candidates.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <span className="text-emerald-500">Present:</span>
                    <span className="bg-emerald-50 px-2 py-0.5 rounded-full font-bold">{markingStats.present}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-655 text-red-600">
                    <span className="text-red-500">Absent:</span>
                    <span className="bg-red-50 px-2 py-0.5 rounded-full font-bold">{markingStats.absent}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <span className="text-amber-500">Late:</span>
                    <span className="bg-amber-50 px-2 py-0.5 rounded-full font-bold">{markingStats.late}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <span className="text-indigo-500">Leaves / Half Days:</span>
                    <span className="bg-indigo-50 px-2 py-0.5 rounded-full font-bold">{markingStats.leave + markingStats.halfDay}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Split Master-Detail Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              
              {/* Left Panel: Candidates List (7/12 cols) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                    <Loader2 className="animate-spin text-[#1e3a5f]" size={32} />
                    <span className="text-sm font-semibold">Loading batch candidates...</span>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                    <Users size={48} className="text-gray-300 mb-2" />
                    <span className="text-sm font-medium">No candidates are registered in this batch.</span>
                    <p className="text-xs text-gray-400 mt-1">Assign candidates to "{selectedBatch}" in the Batches or Candidates module.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-gray-600">Candidate Info</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 text-center">Overall Attendance %</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 text-center">Exam Eligibility</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {candidates.map((candidate) => {
                            const stats = candidateStats[candidate.id] || { attendancePercentage: 100, isEligible: true };
                            const isSelected = selectedCandidateId === candidate.id;
                            
                            return (
                              <tr 
                                key={candidate.id} 
                                onClick={() => setSelectedCandidateId(candidate.id)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10' 
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {isSelected && <div className="w-1.5 h-8 bg-[#1e3a5f] rounded-r -ml-6 mr-1.5 animate-fade-in" />}
                                    <div>
                                      <div className={`font-semibold ${isSelected ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>{candidate.name}</div>
                                      <div className="text-xs text-gray-400 font-medium">{candidate.id} • {candidate.nic}</div>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <span className={`text-sm font-bold ${
                                      stats.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-red-500'
                                    }`}>
                                      {stats.attendancePercentage}%
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-semibold">
                                      ({stats.totalSessions || 0} classes)
                                    </span>
                                  </div>
                                </td>
  
                                <td className="px-6 py-4 text-center">
                                  {stats.attendancePercentage >= 80 ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      <Shield size={10} /> ELIGIBLE
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                      <ShieldAlert size={10} /> INELIGIBLE
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Save button footer */}
                    <div className="bg-slate-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
                      <span className="text-xs font-semibold text-gray-500">
                        Be sure to save updates before switching batches or tabs.
                      </span>
                      <button 
                        onClick={saveCandidateAttendance}
                        disabled={savingCandidates}
                        className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                      >
                        {savingCandidates ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Saving...
                          </>
                        ) : (
                          'Save Attendance Registry'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Right Panel: Selected Candidate Marking Card (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto max-h-full pr-1">
                {selectedCandidateId && candidates.some(c => c.id === selectedCandidateId) ? (() => {
                  const candidate = candidates.find(c => c.id === selectedCandidateId);
                  const record = attendanceRecords[candidate.id] || { status: 'Absent', remarks: '' };
                  const stats = candidateStats[candidate.id] || { attendancePercentage: 100, isEligible: true, totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, halfDayCount: 0, leaveCount: 0 };
                  
                  // Helper function for navigating to the next candidate
                  const handleNextCandidate = () => {
                    const currentIndex = candidates.findIndex(c => c.id === selectedCandidateId);
                    if (currentIndex !== -1 && currentIndex < candidates.length - 1) {
                      setSelectedCandidateId(candidates[currentIndex + 1].id);
                    }
                  };
                  const hasNext = candidates.findIndex(c => c.id === selectedCandidateId) < candidates.length - 1;

                  return (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-6">
                      {/* Header with Candidate Profile Summary */}
                      <div className="flex items-start justify-between border-b border-gray-150 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] font-bold text-lg">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-base">{candidate.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">ID: {candidate.id} • NIC: {candidate.nic}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-gray-400">Overall Attendance</div>
                          <div className={`text-lg font-black ${stats.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {stats.attendancePercentage}%
                          </div>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attendance Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { st: 'Present', color: 'emerald', label: 'Present' },
                            { st: 'Absent', color: 'red', label: 'Absent' },
                            { st: 'Late', color: 'amber', label: 'Late' },
                            { st: 'Half Day', color: 'indigo', label: 'Half Day' },
                            { st: 'Leave', color: 'slate', label: 'Leave' }
                          ].map(({ st, color, label }) => {
                            const active = record.status === st;
                            const activeStyles = {
                              emerald: 'bg-emerald-600 text-white shadow-emerald-100 ring-2 ring-emerald-600 ring-offset-2',
                              red: 'bg-red-500 text-white shadow-red-100 ring-2 ring-red-500 ring-offset-2',
                              amber: 'bg-amber-500 text-white shadow-amber-100 ring-2 ring-amber-500 ring-offset-2',
                              indigo: 'bg-indigo-600 text-white shadow-indigo-100 ring-2 ring-indigo-600 ring-offset-2',
                              slate: 'bg-slate-600 text-white shadow-slate-100 ring-2 ring-slate-600 ring-offset-2'
                            }[color];
                            
                            const inactiveStyles = {
                              emerald: 'hover:bg-emerald-50 text-emerald-700 bg-emerald-50/30 border border-emerald-100',
                              red: 'hover:bg-red-50 text-red-600 bg-red-50/30 border border-red-100',
                              amber: 'hover:bg-amber-50 text-amber-600 bg-amber-50/30 border border-amber-100',
                              indigo: 'hover:bg-indigo-50 text-indigo-600 bg-indigo-50/30 border border-indigo-100',
                              slate: 'hover:bg-slate-100 text-slate-600 bg-slate-100/30 border border-slate-200'
                            }[color];

                            return (
                              <button
                                key={st}
                                onClick={() => handleMarkCandidate(candidate.id, st)}
                                className={`py-3 px-4 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${
                                  active ? activeStyles : inactiveStyles
                                }`}
                              >
                                {active && <Check size={12} />}
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Attendance Stats Breakdown */}
                      <div className="flex flex-col gap-2 bg-slate-50/50 p-4 rounded-xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Attendance Details Breakdown</label>
                        <div className="grid grid-cols-5 gap-2 text-center">
                          <div className="bg-white p-2 rounded-lg border border-gray-150 shadow-sm">
                            <div className="text-[9px] font-semibold text-gray-400">Total</div>
                            <div className="text-xs font-bold text-gray-800">{stats.totalSessions || 0}</div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-150 shadow-sm">
                            <div className="text-[9px] font-semibold text-emerald-500">Present</div>
                            <div className="text-xs font-bold text-emerald-600">{stats.presentCount || 0}</div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-150 shadow-sm">
                            <div className="text-[9px] font-semibold text-red-500">Absent</div>
                            <div className="text-xs font-bold text-red-600">{stats.absentCount || 0}</div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-150 shadow-sm">
                            <div className="text-[9px] font-semibold text-amber-500">Late</div>
                            <div className="text-xs font-bold text-amber-600">{stats.lateCount || 0}</div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-gray-150 shadow-sm">
                            <div className="text-[9px] font-semibold text-indigo-500">Leave</div>
                            <div className="text-xs font-bold text-indigo-600">
                              {(stats.leaveCount || 0) + (stats.halfDayCount || 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remarks Input */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remarks / Notes</label>
                        <input
                          type="text"
                          value={record.remarks || ''}
                          placeholder="e.g. medical reason, late by 15 mins"
                          onChange={(e) => handleCandidateRemarks(candidate.id, e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#1e3a5f] transition-all"
                        />
                      </div>

                      {/* Attendance History List */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Attendance History Log</label>
                        <div className="border border-gray-205 border-gray-250 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-slate-50/20">
                          {selectedCandidateHistory.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400 font-medium">
                              No attendance records found.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {selectedCandidateHistory.map((h, index) => {
                                const statusColors = {
                                  Present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                                  Absent: 'bg-red-50 text-red-700 border-red-100',
                                  Late: 'bg-amber-50 text-amber-700 border-amber-100',
                                  'Half Day': 'bg-indigo-50 text-indigo-700 border-indigo-100',
                                  Leave: 'bg-slate-100 text-slate-700 border-slate-200'
                                }[h.status] || 'bg-gray-50 text-gray-700 border-gray-200';

                                return (
                                  <div key={h.id || index} className="p-3 flex items-start justify-between gap-3 text-xs bg-white hover:bg-slate-50/50 transition-colors">
                                    <div>
                                      <div className="font-semibold text-gray-700">{h.sessionDate}</div>
                                      <div className="text-[10px] text-gray-400 font-medium">{h.sessionType}</div>
                                      {h.remarks && (
                                        <div className="text-[10px] text-gray-500 italic mt-0.5">Note: "{h.remarks}"</div>
                                      )}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
                                      {h.status}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Navigation Footer */}
                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                        <span className="text-[11px] text-gray-400 font-medium">
                          Marking candidate {candidates.findIndex(c => c.id === selectedCandidateId) + 1} of {candidates.length}
                        </span>
                        
                        {hasNext && (
                          <button
                            onClick={handleNextCandidate}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                          >
                            Next Candidate <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-400 h-64">
                    <Users size={36} className="text-gray-300 mb-2" />
                    <span className="text-sm font-semibold">Select a Candidate</span>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Click any candidate on the left to mark their attendance status.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* INSTRUCTOR TAB */}
        {activeTab === 'instructors' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {instructors.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <Users size={48} className="text-gray-300 mb-2" />
                <span className="text-sm font-medium">No instructors found in database.</span>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">Instructor Name</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Check-In Time</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Check-Out Time</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center">Fast Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {instructors.map((ins) => {
                      const record = instructorAttendance[ins.id] || { status: 'Absent', checkIn: '', checkOut: '' };
                      const isSaving = savingInstructors[ins.id] || false;
                      const checkInTime = record.checkIn || '';
                      const checkOutTime = record.checkOut || '';

                      return (
                        <tr key={ins.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{ins.name}</div>
                            <div className="text-xs text-gray-400 font-medium">{ins.id} • {ins.phone}</div>
                          </td>

                          <td className="px-6 py-4">
                            <select 
                              value={record.status}
                              onChange={(e) => handleInstructorAction(ins.id, 'status', e.target.value)}
                              className={`text-xs font-bold rounded-lg border px-2.5 py-1 outline-none ${
                                record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                record.status === 'Leave' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                              <option value="Leave">Leave</option>
                            </select>
                          </td>

                          <td className="px-6 py-4">
                            <input 
                              type="time" 
                              value={checkInTime}
                              onChange={(e) => handleInstructorAction(ins.id, 'checkIn', e.target.value)}
                              className="bg-slate-50 border border-gray-200 text-xs text-gray-700 font-semibold rounded-lg px-2.5 py-1 outline-none focus:border-[#1e3a5f]"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <input 
                              type="time" 
                              value={checkOutTime}
                              onChange={(e) => handleInstructorAction(ins.id, 'checkOut', e.target.value)}
                              className="bg-slate-50 border border-gray-200 text-xs text-gray-700 font-semibold rounded-lg px-2.5 py-1 outline-none focus:border-[#1e3a5f]"
                            />
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex gap-1.5 justify-center">
                              <button 
                                onClick={() => {
                                  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                  handleInstructorAction(ins.id, 'checkIn', now);
                                }}
                                className="px-2 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 text-[10px] font-bold rounded-md transition-all"
                              >
                                Check In Now
                              </button>
                              <button 
                                onClick={() => {
                                  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                  handleInstructorAction(ins.id, 'checkOut', now);
                                }}
                                className="px-2 py-1 bg-amber-500/5 text-amber-700 hover:bg-amber-500/10 text-[10px] font-bold rounded-md transition-all"
                              >
                                Check Out Now
                              </button>
                            </div>
                            {isSaving && (
                              <span className="block text-[9px] text-gray-400 mt-1 animate-pulse">Syncing...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {staffList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <Users size={48} className="text-gray-300 mb-2" />
                <span className="text-sm font-medium">No staff registered.</span>
                <p className="text-xs text-gray-400 mt-1">Use the "Add Staff Member" button above to register.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">Staff Info</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Role</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Check-In Time</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Check-Out Time</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-center font-bold">Fast Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staffList.map((stf) => {
                      const record = staffAttendance[stf.id] || { status: 'Absent', checkIn: '', checkOut: '' };
                      const isSaving = savingStaff[stf.id] || false;
                      const checkInTime = record.checkIn || '';
                      const checkOutTime = record.checkOut || '';

                      return (
                        <tr key={stf.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{stf.name}</div>
                            <div className="text-xs text-gray-400 font-medium">{stf.id} • {stf.phone || 'No phone'}</div>
                          </td>

                          <td className="px-6 py-4 font-medium text-gray-600">
                            {stf.role}
                          </td>

                          <td className="px-6 py-4">
                            <select 
                              value={record.status}
                              onChange={(e) => handleStaffAction(stf.id, 'status', e.target.value)}
                              className={`text-xs font-bold rounded-lg border px-2.5 py-1 outline-none ${
                                record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                record.status === 'Leave' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                              <option value="Leave">Leave</option>
                            </select>
                          </td>

                          <td className="px-6 py-4">
                            <input 
                              type="time" 
                              value={checkInTime}
                              onChange={(e) => handleStaffAction(stf.id, 'checkIn', e.target.value)}
                              className="bg-slate-50 border border-gray-200 text-xs text-gray-700 font-semibold rounded-lg px-2.5 py-1 outline-none focus:border-[#1e3a5f]"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <input 
                              type="time" 
                              value={checkOutTime}
                              onChange={(e) => handleStaffAction(stf.id, 'checkOut', e.target.value)}
                              className="bg-slate-50 border border-gray-200 text-xs text-gray-700 font-semibold rounded-lg px-2.5 py-1 outline-none focus:border-[#1e3a5f]"
                            />
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex gap-1.5 justify-center">
                              <button 
                                onClick={() => {
                                  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                  handleStaffAction(stf.id, 'checkIn', now);
                                }}
                                className="px-2 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 text-[10px] font-bold rounded-md transition-all"
                              >
                                Check In Now
                              </button>
                              <button 
                                onClick={() => {
                                  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                                  handleStaffAction(stf.id, 'checkOut', now);
                                }}
                                className="px-2 py-1 bg-amber-500/5 text-amber-700 hover:bg-amber-500/10 text-[10px] font-bold rounded-md transition-all"
                              >
                                Check Out Now
                              </button>
                            </div>
                            {isSaving && (
                              <span className="block text-[9px] text-gray-400 mt-1 animate-pulse">Syncing...</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="flex-1 flex flex-col min-h-0 gap-6">
            
            {/* Report Form Parameters */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm shrink-0">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider mb-4">Report Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Report Type</label>
                  <select 
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      setReportData([]);
                    }}
                    className="w-full bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]"
                  >
                    <option value="Candidate">Candidate Attendance Report</option>
                    <option value="Instructor">Instructor Attendance Report</option>
                    <option value="Staff">Staff Attendance Report</option>
                    <option value="AbsentList">Absent List Report</option>
                    <option value="MonthlySummary">Eligibility / Monthly Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Start Date</label>
                  <input 
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">End Date</label>
                  <input 
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]"
                  />
                </div>

                {reportType === 'Candidate' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Filter Batch (Optional)</label>
                    <select
                      value={reportBatchId}
                      onChange={(e) => setReportBatchId(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]"
                    >
                      <option value="">All Batches</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {['Candidate', 'Instructor', 'Staff'].includes(reportType) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Attendance Status</label>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]"
                    >
                      <option value="">All Statuses</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </div>
                )}

                <div>
                  <button 
                    onClick={generateReport}
                    disabled={generatingReport}
                    className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
                  >
                    {generatingReport ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Report Table output */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0 print:border-none print:shadow-none">
              
              {/* Report view Controls */}
              {reportData.length > 0 && (
                <div className="bg-slate-50 border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0 print:hidden">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Results: {reportData.length} records found
                  </span>
                  
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-[#1e3a5f] hover:border-[#1e3a5f] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Download size={14} /> Print Report (PDF)
                  </button>
                </div>
              )}

              {/* Table wrapper */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Print/Export header */}
                <div className="hidden print:block mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#1e3a5f]">LankaDrive Driving School</h2>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mt-1">{reportType} Attendance Report</p>
                  <p className="text-xs text-gray-400 mt-0.5">Period: {reportStartDate} to {reportEndDate}</p>
                  <div className="border-b-2 border-gray-200 mt-4"></div>
                </div>

                {reportData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                    <FileText size={48} className="text-gray-300 mb-2" />
                    <span className="text-sm font-medium">No report generated yet.</span>
                    <p className="text-xs text-gray-400 mt-1">Select the parameters above and click "Generate Report".</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-gray-200 text-gray-700">
                        {reportType === 'Candidate' && (
                          <>
                            <th className="px-4 py-2.5 font-bold">Date</th>
                            <th className="px-4 py-2.5 font-bold">Candidate Name</th>
                            <th className="px-4 py-2.5 font-bold">Batch</th>
                            <th className="px-4 py-2.5 font-bold">Session Type</th>
                            <th className="px-4 py-2.5 font-bold text-center">Status</th>
                            <th className="px-4 py-2.5 font-bold">Remarks</th>
                          </>
                        )}
                        {reportType === 'Instructor' && (
                          <>
                            <th className="px-4 py-2.5 font-bold">Date</th>
                            <th className="px-4 py-2.5 font-bold">Instructor Name</th>
                            <th className="px-4 py-2.5 font-bold">Check-In</th>
                            <th className="px-4 py-2.5 font-bold">Check-Out</th>
                            <th className="px-4 py-2.5 font-bold text-center">Status</th>
                          </>
                        )}
                        {reportType === 'Staff' && (
                          <>
                            <th className="px-4 py-2.5 font-bold">Date</th>
                            <th className="px-4 py-2.5 font-bold">Staff Name</th>
                            <th className="px-4 py-2.5 font-bold">Role</th>
                            <th className="px-4 py-2.5 font-bold">Check-In</th>
                            <th className="px-4 py-2.5 font-bold">Check-Out</th>
                            <th className="px-4 py-2.5 font-bold text-center">Status</th>
                          </>
                        )}
                        {reportType === 'AbsentList' && (
                          <>
                            <th className="px-4 py-2.5 font-bold">Date</th>
                            <th className="px-4 py-2.5 font-bold">Candidate Name</th>
                            <th className="px-4 py-2.5 font-bold">Batch</th>
                            <th className="px-4 py-2.5 font-bold">Contact Phone</th>
                          </>
                        )}
                        {reportType === 'MonthlySummary' && (
                          <>
                            <th className="px-4 py-2.5 font-bold">Candidate</th>
                            <th className="px-4 py-2.5 font-bold">Batch</th>
                            <th className="px-4 py-2.5 font-bold text-center">Total Sessions</th>
                            <th className="px-4 py-2.5 font-bold text-center">Present</th>
                            <th className="px-4 py-2.5 font-bold text-center">Absent</th>
                            <th className="px-4 py-2.5 font-bold text-center">Late</th>
                            <th className="px-4 py-2.5 font-bold text-center">Leaves/Half Days</th>
                            <th className="px-4 py-2.5 font-bold text-center">Attendance %</th>
                            <th className="px-4 py-2.5 font-bold text-center">Exam Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((row, idx) => {
                        const total = row.totalSessions || 0;
                        const present = row.presentCount || 0;
                        const late = row.lateCount || 0;
                        const halfDay = row.halfDayCount || 0;
                        const leave = row.leaveCount || 0;
                        
                        const attended = present + late + (halfDay * 0.5) + leave;
                        const pct = total > 0 ? Math.round((attended / total) * 100) : 100;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {reportType === 'Candidate' && (
                              <>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.sessionDate}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.candidateName} <span className="text-[10px] text-gray-400 font-medium">({row.candidateId})</span></td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{row.batchName || 'N/A'}</td>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.sessionType}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    row.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                    row.status === 'Absent' ? 'bg-red-50 text-red-700' :
                                    row.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>{row.status}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 italic">{row.remarks || '—'}</td>
                              </>
                            )}

                            {reportType === 'Instructor' && (
                              <>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.attendanceDate}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.instructorName}</td>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.checkIn || '—'}</td>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.checkOut || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    row.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                    row.status === 'Absent' ? 'bg-red-50 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>{row.status}</span>
                                </td>
                              </>
                            )}

                            {reportType === 'Staff' && (
                              <>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.attendanceDate}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.staffName}</td>
                                <td className="px-4 py-3 text-gray-500 font-medium">{row.staffRole}</td>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.checkIn || '—'}</td>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.checkOut || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    row.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                    row.status === 'Absent' ? 'bg-red-50 text-red-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>{row.status}</span>
                                </td>
                              </>
                            )}

                            {reportType === 'AbsentList' && (
                              <>
                                <td className="px-4 py-3 text-gray-600 font-semibold">{row.sessionDate}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.candidateName} <span className="text-[10px] text-gray-400 font-medium">({row.candidateId})</span></td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{row.batchName || 'N/A'}</td>
                                <td className="px-4 py-3 text-red-600 font-bold hover:underline">{row.candidatePhone || 'No number'}</td>
                              </>
                            )}

                            {reportType === 'MonthlySummary' && (
                              <>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.candidateName} <span className="text-[10px] text-gray-400 font-medium">({row.candidateId})</span></td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{row.batchName || 'N/A'}</td>
                                <td className="px-4 py-3 text-center text-gray-600 font-semibold">{total}</td>
                                <td className="px-4 py-3 text-center text-emerald-600 font-bold">{present}</td>
                                <td className="px-4 py-3 text-center text-red-500 font-bold">{row.absentCount || 0}</td>
                                <td className="px-4 py-3 text-center text-amber-500 font-semibold">{late}</td>
                                <td className="px-4 py-3 text-center text-indigo-500 font-semibold">{halfDay + leave}</td>
                                <td className="px-4 py-3 text-center font-bold text-gray-700">
                                  <span className={pct >= 80 ? 'text-emerald-600' : 'text-red-500'}>{pct}%</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {pct >= 80 ? (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      <Check size={8} /> ELIGIBLE
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">
                                      <X size={8} /> INELIGIBLE
                                    </span>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Modal for Registering Staff Members */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1e3a5f] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">Add Staff Member</h3>
              <button 
                onClick={() => setShowAddStaffModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sunil Perera"
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Designation</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Receptionist, Manager"
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0771234567"
                  value={newStaffData.phone}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1e3a5f]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={addingStaff}
                  className="flex items-center gap-1.5 bg-[#1e3a5f] hover:bg-[#152a45] disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
                >
                  {addingStaff ? <Loader2 className="animate-spin" size={14} /> : null}
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
