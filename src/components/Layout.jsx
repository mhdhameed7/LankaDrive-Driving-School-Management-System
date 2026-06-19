import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ user, onLogout }) => {
  const location = useLocation();

  // Pages that need full-height, no-padding layout
  const fullHeightPages = ['/batches', '/vehicles', '/instructors', '/attendance', '/exams', '/reports'];
  const isFullHeight = fullHeightPages.some(path => location.pathname.includes(path));

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        <main
          className={`flex-1 overflow-hidden flex flex-col min-h-0 ${
            isFullHeight ? 'p-4' : 'p-6 overflow-y-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
