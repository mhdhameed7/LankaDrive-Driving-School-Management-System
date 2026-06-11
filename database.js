import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
let db;

const saveDatabase = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
};

export const initializeDatabase = async () => {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    securityQuestion TEXT,
    securityAnswer TEXT
  )`);

  // Candidates Table (replaces Students)
  db.run(`CREATE TABLE IF NOT EXISTS Candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nic TEXT UNIQUE NOT NULL,
    dob TEXT,
    gender TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    licenseClass TEXT,
    transmissionPref TEXT DEFAULT 'Manual',
    preferredLanguage TEXT DEFAULT 'Sinhala',
    emergencyName TEXT,
    emergencyRelationship TEXT,
    emergencyPhone TEXT,
    trainingPackage TEXT,
    batchPreference TEXT,
    status TEXT DEFAULT 'REGISTERED',
    stage INTEGER DEFAULT 1,
    registeredDate TEXT,
    registrationPayment REAL DEFAULT 0,
    receiptNumber TEXT
  )`);

  // Medical Records
  db.run(`CREATE TABLE IF NOT EXISTS MedicalRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    certificateNumber TEXT,
    doctorName TEXT,
    medicalCenter TEXT,
    issueDate TEXT,
    expiryDate TEXT,
    isApproved INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Written Exams
  db.run(`CREATE TABLE IF NOT EXISTS WrittenExams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    examDate TEXT,
    examCenter TEXT,
    attemptNumber INTEGER DEFAULT 1,
    result TEXT,
    score TEXT,
    notes TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Learner Permits
  db.run(`CREATE TABLE IF NOT EXISTS LearnerPermits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    permitNumber TEXT,
    issueDate TEXT,
    expiryDate TEXT,
    licenseClass TEXT,
    isActive INTEGER DEFAULT 1,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Practical Exams
  db.run(`CREATE TABLE IF NOT EXISTS PracticalExams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    examDate TEXT,
    examCenter TEXT,
    attemptNumber INTEGER DEFAULT 1,
    result TEXT,
    examinerNotes TEXT,
    licenseNumber TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Training Sessions
  db.run(`CREATE TABLE IF NOT EXISTS TrainingSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    sessionDate TEXT,
    sessionType TEXT,
    instructorName TEXT,
    vehicleNumber TEXT,
    duration REAL,
    attendance TEXT DEFAULT 'Present',
    notes TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Documents
  db.run(`CREATE TABLE IF NOT EXISTS Documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    documentType TEXT,
    fileName TEXT,
    uploadDate TEXT,
    status TEXT DEFAULT 'Uploaded',
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Admission Reviews
  db.run(`CREATE TABLE IF NOT EXISTS AdmissionReviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    reviewDate TEXT,
    reviewedBy TEXT,
    decision TEXT,
    documentsVerified TEXT,
    notes TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Batches
  db.run(`CREATE TABLE IF NOT EXISTS Batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batchCode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    maxCapacity INTEGER DEFAULT 30,
    status TEXT DEFAULT 'Active'
  )`);

  // Batch Sessions
  db.run(`CREATE TABLE IF NOT EXISTS BatchSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batchId INTEGER,
    title TEXT,
    startTime TEXT,
    endTime TEXT,
    instructorId TEXT,
    vehicleId TEXT,
    locationArea TEXT,
    vehicleType TEXT,
    sessionType TEXT,
    FOREIGN KEY (batchId) REFERENCES Batches(id)
  )`);
  
  try { db.run("ALTER TABLE BatchSessions ADD COLUMN locationArea TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE BatchSessions ADD COLUMN vehicleType TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE BatchSessions ADD COLUMN sessionType TEXT"); } catch (e) {}

  try { db.run("ALTER TABLE Batches ADD COLUMN licenseCategory TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN startDate TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN endDate TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN sessionType TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN timeSlot TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN sessionDays TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN instructorId TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Batches ADD COLUMN vehicleId TEXT"); } catch (e) {}

  // Vehicles
  db.run(`CREATE TABLE IF NOT EXISTS Vehicles (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    plateNumber TEXT UNIQUE NOT NULL,
    transmission TEXT DEFAULT 'Manual',
    type TEXT,
    status TEXT DEFAULT 'Active'
  )`);
  
  try { db.run("ALTER TABLE Vehicles ADD COLUMN color TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN year TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN chassisNumber TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN engineNumber TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN licenseCategory TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN revenueLicenseExpiry TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN insuranceExpiry TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN drivingSchoolLicenseExpiry TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN emissionTestExpiry TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN purchasePrice REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN purchaseDate TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN currentMileage REAL DEFAULT 0"); } catch (e) {}
  try { db.run("ALTER TABLE Vehicles ADD COLUMN defaultInstructorId TEXT"); } catch (e) {}

  // MaintenanceLogs
  db.run(`CREATE TABLE IF NOT EXISTS MaintenanceLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicleId TEXT NOT NULL,
    serviceDate TEXT NOT NULL,
    mileage REAL DEFAULT 0,
    description TEXT,
    partsReplaced TEXT,
    cost REAL DEFAULT 0,
    nextServiceMileage REAL DEFAULT 0,
    nextServiceDate TEXT,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id)
  )`);

  // FuelLogs
  db.run(`CREATE TABLE IF NOT EXISTS FuelLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicleId TEXT NOT NULL,
    date TEXT NOT NULL,
    volumeLiters REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    odometerReading REAL DEFAULT 0,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(id)
  )`);

  // Holidays
  db.run(`CREATE TABLE IF NOT EXISTS Holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL
  )`);

  // Instructors
  db.run(`CREATE TABLE IF NOT EXISTS Instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    nic TEXT,
    licenseNumber TEXT,
    dailyBaseAllowance REAL DEFAULT 0,
    perSessionCommission REAL DEFAULT 0
  )`);

  // InstructorShifts
  db.run(`CREATE TABLE IF NOT EXISTS InstructorShifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructorId TEXT NOT NULL,
    shiftDate TEXT NOT NULL,
    totalSessions INTEGER DEFAULT 0,
    calculatedAllowance REAL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (instructorId) REFERENCES Instructors(id)
  )`);

  // Instructor Fields added via ALTER
  try { db.run("ALTER TABLE Instructors ADD COLUMN email TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN address TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN gender TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN dateJoined TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN licenseCategories TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN licenseExpiryDate TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN status TEXT DEFAULT 'Active'"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN workingDays TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN workingHours TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN isAvailable INTEGER DEFAULT 1"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN allowedVehicles TEXT"); } catch (e) {}
  try { db.run("ALTER TABLE Instructors ADD COLUMN allowedVehicleCategories TEXT"); } catch (e) {}

  // Instructor Leaves
  db.run(`CREATE TABLE IF NOT EXISTS InstructorLeaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructorId TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (instructorId) REFERENCES Instructors(id)
  )`);

  // Instructor Documents
  db.run(`CREATE TABLE IF NOT EXISTS InstructorDocuments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructorId TEXT NOT NULL,
    documentType TEXT NOT NULL,
    fileName TEXT NOT NULL,
    uploadDate TEXT NOT NULL,
    status TEXT DEFAULT 'Uploaded',
    FOREIGN KEY (instructorId) REFERENCES Instructors(id)
  )`);

  // Staff registry
  db.run(`CREATE TABLE IF NOT EXISTS Staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    status TEXT DEFAULT 'Active'
  )`);

  // Candidate Attendance
  db.run(`CREATE TABLE IF NOT EXISTS CandidateAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId TEXT NOT NULL,
    batchId INTEGER,
    sessionDate TEXT NOT NULL,
    sessionType TEXT NOT NULL,
    status TEXT NOT NULL,
    remarks TEXT,
    FOREIGN KEY (candidateId) REFERENCES Candidates(id)
  )`);

  // Instructor Attendance
  db.run(`CREATE TABLE IF NOT EXISTS InstructorAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructorId TEXT NOT NULL,
    attendanceDate TEXT NOT NULL,
    checkIn TEXT,
    checkOut TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY (instructorId) REFERENCES Instructors(id)
  )`);

  // Staff Attendance
  db.run(`CREATE TABLE IF NOT EXISTS StaffAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staffId TEXT NOT NULL,
    attendanceDate TEXT NOT NULL,
    checkIn TEXT,
    checkOut TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY (staffId) REFERENCES Staff(id)
  )`);

  // Seed staff registry if empty
  const staffCountQuery = db.exec("SELECT COUNT(*) FROM Staff");
  const staffCount = staffCountQuery.length > 0 ? staffCountQuery[0].values[0][0] : 0;
  if (staffCount === 0) {
    const staff = [
      ['STF-001', 'Sunil Perera', '0771112222', 'Receptionist', 'Active'],
      ['STF-002', 'Manel Alwis', '0713334444', 'Manager', 'Active'],
      ['STF-003', 'Rohan Silva', '0725556666', 'Security', 'Active']
    ];
    const stmt = db.prepare(`INSERT INTO Staff (id, name, phone, role, status) VALUES (?, ?, ?, ?, ?)`);
    for (const s of staff) { stmt.run(s); }
    stmt.free();
    saveDatabase();
  }

  // Seed Admin
  const adminQuery = db.exec("SELECT * FROM Users WHERE username = 'admin'");
  if (adminQuery.length === 0) {
    db.run("INSERT INTO Users (username, password, role) VALUES ('admin', 'password123', 'admin')");
    saveDatabase();
  }

  // Seed sample candidates
  const countQuery = db.exec("SELECT COUNT(*) FROM Candidates");
  const count = countQuery.length > 0 ? countQuery[0].values[0][0] : 0;
  if (count === 0) {
    const candidates = [
      ['CND-2025-001','Kasun Perera','951234567V','1995-05-15','Male','123 Main St, Colombo','0771234567','kasun@gmail.com','B','Manual','Sinhala','Nimal Perera','Father','0719876543','Standard','Batch A','IN_TRAINING',4,'2025-01-10',15000,'RCP-001'],
      ['CND-2025-002','Nimali Silva','987654321V','1998-08-20','Female','45 Kandy Rd, Kandy','0712345678','nimali@yahoo.com','B1','Auto','Sinhala','Kamani Silva','Mother','0778765432','Premium','Batch B','ELIGIBLE_FOR_TRIAL',5,'2025-01-12',25000,'RCP-002'],
      ['CND-2025-003','Ruwan Kumara','200112345678','2001-02-10','Male','78 Galle Rd, Galle','0753456789','ruwan@outlook.com','A1','Manual','English','Saman Kumara','Father','0787654321','Standard','Batch A','CERTIFIED',5,'2025-01-05',15000,'RCP-003'],
      ['CND-2025-004','Samanthi Fernando','905678123V','1990-11-25','Female','12 Negombo Rd, Negombo','0724567890','samanthi@gmail.com','B','Manual','Tamil','Ravi Fernando','Husband','0756543210','Standard','Batch C','REGISTERED',1,'2025-02-01',15000,'RCP-004'],
      ['CND-2025-005','Chaminda Peiris','198512345678','1985-04-30','Male','56 High Level Rd, Maharagama','0785678901','chaminda@hotmail.com','C','Manual','Sinhala','Malini Peiris','Wife','0725432109','Premium','Batch B','MEDICAL_APPROVED',3,'2025-02-05',25000,'RCP-005'],
    ];
    const stmt = db.prepare(`INSERT INTO Candidates (id,name,nic,dob,gender,address,phone,email,licenseClass,transmissionPref,preferredLanguage,emergencyName,emergencyRelationship,emergencyPhone,trainingPackage,batchPreference,status,stage,registeredDate,registrationPayment,receiptNumber) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const c of candidates) { stmt.run(c); }
    stmt.free();
    saveDatabase();
  }

  // Seed sample instructors
  const instCountQuery = db.exec("SELECT COUNT(*) FROM Instructors");
  const instCount = instCountQuery.length > 0 ? instCountQuery[0].values[0][0] : 0;
  if (instCount === 0) {
    const instructors = [
      ['INS-001', 'Saman Kumara', '0777123456', '781234567V', 'D-12345', 1500, 250],
      ['INS-002', 'Priyantha Bandara', '0714567890', '852345678V', 'D-54321', 1800, 300],
      ['INS-003', 'Aruni Fernando', '0759876543', '915678901V', 'D-98765', 1600, 280]
    ];
    const stmt = db.prepare(`INSERT INTO Instructors (id, name, phone, nic, licenseNumber, dailyBaseAllowance, perSessionCommission) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const ins of instructors) { stmt.run(ins); }
    stmt.free();
    saveDatabase();
  }

  // Seed sample vehicles
  const vehCountQuery = db.exec("SELECT COUNT(*) FROM Vehicles");
  const vehCount = vehCountQuery.length > 0 ? vehCountQuery[0].values[0][0] : 0;
  if (vehCount === 0) {
    const vehicles = [
      ['VHC-001', 'Toyota', 'Vitz', 'WP CAD-4321', 'Auto', 'Car', 'Active'],
      ['VHC-002', 'Suzuki', 'Swift', 'WP CAB-8765', 'Manual', 'Car', 'Active'],
      ['VHC-003', 'Bajaj', 'RE', 'WP QR-9080', 'Manual', 'Three Wheeler', 'Active'],
      ['VHC-004', 'Honda', 'Hornet', 'WP BI-1234', 'Manual', 'Motorcycle', 'Active']
    ];
    const stmt = db.prepare(`INSERT INTO Vehicles (id, make, model, plateNumber, transmission, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const v of vehicles) { stmt.run(v); }
    stmt.free();
    saveDatabase();
  }

  // Seed sample written exams
  const writtenCheck = db.exec("SELECT COUNT(*) FROM WrittenExams WHERE examDate = '2026-05-05'");
  const hasWritten05 = writtenCheck.length > 0 ? writtenCheck[0].values[0][0] : 0;
  if (hasWritten05 === 0) {
    const exams = [
      ['CND-2025-004', '2026-05-05', 'Colombo RMV', 1, 'Pending', '', 'First attempt'],
      ['CND-2025-005', '2026-05-05', 'Colombo RMV', 1, 'Pending', '', 'First attempt'],
      ['CND-2025-004', '2026-05-22', 'Colombo RMV', 1, 'Pending', '', 'First attempt'],
      ['CND-2025-005', '2026-05-22', 'Colombo RMV', 1, 'Pending', '', 'First attempt']
    ];
    db.run("DELETE FROM WrittenExams WHERE examDate IN ('2026-05-05', '2026-05-22')");
    const stmt = db.prepare(`INSERT INTO WrittenExams (candidateId, examDate, examCenter, attemptNumber, result, score, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const ex of exams) { stmt.run(ex); }
    stmt.free();
    saveDatabase();
  }

  // Seed sample practical exams
  const practicalCheck = db.exec("SELECT COUNT(*) FROM PracticalExams WHERE examDate = '2026-05-05'");
  const hasPractical05 = practicalCheck.length > 0 ? practicalCheck[0].values[0][0] : 0;
  if (hasPractical05 === 0) {
    const exams = [
      ['CND-2025-001', '2026-05-05', 'Werahera RMV', 1, 'Pending', '', ''],
      ['CND-2025-002', '2026-05-05', 'Werahera RMV', 1, 'Pending', '', ''],
      ['CND-2025-001', '2026-05-22', 'Werahera RMV', 1, 'Pending', '', ''],
      ['CND-2025-002', '2026-05-22', 'Werahera RMV', 1, 'Pending', '', '']
    ];
    db.run("DELETE FROM PracticalExams WHERE examDate IN ('2026-05-05', '2026-05-22')");
    const stmt = db.prepare(`INSERT INTO PracticalExams (candidateId, examDate, examCenter, attemptNumber, result, examinerNotes, licenseNumber) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const ex of exams) { stmt.run(ex); }
    stmt.free();
    saveDatabase();
  }
};

// Helper
const resultToObjects = (res) => {
  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    let obj = {};
    columns.forEach((col, idx) => { obj[col] = row[idx]; });
    return obj;
  });
};

export const handleIpcRequests = (ipcMain) => {

  // ── Auth ──
  ipcMain.handle('login', (event, { username, password }) => {
    try {
      const stmt = db.prepare('SELECT * FROM Users WHERE username = ? AND password = ?');
      stmt.bind([username, password]);
      let user = null;
      if (stmt.step()) user = stmt.getAsObject();
      stmt.free();
      if (user) {
        const hasSecuritySetup = !!(user.securityQuestion && user.securityAnswer);
        return { success: true, user: { username: user.username, role: user.role, hasSecuritySetup } };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('check-security-setup', (event, { username }) => {
    try {
      const res = db.exec(`SELECT securityQuestion FROM Users WHERE username = '${username}'`);
      if (res.length === 0 || res[0].values.length === 0) return { success: false, message: 'User not found.' };
      const q = res[0].values[0][0];
      return { success: true, hasSetup: !!q, securityQuestion: q || null };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-security-question', (event, { username }) => {
    try {
      const res = db.exec(`SELECT securityQuestion FROM Users WHERE username = '${username}'`);
      if (res.length === 0 || res[0].values.length === 0) return { success: false, message: 'Username not found.' };
      const q = res[0].values[0][0];
      if (!q) return { success: false, message: 'No security question set up. Contact system administrator.' };
      return { success: true, securityQuestion: q };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('setup-security-question', (event, { username, securityQuestion, securityAnswer }) => {
    try {
      const a = securityAnswer.trim().toLowerCase();
      db.run('UPDATE Users SET securityQuestion = ?, securityAnswer = ? WHERE username = ?', [securityQuestion, a, username]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('reset-password-with-security', (event, { username, securityAnswer, newPassword }) => {
    try {
      const res = db.exec(`SELECT securityAnswer FROM Users WHERE username = '${username}'`);
      if (res.length === 0 || res[0].values.length === 0) return { success: false, message: 'Invalid recovery attempt.' };
      const stored = res[0].values[0][0];
      if (securityAnswer.trim().toLowerCase() !== stored) return { success: false, message: 'Incorrect security answer. Please try again.' };
      db.run('UPDATE Users SET password = ? WHERE username = ?', [newPassword, username]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Candidates ──
  ipcMain.handle('get-candidates', () => {
    return resultToObjects(db.exec('SELECT * FROM Candidates ORDER BY registeredDate DESC'));
  });

  ipcMain.handle('get-candidate-by-id', (event, id) => {
    try {
      const res = db.exec(`SELECT * FROM Candidates WHERE id = '${id}'`);
      const candidates = resultToObjects(res);
      return { success: true, candidate: candidates.length > 0 ? candidates[0] : null };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('add-candidate', (event, c) => {
    try {
      db.run(`INSERT INTO Candidates (id,name,nic,dob,gender,address,phone,email,licenseClass,transmissionPref,preferredLanguage,emergencyName,emergencyRelationship,emergencyPhone,trainingPackage,batchPreference,status,stage,registeredDate,registrationPayment,receiptNumber) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [c.id,c.name,c.nic,c.dob,c.gender,c.address,c.phone,c.email,c.licenseClass,c.transmissionPref,c.preferredLanguage,c.emergencyName,c.emergencyRelationship,c.emergencyPhone,c.trainingPackage,c.batchPreference,'REGISTERED',1,c.registeredDate,c.registrationPayment,c.receiptNumber]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-candidate', (event, c) => {
    try {
      db.run(`UPDATE Candidates SET name=?,nic=?,dob=?,gender=?,address=?,phone=?,email=?,licenseClass=?,transmissionPref=?,preferredLanguage=?,emergencyName=?,emergencyRelationship=?,emergencyPhone=?,trainingPackage=?,batchPreference=? WHERE id=?`,
        [c.name,c.nic,c.dob,c.gender,c.address,c.phone,c.email,c.licenseClass,c.transmissionPref,c.preferredLanguage,c.emergencyName,c.emergencyRelationship,c.emergencyPhone,c.trainingPackage,c.batchPreference,c.id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-candidate-status', (event, { id, status, stage }) => {
    try {
      db.run('UPDATE Candidates SET status = ?, stage = ? WHERE id = ?', [status, stage, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-candidate', (event, id) => {
    try {
      db.run(`DELETE FROM Candidates WHERE id = '${id}'`);
      db.run(`DELETE FROM MedicalRecords WHERE candidateId = '${id}'`);
      db.run(`DELETE FROM WrittenExams WHERE candidateId = '${id}'`);
      db.run(`DELETE FROM LearnerPermits WHERE candidateId = '${id}'`);
      db.run(`DELETE FROM PracticalExams WHERE candidateId = '${id}'`);
      db.run(`DELETE FROM TrainingSessions WHERE candidateId = '${id}'`);
      db.run(`DELETE FROM Documents WHERE candidateId = '${id}'`);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Medical Records ──
  ipcMain.handle('add-medical-record', (event, r) => {
    try {
      db.run(`INSERT INTO MedicalRecords (candidateId,certificateNumber,doctorName,medicalCenter,issueDate,expiryDate,isApproved,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [r.candidateId,r.certificateNumber,r.doctorName,r.medicalCenter,r.issueDate,r.expiryDate,r.isApproved?1:0,r.notes]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-medical-records', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM MedicalRecords WHERE candidateId = '${candidateId}'`));
  });

  // ── Written Exams ──
  ipcMain.handle('add-written-exam', (event, e) => {
    try {
      db.run(`INSERT INTO WrittenExams (candidateId,examDate,examCenter,attemptNumber,result,score,notes) VALUES (?,?,?,?,?,?,?)`,
        [e.candidateId,e.examDate,e.examCenter,e.attemptNumber,e.result,e.score,e.notes]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-written-exams', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM WrittenExams WHERE candidateId = '${candidateId}'`));
  });

  // ── Learner Permits ──
  ipcMain.handle('add-learner-permit', (event, p) => {
    try {
      db.run(`INSERT INTO LearnerPermits (candidateId,permitNumber,issueDate,expiryDate,licenseClass,isActive) VALUES (?,?,?,?,?,?)`,
        [p.candidateId,p.permitNumber,p.issueDate,p.expiryDate,p.licenseClass,p.isActive?1:0]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-learner-permits', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM LearnerPermits WHERE candidateId = '${candidateId}'`));
  });

  // ── Practical Exams ──
  ipcMain.handle('add-practical-exam', (event, e) => {
    try {
      db.run(`INSERT INTO PracticalExams (candidateId,examDate,examCenter,attemptNumber,result,examinerNotes,licenseNumber) VALUES (?,?,?,?,?,?,?)`,
        [e.candidateId,e.examDate,e.examCenter,e.attemptNumber,e.result,e.examinerNotes,e.licenseNumber]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-practical-exams', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM PracticalExams WHERE candidateId = '${candidateId}'`));
  });

  // ── Training Sessions ──
  ipcMain.handle('add-training-session', (event, s) => {
    try {
      db.run(`INSERT INTO TrainingSessions (candidateId,sessionDate,sessionType,instructorName,vehicleNumber,duration,attendance,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [s.candidateId,s.sessionDate,s.sessionType,s.instructorName,s.vehicleNumber,s.duration,s.attendance,s.notes]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-training-sessions', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM TrainingSessions WHERE candidateId = '${candidateId}'`));
  });

  // ── Documents ──
  ipcMain.handle('add-document', (event, d) => {
    try {
      db.run(`INSERT INTO Documents (candidateId,documentType,fileName,uploadDate,status) VALUES (?,?,?,?,?)`,
        [d.candidateId,d.documentType,d.fileName,d.uploadDate,d.status||'Uploaded']);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-documents', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM Documents WHERE candidateId = '${candidateId}'`));
  });

  // ── Dashboard Stats ──
  ipcMain.handle('get-dashboard-stats', () => {
    const total = db.exec('SELECT COUNT(*) FROM Candidates');
    const registered = db.exec("SELECT COUNT(*) FROM Candidates WHERE status = 'REGISTERED'");
    const inTraining = db.exec("SELECT COUNT(*) FROM Candidates WHERE status = 'IN_TRAINING'");
    const certified = db.exec("SELECT COUNT(*) FROM Candidates WHERE status = 'CERTIFIED'");
    return {
      totalCandidates: total.length > 0 ? total[0].values[0][0] : 0,
      registered: registered.length > 0 ? registered[0].values[0][0] : 0,
      inTraining: inTraining.length > 0 ? inTraining[0].values[0][0] : 0,
      certified: certified.length > 0 ? certified[0].values[0][0] : 0,
    };
  });

  // ── Generate next candidate ID ──
  ipcMain.handle('get-next-candidate-id', () => {
    const year = new Date().getFullYear();
    const res = db.exec(`SELECT COUNT(*) FROM Candidates WHERE id LIKE 'CND-${year}-%'`);
    const count = res.length > 0 ? res[0].values[0][0] : 0;
    return `CND-${year}-${String(count + 1).padStart(3, '0')}`;
  });

  ipcMain.handle('get-next-receipt-number', () => {
    const year = new Date().getFullYear();
    const res = db.exec(`SELECT receiptNumber FROM Candidates WHERE receiptNumber LIKE 'REC-${year}-%' ORDER BY receiptNumber DESC LIMIT 1`);
    let next = 1;
    if (res.length > 0 && res[0].values.length > 0) {
      const last = res[0].values[0][0];
      const num = parseInt(last.split('-')[2], 10);
      if (!isNaN(num)) next = num + 1;
    }
    return `REC-${year}-${String(next).padStart(3, '0')}`;
  });

  // ── Admissions ──
  ipcMain.handle('get-pending-admissions', () => {
    return resultToObjects(db.exec("SELECT * FROM Candidates WHERE status = 'REGISTERED' ORDER BY registeredDate ASC"));
  });

  ipcMain.handle('add-admission-review', (event, { candidateId, reviewDate, reviewedBy, decision, documentsVerified, notes }) => {
    try {
      db.run(`INSERT INTO AdmissionReviews (candidateId, reviewDate, reviewedBy, decision, documentsVerified, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [candidateId, reviewDate, reviewedBy, decision, JSON.stringify(documentsVerified), notes]);
      
      let newStatus = 'REGISTERED';
      let newStage = 1;
      if (decision === 'APPROVED') {
        newStatus = 'MEDICAL_PENDING';
        newStage = 2;
      } else if (decision === 'REJECTED') {
        newStatus = 'REJECTED';
        newStage = 1; // Stay at stage 1 or move to a special stage? We'll keep 1.
      }
      // ON_HOLD stays REGISTERED but we have a record.
      
      if (decision === 'APPROVED' || decision === 'REJECTED') {
        db.run('UPDATE Candidates SET status = ?, stage = ? WHERE id = ?', [newStatus, newStage, candidateId]);
      }
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-admission-reviews', (event, candidateId) => {
    return resultToObjects(db.exec(`SELECT * FROM AdmissionReviews WHERE candidateId = '${candidateId}' ORDER BY id DESC`));
  });

  ipcMain.handle('get-admission-stats', () => {
    const today = new Date().toISOString().split('T')[0];
    const pending = db.exec("SELECT COUNT(*) FROM Candidates WHERE status = 'REGISTERED'");
    const admittedToday = db.exec(`SELECT COUNT(*) FROM AdmissionReviews WHERE decision = 'APPROVED' AND reviewDate LIKE '${today}%'`);
    const rejectedHold = db.exec("SELECT COUNT(*) FROM AdmissionReviews WHERE decision IN ('REJECTED', 'ON_HOLD')");
    
    return {
      pending: pending.length > 0 ? pending[0].values[0][0] : 0,
      admittedToday: admittedToday.length > 0 ? admittedToday[0].values[0][0] : 0,
      rejectedHold: rejectedHold.length > 0 ? rejectedHold[0].values[0][0] : 0,
    };
  });

  // ── Batches & Scheduling ──
  ipcMain.handle('get-batches', () => {
    const query = `
      SELECT b.*, (SELECT COUNT(*) FROM Candidates c WHERE c.batchPreference = b.batchCode) as candidateCount 
      FROM Batches b 
      ORDER BY b.id DESC
    `;
    return resultToObjects(db.exec(query));
  });

  ipcMain.handle('add-batch', (event, { name, type, maxCapacity, licenseCategory, startDate, endDate, sessionType, timeSlot, sessionDays, instructorId, vehicleId }) => {
    try {
      const year = new Date().getFullYear();
      const res = db.exec(`SELECT COUNT(*) FROM Batches WHERE batchCode LIKE 'BCH-${year}-%'`);
      const count = res.length > 0 ? res[0].values[0][0] : 0;
      const batchCode = `BCH-${year}-${String(count + 1).padStart(3, '0')}`;
      
      db.run("INSERT INTO Batches (batchCode, name, type, maxCapacity, licenseCategory, startDate, endDate, sessionType, timeSlot, sessionDays, instructorId, vehicleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [batchCode, name, type, maxCapacity || 30, licenseCategory || null, startDate || null, endDate || null, sessionType || null, timeSlot || null, sessionDays || null, instructorId || null, vehicleId || null]);
      saveDatabase();
      return { success: true, batchCode };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-batch-status', (event, { batchId, status }) => {
    try {
      db.run("UPDATE Batches SET status = ? WHERE id = ?", [status, batchId]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-batch', (event, { id, name, type, maxCapacity, licenseCategory, startDate, endDate, sessionType, timeSlot, sessionDays, instructorId, vehicleId }) => {
    try {
      db.run("UPDATE Batches SET name = ?, type = ?, maxCapacity = ?, licenseCategory = ?, startDate = ?, endDate = ?, sessionType = ?, timeSlot = ?, sessionDays = ?, instructorId = ?, vehicleId = ? WHERE id = ?", 
        [name, type, maxCapacity, licenseCategory || null, startDate || null, endDate || null, sessionType || null, timeSlot || null, sessionDays || null, instructorId || null, vehicleId || null, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-batch', (event, id) => {
    try {
      // Unassign candidates
      const current = db.exec(`SELECT batchCode FROM Batches WHERE id = ${id}`);
      if (current.length > 0) {
        const batchCode = current[0].values[0][0];
        db.run("UPDATE Candidates SET batchPreference = NULL WHERE batchPreference = ?", [batchCode]);
      }
      // Delete sessions
      db.run("DELETE FROM BatchSessions WHERE batchId = ?", [id]);
      // Delete batch
      db.run("DELETE FROM Batches WHERE id = ?", [id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-batch-sessions', () => {
    return resultToObjects(db.exec("SELECT * FROM BatchSessions"));
  });

  ipcMain.handle('add-batch-session', (event, { batchId, title, startTime, endTime, instructorId, vehicleId, locationArea, vehicleType, sessionType }) => {
    try {
      if (instructorId) {
        const insCheck = db.exec(`SELECT * FROM BatchSessions WHERE instructorId = '${instructorId}' AND ((startTime <= '${startTime}' AND endTime > '${startTime}') OR (startTime < '${endTime}' AND endTime >= '${endTime}') OR (startTime >= '${startTime}' AND endTime <= '${endTime}'))`);
        if (insCheck.length > 0) throw new Error("Instructor is already booked for another session during this time.");
      }
      if (vehicleId) {
        const vehCheck = db.exec(`SELECT * FROM BatchSessions WHERE vehicleId = '${vehicleId}' AND ((startTime <= '${startTime}' AND endTime > '${startTime}') OR (startTime < '${endTime}' AND endTime >= '${endTime}') OR (startTime >= '${startTime}' AND endTime <= '${endTime}'))`);
        if (vehCheck.length > 0) throw new Error("Vehicle is already booked for another session during this time.");
      }

      db.run("INSERT INTO BatchSessions (batchId, title, startTime, endTime, instructorId, vehicleId, locationArea, vehicleType, sessionType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [batchId, title, startTime, endTime, instructorId || null, vehicleId || null, locationArea || '', vehicleType || '', sessionType || 'Practical']);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-batch-session', (event, { id, startTime, endTime, title, instructorId, vehicleId, locationArea, vehicleType, sessionType }) => {
    try {
      if (instructorId || vehicleId) {
        // Only check if we have these provided
        if (instructorId) {
          const insCheck = db.exec(`SELECT * FROM BatchSessions WHERE id != ${id} AND instructorId = '${instructorId}' AND ((startTime <= '${startTime}' AND endTime > '${startTime}') OR (startTime < '${endTime}' AND endTime >= '${endTime}') OR (startTime >= '${startTime}' AND endTime <= '${endTime}'))`);
          if (insCheck.length > 0) throw new Error("Instructor is already booked for another session during this time.");
        }
        if (vehicleId) {
          const vehCheck = db.exec(`SELECT * FROM BatchSessions WHERE id != ${id} AND vehicleId = '${vehicleId}' AND ((startTime <= '${startTime}' AND endTime > '${startTime}') OR (startTime < '${endTime}' AND endTime >= '${endTime}') OR (startTime >= '${startTime}' AND endTime <= '${endTime}'))`);
          if (vehCheck.length > 0) throw new Error("Vehicle is already booked for another session during this time.");
        }
      }

      if (title !== undefined) {
        db.run("UPDATE BatchSessions SET startTime = ?, endTime = ?, title = ?, instructorId = ?, vehicleId = ?, locationArea = ?, vehicleType = ?, sessionType = ? WHERE id = ?", 
          [startTime, endTime, title, instructorId || null, vehicleId || null, locationArea || '', vehicleType || '', sessionType || 'Practical', id]);
      } else {
        // Drag and drop case (only times updated)
        db.run("UPDATE BatchSessions SET startTime = ?, endTime = ? WHERE id = ?", [startTime, endTime, id]);
      }
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-batch-session', (event, id) => {
    try {
      db.run("DELETE FROM BatchSessions WHERE id = ?", [id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Smart Batching ──
  ipcMain.handle('get-candidates-by-exam-date', (event, { examType, date }) => {
    try {
      let query = "";
      if (examType === 'Written') {
        // Enforce Stage 3 (Medical Approved) for written exam candidates
        query = `SELECT DISTINCT c.* FROM Candidates c JOIN WrittenExams e ON c.id = e.candidateId WHERE e.examDate LIKE '${date}%' AND c.stage = 3 AND (e.result = 'Pending' OR e.result IS NULL OR e.result = '') AND (c.batchPreference IS NULL OR c.batchPreference NOT IN (SELECT batchCode FROM Batches WHERE status IN ('Active', 'Upcoming')))`;
      } else {
        // Enforce Stage 5 (Eligible for Trial / Trial Exam Scheduled) for practical trial candidates
        query = `SELECT DISTINCT c.* FROM Candidates c JOIN PracticalExams e ON c.id = e.candidateId WHERE e.examDate LIKE '${date}%' AND c.stage = 5 AND c.status IN ('ELIGIBLE_FOR_TRIAL', 'TRIAL_EXAM_SCHEDULED') AND (e.result = 'Pending' OR e.result IS NULL OR e.result = '') AND (c.batchPreference IS NULL OR c.batchPreference NOT IN (SELECT batchCode FROM Batches WHERE status IN ('Active', 'Upcoming')))`;
      }
      return { success: true, candidates: resultToObjects(db.exec(query)) };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-candidates-by-area-vehicle', (event, { area, transmission }) => {
    try {
      const areaFilter = area ? `AND address LIKE '%${area}%'` : "";
      const transFilter = transmission ? `AND transmissionPref = '${transmission}'` : "";
      // Enforce Stage 4 (Learner Permit Issued / In Training) or Stage 5 (Eligible for Trial - for extra practice) for practical driving sessions
      const query = `SELECT * FROM Candidates WHERE (stage = 4 OR (stage = 5 AND status = 'ELIGIBLE_FOR_TRIAL')) AND status != 'REJECTED' ${areaFilter} ${transFilter} AND (batchPreference IS NULL OR batchPreference NOT IN (SELECT batchCode FROM Batches WHERE status IN ('Active', 'Upcoming')))`;
      return { success: true, candidates: resultToObjects(db.exec(query)) };
    } catch (err) { return { success: false, message: err.message }; }
  });
  
  ipcMain.handle('assign-candidates-to-batch', (event, { batchCode, candidateIds }) => {
    try {
      if (!candidateIds || candidateIds.length === 0) return { success: true };
      const placeholders = candidateIds.map(() => '?').join(',');
      db.run(`UPDATE Candidates SET batchPreference = ? WHERE id IN (${placeholders})`, [batchCode, ...candidateIds]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('remove-candidate-from-batch', (event, { candidateId }) => {
    try {
      db.run(`UPDATE Candidates SET batchPreference = NULL WHERE id = ?`, [candidateId]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-batch-candidates', (event, batchCode) => {
    return resultToObjects(db.exec(`SELECT * FROM Candidates WHERE batchPreference = '${batchCode}'`));
  });

  // ── Holidays ──
  ipcMain.handle('get-holidays', () => {
    return resultToObjects(db.exec("SELECT * FROM Holidays ORDER BY date ASC"));
  });

  ipcMain.handle('add-holiday', (event, { date, name, type }) => {
    try {
      db.run("INSERT INTO Holidays (date, name, type) VALUES (?, ?, ?)", [date, name, type]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-holiday', (event, id) => {
    try {
      db.run("DELETE FROM Holidays WHERE id = ?", [id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Vehicles ──
  ipcMain.handle('get-vehicles', () => {
    return resultToObjects(db.exec("SELECT * FROM Vehicles"));
  });

  ipcMain.handle('add-vehicle', (event, { id, make, model, plateNumber, transmission, type, status, color, year, chassisNumber, engineNumber, licenseCategory, revenueLicenseExpiry, insuranceExpiry, drivingSchoolLicenseExpiry, emissionTestExpiry, purchasePrice, purchaseDate, currentMileage, defaultInstructorId }) => {
    try {
      db.run(`INSERT INTO Vehicles (id, make, model, plateNumber, transmission, type, status, color, year, chassisNumber, engineNumber, licenseCategory, revenueLicenseExpiry, insuranceExpiry, drivingSchoolLicenseExpiry, emissionTestExpiry, purchasePrice, purchaseDate, currentMileage, defaultInstructorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, make, model, plateNumber, transmission || 'Manual', type, status || 'Active', color, year, chassisNumber, engineNumber, licenseCategory, revenueLicenseExpiry, insuranceExpiry, drivingSchoolLicenseExpiry, emissionTestExpiry, purchasePrice || 0, purchaseDate, currentMileage || 0, defaultInstructorId]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-vehicle', (event, { id, make, model, plateNumber, transmission, type, status, color, year, chassisNumber, engineNumber, licenseCategory, revenueLicenseExpiry, insuranceExpiry, drivingSchoolLicenseExpiry, emissionTestExpiry, purchasePrice, purchaseDate, currentMileage, defaultInstructorId }) => {
    try {
      db.run(`UPDATE Vehicles SET make=?, model=?, plateNumber=?, transmission=?, type=?, status=?, color=?, year=?, chassisNumber=?, engineNumber=?, licenseCategory=?, revenueLicenseExpiry=?, insuranceExpiry=?, drivingSchoolLicenseExpiry=?, emissionTestExpiry=?, purchasePrice=?, purchaseDate=?, currentMileage=?, defaultInstructorId=? WHERE id=?`,
        [make, model, plateNumber, transmission, type, status, color, year, chassisNumber, engineNumber, licenseCategory, revenueLicenseExpiry, insuranceExpiry, drivingSchoolLicenseExpiry, emissionTestExpiry, purchasePrice, purchaseDate, currentMileage, defaultInstructorId, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-vehicle', (event, id) => {
    try {
      db.run("DELETE FROM Vehicles WHERE id = ?", [id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-next-vehicle-id', () => {
    const res = db.exec(`SELECT COUNT(*) FROM Vehicles`);
    const count = res.length > 0 ? res[0].values[0][0] : 0;
    return `VHC-${String(count + 1).padStart(3, '0')}`;
  });

  // ── Maintenance Logs ──
  ipcMain.handle('get-maintenance-logs', (event, vehicleId) => {
    return resultToObjects(db.exec(`SELECT * FROM MaintenanceLogs WHERE vehicleId = '${vehicleId}' ORDER BY serviceDate DESC`));
  });

  ipcMain.handle('add-maintenance-log', (event, { vehicleId, serviceDate, mileage, description, partsReplaced, cost, nextServiceMileage, nextServiceDate }) => {
    try {
      db.run(`INSERT INTO MaintenanceLogs (vehicleId, serviceDate, mileage, description, partsReplaced, cost, nextServiceMileage, nextServiceDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [vehicleId, serviceDate, mileage || 0, description, partsReplaced, cost || 0, nextServiceMileage || 0, nextServiceDate]);
      db.run(`UPDATE Vehicles SET currentMileage = ? WHERE id = ?`, [mileage || 0, vehicleId]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Fuel Logs ──
  ipcMain.handle('get-fuel-logs', (event, vehicleId) => {
    return resultToObjects(db.exec(`SELECT * FROM FuelLogs WHERE vehicleId = '${vehicleId}' ORDER BY date DESC`));
  });

  ipcMain.handle('add-fuel-log', (event, { vehicleId, date, volumeLiters, cost, odometerReading }) => {
    try {
      db.run(`INSERT INTO FuelLogs (vehicleId, date, volumeLiters, cost, odometerReading) VALUES (?, ?, ?, ?, ?)`,
        [vehicleId, date, volumeLiters || 0, cost || 0, odometerReading || 0]);
      db.run(`UPDATE Vehicles SET currentMileage = ? WHERE id = ?`, [odometerReading || 0, vehicleId]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Instructors & Batta ──
  ipcMain.handle('get-instructors', () => {
    const query = `
      SELECT i.*, 
        (SELECT COUNT(DISTINCT batchId) FROM BatchSessions WHERE instructorId = i.id) as assignedBatchCount
      FROM Instructors i
    `;
    return resultToObjects(db.exec(query));
  });

  ipcMain.handle('add-instructor', (event, data) => {
    try {
      db.run(`INSERT INTO Instructors (id, name, phone, nic, licenseNumber, dailyBaseAllowance, perSessionCommission, email, address, gender, dateJoined, licenseCategories, licenseExpiryDate, status, workingDays, workingHours, isAvailable, allowedVehicles, allowedVehicleCategories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.id, data.name, data.phone, data.nic, data.licenseNumber, data.dailyBaseAllowance || 0, data.perSessionCommission || 0, data.email, data.address, data.gender, data.dateJoined, data.licenseCategories, data.licenseExpiryDate, data.status || 'Active', data.workingDays, data.workingHours, data.isAvailable !== undefined ? data.isAvailable : 1, data.allowedVehicles, data.allowedVehicleCategories]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-instructor', (event, data) => {
    try {
      db.run(`UPDATE Instructors SET name=?, phone=?, nic=?, licenseNumber=?, dailyBaseAllowance=?, perSessionCommission=?, email=?, address=?, gender=?, dateJoined=?, licenseCategories=?, licenseExpiryDate=?, status=?, workingDays=?, workingHours=?, isAvailable=?, allowedVehicles=?, allowedVehicleCategories=? WHERE id=?`,
        [data.name, data.phone, data.nic, data.licenseNumber, data.dailyBaseAllowance, data.perSessionCommission, data.email, data.address, data.gender, data.dateJoined, data.licenseCategories, data.licenseExpiryDate, data.status, data.workingDays, data.workingHours, data.isAvailable, data.allowedVehicles, data.allowedVehicleCategories, data.id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('delete-instructor', (event, id) => {
    try {
      db.run("DELETE FROM InstructorLeaves WHERE instructorId = ?", [id]);
      db.run("DELETE FROM InstructorDocuments WHERE instructorId = ?", [id]);
      db.run("DELETE FROM Instructors WHERE id = ?", [id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });
  
  // ── Instructor Leaves ──
  ipcMain.handle('get-instructor-leaves', (event, instructorId) => {
    return resultToObjects(db.exec(`SELECT * FROM InstructorLeaves WHERE instructorId = '${instructorId}' ORDER BY startDate DESC`));
  });

  ipcMain.handle('add-instructor-leave', (event, { instructorId, startDate, endDate, reason, status }) => {
    try {
      db.run(`INSERT INTO InstructorLeaves (instructorId, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?)`,
        [instructorId, startDate, endDate, reason, status || 'Pending']);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-instructor-leave-status', (event, { id, status }) => {
    try {
      db.run(`UPDATE InstructorLeaves SET status = ? WHERE id = ?`, [status, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Instructor Documents ──
  ipcMain.handle('get-instructor-documents', (event, instructorId) => {
    return resultToObjects(db.exec(`SELECT * FROM InstructorDocuments WHERE instructorId = '${instructorId}' ORDER BY uploadDate DESC`));
  });

  ipcMain.handle('add-instructor-document', (event, { instructorId, documentType, fileName, uploadDate, status }) => {
    try {
      db.run(`INSERT INTO InstructorDocuments (instructorId, documentType, fileName, uploadDate, status) VALUES (?, ?, ?, ?, ?)`,
        [instructorId, documentType, fileName, uploadDate, status || 'Uploaded']);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });
  
  ipcMain.handle('get-next-instructor-id', () => {
    const res = db.exec(`SELECT COUNT(*) FROM Instructors`);
    const count = res.length > 0 ? res[0].values[0][0] : 0;
    return `INS-${String(count + 1).padStart(3, '0')}`;
  });

  ipcMain.handle('calculate-instructor-shifts', (event, { startDate, endDate }) => {
    // Dynamically calculate shifts from BatchSessions
    try {
      const query = `
        SELECT 
          i.id as instructorId, i.name as instructorName, 
          i.dailyBaseAllowance, i.perSessionCommission,
          substr(s.startTime, 1, 10) as shiftDate,
          COUNT(s.id) as totalSessions
        FROM BatchSessions s
        JOIN Instructors i ON s.instructorId = i.id
        WHERE substr(s.startTime, 1, 10) >= '${startDate}' 
          AND substr(s.startTime, 1, 10) <= '${endDate}'
        GROUP BY i.id, shiftDate
        ORDER BY shiftDate DESC
      `;
      const calculated = resultToObjects(db.exec(query));
      
      // Get saved shift statuses
      const savedQuery = `SELECT * FROM InstructorShifts WHERE shiftDate >= '${startDate}' AND shiftDate <= '${endDate}'`;
      const savedShifts = resultToObjects(db.exec(savedQuery));
      
      const shifts = calculated.map(calc => {
        const totalAllowance = calc.dailyBaseAllowance + (calc.totalSessions * calc.perSessionCommission);
        const saved = savedShifts.find(s => s.instructorId === calc.instructorId && s.shiftDate === calc.shiftDate);
        return {
          id: saved ? saved.id : null,
          instructorId: calc.instructorId,
          instructorName: calc.instructorName,
          shiftDate: calc.shiftDate,
          totalSessions: calc.totalSessions,
          dailyBaseAllowance: calc.dailyBaseAllowance,
          perSessionCommission: calc.perSessionCommission,
          calculatedAllowance: totalAllowance,
          status: saved ? saved.status : 'Pending'
        };
      });
      return { success: true, shifts };
    } catch (err) { return { success: false, message: err.message }; }
  });
  
  ipcMain.handle('mark-shift-paid', (event, { instructorId, shiftDate, totalSessions, calculatedAllowance }) => {
    try {
      const exist = db.exec(`SELECT id FROM InstructorShifts WHERE instructorId = '${instructorId}' AND shiftDate = '${shiftDate}'`);
      if (exist.length > 0 && exist[0].values.length > 0) {
        db.run(`UPDATE InstructorShifts SET status = 'Paid', totalSessions = ?, calculatedAllowance = ? WHERE instructorId = ? AND shiftDate = ?`, 
          [totalSessions, calculatedAllowance, instructorId, shiftDate]);
      } else {
        db.run(`INSERT INTO InstructorShifts (instructorId, shiftDate, totalSessions, calculatedAllowance, status) VALUES (?, ?, ?, ?, 'Paid')`,
          [instructorId, shiftDate, totalSessions, calculatedAllowance]);
      }
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Candidate Attendance ──
  ipcMain.handle('get-candidate-attendance', (event, { candidateId, batchId, sessionDate } = {}) => {
    try {
      let query = 'SELECT * FROM CandidateAttendance';
      let conditions = [];
      if (candidateId) conditions.push(`candidateId = '${candidateId}'`);
      if (batchId) conditions.push(`batchId = ${batchId}`);
      if (sessionDate) conditions.push(`sessionDate = '${sessionDate}'`);
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      return { success: true, attendance: resultToObjects(db.exec(query)) };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('add-candidate-attendance', (event, { records }) => {
    try {
      const stmtDelete = db.prepare(`DELETE FROM CandidateAttendance WHERE candidateId = ? AND sessionDate = ? AND sessionType = ?`);
      const stmtInsert = db.prepare(`INSERT INTO CandidateAttendance (candidateId, batchId, sessionDate, sessionType, status, remarks) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const r of records) {
        stmtDelete.run([r.candidateId, r.sessionDate, r.sessionType]);
        stmtInsert.run([r.candidateId, r.batchId || null, r.sessionDate, r.sessionType, r.status, r.remarks || '']);
      }
      stmtDelete.free();
      stmtInsert.free();
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-candidate-attendance-stats', (event, { candidateId } = {}) => {
    try {
      let query = `
        SELECT 
          candidateId,
          COUNT(*) as totalSessions,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateCount,
          SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as halfDayCount,
          SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leaveCount,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentCount
        FROM CandidateAttendance
      `;
      if (candidateId) {
        query += ` WHERE candidateId = '${candidateId}' GROUP BY candidateId`;
      } else {
        query += ` GROUP BY candidateId`;
      }
      const raw = resultToObjects(db.exec(query));
      const stats = raw.map(r => {
        const total = r.totalSessions || 0;
        const attended = r.presentCount + r.lateCount + (r.halfDayCount * 0.5) + r.leaveCount;
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
        return {
          ...r,
          attendancePercentage: percentage,
          isEligible: percentage >= 80
        };
      });
      return { success: true, stats: candidateId ? (stats[0] || { candidateId, totalSessions: 0, presentCount: 0, lateCount: 0, halfDayCount: 0, leaveCount: 0, absentCount: 0, attendancePercentage: 100, isEligible: true }) : stats };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Instructor Attendance ──
  ipcMain.handle('get-instructor-attendance', (event, { instructorId, startDate, endDate } = {}) => {
    try {
      let query = `
        SELECT ia.*, i.name as instructorName 
        FROM InstructorAttendance ia
        JOIN Instructors i ON ia.instructorId = i.id
      `;
      let conditions = [];
      if (instructorId) conditions.push(`ia.instructorId = '${instructorId}'`);
      if (startDate) conditions.push(`ia.attendanceDate >= '${startDate}'`);
      if (endDate) conditions.push(`ia.attendanceDate <= '${endDate}'`);
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY ia.attendanceDate DESC, ia.id DESC';
      return { success: true, attendance: resultToObjects(db.exec(query)) };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('add-instructor-attendance', (event, r) => {
    try {
      db.run(`DELETE FROM InstructorAttendance WHERE instructorId = ? AND attendanceDate = ?`, [r.instructorId, r.attendanceDate]);
      db.run(`INSERT INTO InstructorAttendance (instructorId, attendanceDate, checkIn, checkOut, status) VALUES (?, ?, ?, ?, ?)`,
        [r.instructorId, r.attendanceDate, r.checkIn || null, r.checkOut || null, r.status]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-instructor-attendance', (event, { id, checkOut, status }) => {
    try {
      db.run(`UPDATE InstructorAttendance SET checkOut = ?, status = ? WHERE id = ?`, [checkOut, status, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Staff Registry & Attendance ──
  ipcMain.handle('get-staff-list', () => {
    try {
      return { success: true, staff: resultToObjects(db.exec(`SELECT * FROM Staff ORDER BY name ASC`)) };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('add-staff', (event, s) => {
    try {
      db.run(`INSERT INTO Staff (id, name, phone, role, status) VALUES (?, ?, ?, ?, ?)`,
        [s.id, s.name, s.phone, s.role, s.status || 'Active']);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('get-staff-attendance', (event, { staffId, startDate, endDate } = {}) => {
    try {
      let query = `
        SELECT sa.*, s.name as staffName, s.role as staffRole
        FROM StaffAttendance sa
        JOIN Staff s ON sa.staffId = s.id
      `;
      let conditions = [];
      if (staffId) conditions.push(`sa.staffId = '${staffId}'`);
      if (startDate) conditions.push(`sa.attendanceDate >= '${startDate}'`);
      if (endDate) conditions.push(`sa.attendanceDate <= '${endDate}'`);
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY sa.attendanceDate DESC, sa.id DESC';
      return { success: true, attendance: resultToObjects(db.exec(query)) };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('add-staff-attendance', (event, r) => {
    try {
      db.run(`DELETE FROM StaffAttendance WHERE staffId = ? AND attendanceDate = ?`, [r.staffId, r.attendanceDate]);
      db.run(`INSERT INTO StaffAttendance (staffId, attendanceDate, checkIn, checkOut, status) VALUES (?, ?, ?, ?, ?)`,
        [r.staffId, r.attendanceDate, r.checkIn || null, r.checkOut || null, r.status]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('update-staff-attendance', (event, { id, checkOut, status }) => {
    try {
      db.run(`UPDATE StaffAttendance SET checkOut = ?, status = ? WHERE id = ?`, [checkOut, status, id]);
      saveDatabase();
      return { success: true };
    } catch (err) { return { success: false, message: err.message }; }
  });

  // ── Combined Reports ──
  ipcMain.handle('get-attendance-report', (event, { type, startDate, endDate, batchId, status }) => {
    try {
      if (type === 'Candidate') {
        let query = `
          SELECT ca.*, c.name as candidateName, b.name as batchName
          FROM CandidateAttendance ca
          JOIN Candidates c ON ca.candidateId = c.id
          LEFT JOIN Batches b ON ca.batchId = b.id
          WHERE ca.sessionDate >= '${startDate}' AND ca.sessionDate <= '${endDate}'
        `;
        if (batchId) query += ` AND ca.batchId = ${batchId}`;
        if (status) query += ` AND ca.status = '${status}'`;
        query += ` ORDER BY ca.sessionDate DESC, c.name ASC`;
        return { success: true, data: resultToObjects(db.exec(query)) };
      } else if (type === 'Instructor') {
        let query = `
          SELECT ia.*, i.name as instructorName
          FROM InstructorAttendance ia
          JOIN Instructors i ON ia.instructorId = i.id
          WHERE ia.attendanceDate >= '${startDate}' AND ia.attendanceDate <= '${endDate}'
        `;
        if (status) query += ` AND ia.status = '${status}'`;
        query += ` ORDER BY ia.attendanceDate DESC, i.name ASC`;
        return { success: true, data: resultToObjects(db.exec(query)) };
      } else if (type === 'Staff') {
        let query = `
          SELECT sa.*, s.name as staffName, s.role as staffRole
          FROM StaffAttendance sa
          JOIN Staff s ON sa.staffId = s.id
          WHERE sa.attendanceDate >= '${startDate}' AND sa.attendanceDate <= '${endDate}'
        `;
        if (status) query += ` AND sa.status = '${status}'`;
        query += ` ORDER BY sa.attendanceDate DESC, s.name ASC`;
        return { success: true, data: resultToObjects(db.exec(query)) };
      } else if (type === 'AbsentList') {
        let query = `
          SELECT ca.*, c.name as candidateName, c.phone as candidatePhone, b.name as batchName
          FROM CandidateAttendance ca
          JOIN Candidates c ON ca.candidateId = c.id
          LEFT JOIN Batches b ON ca.batchId = b.id
          WHERE ca.sessionDate >= '${startDate}' AND ca.sessionDate <= '${endDate}' AND ca.status = 'Absent'
          ORDER BY ca.sessionDate DESC, c.name ASC
        `;
        return { success: true, data: resultToObjects(db.exec(query)) };
      } else if (type === 'MonthlySummary') {
        let query = `
          SELECT 
            c.id as candidateId, c.name as candidateName, b.name as batchName,
            COUNT(ca.id) as totalSessions,
            SUM(CASE WHEN ca.status = 'Present' THEN 1 ELSE 0 END) as presentCount,
            SUM(CASE WHEN ca.status = 'Absent' THEN 1 ELSE 0 END) as absentCount,
            SUM(CASE WHEN ca.status = 'Late' THEN 1 ELSE 0 END) as lateCount,
            SUM(CASE WHEN ca.status = 'Half Day' THEN 1 ELSE 0 END) as halfDayCount,
            SUM(CASE WHEN ca.status = 'Leave' THEN 1 ELSE 0 END) as leaveCount
          FROM Candidates c
          LEFT JOIN Batches b ON c.batchPreference = b.name
          LEFT JOIN CandidateAttendance ca ON c.id = ca.candidateId AND ca.sessionDate >= '${startDate}' AND ca.sessionDate <= '${endDate}'
          GROUP BY c.id
          ORDER BY c.name ASC
        `;
        return { success: true, data: resultToObjects(db.exec(query)) };
      }
      return { success: false, message: 'Invalid report type' };
    } catch (err) { return { success: false, message: err.message }; }
  });
};
