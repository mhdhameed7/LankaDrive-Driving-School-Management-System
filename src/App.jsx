import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import Admission from './pages/Admission';
import Batches from './pages/Batches';
import Settings from './pages/Settings';
import Instructors from './pages/Instructors';
import InstructorProfile from './pages/InstructorProfile';
import Vehicles from './pages/Vehicles';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';


function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        
        <Route path="/" element={<ProtectedRoute><Layout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id" element={<CandidateProfile />} />
          <Route path="admission" element={<Admission />} />
          <Route path="batches" element={<Batches />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="instructors/:id" element={<InstructorProfile />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payments" element={<Payments />} />
          <Route path="exams" element={<div className="p-6">Exams Module Coming Soon</div>} />
          <Route path="reports" element={<div className="p-6">Reports Module Coming Soon</div>} />
          <Route path="messages" element={<div className="p-6">Messages Module Coming Soon</div>} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
