import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Map, User, LogOut, ShieldCheck, History, Activity 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, user, activeSessionCount, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
    { path: '/sessions', label: 'Broadcast Log', icon: <History size={20} /> },
    { path: '/students', label: 'Student Directory', icon: <Users size={20} /> },
    { path: '/geo', label: 'Geofence Zones', icon: <Map size={20} /> },
    { path: '/profile', label: 'Profile Settings', icon: <User size={20} /> },
  ];

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-[40] w-72 bg-stone-900 flex flex-col p-6 border-r border-stone-800 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* 1. FIXED HEADER */}
        <div className="flex items-center space-x-3 mb-8 px-2 shrink-0">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-900/20">
            <ShieldCheck size={24} className="text-stone-900" />
          </div>
          <span className="font-black tracking-tighter text-xl text-white uppercase italic">
            Smart<span className="text-amber-500">Adm</span>
          </span>
        </div>

        {/* 2. SCROLLABLE NAV AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              if (item.path === '/geo' && user?.role !== 'admin' && user?.role !== 'professor') return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-amber-500 text-stone-900 shadow-xl shadow-amber-900/40' 
                      : 'text-stone-500 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${isActive ? 'text-stone-900' : 'group-hover:text-amber-500'}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  {item.path === '/sessions' && activeSessionCount > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-stone-900 text-amber-500' : 'bg-amber-500 text-stone-900'
                    }`}>
                      {activeSessionCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. FIXED FOOTER (This moves the button up) */}
        <div className="pt-6 mt-6 border-t border-stone-800 shrink-0">
          <div className="px-4 py-4 bg-stone-800/30 rounded-2xl border border-white/5 mb-4">
            <p className="text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1">Node: {user?.name}</p>
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-bold text-amber-500/80 uppercase italic">
                 {user?.role} Access
               </span>
               <Activity size={12} className={activeSessionCount > 0 ? "text-green-500 animate-pulse" : "text-stone-600"} />
            </div>
          </div>

          <button 
            onClick={() => { setIsOpen(false); onLogout(); }}
            className="w-full flex items-center space-x-4 text-stone-500 hover:text-red-500 transition-all px-4 py-3 rounded-xl hover:bg-red-500/5 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-[3px]">Terminate Auth</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[30] lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;