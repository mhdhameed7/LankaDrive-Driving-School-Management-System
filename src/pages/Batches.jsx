import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, Plus, List, Grid, Users, Car, UserSquare2, 
  X, CheckCircle2, AlertCircle, Clock, Edit, Trash2, Search, 
  Check, Sparkles, AlertTriangle, ShieldCheck, Phone, MapPin, 
  ChevronRight, Layers, ArrowRight, Play, CheckCircle
} from 'lucide-react';

const SESSION_TYPE_CONFIG = {
  'Theory': { label: 'Theory Class', color: 'bg-blue-100 text-blue-700 border-blue-200', max: 15 },
  'Practical': { label: 'Practical Training', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', max: 5 },
  'Simulation': { label: 'Simulator Practice', color: 'bg-purple-100 text-purple-700 border-purple-200', max: 2 }
};

const TIME_SLOT_CONFIG = {
  'Morning': { label: 'Morning (6am-9am)', emoji: '🌅', color: 'bg-amber-100 text-amber-700' },
  'Afternoon': { label: 'Afternoon (12pm-3pm)', emoji: '☀️', color: 'bg-orange-100 text-orange-700' },
  'Evening': { label: 'Evening (5pm-8pm)', emoji: '🌇', color: 'bg-indigo-100 text-indigo-700' },
  'Weekend': { label: 'Weekend Special', emoji: '🎉', color: 'bg-rose-100 text-rose-700' }
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekDays = (monday) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

const isToday = (someDate) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

const formatMonthYear = (monday) => {
  return monday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const getShortBatchCode = (name) => {
  if (!name) return 'BCH';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4);
};

const Batches = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  // Batch Form State
  const initialBatchForm = { 
    id: null,
    name: '', 
    type: 'Weekday', 
    licenseCategory: 'B - Light Vehicle', 
    startDate: '', 
    endDate: '',
    sessionType: 'Theory',
    timeSlot: 'Morning',
    sessionDays: [],
    instructorId: '',
    vehicleId: '',
    maxCapacity: 15
  };
  const [batchForm, setBatchForm] = useState(initialBatchForm);
  const [conflictWarning, setConflictWarning] = useState(null);
  
  // Candidate Selection in Creation Form
  const [selectedFormCandidateIds, setSelectedFormCandidateIds] = useState(new Set());
  const [formCandidateSearch, setFormCandidateSearch] = useState('');

  // Filtering Batches
  const [batchFilter, setBatchFilter] = useState('All');

  // Weekly Grid Calendar Navigation
  const [calWeekStart, setCalWeekStart] = useState(() => getMonday(new Date()));

  // Modals & Other States
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingBatch, setManagingBatch] = useState(null);
  const [batchCandidates, setBatchCandidates] = useState([]);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [searchAddCandidateQuery, setSearchAddCandidateQuery] = useState('');

  // Smart Batching
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [smartMode, setSmartMode] = useState('exam'); 
  const [smartForm, setSmartForm] = useState({ examType: 'Written', date: '', area: '', transmission: 'Manual' });
  const [smartCandidates, setSmartCandidates] = useState([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState(new Set());
  const [searchCandidatesQuery, setSearchCandidatesQuery] = useState('');
  const [splitMethod, setSplitMethod] = useState(false);
  
  const loadData = async () => {
    try {
      const fetchedBatches = await window.api.getBatches();
      setBatches(fetchedBatches || []);
      
      const fetchedInstructors = await window.api.getInstructors();
      setInstructors(fetchedInstructors || []);

      const fetchedVehicles = await window.api.getVehicles();
      setVehicles(fetchedVehicles || []);

      const fetchedCandidates = await window.api.getCandidates();
      setCandidates(fetchedCandidates || []);
    } catch (err) {
      console.error("Failed to load batches/sessions", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setBatchForm(initialBatchForm);
      setSelectedFormCandidateIds(new Set());
      setFormCandidateSearch('');
      const input = document.querySelector('input[placeholder="e.g. Morning Theory B"]');
      if (input) input.focus();
      navigate('/batches', { replace: true });
    }
  }, [location, navigate]);

  const generateBatchName = (slot) => {
    const prefix = (slot || 'Morning').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const count = batches.filter(b => b.timeSlot === slot).length + 1;
    return `${prefix}-${year}-${String(count).padStart(2, '0')}`;
  };

  // Memoized unassigned candidates for manual batch creation
  const unassignedCandidates = useMemo(() => {
    const activeBatchCodes = new Set(batches.map(b => b.batchCode));
    return candidates.filter(c => !c.batchPreference || !activeBatchCodes.has(c.batchPreference));
  }, [candidates, batches]);

  const filteredFormCandidates = useMemo(() => {
    return unassignedCandidates.filter(c => 
      c.name.toLowerCase().includes(formCandidateSearch.toLowerCase()) || 
      c.nic.toLowerCase().includes(formCandidateSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(formCandidateSearch.toLowerCase())
    );
  }, [unassignedCandidates, formCandidateSearch]);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (batchFilter === 'All') return true;
      return b.sessionType === batchFilter;
    });
  }, [batches, batchFilter]);

  const weekDays = useMemo(() => getWeekDays(calWeekStart), [calWeekStart]);
  const weekEnd = useMemo(() => {
    const end = new Date(calWeekStart);
    end.setDate(calWeekStart.getDate() + 6);
    return end;
  }, [calWeekStart]);

  const isBatchInWeek = (batch) => {
    if (!batch.startDate || !batch.endDate) return true;
    const bStart = new Date(batch.startDate);
    const bEnd = new Date(batch.endDate);
    return bStart <= weekEnd && bEnd >= calWeekStart;
  };

  // Form Handlers
  const handleSessionTypeChange = (type) => {
    const config = SESSION_TYPE_CONFIG[type];
    setBatchForm(prev => ({
      ...prev,
      sessionType: type,
      maxCapacity: config ? config.max : prev.maxCapacity
    }));
  };

  const toggleSessionDay = (day) => {
    setBatchForm(prev => {
      const days = prev.sessionDays.includes(day) 
        ? prev.sessionDays.filter(d => d !== day)
        : [...prev.sessionDays, day];
      return { ...prev, sessionDays: days };
    });
  };

  const checkConflicts = () => {
    if (!batchForm.timeSlot || batchForm.sessionDays.length === 0 || (!batchForm.instructorId && !batchForm.vehicleId)) {
      setConflictWarning(null);
      return;
    }
    
    const conflictingBatch = batches.find(b => {
      if (b.id === batchForm.id) return false; // skip self
      if (b.timeSlot !== batchForm.timeSlot) return false;
      
      let hasOverlappingDays = false;
      try {
        const bDays = JSON.parse(b.sessionDays || '[]');
        hasOverlappingDays = bDays.some(day => batchForm.sessionDays.includes(day));
      } catch(e) {}
      
      if (!hasOverlappingDays) return false;

      // Same time, same day. Check instructor or vehicle.
      if (batchForm.instructorId && b.instructorId === batchForm.instructorId) return true;
      if (batchForm.vehicleId && b.vehicleId === batchForm.vehicleId) return true;
      
      return false;
    });

    if (conflictingBatch) {
      setConflictWarning(`Conflict! "${conflictingBatch.name}" already schedules Instructor/Vehicle on these days at this slot.`);
    } else {
      setConflictWarning(null);
    }
  };

  useEffect(() => {
    checkConflicts();
  }, [batchForm.timeSlot, batchForm.sessionDays, batchForm.instructorId, batchForm.vehicleId, batches]);

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (batchForm.sessionDays.length === 0) {
      alert("Please select at least one session day.");
      return;
    }
    
    const payload = {
      ...batchForm,
      sessionDays: JSON.stringify(batchForm.sessionDays)
    };

    if (payload.id) {
      const res = await window.api.updateBatch(payload);
      if (res.success && selectedFormCandidateIds.size > 0) {
        const batchObj = batches.find(b => b.id === payload.id);
        if (batchObj) {
          await window.api.assignCandidatesToBatch({
            batchCode: batchObj.batchCode,
            candidateIds: Array.from(selectedFormCandidateIds)
          });
        }
      }
    } else {
      const res = await window.api.addBatch(payload);
      if (res.success && res.batchCode && selectedFormCandidateIds.size > 0) {
        await window.api.assignCandidatesToBatch({
          batchCode: res.batchCode,
          candidateIds: Array.from(selectedFormCandidateIds)
        });
      }
    }
    setBatchForm(initialBatchForm);
    setSelectedFormCandidateIds(new Set());
    setFormCandidateSearch('');
    loadData();
  };

  const handleEditBatch = (batch) => {
    let days = [];
    try {
      if (batch.sessionDays) days = JSON.parse(batch.sessionDays);
    } catch(e) {}
    
    setBatchForm({
      id: batch.id,
      name: batch.name,
      licenseCategory: batch.licenseCategory || 'B - Light Vehicle',
      type: batch.type || 'Weekday',
      maxCapacity: batch.maxCapacity || 15,
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      sessionType: batch.sessionType || 'Theory',
      timeSlot: batch.timeSlot || 'Morning',
      sessionDays: days,
      instructorId: batch.instructorId || '',
      vehicleId: batch.vehicleId || ''
    });
    setSelectedFormCandidateIds(new Set());
  };

  const handleDeleteBatch = async (batchId, batchName) => {
    if (window.confirm(`⚠️ WARNING: Are you sure you want to delete batch "${batchName}"?`)) {
      const res = await window.api.deleteBatch(batchId);
      if (res.success) loadData();
    }
  };

  const handleCancelEdit = () => {
    setBatchForm(initialBatchForm);
    setSelectedFormCandidateIds(new Set());
    setFormCandidateSearch('');
  };

  // Manage Candidates Logic
  const openManageBatch = async (batch) => {
    setManagingBatch(batch);
    try {
      const res = await window.api.getBatchCandidates(batch.batchCode);
      setBatchCandidates(res || []);
      setShowManageModal(true);
    } catch (err) { console.error(err); }
  };

  const openAddCandidateModal = async () => {
    try {
      const res = await window.api.getCandidates();
      const activeBatchCodes = new Set(batches.map(b => b.batchCode));
      const unassigned = (res || []).filter(c => !c.batchPreference || !activeBatchCodes.has(c.batchPreference));
      setAvailableCandidates(unassigned);
      setSearchAddCandidateQuery('');
      setShowAddCandidateModal(true);
    } catch (err) { console.error(err); }
  };

  const assignCandidateToBatch = async (candidateId) => {
    if (batchCandidates.length >= managingBatch.maxCapacity) {
      return alert("Batch is at full capacity!");
    }
    const res = await window.api.assignCandidatesToBatch({ batchCode: managingBatch.batchCode, candidateIds: [candidateId] });
    if (res.success) {
      openManageBatch(managingBatch);
      loadData();
      setShowAddCandidateModal(false);
    }
  };

  const removeCandidate = async (candidateId) => {
    if (window.confirm("Remove candidate from batch?")) {
      const res = await window.api.removeCandidateFromBatch({ candidateId });
      if (res.success) {
        openManageBatch(managingBatch);
        loadData();
      }
    }
  };
  
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const res = await window.api.updateBatchStatus({ batchId: managingBatch.id, status: newStatus });
    if (res.success) {
      setManagingBatch({ ...managingBatch, status: newStatus });
      loadData();
    }
  };

  // Smart Batch Logic
  const handleSearchSmartCandidates = async () => {
    try {
      const res = await window.api.getCandidates();
      let matches = [];
      if (smartMode === 'exam') {
        matches = (res || []).filter(c => c.status === (smartForm.examType === 'Written' ? 'Document Verifying' : 'Written Passed'));
      } else {
        matches = (res || []).filter(c => (c.address || '').toLowerCase().includes((smartForm.area || '').toLowerCase()));
      }
      setSmartCandidates(matches);
      setSelectedCandidateIds(new Set());
    } catch (err) { console.error(err); }
  };

  const handleToggleCandidate = (id) => {
    const next = new Set(selectedCandidateIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCandidateIds(next);
  };

  const handleToggleAllCandidates = () => {
    if (selectedCandidateIds.size === filteredSmartCandidates.length && filteredSmartCandidates.length > 0) {
      setSelectedCandidateIds(new Set());
    } else {
      setSelectedCandidateIds(new Set(filteredSmartCandidates.map(c => c.id)));
    }
  };

  const handleCreateSmartBatch = async () => {
    const candidateArray = Array.from(selectedCandidateIds);
    if (candidateArray.length === 0) return;
    try {
      let bCode = "";
      if (splitMethod && candidateArray.length > 30) {
        const chunkSize = 30;
        for (let i = 0; i < candidateArray.length; i += chunkSize) {
          const chunk = candidateArray.slice(i, i + chunkSize);
          const p = { name: `Smart Batch Part ${i/chunkSize + 1}`, type: 'Weekday', maxCapacity: chunkSize, licenseCategory: 'B - Light Vehicle' };
          const res = await window.api.addBatch(p);
          if (res.success) await window.api.assignCandidatesToBatch({ batchCode: res.batchCode, candidateIds: chunk });
        }
        alert(`Successfully generated multiple auto-split cohorts!`);
      } else {
        const payload = { name: `Smart Batch (${smartMode})`, type: 'Weekday', maxCapacity: Math.max(30, candidateArray.length), licenseCategory: 'B - Light Vehicle' };
        const res = await window.api.addBatch(payload);
        if (res.success) {
          bCode = res.batchCode;
          await window.api.assignCandidatesToBatch({ batchCode: bCode, candidateIds: candidateArray });
        }
        alert(`Successfully generated cohort ${bCode}!`);
      }
      setShowSmartModal(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const filteredSmartCandidates = smartCandidates.filter(c => 
    c.name.toLowerCase().includes(searchCandidatesQuery.toLowerCase()) || 
    c.nic.toLowerCase().includes(searchCandidatesQuery.toLowerCase())
  );
  
  const filteredAvailableCandidates = availableCandidates.filter(c => 
    c.name.toLowerCase().includes(searchAddCandidateQuery.toLowerCase()) || 
    c.nic.toLowerCase().includes(searchAddCandidateQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 z-10 relative">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-600" />
            Batch & Scheduling
          </h1>
          <p className="text-xs font-semibold text-[#64748b] mt-0.5">Manage training cohorts and weekly schedules</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSmartModal(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all border border-indigo-200 shadow-xs cursor-pointer">
            <Sparkles size={16} /> Smart Batching
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-slate-50/50">
        {/* Left Panel: Inline Form */}
        <div className="w-[350px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0 z-0 relative">
          <div className="p-5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              {batchForm.id ? 'Edit Batch Configuration' : 'Create New Batch'}
            </h2>
          </div>
          
          <form onSubmit={handleBatchSubmit} className="p-5 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">Batch Name</label>
                <button 
                  type="button" 
                  onClick={() => setBatchForm(prev => ({ ...prev, name: generateBatchName(prev.timeSlot) }))}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={10} /> Auto-Gen
                </button>
              </div>
              <input required type="text" className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Morning Theory B" value={batchForm.name} onChange={e => setBatchForm({...batchForm, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Start Date</label>
                <input required type="date" className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-[11px] outline-none focus:border-indigo-500" value={batchForm.startDate} onChange={e => setBatchForm({...batchForm, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">End Date</label>
                <input required type="date" className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-[11px] outline-none focus:border-indigo-500" value={batchForm.endDate} onChange={e => setBatchForm({...batchForm, endDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-2">Session Type</label>
              <div className="flex gap-2">
                {Object.entries(SESSION_TYPE_CONFIG).map(([type, config]) => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => handleSessionTypeChange(type)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${batchForm.sessionType === type ? config.color + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle size={12}/> Auto-set max capacity: {SESSION_TYPE_CONFIG[batchForm.sessionType]?.max || 15}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-2">Weekly Schedule Days</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => {
                  const isSelected = batchForm.sessionDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleSessionDay(day)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-2">Time Slot</label>
              <select className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500" value={batchForm.timeSlot} onChange={e => setBatchForm({...batchForm, timeSlot: e.target.value})}>
                {Object.keys(TIME_SLOT_CONFIG).map(slot => (
                  <option key={slot} value={slot}>{TIME_SLOT_CONFIG[slot].label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Instructor</label>
                <select className="w-full px-2 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500" value={batchForm.instructorId} onChange={e => setBatchForm({...batchForm, instructorId: e.target.value})}>
                  <option value="">-- Unassigned --</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Vehicle</label>
                <select 
                  className="w-full px-2 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 disabled:opacity-50" 
                  value={batchForm.vehicleId} 
                  onChange={e => setBatchForm({...batchForm, vehicleId: e.target.value})}
                  disabled={batchForm.sessionType === 'Theory'}
                >
                  <option value="">-- Unassigned --</option>
                  {vehicles.filter(v => v.status === 'Active').map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                </select>
              </div>
            </div>

            {/* Candidates Multi-Select Selection Form */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5 flex justify-between">
                <span>Assign Candidates ({selectedFormCandidateIds.size})</span>
                <span className="text-[10px] text-slate-400 capitalize normal-case font-medium">unassigned candidates</span>
              </label>
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={formCandidateSearch}
                onChange={e => setFormCandidateSearch(e.target.value)}
                className="w-full px-2 py-1.5 mb-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-[11px] outline-none focus:border-indigo-500"
              />
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                {filteredFormCandidates.length === 0 ? (
                  <div className="text-[10px] text-slate-400 text-center py-2">No unassigned candidates</div>
                ) : (
                  filteredFormCandidates.map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors text-[10px] font-medium text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={selectedFormCandidateIds.has(c.id)} 
                        onChange={() => {
                          const next = new Set(selectedFormCandidateIds);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          setSelectedFormCandidateIds(next);
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                      />
                      <span className="truncate">{c.name} ({c.nic})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            
            {conflictWarning && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-[11px] font-bold flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}
            
            {!conflictWarning && batchForm.timeSlot && batchForm.sessionDays.length > 0 && (batchForm.instructorId || batchForm.vehicleId) && (
               <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                 <CheckCircle size={14} /> Schedule is clear. No conflicts.
               </div>
            )}

            <div className="pt-4 flex gap-2">
              <button type="submit" disabled={conflictWarning} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition-all ${conflictWarning ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'}`}>
                {batchForm.id ? 'Save Changes' : 'Create Batch'}
              </button>
              {batchForm.id && (
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Middle/Right: Batch Cards & Weekly Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">
          
          {/* Top Half: Batch Cards */}
          <div className="h-1/2 overflow-y-auto p-6 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <List size={16} className="text-indigo-600" />
                Active Batches Overview
              </h2>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {['All', 'Theory', 'Practical', 'Simulation'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setBatchFilter(tab)}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                      batchFilter === tab 
                        ? 'bg-white text-slate-800 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredBatches.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                 <Users size={32} className="mx-auto text-slate-300 mb-2" />
                 <p className="text-sm font-bold text-slate-500">No active batches created yet.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredBatches.map(batch => {
                  let days = [];
                  try {
                    if (batch.sessionDays) days = JSON.parse(batch.sessionDays);
                  } catch(e) {}
                  
                  const typeConfig = SESSION_TYPE_CONFIG[batch.sessionType] || SESSION_TYPE_CONFIG['Theory'];
                  const capacityPercent = Math.min(100, Math.round(((batch.candidateCount || 0) / (batch.maxCapacity || 1)) * 100));
                  
                  return (
                    <div key={batch.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{batch.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{batch.batchCode}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase border ${typeConfig.color}`}>
                          {batch.sessionType || 'Theory'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="text-[9px] font-extrabold text-slate-400 uppercase mb-0.5">Schedule</div>
                          <div className="text-xs font-bold text-slate-700">{batch.timeSlot || 'Not set'}</div>
                          <div className="text-[10px] font-medium text-slate-500 mt-0.5">{days.map(d=>d.substring(0,3)).join(', ') || 'No days'}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col justify-center">
                           <div className="text-[9px] font-extrabold text-slate-400 uppercase mb-1">Capacity</div>
                           <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                             <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${capacityPercent}%` }}></div>
                           </div>
                           <div className="text-[10px] font-bold text-slate-600 text-right">{batch.candidateCount || 0} / {batch.maxCapacity}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                         {batch.instructorId && (
                           <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                             <UserSquare2 size={10} className="text-indigo-500" /> {instructors.find(i=>i.id==batch.instructorId)?.name || batch.instructorId}
                           </div>
                         )}
                         {batch.vehicleId && (
                           <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                             <Car size={10} className="text-indigo-500" /> {vehicles.find(v=>v.id==batch.vehicleId)?.plateNumber || batch.vehicleId}
                           </div>
                         )}
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2 justify-end">
                        <button onClick={() => handleEditBatch(batch)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteBatch(batch.id, batch.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => openManageBatch(batch)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-colors ml-1">
                          Manage Students
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Bottom Half: Weekly Grid */}
          <div className="flex-1 border-t border-[#e2e8f0] bg-white flex flex-col min-h-0 relative z-0">
             <div className="p-4 border-b border-[#e2e8f0] bg-slate-50/50 flex justify-between items-center shrink-0">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Grid size={16} className="text-indigo-600" />
                  Weekly Schedule Grid
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const prev = new Date(calWeekStart);
                      prev.setDate(prev.getDate() - 7);
                      setCalWeekStart(prev);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Prev Week
                  </button>
                  <span className="text-xs font-bold text-slate-700 mx-2">
                    {formatMonthYear(calWeekStart)}
                  </span>
                  <button 
                    onClick={() => {
                      setCalWeekStart(getMonday(new Date()));
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => {
                      const next = new Date(calWeekStart);
                      next.setDate(next.getDate() + 7);
                      setCalWeekStart(next);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Next Week
                  </button>
                </div>
             </div>
             
             <div className="flex-1 overflow-auto p-4 bg-[#f8fafc]">
                <div className="min-w-[800px] border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-sm">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr>
                         <th className="p-3 border-b border-r border-[#e2e8f0] bg-slate-50 w-32 font-bold text-xs text-slate-500 uppercase">Time Slot</th>
                         {weekDays.map(date => {
                           const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                           const isDayToday = isToday(date);
                           return (
                             <th key={date.toString()} className={`p-3 border-b border-r border-[#e2e8f0] font-bold text-xs text-center ${isDayToday ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-700'}`}>
                               <div>{dayName}</div>
                               <div className="text-[10px] font-normal opacity-85 mt-0.5">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                             </th>
                           );
                         })}
                       </tr>
                     </thead>
                     <tbody>
                       {Object.keys(TIME_SLOT_CONFIG).map(slot => (
                         <tr key={slot} className="hover:bg-slate-50/50">
                            <td className="p-3 border-b border-r border-[#e2e8f0] font-extrabold text-[11px] text-slate-600 align-top">
                              <span className="mr-1">{TIME_SLOT_CONFIG[slot].emoji}</span>
                              {TIME_SLOT_CONFIG[slot].label}
                            </td>
                            {weekDays.map(date => {
                              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                              // Find batches for this slot and day that are active during this week
                              const slotBatches = filteredBatches.filter(b => {
                                if (b.timeSlot !== slot) return false;
                                if (!isBatchInWeek(b)) return false;
                                try {
                                  const days = JSON.parse(b.sessionDays || '[]');
                                  return days.some(d => d.substring(0, 3).toLowerCase() === dayName.substring(0, 3).toLowerCase());
                                } catch(e) { return false; }
                              });
                              
                              return (
                                <td key={date.toString()} className="p-2 border-b border-r border-[#e2e8f0] align-top min-h-[80px] w-[12.5%]">
                                  <div className="flex flex-col gap-1.5">
                                    {slotBatches.map(b => {
                                       const typeConfig = SESSION_TYPE_CONFIG[b.sessionType] || SESSION_TYPE_CONFIG['Theory'];
                                       return (
                                         <div key={b.id} onClick={() => openManageBatch(b)} className={`p-1.5 rounded text-[9px] border ${typeConfig.color} bg-white shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all`}>
                                           <div className="font-extrabold truncate">{b.name}</div>
                                           <div className="flex justify-between items-center mt-1">
                                             <span className="opacity-80">{b.batchCode}</span>
                                             {b.instructorId && <UserSquare2 size={10} className="opacity-70" />}
                                           </div>
                                         </div>
                                       );
                                    })}
                                  </div>
                                </td>
                              )
                            })}
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      
      {/* Manage Students Modal */}
      {showManageModal && managingBatch && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-6 border-b border-[#e2e8f0] bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-[#0f172a]">{managingBatch.name}</h2>
                <div className="flex gap-4 mt-1 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Users size={14} /> {batchCandidates.length} / {managingBatch.maxCapacity} Enrolled</span>
                  <span className="flex items-center gap-1"><Car size={14} /> {managingBatch.licenseCategory}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold shadow-xs outline-none focus:border-indigo-500" value={managingBatch.status} onChange={handleStatusChange}>
                  <option value="Active">Status: Active</option>
                  <option value="Completed">Status: Completed</option>
                  <option value="Cancelled">Status: Cancelled</option>
                </select>
                <button onClick={() => setShowManageModal(false)} className="p-2 text-[#94a3b8] hover:text-[#0f172a] rounded-lg hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-sm text-slate-800">Enrolled Candidates</h3>
              <button onClick={openAddCandidateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors">
                <Plus size={14} /> Add Candidate
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-bold text-slate-500">Candidate Details</th>
                    <th className="px-6 py-3 font-bold text-slate-500">NIC / Phone</th>
                    <th className="px-6 py-3 font-bold text-slate-500">Current Status</th>
                    <th className="px-6 py-3 font-bold text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {batchCandidates.map(c => (
                    <tr key={c.id} className="hover:bg-white transition-colors bg-[#fdfdfd]">
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 font-medium">
                        {c.nic}<br/><span className="text-[10px] text-slate-400">{c.phone}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">{c.status}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => removeCandidate(c.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer" title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {batchCandidates.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[#94a3b8] font-bold text-sm">No candidates enrolled in this batch yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-[#e2e8f0] bg-slate-50 shrink-0">
              <h2 className="text-lg font-extrabold text-[#0f172a] flex items-center gap-2">
                <Plus className="text-indigo-600" size={20} /> Enroll Candidate to {managingBatch?.batchCode}
              </h2>
              <button onClick={() => setShowAddCandidateModal(false)} className="p-1 text-[#94a3b8] hover:text-[#0f172a] rounded-lg hover:bg-slate-200 transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search unassigned candidates by name or NIC..." 
                  value={searchAddCandidateQuery}
                  onChange={e => setSearchAddCandidateQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-bold text-slate-500">Candidate Detail</th>
                    <th className="px-4 py-2.5 font-bold text-slate-500">Status</th>
                    <th className="px-4 py-2.5 font-bold text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredAvailableCandidates.map(c => (
                    <tr key={c.id} className="hover:bg-white transition-colors bg-[#fdfdfd]">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.id} • {c.nic}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => assignCandidateToBatch(c.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs cursor-pointer">
                          Enroll
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAvailableCandidates.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center text-[#94a3b8] font-semibold">No unassigned candidates match your filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Smart Batch Generator Modal */}
      {showSmartModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-[modalIn_0.2s_ease-out] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#e2e8f0] bg-slate-50">
              <h2 className="text-lg font-extrabold text-[#0f172a] flex items-center gap-2">
                <Sparkles className="text-emerald-500" size={20} /> Smart Batch Generator Engine
              </h2>
              <button onClick={() => setShowSmartModal(false)} className="p-1 text-[#94a3b8] hover:text-[#0f172a] rounded-lg hover:bg-slate-200 transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 border-b border-[#e2e8f0] bg-[#f8fafc] grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Select Batch Strategy</span>
                <button 
                  onClick={() => { setSmartMode('exam'); setSmartCandidates([]); setSelectedCandidateIds(new Set()); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-xs ${
                    smartMode === 'exam' 
                      ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-100/50 bg-white'
                  }`}
                >
                  <span>RMV Exam Cohort</span>
                  <ChevronRight size={14} className={smartMode === 'exam' ? 'text-indigo-600' : 'text-slate-400'} />
                </button>
                <button 
                  onClick={() => { setSmartMode('area'); setSmartCandidates([]); setSelectedCandidateIds(new Set()); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-xs ${
                    smartMode === 'area' 
                      ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-100/50 bg-white'
                  }`}
                >
                  <span>Smart Area & Transmission</span>
                  <ChevronRight size={14} className={smartMode === 'area' ? 'text-indigo-600' : 'text-slate-400'} />
                </button>
              </div>

              <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-3">Define Query Parameters</span>
                
                {smartMode === 'exam' ? (
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Exam Target</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={smartForm.examType} onChange={e => setSmartForm(prev => ({...prev, examType: e.target.value}))}>
                        <option value="Written">Written Exam Batch</option>
                        <option value="Practical">Practical Trial Batch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Exam Date</label>
                      <input type="date" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={smartForm.date} onChange={e => setSmartForm(prev => ({...prev, date: e.target.value}))} />
                    </div>
                    <button onClick={handleSearchSmartCandidates} className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer">Find Candidates</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Location Area</label>
                      <input type="text" placeholder="e.g. Colombo" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={smartForm.area} onChange={e => setSmartForm({...smartForm, area: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Transmission</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500" value={smartForm.transmission} onChange={e => setSmartForm({...smartForm, transmission: e.target.value})}>
                        <option value="Manual">Manual Preference</option>
                        <option value="Auto">Automatic Preference</option>
                      </select>
                    </div>
                    <button onClick={handleSearchSmartCandidates} className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer">Find Candidates</button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center gap-4 flex-shrink-0">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Filter matching candidate list..."
                  value={searchCandidatesQuery}
                  onChange={e => setSearchCandidatesQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-400"
                />
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Selected: <strong>{selectedCandidateIds.size}</strong> of {filteredSmartCandidates.length} matches</span>
              </div>
            </div>

            <div className="p-0 overflow-y-auto flex-1 bg-slate-50/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] sticky top-0 border-b border-[#e2e8f0] z-10">
                  <tr>
                    <th className="px-6 py-3 w-10">
                      <input 
                        type="checkbox"
                        checked={filteredSmartCandidates.length > 0 && selectedCandidateIds.size === filteredSmartCandidates.length}
                        onChange={handleToggleAllCandidates}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-[10px] font-extrabold text-[#64748b] uppercase">Candidate</th>
                    <th className="px-6 py-3 text-[10px] font-extrabold text-[#64748b] uppercase">Workflow Status</th>
                    <th className="px-6 py-3 text-[10px] font-extrabold text-[#64748b] uppercase">Contact</th>
                    <th className="px-6 py-3 text-[10px] font-extrabold text-[#64748b] uppercase">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredSmartCandidates.map(c => (
                    <tr key={c.id} className={`hover:bg-indigo-50/20 bg-white transition-colors ${selectedCandidateIds.has(c.id) ? 'bg-indigo-50/10' : ''}`}>
                      <td className="px-6 py-3.5">
                        <input 
                          type="checkbox"
                          checked={selectedCandidateIds.has(c.id)}
                          onChange={() => handleToggleCandidate(c.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.id} • {c.nic}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-extrabold uppercase">{c.status}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-700"><Phone size={12} className="text-slate-400" /> {c.phone}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1 text-slate-600"><MapPin size={12} className="text-slate-400 flex-shrink-0" /> <span className="truncate max-w-[150px]">{c.address}</span></div>
                      </td>
                    </tr>
                  ))}
                  {filteredSmartCandidates.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#94a3b8] font-bold">No candidate matches found. Select parameters above to query database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedCandidateIds.size > 30 && (
              <div className="bg-amber-50 border-t border-b border-amber-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-2.5">
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Overcapacity Limit Triggered</h4>
                    <p className="text-[11px] text-amber-700">Selected candidates ({selectedCandidateIds.size}) exceed the standard cohort limit of 30. We recommend utilizing Auto-Split.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSplitMethod(!splitMethod)}
                  className={`flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    splitMethod 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                      : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100/50'
                  }`}
                >
                  <Layers size={13} /> {splitMethod ? 'Enabled: Auto-Split Activated' : 'Click to Enable Auto-Split'}
                </button>
              </div>
            )}
            
            <div className="p-5 border-t border-[#e2e8f0] flex justify-between items-center bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="text-xs font-extrabold text-slate-600">Selected Enrollees count: {selectedCandidateIds.size}</div>
              <div className="flex gap-3">
                <button onClick={() => setShowSmartModal(false)} className="px-4 py-2 text-xs font-bold text-[#64748b]">Cancel</button>
                <button 
                  onClick={handleCreateSmartBatch} 
                  disabled={selectedCandidateIds.size === 0} 
                  className={`px-5 py-2.5 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    selectedCandidateIds.size === 0 
                      ? 'bg-[#94a3b8] cursor-not-allowed opacity-50' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                  }`}
                >
                  <ArrowRight size={13} /> Generate Cohort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Batches;
