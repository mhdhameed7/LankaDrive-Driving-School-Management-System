import React, { useState, useEffect } from 'react';
import { 
  UserSquare2, Plus, Edit2, Trash2, Eye, Search, Filter, 
  Users, CheckCircle, AlertCircle, ShieldAlert, Phone, Mail, 
  MapPin, Calendar, Clock, Award, Shield, Check, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Instructors = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [licenseFilter, setLicenseFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    id: '', 
    name: '', 
    phone: '', 
    nic: '', 
    licenseNumber: '', 
    dailyBaseAllowance: 1500, 
    perSessionCommission: 500, 
    email: '', 
    address: '', 
    gender: 'Male', 
    dateJoined: new Date().toISOString().split('T')[0], 
    licenseCategories: 'B', 
    licenseExpiryDate: '', 
    status: 'Active', 
    workingDays: 'Mon-Sat', 
    workingHours: '08:00 - 17:00', 
    isAvailable: 1, 
    allowedVehicles: '', 
    allowedVehicleCategories: 'Car'
  };

  const [formData, setFormData] = useState(defaultForm);

  const loadInstructors = async () => {
    try {
      const res = await window.api.getInstructors();
      setInstructors(res || []);
    } catch (err) { 
      console.error("Error loading instructors:", err); 
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const handleOpenModal = async (instructor = null) => {
    if (instructor) {
      setFormData({ ...defaultForm, ...instructor });
      setEditingId(instructor.id);
    } else {
      try {
        const nextId = await window.api.getNextInstructorId();
        setFormData({ ...defaultForm, id: nextId });
      } catch (err) {
        setFormData({ ...defaultForm, id: `INS-${Date.now().toString().slice(-4)}` });
      }
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await window.api.updateInstructor(formData);
      } else {
        res = await window.api.addInstructor(formData);
      }
      if (res.success) {
        setShowModal(false);
        loadInstructors();
      } else {
        alert(res.message || "Operation failed");
      }
    } catch (err) { 
      alert(err.message || "An error occurred"); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this instructor? All related records (Leaves, Documents) will be removed.")) {
      try {
        const res = await window.api.deleteInstructor(id);
        if (res.success) {
          loadInstructors();
        } else {
          alert(res.message || "Delete failed");
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Stats calculation
  const totalCount = instructors.length;
  const activeCount = instructors.filter(i => i.status === 'Active').length;
  const onLeaveCount = instructors.filter(i => i.status === 'On Leave').length;
  const suspendedCount = instructors.filter(i => i.status === 'Suspended').length;

  // Filter & Search Logic
  const filteredInstructors = instructors.filter(ins => {
    const matchesSearch = 
      ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ins.phone && ins.phone.includes(searchQuery)) ||
      (ins.nic && ins.nic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ins.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || ins.status === statusFilter;
    
    const matchesLicense = licenseFilter === 'All' || 
      (ins.licenseCategories && ins.licenseCategories.toLowerCase().includes(licenseFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesLicense;
  });

  const allCategories = Array.from(new Set(
    instructors
      .flatMap(i => i.licenseCategories ? i.licenseCategories.split(',').map(s => s.trim()) : [])
  )).filter(Boolean);

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-[#f8fafc] font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <UserSquare2 size={28} />
            </div>
            Instructor Registry
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">
            Register and monitor instructors, license compliance, allowed training vehicle classes, and leaves.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152942] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} /> Register Instructor
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-4 gap-6 mb-8 flex-shrink-0">
        {[
          { label: 'Total Instructors', value: totalCount, icon: Users, color: 'text-[#1e3a5f] bg-[#1e3a5f]/5 border-[#1e3a5f]/10' },
          { label: 'Active Status', value: activeCount, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'On Leave Today', value: onLeaveCount, icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Suspended Duty', value: suspendedCount, icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-100' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-black text-slate-800 mt-0.5">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center mb-6 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450" size={16} />
          <input 
            type="text" 
            placeholder="Search by ID, Name, Phone, or NIC..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] transition-all text-slate-800"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="text-slate-400" size={14} />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Filters</span>
        </div>

        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-700 focus:bg-white outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Suspended">Suspended</option>
          <option value="Retired">Retired</option>
        </select>

        <select 
          value={licenseFilter} 
          onChange={e => setLicenseFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-700 focus:bg-white outline-none cursor-pointer"
        >
          <option value="All">All License Classes</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>Class {cat}</option>
          ))}
        </select>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Instructor Details</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">License & Categories</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Batches</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstructors.map(ins => (
                <tr key={ins.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/5 text-[#1e3a5f] flex items-center justify-center font-extrabold text-sm border border-[#1e3a5f]/10 shadow-sm shrink-0 uppercase">
                        {ins.name ? ins.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-800 text-sm">{ins.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold flex items-center gap-1.5">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black text-[9px]">{ins.id}</span>
                          <span>NIC: {ins.nic || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 font-semibold">
                          {ins.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {ins.phone}</span>}
                          {ins.email && <span className="flex items-center gap-1"><Mail size={11} className="text-slate-400" /> {ins.email}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      <span>{ins.licenseNumber || 'No License Number'}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ins.licenseCategories ? ins.licenseCategories.split(',').map((cat, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                          {cat.trim()}
                        </span>
                      )) : <span className="text-xs text-slate-450">None</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      ins.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      ins.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      ins.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        ins.status === 'Active' ? 'bg-emerald-500' :
                        ins.status === 'On Leave' ? 'bg-amber-500' :
                        ins.status === 'Suspended' ? 'bg-rose-500' :
                        'bg-slate-500'
                      }`}></span>
                      {ins.status || 'Active'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
                      {ins.assignedBatchCount || 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/instructors/${ins.id}`)} 
                        className="p-2 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 border border-transparent hover:border-[#1e3a5f]/10 rounded-xl transition-all" 
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(ins)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all" 
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ins.id)} 
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all" 
                        title="Delete Profile"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInstructors.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                    <UserSquare2 size={44} className="mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-extrabold text-slate-600">No instructors matched the search criteria</p>
                    <p className="text-xs mt-1 text-slate-450">Try modifying search tags or dropdown filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-[modalIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-6 border-b border-slate-150 bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserSquare2 className="text-[#1e3a5f]" />
                {editingId ? 'Modify Instructor Record' : 'Register New Instructor'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-450 hover:bg-slate-100 hover:text-slate-700 transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <form id="instructor-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Information Group */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Full Name</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">NIC Number</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Gender</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer focus:border-[#1e3a5f]" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Phone Number</label>
                      <input required type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Email Address</label>
                      <input type="email" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Residential Address</label>
                      <input type="text" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Job & Duty Schedule Group */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                    Employment Details & Availability
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Date Joined</label>
                      <input type="date" className="w-full px-3 py-1.5 border rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={formData.dateJoined} onChange={e => setFormData({...formData, dateJoined: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Employment Status</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer focus:border-[#1e3a5f]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Suspended</option>
                        <option>Retired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Duty Availability</label>
                      <select className="w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer focus:border-[#1e3a5f]" value={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: parseInt(e.target.value)})}>
                        <option value={1}>Available for training sessions</option>
                        <option value={0}>Currently unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Working Days</label>
                      <input type="text" placeholder="e.g. Mon-Sat" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.workingDays} onChange={e => setFormData({...formData, workingDays: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Working Hours</label>
                      <input type="text" placeholder="e.g. 08:00 - 17:00" className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Professional Licensing & Authorized Training */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Shield size={14} /> Licensing & Authorized Classes
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Instructor License Number</label>
                      <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Categories Permitted to Teach</label>
                      <input type="text" placeholder="e.g. B, A, C" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.licenseCategories} onChange={e => setFormData({...formData, licenseCategories: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">License Expiry Date</label>
                      <input type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] outline-none focus:border-[#1e3a5f]" value={formData.licenseExpiryDate} onChange={e => setFormData({...formData, licenseExpiryDate: e.target.value})} />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-extrabold text-slate-650 uppercase mb-1.5">Allowed Vehicle Class Names</label>
                      <input type="text" placeholder="e.g. Manual Car, Auto Car, Motorcycle" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1e3a5f]" value={formData.allowedVehicleCategories} onChange={e => setFormData({...formData, allowedVehicleCategories: e.target.value})} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-150 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-250 rounded-xl transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="instructor-form" 
                className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152942] text-white font-bold rounded-xl transition-all shadow-md text-xs"
              >
                {editingId ? 'Save Changes' : 'Register Instructor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructors;
