import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, FileText, 
  CheckCircle2, Plus, FileCheck, Car, Award, ShieldCheck, FileSignature, Stethoscope
} from 'lucide-react';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);

  // Sub-data states
  const [medicals, setMedicals] = useState([]);
  const [writtenExams, setWrittenExams] = useState([]);
  const [permits, setPermits] = useState([]);
  const [training, setTraining] = useState([]);
  const [practicalExams, setPracticalExams] = useState([]);

  // Modals
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showWrittenModal, setShowWrittenModal] = useState(false);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showPracticalModal, setShowPracticalModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await window.api.getCandidateById(id);
      if (res.success && res.candidate) {
        setCandidate(res.candidate);
        
        // Load sub-data
        setMedicals(await window.api.getMedicalRecords(id));
        setWrittenExams(await window.api.getWrittenExams(id));
        setPermits(await window.api.getLearnerPermits(id));
        setTraining(await window.api.getTrainingSessions(id));
        setPracticalExams(await window.api.getPracticalExams(id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const updateStage = async (newStatus, newStage) => {
    await window.api.updateCandidateStatus({ id, status: newStatus, stage: newStage });
    loadData();
  };

  // ── Form Handlers ──

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      candidateId: id,
      certificateNumber: data.get('certificateNumber'),
      doctorName: data.get('doctorName'),
      medicalCenter: data.get('medicalCenter'),
      issueDate: data.get('issueDate'),
      expiryDate: data.get('expiryDate'),
      isApproved: true,
      notes: data.get('notes')
    };
    await window.api.addMedicalRecord(payload);
    await updateStage('MEDICAL_APPROVED', 3);
    setShowMedicalModal(false);
  };

  const handleWrittenSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const result = data.get('result');
    const payload = {
      candidateId: id,
      examDate: data.get('examDate'),
      examCenter: data.get('examCenter'),
      attemptNumber: data.get('attemptNumber'),
      result: result,
      score: data.get('score'),
      notes: data.get('notes')
    };
    await window.api.addWrittenExam(payload);
    if (result === 'PASSED') {
      await updateStage('WRITTEN_EXAM_PASSED', 4);
    }
    setShowWrittenModal(false);
  };

  const handlePermitSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      candidateId: id,
      permitNumber: data.get('permitNumber'),
      issueDate: data.get('issueDate'),
      expiryDate: data.get('expiryDate'),
      licenseClass: candidate.licenseClass,
      isActive: true
    };
    await window.api.addLearnerPermit(payload);
    await updateStage('LEARNER_PERMIT_ISSUED', 4);
    setShowPermitModal(false);
  };

  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      candidateId: id,
      sessionDate: data.get('sessionDate'),
      sessionType: data.get('sessionType'),
      instructorName: data.get('instructorName'),
      vehicleNumber: data.get('vehicleNumber'),
      duration: data.get('duration'),
      attendance: data.get('attendance'),
      notes: data.get('notes')
    };
    await window.api.addTrainingSession(payload);
    if (candidate.status !== 'IN_TRAINING' && candidate.stage === 4) {
      await updateStage('IN_TRAINING', 4);
    }
    setShowTrainingModal(false);
  };

  const handlePracticalSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const result = data.get('result');
    const payload = {
      candidateId: id,
      examDate: data.get('examDate'),
      examCenter: data.get('examCenter'),
      attemptNumber: data.get('attemptNumber'),
      result: result,
      examinerNotes: data.get('examinerNotes'),
      licenseNumber: data.get('licenseNumber')
    };
    await window.api.addPracticalExam(payload);
    if (result === 'PASSED') {
      await updateStage('CERTIFIED', 5);
    }
    setShowPracticalModal(false);
  };

  if (loading) return <div className="p-10 text-center text-[#64748b]">Loading profile...</div>;
  if (!candidate) return <div className="p-10 text-center text-red-500">Candidate not found.</div>;

  const getStatusBadge = (status) => {
    const badges = {
      'REGISTERED': 'bg-blue-100 text-blue-800',
      'MEDICAL_PENDING': 'bg-amber-100 text-amber-800',
      'MEDICAL_APPROVED': 'bg-emerald-100 text-emerald-800',
      'WRITTEN_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800',
      'WRITTEN_EXAM_PASSED': 'bg-emerald-100 text-emerald-800',
      'LEARNER_PERMIT_ISSUED': 'bg-indigo-100 text-indigo-800',
      'IN_TRAINING': 'bg-amber-100 text-amber-800',
      'ELIGIBLE_FOR_TRIAL': 'bg-orange-100 text-orange-800',
      'TRIAL_EXAM_SCHEDULED': 'bg-purple-100 text-purple-800',
      'CERTIFIED': 'bg-green-100 text-green-800',
    };
    const safeStatus = status || 'REGISTERED';
    const style = badges[safeStatus] || 'bg-gray-100 text-gray-800';
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style}`}>{safeStatus.replace(/_/g, ' ')}</span>;
  };

  const tabs = [
    { id: 'info', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'written', label: 'Written Exam', icon: FileSignature },
    { id: 'permit', label: 'Learner Permit', icon: ShieldCheck },
    { id: 'training', label: 'Training', icon: Car },
    { id: 'practical', label: 'Trial Exam', icon: Award },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb]">
        <button onClick={() => navigate('/candidates')} className="p-2 text-[#64748b] hover:text-[#1e3a5f] hover:bg-[#f8fafc] rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1e3a5f] font-['Public_Sans']">{candidate.name}</h1>
            {getStatusBadge(candidate.status)}
          </div>
          <div className="flex items-center gap-6 mt-2 text-sm text-[#64748b]">
            <span className="font-mono font-semibold">{candidate.id}</span>
            <span className="flex items-center gap-1.5"><User size={14} /> {candidate.nic}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> {candidate.phone}</span>
            <span className="flex items-center gap-1.5"><Car size={14} /> {(candidate.licenseClass || '').split(',').join(', ')} ({candidate.transmissionPref})</span>
          </div>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb]">
        <div className="relative">
          <div className="absolute top-4 left-0 h-1 bg-[#f1f5f9] rounded-full z-0"></div>
          <div className="absolute top-4 left-0 h-1 bg-[#10b981] rounded-full z-0 transition-all duration-500" style={{ width: `${((candidate.stage - 1) / 4) * 100}%` }}></div>
          
          <div className="flex justify-between relative z-10">
            {['Registration', 'Medicals', 'Theory Exam', 'Training', 'Licensing'].map((step, idx) => {
              const sLevel = idx + 1;
              const isPast = candidate.stage >= sLevel;
              const isCurrent = candidate.stage === sLevel;
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                    ${isPast ? 'bg-[#10b981] border-[#10b981] text-white' : 
                      isCurrent ? 'bg-white border-[#f59e0b] text-[#f59e0b] ring-4 ring-[#f59e0b]/20' : 
                      'bg-white border-[#cbd5e1] text-[#cbd5e1]'}`}
                  >
                    {isPast ? <CheckCircle2 size={18} /> : sLevel}
                  </div>
                  <span className={`text-[10px] font-bold uppercase mt-2 ${isPast ? 'text-[#10b981]' : isCurrent ? 'text-[#f59e0b]' : 'text-[#94a3b8]'}`}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden flex-shrink-0">
          <div className="p-4 bg-[#f8fafc] border-b border-[#e5e7eb]">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Candidate Sections</h3>
          </div>
          <div className="p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === tab.id 
                    ? 'bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/20' 
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e3a5f]'}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-y-auto">
          
          {activeTab === 'info' && (
            <div className="p-6 space-y-8 animate-[modalIn_0.3s_ease-out]">
              <div>
                <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e5e7eb] pb-2 mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div><span className="text-[#64748b] block mb-1">Full Name</span><strong className="text-[#334155]">{candidate.name}</strong></div>
                  <div><span className="text-[#64748b] block mb-1">NIC Number</span><strong className="text-[#334155]">{candidate.nic}</strong></div>
                  <div><span className="text-[#64748b] block mb-1">Date of Birth</span><strong className="text-[#334155]">{candidate.dob}</strong></div>
                  <div><span className="text-[#64748b] block mb-1">Gender</span><strong className="text-[#334155]">{candidate.gender}</strong></div>
                  <div className="col-span-2"><span className="text-[#64748b] block mb-1">Address</span><strong className="text-[#334155]">{candidate.address}</strong></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1e3a5f] border-b border-[#e5e7eb] pb-2 mb-4">Registration Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div><span className="text-[#64748b] block mb-1">License Class</span><strong className="text-[#334155]">{(candidate.licenseClass || '').split(',').join(', ')} ({candidate.transmissionPref})</strong></div>
                  <div><span className="text-[#64748b] block mb-1">Training Package</span><strong className="text-[#334155]">{candidate.trainingPackage}</strong></div>
                  <div><span className="text-[#64748b] block mb-1">Registration Date</span><strong className="text-[#334155]">{candidate.registeredDate}</strong></div>
                  <div><span className="text-[#64748b] block mb-1">Payment Receipt</span><strong className="text-[#334155]">{candidate.receiptNumber} (Rs. {candidate.registrationPayment})</strong></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="p-6 animate-[modalIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 border-b border-[#e5e7eb] pb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Medical Records</h3>
                {medicals.length === 0 && (
                  <button onClick={() => setShowMedicalModal(true)} className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Plus size={16} /> Record Medical Approval
                  </button>
                )}
              </div>
              
              {medicals.length > 0 ? (
                <div className="space-y-4">
                  {medicals.map(med => (
                    <div key={med.id} className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 flex gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 opacity-10 rounded-bl-full"></div>
                      <Stethoscope className="text-emerald-600 shrink-0 mt-1" size={24} />
                      <div className="grid grid-cols-2 flex-1 gap-4 text-sm relative z-10">
                        <div><span className="text-emerald-800/60 block text-xs font-bold uppercase mb-0.5">Cert Number</span><strong className="text-emerald-950">{med.certificateNumber}</strong></div>
                        <div><span className="text-emerald-800/60 block text-xs font-bold uppercase mb-0.5">Medical Center</span><strong className="text-emerald-950">{med.medicalCenter}</strong></div>
                        <div><span className="text-emerald-800/60 block text-xs font-bold uppercase mb-0.5">Issue Date</span><strong className="text-emerald-950">{med.issueDate}</strong></div>
                        <div><span className="text-emerald-800/60 block text-xs font-bold uppercase mb-0.5">Expiry Date</span><strong className="text-emerald-950">{med.expiryDate}</strong></div>
                        <div className="col-span-2"><span className="text-emerald-800/60 block text-xs font-bold uppercase mb-0.5">Status</span><span className="inline-block bg-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded font-bold text-xs mt-1">APPROVED</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8]">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No medical records found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'written' && (
            <div className="p-6 animate-[modalIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 border-b border-[#e5e7eb] pb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Written Exams</h3>
                {candidate.stage >= 3 && (
                  <button onClick={() => setShowWrittenModal(true)} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Plus size={16} /> Record Exam Attempt
                  </button>
                )}
              </div>
              
              {writtenExams.length > 0 ? (
                <div className="space-y-4">
                  {writtenExams.map(exam => (
                    <div key={exam.id} className={`border rounded-xl p-5 flex gap-4 ${exam.result === 'PASSED' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <FileSignature className={exam.result === 'PASSED' ? 'text-emerald-600' : 'text-red-500'} size={24} />
                      <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-4 text-sm">
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Date</span><strong className="text-gray-900">{exam.examDate}</strong></div>
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Center</span><strong className="text-gray-900">{exam.examCenter}</strong></div>
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Score</span><strong className="text-gray-900">{exam.score}</strong></div>
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Result</span><strong className={exam.result === 'PASSED' ? 'text-emerald-600' : 'text-red-600'}>{exam.result}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8]">
                  <p>No written exams recorded.</p>
                  {candidate.stage < 3 && <p className="text-xs mt-2 text-amber-500">Requires Medical Approval first.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'permit' && (
            <div className="p-6 animate-[modalIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 border-b border-[#e5e7eb] pb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Learner Permits</h3>
                {candidate.stage >= 4 && permits.length === 0 && (
                  <button onClick={() => setShowPermitModal(true)} className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Plus size={16} /> Issue Permit
                  </button>
                )}
              </div>
              
              {permits.length > 0 ? (
                <div className="space-y-4">
                  {permits.map(permit => (
                    <div key={permit.id} className="border border-indigo-200 bg-indigo-50 rounded-xl p-5 flex gap-4">
                      <ShieldCheck className="text-indigo-600 shrink-0 mt-1" size={24} />
                      <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-4 text-sm">
                        <div><span className="text-indigo-800/60 block text-xs font-bold uppercase mb-0.5">Permit Number</span><strong className="text-indigo-950 font-mono text-base">{permit.permitNumber}</strong></div>
                        <div><span className="text-indigo-800/60 block text-xs font-bold uppercase mb-0.5">Class</span><strong className="text-indigo-950">{permit.licenseClass}</strong></div>
                        <div><span className="text-indigo-800/60 block text-xs font-bold uppercase mb-0.5">Issue Date</span><strong className="text-indigo-950">{permit.issueDate}</strong></div>
                        <div><span className="text-indigo-800/60 block text-xs font-bold uppercase mb-0.5">Expiry Date</span><strong className="text-indigo-950">{permit.expiryDate}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8]">
                  <p>No learner permit issued.</p>
                  {candidate.stage < 4 && <p className="text-xs mt-2 text-amber-500">Requires passing Written Exam first.</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div className="p-6 animate-[modalIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 border-b border-[#e5e7eb] pb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Training Sessions</h3>
                {candidate.stage >= 4 && permits.length > 0 && (
                  <button onClick={() => setShowTrainingModal(true)} className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Plus size={16} /> Log Session
                  </button>
                )}
              </div>
              
              {training.length > 0 ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8fafc]">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-[#64748b] uppercase border-b border-[#e2e8f0]">Date</th>
                          <th className="px-4 py-3 text-xs font-bold text-[#64748b] uppercase border-b border-[#e2e8f0]">Type</th>
                          <th className="px-4 py-3 text-xs font-bold text-[#64748b] uppercase border-b border-[#e2e8f0]">Instructor & Vehicle</th>
                          <th className="px-4 py-3 text-xs font-bold text-[#64748b] uppercase border-b border-[#e2e8f0]">Duration</th>
                          <th className="px-4 py-3 text-xs font-bold text-[#64748b] uppercase border-b border-[#e2e8f0]">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {training.map(session => (
                          <tr key={session.id} className="hover:bg-[#f8fafc] text-sm">
                            <td className="px-4 py-3 font-semibold text-[#334155]">{session.sessionDate}</td>
                            <td className="px-4 py-3 text-[#64748b]">{session.sessionType}</td>
                            <td className="px-4 py-3 text-[#334155]">{session.instructorName}<br/><span className="text-xs text-[#94a3b8]">{session.vehicleNumber}</span></td>
                            <td className="px-4 py-3 text-[#64748b]">{session.duration} hrs</td>
                            <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">{session.attendance}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8]">
                  <p>No training sessions logged.</p>
                  {candidate.stage < 4 ? (
                    <p className="text-xs mt-2 text-amber-500">Requires passing Written Exam and obtaining a Learner Permit first.</p>
                  ) : permits.length === 0 ? (
                    <p className="text-xs mt-2 text-amber-500">A Learner Permit must be issued before logging training sessions.</p>
                  ) : null}
                </div>
              )}

              {candidate.stage === 4 && training.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 font-['Public_Sans']">Training Completed?</h4>
                    <p className="text-xs text-amber-700 mt-1">If the candidate has finished their required training, mark them ready for their practical exam.</p>
                  </div>
                  <button 
                    onClick={() => updateStage('ELIGIBLE_FOR_TRIAL', 5)}
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-amber-500/10 hover:shadow-lg active:scale-95"
                  >
                    Mark Ready for Practical Exam
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'practical' && (
            <div className="p-6 animate-[modalIn_0.3s_ease-out]">
              <div className="flex justify-between items-center mb-6 border-b border-[#e5e7eb] pb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">Trial Exams & License</h3>
                {candidate.stage >= 5 && (
                  <button onClick={() => setShowPracticalModal(true)} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <Plus size={16} /> Record Result
                  </button>
                )}
              </div>
              
              {practicalExams.length > 0 ? (
                <div className="space-y-4">
                  {practicalExams.map(exam => (
                    <div key={exam.id} className={`border rounded-xl p-5 flex gap-4 ${exam.result === 'PASSED' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <Award className={exam.result === 'PASSED' ? 'text-green-600' : 'text-red-500'} size={24} />
                      <div className="grid grid-cols-2 md:grid-cols-4 flex-1 gap-4 text-sm">
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Date</span><strong className="text-gray-900">{exam.examDate}</strong></div>
                        <div><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">Result</span><strong className={exam.result === 'PASSED' ? 'text-green-600' : 'text-red-600'}>{exam.result}</strong></div>
                        {exam.licenseNumber && (
                          <div className="col-span-2"><span className="text-gray-500 block text-xs font-bold uppercase mb-0.5">License Number</span><strong className="text-gray-900 font-mono text-base">{exam.licenseNumber}</strong></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#94a3b8]">
                  <p>No trial exams recorded.</p>
                  {candidate.stage < 5 && <p className="text-xs mt-2 text-amber-500">Must complete practical training to schedule trial exams.</p>}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      
      {/* Medical Modal */}
      {showMedicalModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="bg-[#10b981] p-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Record Medical Approval</h2>
            </div>
            <form onSubmit={handleMedicalSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Certificate Number</label><input required name="certificateNumber" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-semibold mb-1">Doctor Name</label><input required name="doctorName" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-semibold mb-1">Medical Center</label><input required name="medicalCenter" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Issue Date</label><input required name="issueDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Expiry Date</label><input required name="expiryDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowMedicalModal(false)} className="px-4 py-2 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-semibold">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Written Exam Modal */}
      {showWrittenModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="bg-[#f59e0b] p-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Record Written Exam</h2>
            </div>
            <form onSubmit={handleWrittenSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Date</label><input required name="examDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Attempt</label><input required name="attemptNumber" type="number" defaultValue={writtenExams.length + 1} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-1">Exam Center</label><input required name="examCenter" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Result</label>
                  <select name="result" className="w-full border rounded-lg px-3 py-2 font-bold">
                    <option value="PASSED" className="text-emerald-600">PASSED</option>
                    <option value="FAILED" className="text-red-600">FAILED</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-1">Score</label><input name="score" type="text" placeholder="e.g. 40/40" className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowWrittenModal(false)} className="px-4 py-2 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg font-semibold">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permit Modal */}
      {showPermitModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="bg-[#1e3a5f] p-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Issue Learner Permit</h2>
            </div>
            <form onSubmit={handlePermitSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold mb-1">Permit Number</label><input required name="permitNumber" type="text" className="w-full border rounded-lg px-3 py-2 font-mono" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Issue Date</label><input required name="issueDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Expiry Date</label><input required name="expiryDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPermitModal(false)} className="px-4 py-2 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg font-semibold">Issue Permit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Training Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="bg-[#1e3a5f] p-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Log Training Session</h2>
            </div>
            <form onSubmit={handleTrainingSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Date</label><input required name="sessionDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Type</label>
                  <select name="sessionType" className="w-full border rounded-lg px-3 py-2">
                    <option value="Practical">Practical (On-road)</option>
                    <option value="Theory">Theory</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Instructor</label><input required name="instructorName" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Vehicle</label><input required name="vehicleNumber" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Duration (Hours)</label><input required name="duration" type="number" step="0.5" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Attendance</label>
                  <select name="attendance" className="w-full border rounded-lg px-3 py-2">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowTrainingModal(false)} className="px-4 py-2 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg font-semibold">Log Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trial Exam Modal */}
      {showPracticalModal && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modalIn_0.3s_ease-out]">
            <div className="bg-[#10b981] p-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">Record Trial Exam</h2>
            </div>
            <form onSubmit={handlePracticalSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1">Date</label><input required name="examDate" type="date" className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-semibold mb-1">Result</label>
                  <select name="result" className="w-full border rounded-lg px-3 py-2 font-bold">
                    <option value="PASSED" className="text-emerald-600">PASSED</option>
                    <option value="FAILED" className="text-red-600">FAILED</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-semibold mb-1">Exam Center</label><input required name="examCenter" type="text" className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-semibold mb-1">License Number (If Passed)</label><input name="licenseNumber" type="text" placeholder="Optional" className="w-full border rounded-lg px-3 py-2 font-mono" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowPracticalModal(false)} className="px-4 py-2 text-[#64748b] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10b981] text-white rounded-lg font-semibold">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateProfile;
