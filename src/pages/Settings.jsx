import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, CalendarDays, Plus, Trash2, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('holidays');
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', type: 'Poya' });

  const loadHolidays = async () => {
    try {
      const res = await window.api.getHolidays();
      setHolidays(res || []);
    } catch (err) {
      console.error("Failed to load holidays", err);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await window.api.addHoliday(holidayForm);
      if (res.success) {
        setShowModal(false);
        setHolidayForm({ date: '', name: '', type: 'Poya' });
        loadHolidays();
      } else {
        alert("Failed to add holiday: " + res.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm("Are you sure you want to remove this holiday?")) {
      try {
        const res = await window.api.deleteHoliday(id);
        if (res.success) {
          loadHolidays();
        } else {
          alert("Failed to delete: " + res.message);
        }
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <SettingsIcon className="text-[#f59e0b]" size={32} />
            System Settings
          </h1>
          <p className="text-[#64748b] mt-1">Manage system configurations and operational constraints.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Sidebar Nav */}
        <div className="w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'holidays' ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-white text-[#64748b] hover:bg-[#f1f5f9]'}`}
          >
            <CalendarDays size={20} />
            Holiday & RMV Sync
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'general' ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-white text-[#64748b] hover:bg-[#f1f5f9]'}`}
          >
            <ShieldAlert size={20} />
            General Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6">
          {activeTab === 'holidays' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">Blackout Dates</h2>
                  <p className="text-sm text-[#64748b] mt-1">Define Poya days, Public Holidays, and days when the Kachcheri/RMV is closed to prevent scheduling errors.</p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  <Plus size={18} /> Add Holiday
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Name / Reason</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {holidays.length > 0 ? holidays.map(h => (
                      <tr key={h.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-4 font-bold text-[#1e3a5f] text-sm">{h.date}</td>
                        <td className="px-6 py-4 font-medium text-[#334155]">{h.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${h.type === 'Poya' ? 'bg-amber-50 text-amber-700 border-amber-200' : h.type === 'Public' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {h.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteHoliday(h.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-[#94a3b8]">
                          No holidays configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="py-12 text-center">
              <ShieldAlert className="mx-auto text-[#cbd5e1] mb-4" size={48} />
              <h3 className="text-lg font-bold text-[#334155]">General Settings</h3>
              <p className="text-[#64748b]">Additional system settings will be available here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="flex justify-between items-center p-5 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-bold text-[#1e3a5f]">Add Holiday</h2>
              <button onClick={() => setShowModal(false)} className="text-[#94a3b8] hover:text-[#0f172a]">✕</button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-1.5">Date</label>
                <input required type="date" className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f]" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-1.5">Holiday Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f]" placeholder="e.g. Vesak Full Moon Poya Day" value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-1.5">Type</label>
                <select className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-sm outline-none focus:border-[#1e3a5f]" value={holidayForm.type} onChange={e => setHolidayForm({...holidayForm, type: e.target.value})}>
                  <option value="Poya">Poya Day</option>
                  <option value="Public">Public Holiday</option>
                  <option value="Kachcheri_Closed">RMV / Kachcheri Closed</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#1e3a5f] text-white font-bold rounded-xl">Save Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
