import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, CalendarDays, Plus, Trash2, 
  ShieldAlert, DollarSign, Lock, ShieldCheck, HelpCircle, 
  Save, RefreshCw, Key, AlertTriangle, CheckCircle 
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('fees');
  
  // Fees State
  const [fees, setFees] = useState({
    standard_fee: '50000',
    premium_fee: '75000',
    express_fee: '60000',
    exam_reschedule_fee: '1500'
  });
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesSuccess, setFeesSuccess] = useState(false);

  // Holidays State
  const [holidays, setHolidays] = useState([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', type: 'Poya' });

  // Security State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [securityForm, setSecurityForm] = useState({ securityQuestion: '', securityAnswer: '' });
  const [securitySetupSuccess, setSecuritySetupSuccess] = useState('');
  const [securitySetupError, setSecuritySetupError] = useState('');
  const [hasQuestionSetup, setHasQuestionSetup] = useState(false);

  const loadSettingsAndHolidays = async () => {
    try {
      // Load settings
      const settingsList = await window.api.getSettings();
      if (settingsList && Array.isArray(settingsList)) {
        const settingsMap = {};
        settingsList.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setFees({
          standard_fee: settingsMap.standard_fee || '50000',
          premium_fee: settingsMap.premium_fee || '75000',
          express_fee: settingsMap.express_fee || '60000',
          exam_reschedule_fee: settingsMap.exam_reschedule_fee || '1500'
        });
      }

      // Load holidays
      const holidayRes = await window.api.getHolidays();
      setHolidays(holidayRes || []);

      // Load security status
      const secSetup = await window.api.checkSecuritySetup({ username: 'admin' });
      if (secSetup.success) {
        setHasQuestionSetup(secSetup.hasSetup);
        if (secSetup.hasSetup) {
          setSecurityForm(prev => ({ ...prev, securityQuestion: secSetup.securityQuestion || '' }));
        }
      }
    } catch (err) {
      console.error("Failed to load settings data", err);
    }
  };

  useEffect(() => {
    loadSettingsAndHolidays();
  }, []);

  // Save Fees
  const handleSaveFees = async (e) => {
    e.preventDefault();
    setFeesLoading(true);
    setFeesSuccess(false);
    try {
      await window.api.updateSetting({ key: 'standard_fee', value: fees.standard_fee });
      await window.api.updateSetting({ key: 'premium_fee', value: fees.premium_fee });
      await window.api.updateSetting({ key: 'express_fee', value: fees.express_fee });
      await window.api.updateSetting({ key: 'exam_reschedule_fee', value: fees.exam_reschedule_fee });
      setFeesSuccess(true);
      setTimeout(() => setFeesSuccess(false), 3000);
    } catch (err) {
      alert("Error saving fees: " + err.message);
    } finally {
      setFeesLoading(false);
    }
  };

  // Add Holiday
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await window.api.addHoliday(holidayForm);
      if (res.success) {
        setShowHolidayModal(false);
        setHolidayForm({ date: '', name: '', type: 'Poya' });
        loadSettingsAndHolidays();
      } else {
        alert("Failed to add holiday: " + res.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = async (id) => {
    if (window.confirm("Are you sure you want to remove this holiday?")) {
      try {
        const res = await window.api.deleteHoliday(id);
        if (res.success) {
          loadSettingsAndHolidays();
        } else {
          alert("Failed to delete: " + res.message);
        }
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const res = await window.api.changePassword({
        username: 'admin',
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.success) {
        setPasswordSuccess("Password updated successfully.");
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(res.message || "Failed to update password.");
      }
    } catch (err) {
      setPasswordError("Error: " + err.message);
    }
  };

  // Setup Security Question
  const handleSaveSecurityQuestion = async (e) => {
    e.preventDefault();
    setSecuritySetupError('');
    setSecuritySetupSuccess('');
    try {
      const res = await window.api.setupSecurityQuestion({
        username: 'admin',
        securityQuestion: securityForm.securityQuestion,
        securityAnswer: securityForm.securityAnswer
      });
      if (res.success) {
        setSecuritySetupSuccess("Security question successfully configured.");
        setHasQuestionSetup(true);
        setSecurityForm(prev => ({ ...prev, securityAnswer: '' }));
      } else {
        setSecuritySetupError(res.message || "Failed to save question.");
      }
    } catch (err) {
      setSecuritySetupError("Error: " + err.message);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-3">
            <SettingsIcon className="text-indigo-600 animate-[spin_10s_linear_infinite]" size={28} />
            System Settings
          </h1>
          <p className="text-xs font-semibold text-[#64748b] mt-0.5">Configure system pricing packages, blackout calendars, and admin security.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 items-start">
        {/* Sidebar Navigation */}
        <div className="w-64 flex flex-col gap-2 shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'fees' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <DollarSign size={16} />
            Course Pricing & Fees
          </button>
          <button 
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'holidays' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <CalendarDays size={16} />
            Holidays & Blackouts
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            <Lock size={16} />
            Account & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[450px]">
          
          {/* TAB 1: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-md font-extrabold text-[#0f172a] flex items-center gap-2">
                  <DollarSign className="text-indigo-600" size={18} />
                  Pricing Packages Settings
                </h2>
                <p className="text-xs text-[#64748b] mt-1">Configure candidate packages and operational pricing structures default values used across the application.</p>
              </div>

              <form onSubmit={handleSaveFees} className="space-y-5 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Standard Package Fee (LKR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-xs text-slate-400 font-bold">LKR</span>
                      </div>
                      <input 
                        required 
                        type="number" 
                        className="w-full pl-12 pr-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white" 
                        value={fees.standard_fee} 
                        onChange={e => setFees({...fees, standard_fee: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Premium Package Fee (LKR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-xs text-slate-400 font-bold">LKR</span>
                      </div>
                      <input 
                        required 
                        type="number" 
                        className="w-full pl-12 pr-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white" 
                        value={fees.premium_fee} 
                        onChange={e => setFees({...fees, premium_fee: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Express Package Fee (LKR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-xs text-slate-400 font-bold">LKR</span>
                      </div>
                      <input 
                        required 
                        type="number" 
                        className="w-full pl-12 pr-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white" 
                        value={fees.express_fee} 
                        onChange={e => setFees({...fees, express_fee: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Exam Reschedule Fee (LKR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-xs text-slate-400 font-bold">LKR</span>
                      </div>
                      <input 
                        required 
                        type="number" 
                        className="w-full pl-12 pr-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white" 
                        value={fees.exam_reschedule_fee} 
                        onChange={e => setFees({...fees, exam_reschedule_fee: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {feesSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                    <CheckCircle size={14} /> Pricing settings successfully saved and applied.
                  </div>
                )}

                <div className="pt-2 flex justify-start">
                  <button 
                    type="submit" 
                    disabled={feesLoading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {feesLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Pricing Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: HOLIDAYS */}
          {activeTab === 'holidays' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-md font-extrabold text-[#0f172a] flex items-center gap-2">
                    <CalendarDays className="text-indigo-600" size={18} />
                    Blackout & Kachcheri Dates
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">Configure calendar blackout dates (Poya days, RMV closures, Public Holidays) to avoid schedule conflicts.</p>
                </div>
                <button 
                  onClick={() => setShowHolidayModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Blackout Date
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Holiday / Reason</th>
                      <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {holidays.length > 0 ? holidays.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-800">{h.date}</td>
                        <td className="px-6 py-3.5 font-medium text-slate-600">{h.name}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold border ${
                            h.type === 'Poya' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : h.type === 'Public' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {h.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button onClick={() => handleDeleteHoliday(h.id)} className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-semibold">
                          No blackout dates configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* CHANGE PASSWORD */}
              <div className="border-b border-slate-200 pb-8 max-w-xl">
                <div>
                  <h2 className="text-md font-extrabold text-[#0f172a] flex items-center gap-2">
                    <Key className="text-indigo-600" size={18} />
                    Change Admin Password
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">Change current system password for the admin account credentials.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 mt-5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Current Password</label>
                    <input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                      value={passwordForm.oldPassword} 
                      onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">New Password</label>
                      <input 
                        required 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                        value={passwordForm.newPassword} 
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                      <input 
                        required 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                        value={passwordForm.confirmPassword} 
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                      <CheckCircle size={14} /> {passwordSuccess}
                    </div>
                  )}

                  <div className="pt-1">
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* SECURITY RECOVERY QUESTION */}
              <div className="max-w-xl">
                <div>
                  <h2 className="text-md font-extrabold text-[#0f172a] flex items-center gap-2">
                    <HelpCircle className="text-indigo-600" size={18} />
                    Account Recovery Setup
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">Configure security questions used to recover password in case of lockout.</p>
                </div>

                <form onSubmit={handleSaveSecurityQuestion} className="space-y-4 mt-5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Security Question</label>
                    <select 
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                      value={securityForm.securityQuestion}
                      onChange={e => setSecurityForm({...securityForm, securityQuestion: e.target.value})}
                      required
                    >
                      <option value="">-- Select Question --</option>
                      <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                      <option value="What is the name of your favorite teacher?">What is the name of your favorite teacher?</option>
                      <option value="What is the name of the street you grew up on?">What is the name of the street you grew up on?</option>
                      <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                      <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Answer</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Provide answer for authentication" 
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                      value={securityForm.securityAnswer} 
                      onChange={e => setSecurityForm({...securityForm, securityAnswer: e.target.value})} 
                    />
                  </div>

                  {securitySetupError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                      <AlertTriangle size={14} /> {securitySetupError}
                    </div>
                  )}

                  {securitySetupSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                      <CheckCircle size={14} /> {securitySetupSuccess}
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-4">
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      Save Recovery Question
                    </button>
                    {hasQuestionSetup && (
                      <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                        <ShieldCheck size={14} /> Configured
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
                <CalendarDays className="text-indigo-600" size={16} /> Add Blackout Date
              </h2>
              <button onClick={() => setShowHolidayModal(false)} className="text-[#94a3b8] hover:text-[#0f172a] cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Date</label>
                <input required type="date" className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Holiday Name / Reason</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white" placeholder="e.g. Vesak Poya Day" value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">Type</label>
                <select className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500" value={holidayForm.type} onChange={e => setHolidayForm({...holidayForm, type: e.target.value})}>
                  <option value="Poya">Poya Day</option>
                  <option value="Public">Public Holiday</option>
                  <option value="Kachcheri_Closed">RMV / Kachcheri Closed</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowHolidayModal(false)} className="px-5 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1e3a5f] hover:bg-[#11223b] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer">Save Blackout Date</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
