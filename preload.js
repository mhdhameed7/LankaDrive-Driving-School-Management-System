const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  checkSecuritySetup: (data) => ipcRenderer.invoke('check-security-setup', data),
  getSecurityQuestion: (data) => ipcRenderer.invoke('get-security-question', data),
  setupSecurityQuestion: (data) => ipcRenderer.invoke('setup-security-question', data),
  resetPasswordWithSecurity: (data) => ipcRenderer.invoke('reset-password-with-security', data),
  
  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  
  // Candidates
  getCandidates: () => ipcRenderer.invoke('get-candidates'),
  getCandidateById: (id) => ipcRenderer.invoke('get-candidate-by-id', id),
  addCandidate: (candidate) => ipcRenderer.invoke('add-candidate', candidate),
  updateCandidate: (candidate) => ipcRenderer.invoke('update-candidate', candidate),
  updateCandidateStatus: (data) => ipcRenderer.invoke('update-candidate-status', data),
  deleteCandidate: (id) => ipcRenderer.invoke('delete-candidate', id),
  getNextCandidateId: () => ipcRenderer.invoke('get-next-candidate-id'),
  getNextReceiptNumber: () => ipcRenderer.invoke('get-next-receipt-number'),

  // Maintenance & Fuel Logs
  getMaintenanceLogs: (vehicleId) => ipcRenderer.invoke('get-maintenance-logs', vehicleId),
  addMaintenanceLog: (data) => ipcRenderer.invoke('add-maintenance-log', data),
  getFuelLogs: (vehicleId) => ipcRenderer.invoke('get-fuel-logs', vehicleId),
  addFuelLog: (data) => ipcRenderer.invoke('add-fuel-log', data),

  // Admissions
  getPendingAdmissions: () => ipcRenderer.invoke('get-pending-admissions'),
  addAdmissionReview: (data) => ipcRenderer.invoke('add-admission-review', data),
  getAdmissionReviews: (candidateId) => ipcRenderer.invoke('get-admission-reviews', candidateId),
  getAdmissionStats: () => ipcRenderer.invoke('get-admission-stats'),

  // Batches & Sessions
  getBatches: () => ipcRenderer.invoke('get-batches'),
  addBatch: (data) => ipcRenderer.invoke('add-batch', data),
  updateBatch: (data) => ipcRenderer.invoke('update-batch', data),
  deleteBatch: (id) => ipcRenderer.invoke('delete-batch', id),
  updateBatchStatus: (data) => ipcRenderer.invoke('update-batch-status', data),
  getBatchSessions: () => ipcRenderer.invoke('get-batch-sessions'),
  addBatchSession: (data) => ipcRenderer.invoke('add-batch-session', data),
  updateBatchSession: (data) => ipcRenderer.invoke('update-batch-session', data),
  deleteBatchSession: (id) => ipcRenderer.invoke('delete-batch-session', id),

  // Smart Batching
  getCandidatesByExamDate: (data) => ipcRenderer.invoke('get-candidates-by-exam-date', data),
  getCandidatesByAreaVehicle: (data) => ipcRenderer.invoke('get-candidates-by-area-vehicle', data),
  assignCandidatesToBatch: (data) => ipcRenderer.invoke('assign-candidates-to-batch', data),
  removeCandidateFromBatch: (data) => ipcRenderer.invoke('remove-candidate-from-batch', data),
  getBatchCandidates: (batchCode) => ipcRenderer.invoke('get-batch-candidates', batchCode),

  // Vehicles
  getVehicles: () => ipcRenderer.invoke('get-vehicles'),
  addVehicle: (data) => ipcRenderer.invoke('add-vehicle', data),
  updateVehicle: (data) => ipcRenderer.invoke('update-vehicle', data),
  deleteVehicle: (id) => ipcRenderer.invoke('delete-vehicle', id),
  getNextVehicleId: () => ipcRenderer.invoke('get-next-vehicle-id'),

  // Holidays
  getHolidays: () => ipcRenderer.invoke('get-holidays'),
  addHoliday: (data) => ipcRenderer.invoke('add-holiday', data),
  deleteHoliday: (id) => ipcRenderer.invoke('delete-holiday', id),

  // Instructors & Batta
  getInstructors: () => ipcRenderer.invoke('get-instructors'),
  addInstructor: (data) => ipcRenderer.invoke('add-instructor', data),
  updateInstructor: (data) => ipcRenderer.invoke('update-instructor', data),
  deleteInstructor: (id) => ipcRenderer.invoke('delete-instructor', id),
  getNextInstructorId: () => ipcRenderer.invoke('get-next-instructor-id'),
  calculateInstructorShifts: (data) => ipcRenderer.invoke('calculate-instructor-shifts', data),
  markShiftPaid: (data) => ipcRenderer.invoke('mark-shift-paid', data),

  // Instructor Leaves
  getInstructorLeaves: (instructorId) => ipcRenderer.invoke('get-instructor-leaves', instructorId),
  addInstructorLeave: (data) => ipcRenderer.invoke('add-instructor-leave', data),
  updateInstructorLeaveStatus: (data) => ipcRenderer.invoke('update-instructor-leave-status', data),

  // Instructor Documents
  getInstructorDocuments: (instructorId) => ipcRenderer.invoke('get-instructor-documents', instructorId),
  addInstructorDocument: (data) => ipcRenderer.invoke('add-instructor-document', data),

  // Medical Records
  addMedicalRecord: (data) => ipcRenderer.invoke('add-medical-record', data),
  getMedicalRecords: (candidateId) => ipcRenderer.invoke('get-medical-records', candidateId),

  // Written Exams
  addWrittenExam: (data) => ipcRenderer.invoke('add-written-exam', data),
  getWrittenExams: (candidateId) => ipcRenderer.invoke('get-written-exams', candidateId),

  // Learner Permits
  addLearnerPermit: (data) => ipcRenderer.invoke('add-learner-permit', data),
  getLearnerPermits: (candidateId) => ipcRenderer.invoke('get-learner-permits', candidateId),

  // Practical Exams
  addPracticalExam: (data) => ipcRenderer.invoke('add-practical-exam', data),
  getPracticalExams: (candidateId) => ipcRenderer.invoke('get-practical-exams', candidateId),

  // Training Sessions
  addTrainingSession: (data) => ipcRenderer.invoke('add-training-session', data),
  getTrainingSessions: (candidateId) => ipcRenderer.invoke('get-training-sessions', candidateId),

  // Documents
  addDocument: (data) => ipcRenderer.invoke('add-document', data),
  getDocuments: (candidateId) => ipcRenderer.invoke('get-documents', candidateId),

  // Attendance
  getCandidateAttendance: (data) => ipcRenderer.invoke('get-candidate-attendance', data),
  addCandidateAttendance: (data) => ipcRenderer.invoke('add-candidate-attendance', data),
  getCandidateAttendanceStats: (data) => ipcRenderer.invoke('get-candidate-attendance-stats', data),
  
  getInstructorAttendance: (data) => ipcRenderer.invoke('get-instructor-attendance', data),
  addInstructorAttendance: (data) => ipcRenderer.invoke('add-instructor-attendance', data),
  updateInstructorAttendance: (data) => ipcRenderer.invoke('update-instructor-attendance', data),
  
  getStaffList: () => ipcRenderer.invoke('get-staff-list'),
  addStaff: (data) => ipcRenderer.invoke('add-staff', data),
  getStaffAttendance: (data) => ipcRenderer.invoke('get-staff-attendance', data),
  addStaffAttendance: (data) => ipcRenderer.invoke('add-staff-attendance', data),
  updateStaffAttendance: (data) => ipcRenderer.invoke('update-staff-attendance', data),
  
  getAttendanceReport: (data) => ipcRenderer.invoke('get-attendance-report', data)
});
