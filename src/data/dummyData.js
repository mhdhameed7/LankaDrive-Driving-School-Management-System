export const initializeDummyData = () => {
  if (!localStorage.getItem('students')) {
    const students = [
      { id: 'DS-2025-001', name: 'Kasun Perera', nic: '951234567V', dob: '1995-05-15', phone: '0771234567', email: 'kasun@gmail.com', address: '123 Main St, Colombo', licenseClass: 'Class 3', emergencyContact: '0719876543', status: 'In Training', stage: 5, registeredDate: '2025-01-10' },
      { id: 'DS-2025-002', name: 'Nimali Silva', nic: '987654321V', dob: '1998-08-20', phone: '0712345678', email: 'nimali@yahoo.com', address: '45 Kandy Rd, Kandy', licenseClass: 'Class 2', emergencyContact: '0778765432', status: 'Exam Ready', stage: 6, registeredDate: '2025-01-12' },
      { id: 'DS-2025-003', name: 'Ruwan Kumara', nic: '200112345678', dob: '2001-02-10', phone: '0753456789', email: 'ruwan@outlook.com', address: '78 Galle Rd, Galle', licenseClass: 'Class 1', emergencyContact: '0787654321', status: 'Certified', stage: 8, registeredDate: '2025-01-05' },
      { id: 'DS-2025-004', name: 'Samanthi Fernando', nic: '905678123V', dob: '1990-11-25', phone: '0724567890', email: 'samanthi@gmail.com', address: '12 Negombo Rd, Negombo', licenseClass: 'Class 3', emergencyContact: '0756543210', status: 'Prospective', stage: 1, registeredDate: '2025-02-01' },
      { id: 'DS-2025-005', name: 'Chaminda Peiris', nic: '198512345678', dob: '1985-04-30', phone: '0785678901', email: 'chaminda@hotmail.com', address: '56 High Level Rd, Maharagama', licenseClass: 'Class 4', emergencyContact: '0725432109', status: 'Enrolled', stage: 2, registeredDate: '2025-02-05' },
    ];
    localStorage.setItem('students', JSON.stringify(students));
  }

  if (!localStorage.getItem('instructors')) {
    const instructors = [
      { id: 'INS-001', name: 'Kamal Jayasinghe', nic: '851234567V', licenseNumber: 'B123456', classes: ['Class 1', 'Class 2', 'Class 3'], phone: '0711122334', address: 'No 5, Temple Rd, Colombo', joinedDate: '2020-01-15', rating: 4.8 },
      { id: 'INS-002', name: 'Sunil Rathnayake', nic: '785678123V', licenseNumber: 'B987654', classes: ['Class 3', 'Class 4'], phone: '0772233445', address: 'No 10, Station Rd, Kandy', joinedDate: '2018-05-20', rating: 4.5 },
      { id: 'INS-003', name: 'Ajith Perera', nic: '821234567V', licenseNumber: 'B456789', classes: ['Class 1', 'Class 3', 'Class 5'], phone: '0723344556', address: 'No 2, Beach Rd, Galle', joinedDate: '2021-11-10', rating: 4.2 },
    ];
    localStorage.setItem('instructors', JSON.stringify(instructors));
  }

  if (!localStorage.getItem('vehicles')) {
    const vehicles = [
      { id: 'V-001', regNumber: 'CBA-1234', makeModel: 'Toyota Aqua', type: 'Car', fuelType: 'Hybrid', year: 2015, seats: 5, insuranceExpiry: '2025-12-31', revenueExpiry: '2025-10-15', status: 'Available' },
      { id: 'V-002', regNumber: 'WP BGH-5678', makeModel: 'Bajaj RE', type: 'Three-Wheeler', fuelType: 'Petrol', year: 2018, seats: 3, insuranceExpiry: '2025-08-20', revenueExpiry: '2025-07-10', status: 'In Use' },
    ];
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }
  
  if (!localStorage.getItem('payments')) {
    const payments = [
      { id: 'PAY-001', studentId: 'DS-2025-001', amount: 15000, date: '2025-01-10', method: 'Cash', ref: 'REC-1001', receivedBy: 'Admin' },
      { id: 'PAY-002', studentId: 'DS-2025-002', amount: 25000, date: '2025-01-12', method: 'Bank Transfer', ref: 'REF-87654321', receivedBy: 'Admin' },
      { id: 'PAY-003', studentId: 'DS-2025-003', amount: 35000, date: '2025-01-05', method: 'Online', ref: 'ONL-123456', receivedBy: 'System' },
    ];
    localStorage.setItem('payments', JSON.stringify(payments));
  }

  if (!localStorage.getItem('batches')) {
    const batches = [
      { id: 'B-001', name: 'Jan-Morning-Car', startDate: '2025-01-15', endDate: '2025-03-15', timeSlot: 'Morning 6am-9am', instructorId: 'INS-001', vehicleId: 'V-001', status: 'Active' },
      { id: 'B-002', name: 'Feb-Weekend-Bike', startDate: '2025-02-01', endDate: '2025-04-01', timeSlot: 'Weekend', instructorId: 'INS-002', vehicleId: 'V-002', status: 'Upcoming' },
    ];
    localStorage.setItem('batches', JSON.stringify(batches));
  }
};
