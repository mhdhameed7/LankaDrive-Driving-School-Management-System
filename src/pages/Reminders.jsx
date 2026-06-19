import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Award, 
  ShieldAlert, 
  Car, 
  Send, 
  Smartphone, 
  X, 
  Calendar, 
  Sparkles,
  MessageSquarePlus
} from 'lucide-react';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom reminder form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    candidateId: '',
  });

  // Simulated Mobile Dispatch state
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [dispatchMethod, setDispatchMethod] = useState(''); // 'sms' or 'whatsapp'
  const [isSending, setIsSending] = useState(false);
  const [sendingStep, setSendingStep] = useState(0);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [remList, candList] = await Promise.all([
        window.api.getReminders(),
        window.api.getCandidates()
      ]);
      setReminders(remList || []);
      setCandidates(candList || []);
    } catch (err) {
      console.error("Failed to load reminders data", err);
      showToast("Error loading reminders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;

    try {
      const res = await window.api.addReminder({
        title: newReminder.title,
        description: newReminder.description,
        date: newReminder.date,
        type: 'Custom',
        candidateId: newReminder.candidateId || null
      });

      if (res.success) {
        showToast("Custom reminder scheduled successfully");
        setShowAddModal(false);
        setNewReminder({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          candidateId: '',
        });
        loadData();
      } else {
        showToast(res.message || "Failed to save reminder", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom reminder?")) return;
    try {
      const res = await window.api.deleteReminder(id);
      if (res.success) {
        showToast("Reminder deleted");
        loadData();
      } else {
        showToast(res.message || "Failed to delete reminder", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await window.api.updateReminderStatus({ id, status: nextStatus });
      if (res.success) {
        showToast(`Reminder marked as ${nextStatus.toLowerCase()}`);
        loadData();
      } else {
        showToast(res.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
  };

  const handleOpenDispatch = (reminder, method) => {
    setActiveDispatch(reminder);
    setDispatchMethod(method);
    setDispatchSuccess(false);
    setIsSending(false);
  };

  const executeSimulatedDispatch = () => {
    if (dispatchMethod === 'whatsapp') {
      // Direct Native Application Trigger: Pre-fill WhatsApp link and launch external WhatsApp
      const phone = activeDispatch.candidatePhone ? activeDispatch.candidatePhone.trim() : '';
      // Format number to international (Sri Lankan format: 947XXXXXXXX)
      let formattedPhone = phone;
      if (phone.startsWith('0')) {
        formattedPhone = '94' + phone.substring(1);
      }
      
      const messageText = getPrefilledMessage(activeDispatch);
      const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
      const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
      
      // Let's run a brief in-app animation before triggering WhatsApp Desktop
      setIsSending(true);
      setSendingStep(1); // "Formulating secure chat URL..."
      
      setTimeout(() => {
        setSendingStep(2); // "Launching WhatsApp Application..."
        setTimeout(() => {
          // Open the native WhatsApp trigger
          window.open(webUrl, '_blank');
          setIsSending(false);
          setDispatchSuccess(true);
          showToast("WhatsApp dispatch triggered!");
          setTimeout(() => setActiveDispatch(null), 1500);
        }, 1000);
      }, 1000);
    } else {
      // Offline Simulated Cellular SMS Gateway
      setIsSending(true);
      setSendingStep(1); // "Connecting to cellular SMS gateway..."
      
      setTimeout(() => {
        setSendingStep(2); // "Transmitting packets..."
        setTimeout(() => {
          setSendingStep(3); // "Delivered to cellular tower"
          setTimeout(() => {
            setIsSending(false);
            setDispatchSuccess(true);
            showToast("SMS dispatched successfully!");
            setTimeout(() => setActiveDispatch(null), 1500);
          }, 1000);
        }, 1000);
      }, 1000);
    }
  };

  const getPrefilledMessage = (rem) => {
    if (rem.type === 'Payment') {
      const remAmt = rem.meta?.remaining || '';
      const stage = rem.meta?.nextStage || 'next stage';
      return `Dear ${rem.candidateName},\n\nThis is a payment reminder from LankaDrive. You have an outstanding balance of LKR ${remAmt} due for your ${stage}.\n\nPlease settle this payment at your earliest convenience to continue your training schedule.\n\nThank you,\nLankaDrive Management.`;
    }
    if (rem.type === 'Exam') {
      const examType = rem.meta?.examType || 'Theory';
      const center = rem.meta?.center || 'RMV Office';
      const date = rem.date || '';
      return `Dear ${rem.candidateName},\n\nThis is a reminder from LankaDrive that your ${examType} Exam is scheduled on ${date} at ${center}.\n\nPlease arrive 30 minutes early and remember to bring your NIC and training documents.\n\nGood luck!\nLankaDrive Team.`;
    }
    return `Dear ${rem.candidateName || 'Candidate'},\n\nThis is a notification from LankaDrive regarding your training:\n${rem.description}\n\nLankaDrive Management.`;
  };

  // Filter and search computation
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      // Search
      const matchesSearch = 
        String(r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Tab
      if (activeTab === 'all') return true;
      if (activeTab === 'payment') return r.type === 'Payment';
      if (activeTab === 'exam') return r.type === 'Exam';
      if (activeTab === 'vehicle') return r.type === 'Vehicle';
      if (activeTab === 'custom') return r.type === 'Custom';
      return true;
    });
  }, [reminders, activeTab, searchTerm]);

  // Counts for cards
  const counts = useMemo(() => {
    const res = { payment: 0, exam: 0, vehicle: 0, custom: 0 };
    reminders.forEach(r => {
      if (r.type === 'Payment') res.payment++;
      else if (r.type === 'Exam') res.exam++;
      else if (r.type === 'Vehicle') res.vehicle++;
      else if (r.type === 'Custom' && r.status !== 'Completed') res.custom++;
    });
    return res;
  }, [reminders]);

  return (
    <div className="p-8 h-screen flex flex-col overflow-y-auto bg-slate-50 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border animate-[slideIn_0.2s_ease-out] ${
          toast.type === 'error' 
            ? 'bg-red-50 text-red-800 border-red-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <CheckCircle size={18} className={toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Bell className="text-[#f59e0b]" size={32} />
            Reminders & Scheduler
          </h1>
          <p className="text-[#64748b] mt-1">Monitor automated payment balances, exam entries, vehicle expirations, and custom alerts.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
        >
          <MessageSquarePlus size={20} />
          Schedule Custom Reminder
        </button>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 flex-shrink-0">
        
        {/* Payment Reminders Card */}
        <div onClick={() => setActiveTab('payment')} className={`p-5 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${activeTab === 'payment' ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">{counts.payment}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Payment Reminders</p>
          <p className="text-xs text-gray-400 mt-1">Overdue fee collections</p>
        </div>

        {/* Exam Reminders Card */}
        <div onClick={() => setActiveTab('exam')} className={`p-5 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${activeTab === 'exam' ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award size={20} />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">{counts.exam}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Exam Notifications</p>
          <p className="text-xs text-gray-400 mt-1">Theory & Practical trials</p>
        </div>

        {/* Vehicle Expiry Card */}
        <div onClick={() => setActiveTab('vehicle')} className={`p-5 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${activeTab === 'vehicle' ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Car size={20} />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">{counts.vehicle}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Vehicle Expiries</p>
          <p className="text-xs text-gray-400 mt-1">Licenses expiring in 30 days</p>
        </div>

        {/* Custom Scheduler Card */}
        <div onClick={() => setActiveTab('custom')} className={`p-5 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${activeTab === 'custom' ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">{counts.custom}</span>
          </div>
          <p className="text-sm font-bold text-gray-700">Pending Tasks</p>
          <p className="text-xs text-gray-400 mt-1">Custom reminders scheduled</p>
        </div>

      </div>

      {/* Main Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col overflow-hidden">
        
        {/* Filters bar */}
        <div className="p-5 border-b border-gray-100 bg-[#f8fafc] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'payment', label: 'Payments' },
              { id: 'exam', label: 'Exams' },
              { id: 'vehicle', label: 'Vehicles' },
              { id: 'custom', label: 'Scheduled Tasks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#1e3a5f] text-white shadow-sm' 
                    : 'text-[#64748b] hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/30 text-sm"
            />
          </div>

        </div>

        {/* Reminders List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-20 text-center text-[#64748b]">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1e3a5f] rounded-full" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm font-semibold">Generating real-time scheduler logs...</p>
            </div>
          ) : filteredReminders.length > 0 ? (
            filteredReminders.map((r) => {
              const isCustom = r.type === 'Custom';
              const isCompleted = r.status === 'Completed';

              return (
                <div 
                  key={r.id} 
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white hover:border-[#1e3a5f]/20 hover:shadow-sm ${
                    isCompleted ? 'bg-slate-50/50 border-slate-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon based on type */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      r.type === 'Payment' 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : r.type === 'Exam' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : r.type === 'Vehicle' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {r.type === 'Payment' && <CreditCard size={20} />}
                      {r.type === 'Exam' && <Award size={20} />}
                      {r.type === 'Vehicle' && <Car size={20} />}
                      {r.type === 'Custom' && <Clock size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <h3 className={`font-bold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {r.title}
                        </h3>
                        
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase border ${
                          r.type === 'Payment' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : r.type === 'Exam' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : r.type === 'Vehicle' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {r.type}
                        </span>

                        {r.status === 'Overdue' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Critical
                          </span>
                        )}
                      </div>

                      <p className={`text-sm text-slate-500 mt-1.5 ${isCompleted ? 'text-slate-400' : ''}`}>
                        {r.description}
                      </p>

                      {/* Meta information */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} />
                          Target: <strong className="text-slate-600 font-semibold">{r.date || 'No Date'}</strong>
                        </span>

                        {r.candidateName && (
                          <span className="flex items-center gap-1.5">
                            Candidate: <span className="font-semibold text-slate-600 underline cursor-pointer">{r.candidateName}</span>
                          </span>
                        )}

                        {r.candidatePhone && (
                          <span className="flex items-center gap-1">
                            Phone: <strong className="text-slate-600 font-semibold">{r.candidatePhone}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    
                    {/* Simulated Message sending (SMS/WhatsApp) */}
                    {(r.type === 'Payment' || r.type === 'Exam' || (isCustom && r.candidatePhone)) && (
                      <>
                        <button 
                          onClick={() => handleOpenDispatch(r, 'sms')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                        >
                          <Smartphone size={14} />
                          Simulate SMS
                        </button>
                        <button 
                          onClick={() => handleOpenDispatch(r, 'whatsapp')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-200"
                        >
                          <Send size={14} />
                          WhatsApp
                        </button>
                      </>
                    )}

                    {/* Toggle Complete state for Custom tasks */}
                    {isCustom && (
                      <button 
                        onClick={() => handleToggleStatus(r.id, r.status)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isCompleted 
                            ? 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={isCompleted ? "Mark Pending" : "Mark Completed"}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}

                    {/* Delete Custom reminder */}
                    {isCustom && (
                      <button 
                        onClick={() => handleDeleteReminder(r.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg transition-colors"
                        title="Delete Reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center text-[#64748b] bg-slate-50/20 rounded-2xl border border-dashed border-slate-200">
              <Bell className="mx-auto text-[#cbd5e1] mb-3" size={48} />
              <h3 className="text-lg font-bold text-[#334155]">No Reminders Found</h3>
              <p className="text-[#64748b] max-w-sm mx-auto mt-1">There are no reminders matching your search criteria or filter tags. Relax! You are all caught up.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-bold text-[#1e3a5f] flex items-center gap-2">
                <Calendar className="text-[#f59e0b]" size={22} />
                Schedule Custom Task
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-[#0f172a] p-1.5 hover:bg-slate-100 rounded-lg transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">Reminder Title *</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15" 
                  placeholder="e.g. Call Nimali about Medical certificate"
                  value={newReminder.title} 
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">Description</label>
                <textarea 
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/15 h-20 resize-none" 
                  placeholder="Details or notes about the action..."
                  value={newReminder.description} 
                  onChange={e => setNewReminder({...newReminder, description: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">Target Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f]" 
                    value={newReminder.date} 
                    onChange={e => setNewReminder({...newReminder, date: e.target.value})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">Candidate Link (Optional)</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f]"
                    value={newReminder.candidateId} 
                    onChange={e => setNewReminder({...newReminder, candidateId: e.target.value})}
                  >
                    <option value="">None</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-[#64748b] font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#1e3a5f]/95 text-white font-bold rounded-xl shadow-md transition-all">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Smartphone Dispatch Modal */}
      {activeDispatch && (
        <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-[40px] border-[10px] border-slate-800 shadow-2xl w-full max-w-[360px] overflow-hidden flex flex-col h-[640px] relative animate-[modalIn_0.3s_ease-out]">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex justify-center items-center">
              <div className="w-16 h-1 bg-slate-900 rounded-full mb-1"></div>
            </div>

            {/* Smartphone Header Area */}
            <div className="bg-slate-900 pt-7 pb-4 px-6 flex justify-between items-center text-white flex-shrink-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                  {activeDispatch.candidateName ? activeDispatch.candidateName.substring(0, 2).toUpperCase() : 'LD'}
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-none">{activeDispatch.candidateName || 'Candidate'}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Online</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveDispatch(null)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Screen Content Body */}
            <div className="flex-1 bg-slate-950 p-4 overflow-y-auto flex flex-col justify-end space-y-4">
              
              {/* Reminder Detail Card */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-slate-300 text-xs">
                <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wide">Reminder Metadata</span>
                <h5 className="font-bold text-white mt-1 text-sm">{activeDispatch.title}</h5>
                <p className="mt-1 text-[11px] text-slate-400">{activeDispatch.description}</p>
                <div className="mt-3 flex justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-800/80 pt-2">
                  <span>Phone: {activeDispatch.candidatePhone || 'N/A'}</span>
                  <span>Type: {activeDispatch.type}</span>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className={`p-4 rounded-2xl text-xs max-w-[85%] self-end relative ${
                dispatchMethod === 'whatsapp' 
                  ? 'bg-emerald-800 text-emerald-50 rounded-tr-none' 
                  : 'bg-[#1e3a5f] text-slate-100 rounded-tr-none'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{getPrefilledMessage(activeDispatch)}</p>
                <span className="text-[9px] text-slate-300/80 absolute bottom-1 right-2 font-semibold">1:54 PM</span>
              </div>

              {/* Status Log / Progress Bar */}
              {isSending && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col space-y-2 animate-pulse">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <span>{
                      sendingStep === 1 
                        ? (dispatchMethod === 'whatsapp' ? 'Generating secure WhatsApp Link...' : 'Connecting to GSM gateway...')
                        : sendingStep === 2
                        ? (dispatchMethod === 'whatsapp' ? 'Launching native client application...' : 'Transmitting SMS packets...')
                        : 'Finalizing delivery confirmation...'
                    }</span>
                    <span>{sendingStep * 33}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${dispatchMethod === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${sendingStep * 33}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {dispatchSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-center text-xs font-semibold animate-[modalIn_0.2s_ease-out]">
                  ✓ Message Dispatch Initiated!
                </div>
              )}

            </div>

            {/* Smartphone Footer Command bar */}
            <div className="bg-slate-900 p-4 border-t border-slate-800/60 flex flex-col space-y-2.5 flex-shrink-0 z-10">
              
              <div className="text-center text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles size={11} className="text-[#f59e0b]" />
                {dispatchMethod === 'whatsapp' ? 'Online Mode: Pre-filled Desktop integration' : 'Offline Mode: Local cellular network loopback'}
              </div>

              <button
                type="button"
                disabled={isSending || dispatchSuccess}
                onClick={executeSimulatedDispatch}
                className={`w-full py-3 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                  dispatchMethod === 'whatsapp'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-800 disabled:text-slate-500'
                    : 'bg-[#f59e0b] hover:bg-[#d97706] text-white disabled:bg-slate-800 disabled:text-slate-500'
                }`}
              >
                <Send size={14} />
                {isSending ? 'Sending...' : dispatchMethod === 'whatsapp' ? 'Send via WhatsApp' : 'Dispatch SMS'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reminders;
