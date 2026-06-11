import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle2, XCircle, Clock, Search, 
  FileCheck, ArrowRight, User, ShieldCheck, AlertCircle, Phone, X
} from 'lucide-react';

const Admission = () => {
  const [stats, setStats] = useState({ pending: 0, admittedToday: 0, rejectedHold: 0 });
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewState, setReviewState] = useState({
    documents: { nic: false, photos: false, birthCert: false, address: false, medical: false },
    decision: 'APPROVED',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const candidates = await window.api.getPendingAdmissions();
      setPendingCandidates(candidates || []);
      const currentStats = await window.api.getAdmissionStats();
      setStats(currentStats || { pending: 0, admittedToday: 0, rejectedHold: 0 });
    } catch (error) {
      console.error("Failed to fetch admission data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReview = (candidate) => {
    setSelectedCandidate(candidate);
    setReviewState({
      documents: { nic: false, photos: false, birthCert: false, address: false, medical: false },
      decision: 'APPROVED',
      notes: ''
    });
    setShowReviewModal(true);
  };

  const toggleDocument = (docKey) => {
    setReviewState(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: !prev.documents[docKey]
      }
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    // Validate documents if approving
    if (reviewState.decision === 'APPROVED') {
      const allChecked = Object.values(reviewState.documents).every(v => v);
      if (!allChecked) {
        if (!window.confirm("Not all documents are checked. Are you sure you want to approve?")) {
          return;
        }
      }
    }

    const payload = {
      candidateId: selectedCandidate.id,
      reviewDate: new Date().toISOString().split('T')[0],
      reviewedBy: 'Admin', // In a real app, from user session
      decision: reviewState.decision,
      documentsVerified: reviewState.documents,
      notes: reviewState.notes
    };

    try {
      const response = await window.api.addAdmissionReview(payload);
      if (response.success) {
        setShowReviewModal(false);
        fetchData();
      } else {
        alert("Error saving review: " + response.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredCandidates = pendingCandidates.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <ClipboardList className="text-[#f59e0b]" size={32} />
            Admission Review
          </h1>
          <p className="text-[#64748b] mt-1">Review registrations and approve candidates for training.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#1e3a5f]">{stats.pending}</div>
            <div className="text-sm text-[#64748b] font-medium">Pending Review</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#1e3a5f]">{stats.admittedToday}</div>
            <div className="text-sm text-[#64748b] font-medium">Admitted Today</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e8f0] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#1e3a5f]">{stats.rejectedHold}</div>
            <div className="text-sm text-[#64748b] font-medium">Rejected / On Hold</div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        <div className="p-5 border-b border-[#e2e8f0] flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-[#1e3a5f]">Pending Admissions Queue</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Name, NIC..." 
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Candidate ID</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Candidate Info</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Classes</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Reg Date</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1e3a5f] text-sm">{c.id}</div>
                      <div className="text-xs text-[#94a3b8] mt-1 font-mono">{c.receiptNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#334155] text-sm">{c.name}</div>
                      <div className="text-xs text-[#64748b] mt-1">{c.nic} • {c.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.licenseClass || '').split(',').filter(Boolean).map(cls => (
                          <span key={cls} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">
                      {c.registeredDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenReview(c)}
                        className="inline-flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                      >
                        <ShieldCheck size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#94a3b8]">
                    <ClipboardList className="mx-auto mb-3 opacity-20" size={48} />
                    <p className="text-lg font-medium text-[#475569]">No pending admissions.</p>
                    <p className="text-sm mt-1">All registered candidates have been processed.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedCandidate && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-[modalIn_0.3s_ease-out] flex flex-col max-h-[90vh]">
            
            <div className="bg-[#1e3a5f] p-5 rounded-t-2xl text-white flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck size={24} className="text-[#f59e0b]" /> 
                Admission Review: {selectedCandidate.id}
              </h2>
              <button onClick={() => setShowReviewModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-6">
                <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">Candidate Summary</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div><span className="text-[#94a3b8] block text-xs">Name</span><strong className="text-[#1e3a5f]">{selectedCandidate.name}</strong></div>
                  <div><span className="text-[#94a3b8] block text-xs">NIC</span><strong className="text-[#1e3a5f]">{selectedCandidate.nic}</strong></div>
                  <div><span className="text-[#94a3b8] block text-xs">Classes Applied</span><strong className="text-[#1e3a5f]">{(selectedCandidate.licenseClass || '').split(',').join(', ')}</strong></div>
                  <div><span className="text-[#94a3b8] block text-xs">Payment Receipt</span><strong className="text-[#1e3a5f]">{selectedCandidate.receiptNumber} (Rs. {selectedCandidate.registrationPayment})</strong></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#1e3a5f] mb-3">Document Verification Checklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'nic', label: 'NIC Copy (Original Verified)' },
                    { key: 'photos', label: 'Passport Size Photos (2)' },
                    { key: 'birthCert', label: 'Birth Certificate Copy' },
                    { key: 'address', label: 'Address Verification Document' },
                    { key: 'medical', label: 'Medical Fitness Declaration' }
                  ].map(doc => (
                    <label key={doc.key} onClick={() => toggleDocument(doc.key)} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${reviewState.documents[doc.key] ? 'border-emerald-500 bg-emerald-50' : 'border-[#e2e8f0] hover:border-slate-300'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${reviewState.documents[doc.key] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#cbd5e1] bg-white'}`}>
                        {reviewState.documents[doc.key] && <CheckCircle2 size={14} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-semibold ${reviewState.documents[doc.key] ? 'text-emerald-900' : 'text-[#475569]'}`}>{doc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#1e3a5f] mb-3">Admission Decision</h3>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${reviewState.decision === 'APPROVED' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-[#e2e8f0] hover:border-slate-300'}`}>
                    <input type="radio" name="decision" className="hidden" checked={reviewState.decision === 'APPROVED'} onChange={() => setReviewState({...reviewState, decision: 'APPROVED'})} />
                    <CheckCircle2 size={24} />
                    <span className="font-bold text-sm">Approve</span>
                  </label>
                  <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${reviewState.decision === 'ON_HOLD' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-[#e2e8f0] hover:border-slate-300'}`}>
                    <input type="radio" name="decision" className="hidden" checked={reviewState.decision === 'ON_HOLD'} onChange={() => setReviewState({...reviewState, decision: 'ON_HOLD'})} />
                    <AlertCircle size={24} />
                    <span className="font-bold text-sm">On Hold</span>
                  </label>
                  <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${reviewState.decision === 'REJECTED' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-[#e2e8f0] hover:border-slate-300'}`}>
                    <input type="radio" name="decision" className="hidden" checked={reviewState.decision === 'REJECTED'} onChange={() => setReviewState({...reviewState, decision: 'REJECTED'})} />
                    <XCircle size={24} />
                    <span className="font-bold text-sm">Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Review Notes (Optional)</label>
                <textarea 
                  className="w-full border border-[#cbd5e1] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none min-h-[80px]"
                  placeholder="e.g. Needs to bring original birth certificate next time..."
                  value={reviewState.notes}
                  onChange={(e) => setReviewState({...reviewState, notes: e.target.value})}
                ></textarea>
              </div>

            </div>

            <div className="p-5 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
              <button type="button" onClick={() => setShowReviewModal(false)} className="px-5 py-2.5 text-[#64748b] font-semibold hover:bg-[#e2e8f0] rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleReviewSubmit} className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
                Save Decision <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Admission;
