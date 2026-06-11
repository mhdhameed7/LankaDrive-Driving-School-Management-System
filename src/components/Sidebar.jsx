import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CalendarDays, 
  CarFront, 
  UserSquare2, 
  CheckSquare, 
  CreditCard, 
  Award, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut 
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Candidates', path: '/candidates', icon: <Users size={20} /> },
    { name: 'Admission', path: '/admission', icon: <ClipboardList size={20} /> },
    { name: 'Batches', path: '/batches', icon: <CalendarDays size={20} /> },
    { name: 'Vehicles', path: '/vehicles', icon: <CarFront size={20} /> },
    { name: 'Instructors', path: '/instructors', icon: <UserSquare2 size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <CheckSquare size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Exams', path: '/exams', icon: <Award size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Messages', path: '/messages', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 shrink-0 h-screen bg-[#1e3a5f] text-white flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CarFront className="text-[#f59e0b]" size={28} />
          LankaDrive
        </h1>
        <p className="text-xs text-white/70 mt-1">Admin Portal</p>
      </div>
      
      <div className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#f59e0b] text-[#1e3a5f] font-medium'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-semibold text-sm">{user?.username?.substring(0, 2).toUpperCase() || 'AD'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'Admin User'}</p>
            <p className="text-xs text-white/60 capitalize">{user?.role || 'System Admin'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 text-sm font-medium group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
