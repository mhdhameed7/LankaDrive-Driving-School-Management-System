import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Plus, Filter, MoreVertical, FileText, CheckCircle2, UserPlus, FileCheck, ArrowRight, X, User, Car
} from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Form State
  const [formData, setFormData] = useState({
    name: '', nic: '', dob: '', gender: 'Male', address: '', phone: '', email: '',
    licenseClass: [], transmissionPref: 'Manual', preferredLanguage: 'Sinhala',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    trainingPackage: 'Standard', batchPreference: 'Batch A',
    registrationPayment: 15000, receiptNumber: ''
  });

  const LICENSE_CLASSES = [
    { value: 'A1', label: 'A1', desc: 'Motorcycle up to 100cc' },
    { value: 'A',  label: 'A',  desc: 'Motorcycle over 100cc' },
    { value: 'B1', label: 'B1', desc: 'Three-wheeler / Light Van' },
    { value: 'B',  label: 'B',  desc: 'Car / Dual-purpose Vehicle' },
    { value: 'C1', label: 'C1', desc: 'Light Lorry (3,500–17,000 kg)' },
    { value: 'C',  label: 'C',  desc: 'Heavy Lorry (over 17,000 kg)' },
    { value: 'D1', label: 'D1', desc: 'Light Bus (9–33 seats)' },
    { value: 'D',  label: 'D',  desc: 'Heavy Bus (33+ seats)' },
    { value: 'G1', label: 'G1', desc: 'Hand Tractor' },
    { value: 'G',  label: 'G',  desc: 'Agricultural Vehicle' },
    { value: 'J',  label: 'J',  desc: 'Construction Vehicle' },
  ];

  const toggleLicenseClass = (cls) => {
    setFormData(prev => ({
      ...prev,
      licenseClass: prev.licenseClass.includes(cls)
        ? prev.licenseClass.filter(c => c !== cls)
        : [...prev.licenseClass, cls]
    }));
  };

  const fetchCandidates = async () => {
    try {
      const data = await window.api.getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to fetch candidates', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setWizardStep(1);
      setShowWizard(true);
      navigate('/candidates', { replace: true });
    }
  }, [location, navigate]);

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (wizardStep === 2 && formData.licenseClass.length === 0) {
      alert('Please select at least one license class.');
      return;
    }
    if (wizardStep === 4) {
      const receiptNum = await window.api.getNextReceiptNumber();
      setFormData(prev => ({ ...prev, receiptNumber: receiptNum }));
    }
    if (wizardStep < 5) setWizardStep(wizardStep + 1);
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newId = await window.api.getNextCandidateId();
      const candidateToAdd = {
        ...formData,
        licenseClass: formData.licenseClass.join(','),
        id: newId,
        registeredDate: new Date().toISOString().split('T')[0]
      };
      const response = await window.api.addCandidate(candidateToAdd);
      if (response.success) {
        setShowWizard(false);
        setWizardStep(1);
        setFormData({
          name: '', nic: '', dob: '', gender: 'Male', address: '', phone: '', email: '',
          licenseClass: [], transmissionPref: 'Manual', preferredLanguage: 'Sinhala',
          emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
          trainingPackage: 'Standard', batchPreference: 'Batch A',
          registrationPayment: 15000, receiptNumber: ''
        });
        fetchCandidates();
      } else {
        alert('Error adding candidate: ' + response.message);
      }
    } catch (err) {
      console.error('Candidate registration error:', err);
      alert('Failed to register candidate: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.nic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      'REGISTERED': 'bg-blue-100 text-blue-800 border-blue-200',
      'MEDICAL_PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
      'MEDICAL_APPROVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'WRITTEN_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800 border-purple-200',
      'WRITTEN_EXAM_PASSED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'LEARNER_PERMIT_ISSUED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'IN_TRAINING': 'bg-amber-100 text-amber-800 border-amber-200',
      'ELIGIBLE_FOR_TRIAL': 'bg-orange-100 text-orange-800 border-orange-200',
      'TRIAL_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800 border-purple-200',
      'CERTIFIED': 'bg-green-100 text-green-800 border-green-200',
    };
    const safeStatus = status || 'REGISTERED';
    const style = badges[safeStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>{safeStatus.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb]">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] font-['Public_Sans']">Candidate Management</h1>
          <p className="text-sm text-[#64748b] mt-1">Register candidates, process medicals, and track licensing workflow.</p>
        </div>
        <button 
          onClick={() => { setWizardStep(1); setShowWizard(true); }}
          className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-[#f59e0b]/20 hover:-translate-y-0.5"
        >
          <UserPlus size={18} /> Register Candidate
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Name, or NIC..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors shadow-sm">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8fafc] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]">ID & Reg Date</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]">Candidate Info</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]">Class & Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider border-b border-[#e2e8f0]">Current Workflow Stage</th>
                <th className="px-6 py-4 border-b border-[#e2e8f0]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/candidates/${c.id}`)} className="hover:bg-[#f8fafc] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1e3a5f] text-sm">{c.id}</div>
                      <div className="text-xs text-[#94a3b8] mt-1">{c.registeredDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#334155] text-sm">{c.name}</div>
                      <div className="text-xs text-[#64748b] mt-1">{c.nic} • {c.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(c.licenseClass || '').split(',').filter(Boolean).map(cls => (
                          <span key={cls} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] text-xs font-semibold">
                            <Car size={12} /> {cls}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-[#94a3b8] mt-1.5">{c.transmissionPref}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">{getStatusBadge(c.status)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden flex-1">
                          <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: `${(c.stage / 5) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-[#64748b]">STAGE {c.stage}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-[#94a3b8] hover:text-[#1e3a5f] hover:bg-[#f1f5f9] rounded-lg transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f1f5f9] text-[#94a3b8] mb-3">
                      <Search size={24} />
                    </div>
                    <p className="text-[#64748b] font-medium">No candidates found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Registration Wizard Modal ── */}
      {showWizard && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-[modalIn_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="bg-[#1e3a5f] px-6 py-5 relative">
              <button onClick={() => setShowWizard(false)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-['Public_Sans']">Register New Candidate</h2>
                  <p className="text-white/60 text-sm mt-0.5">Complete all steps to enroll a new candidate into the system.</p>
                </div>
              </div>
              
              {/* Progress Tracker */}
              <div className="flex items-center justify-between mt-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-[#f59e0b] -translate-y-1/2 z-0 transition-all duration-300" style={{ width: `${(wizardStep - 1) * 25}%` }}></div>
                
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${wizardStep >= step ? 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/30' : 'bg-[#1e3a5f] border-2 border-white/20 text-white/40'}`}>
                    {step}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-white/50 px-1">
                <span>Personal</span>
                <span>License</span>
                <span>Emergency</span>
                <span>Package</span>
                <span>Review</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#f8fafc]">
              <form id="wizard-form" onSubmit={wizardStep === 5 ? handleSubmit : handleNextStep}>
                
                {/* Step 1: Personal Details */}
                {wizardStep === 1 && (
                  <div className="space-y-5 animate-[modalIn_0.3s_ease-out]">
                    <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e2e8f0] pb-2 mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Full Name</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name as in NIC" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">NIC Number</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} placeholder="e.g. 951234567V" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Date of Birth</label>
                        <input required type="date" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Gender</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Phone Number</label>
                        <input required type="tel" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="07X XXX XXXX" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Address</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Permanent address" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Preferred Language</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.preferredLanguage} onChange={e => setFormData({...formData, preferredLanguage: e.target.value})}>
                          <option value="Sinhala">Sinhala</option>
                          <option value="Tamil">Tamil</option>
                          <option value="English">English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: License Info */}
                {wizardStep === 2 && (
                  <div className="space-y-5 animate-[modalIn_0.3s_ease-out]">
                    <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e2e8f0] pb-2 mb-4">License Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#334155] mb-2">License Classes Applied For <span className="text-xs text-[#94a3b8] font-normal">(select all that apply)</span></label>
                        <div className="grid grid-cols-2 gap-2">
                          {LICENSE_CLASSES.map(cls => (
                            <label
                              key={cls.value}
                              onClick={() => toggleLicenseClass(cls.value)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm
                                ${formData.licenseClass.includes(cls.value)
                                  ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/20'
                                  : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]'}`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors
                                ${formData.licenseClass.includes(cls.value)
                                  ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                                  : 'border-[#cbd5e1] bg-white'}`}
                              >
                                {formData.licenseClass.includes(cls.value) && (
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-[#1e3a5f]">{cls.label}</span>
                                <span className="text-[#64748b] ml-1.5 text-xs">{cls.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {formData.licenseClass.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#64748b]">Selected:</span>
                            {formData.licenseClass.map(cls => (
                              <span key={cls} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1e3a5f] text-white rounded text-xs font-bold">
                                {cls}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleLicenseClass(cls); }} className="ml-0.5 hover:text-red-300">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Transmission</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.transmissionPref} onChange={e => setFormData({...formData, transmissionPref: e.target.value})}>
                          <option value="Manual">Manual</option>
                          <option value="Auto">Auto</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Emergency Contact */}
                {wizardStep === 3 && (
                  <div className="space-y-5 animate-[modalIn_0.3s_ease-out]">
                    <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e2e8f0] pb-2 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Contact Name</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Relationship</label>
                        <input required type="text" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.emergencyRelationship} onChange={e => setFormData({...formData, emergencyRelationship: e.target.value})} placeholder="e.g. Father, Spouse" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Contact Number</label>
                        <input required type="tel" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Package & Documents Placeholder */}
                {wizardStep === 4 && (
                  <div className="space-y-5 animate-[modalIn_0.3s_ease-out]">
                    <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e2e8f0] pb-2 mb-4">Training Package & Docs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Training Package</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.trainingPackage} onChange={e => setFormData({...formData, trainingPackage: e.target.value})}>
                          <option value="Standard">Standard (Full Course)</option>
                          <option value="Premium">Premium (Extra Hours)</option>
                          <option value="Short">Short Course (Experienced)</option>
                          <option value="Trial">Exam Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Batch Preference</label>
                        <select className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none" value={formData.batchPreference} onChange={e => setFormData({...formData, batchPreference: e.target.value})}>
                          <option value="Weekday Morning">Weekday Morning</option>
                          <option value="Weekday Evening">Weekday Evening</option>
                          <option value="Weekend">Weekend Special</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                      <FileCheck className="text-blue-600 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-blue-900">Required Documents</h4>
                        <p className="text-xs text-blue-700 mt-1">Please collect the following from the candidate. Document uploads can be managed later in the candidate's profile.</p>
                        <ul className="text-xs text-blue-800 mt-2 list-disc pl-4 space-y-1">
                          <li>National Identity Card (Original & Copy)</li>
                          <li>Passport Size Photographs (x3)</li>
                          <li>Birth Certificate Copy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Payment */}
                {wizardStep === 5 && (
                  <div className="space-y-5 animate-[modalIn_0.3s_ease-out]">
                    <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e2e8f0] pb-2 mb-4">Registration Payment</h3>
                    
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-4">
                      <h4 className="text-sm font-bold text-[#334155] mb-3 uppercase tracking-wider">Candidate Summary</h4>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-[#64748b]">Name:</div><div className="font-semibold text-[#1e3a5f]">{formData.name}</div>
                        <div className="text-[#64748b]">NIC:</div><div className="font-semibold text-[#1e3a5f]">{formData.nic}</div>
                        <div className="text-[#64748b]">Class:</div><div className="font-semibold text-[#1e3a5f]">{formData.licenseClass.join(', ')} ({formData.transmissionPref})</div>
                        <div className="text-[#64748b]">Package:</div><div className="font-semibold text-[#1e3a5f]">{formData.trainingPackage}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Registration Amount (Rs)</label>
                        <input required type="number" className="w-full px-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none font-bold text-green-700" value={formData.registrationPayment} onChange={e => setFormData({...formData, registrationPayment: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Receipt Number <span className="text-xs text-[#94a3b8] font-normal">(auto-generated)</span></label>
                        <input readOnly type="text" className="w-full px-4 py-2.5 bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl text-sm outline-none font-mono font-bold text-[#1e3a5f] cursor-not-allowed" value={formData.receiptNumber} />
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                      <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Final Step</h4>
                        <p className="text-xs text-amber-700 mt-1">Completing this step will register the candidate and set their workflow status to <strong>REGISTERED</strong>.</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-[#e2e8f0] px-6 py-4 flex justify-between items-center rounded-b-2xl">
              <button 
                type="button" 
                onClick={wizardStep === 1 ? () => setShowWizard(false) : handlePrevStep}
                className="px-5 py-2.5 text-sm font-semibold text-[#64748b] hover:text-[#1e3a5f] hover:bg-[#f1f5f9] rounded-xl transition-colors"
              >
                {wizardStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button 
                type="submit" 
                form="wizard-form"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#1e3a5f]/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? 'Processing...' : (wizardStep === 5 ? 'Complete Registration' : 'Continue')}
                {!loading && wizardStep !== 5 && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
