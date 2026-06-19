import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Calendar, CreditCard, Award, Car, Clock, ShieldAlert } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const title = path.replace('/', '');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const loadNotifications = async () => {
    try {
      const res = await window.api.getReminders();
      // Filter out completed ones
      const active = (res || []).filter(r => r.status !== 'Completed');
      setNotifications(active);
    } catch (err) {
      console.error("Failed to load notifications in Header", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 30 seconds to refresh notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const style = "shrink-0 p-1.5 rounded-lg border";
    switch (type) {
      case 'Payment':
        return <CreditCard size={16} className={`${style} bg-rose-50 text-rose-600 border-rose-100`} />;
      case 'Exam':
        return <Award size={16} className={`${style} bg-blue-50 text-blue-600 border-blue-100`} />;
      case 'Vehicle':
        return <Car size={16} className={`${style} bg-amber-50 text-amber-600 border-amber-100`} />;
      default:
        return <Clock size={16} className={`${style} bg-purple-50 text-purple-600 border-purple-100`} />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        <span className="text-gray-400 text-sm hidden md:inline-block">
          / LankaDrive Management
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students, NIC..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent w-64 bg-gray-50"
          />
        </div>
        
        {/* Bell Button / Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {/* Premium Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-[modalIn_0.15s_ease-out]">
              <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-extrabold text-[#1e3a5f] uppercase tracking-wider">Alerts & Reminders</span>
                {notifications.length > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">
                    {notifications.length} Active
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs font-semibold">
                    <ShieldAlert size={28} className="mx-auto text-slate-300 mb-2" />
                    No active notifications.
                  </div>
                ) : (
                  notifications.slice(0, 5).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/reminders');
                      }}
                      className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start"
                    >
                      {getNotificationIcon(item.type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                        {item.date && (
                          <span className="text-[9px] text-[#cbd5e1] font-bold mt-1 inline-block flex items-center gap-1">
                            <Calendar size={10} /> {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div 
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/reminders');
                }}
                className="p-3 bg-slate-50 border-t border-gray-100 text-center text-[10px] font-extrabold text-[#f59e0b] hover:text-[#d97706] hover:bg-slate-100/50 cursor-pointer transition-all uppercase tracking-wider block"
              >
                View All Notifications
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
