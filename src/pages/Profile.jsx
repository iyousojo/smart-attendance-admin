import React, { useState, useEffect } from 'react';
import { 
  UserCircle, Mail, CheckCircle2, 
  BarChart3, LogOut, ShieldCheck, 
  Loader2, Zap, Menu 
} from 'lucide-react';

const Profile = ({ user, onLogout, onUpdateUser, onOpenSidebar }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || "https://studentattendanceapi-v4hq.onrender.com/api";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
          setProfileData(data);
          // Sync local storage if backend has updated device info
          if (data.user?.deviceId && data.user.deviceId !== user?.deviceId) {
            onUpdateUser(data.user);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.deviceId, onUpdateUser, API_BASE]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-amber-600" size={40} />
        <p className="font-black uppercase italic text-stone-400 tracking-widest text-[10px]">Accessing Secure Node...</p>
      </div>
    </div>
  );

  const attendedCount = profileData?.attendedCount || 0;
  const lateCount = profileData?.lateCount || 0;
  const isBound = !!user?.deviceId;

  const stats = [
    { label: "Present Sessions", value: attendedCount, icon: <CheckCircle2 size={18} />, color: "text-green-500" },
    { label: "Late Sessions", value: lateCount, icon: <Zap size={18} />, color: "text-amber-500" },
    { label: "Total Records", value: attendedCount + lateCount, icon: <BarChart3 size={18} />, color: "text-blue-500" },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-stone-50/30">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
        
        {/* TOP BAR / SIDEBAR TRIGGER - This is the Burger Menu */}
        <div className="flex items-center justify-between lg:hidden mb-4">
           <button 
             onClick={onOpenSidebar} // Now matches the prop from App.js
             className="p-3 bg-white rounded-xl border border-stone-200 text-stone-900 shadow-sm hover:bg-stone-50 transition-colors"
           >
             <Menu size={20} />
           </button>
           <div className="h-[1px] flex-1 bg-stone-200 ml-4 opacity-50" />
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8 text-center md:text-left w-full lg:w-auto">
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-900 rounded-[30px] flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden text-stone-300">
                <UserCircle size={80} className="md:w-[90px]" strokeWidth={1} />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-full border-4 border-[#F8F9FA] flex items-center justify-center ${isBound ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}>
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 mb-3">
                <span className="px-3 py-1 bg-stone-900 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-stone-800">
                  {user?.role} node
                </span>
                <span className="flex items-center gap-1.5 text-stone-400 text-[9px] font-black uppercase tracking-widest">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBound ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {isBound ? 'Live Connection' : 'Restricted Access'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-stone-900 uppercase tracking-tighter italic leading-tight break-words">
                {user?.name || 'Authorized User'}
              </h1>
              <p className="text-stone-500 text-sm font-bold mt-2 flex items-center justify-center md:justify-start gap-2 truncate">
                <Mail size={14} className="text-stone-400 shrink-0" />
                {user?.email}
              </p>
            </div>
          </div>

          <button onClick={onLogout} className="w-full lg:w-auto flex items-center justify-center gap-3 px-6 py-4 border-2 border-stone-200 text-stone-500 rounded-2xl font-black text-[10px] uppercase tracking-[2px] hover:bg-stone-900 hover:text-white transition-all shadow-sm group">
            <LogOut size={18} className="group-hover:text-amber-500" /> Terminate Session
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] border border-stone-100 shadow-sm transition-all group hover:border-amber-600/30">
              <div className={`${stat.color} mb-4 opacity-40 group-hover:opacity-100 transition-opacity`}>
                {stat.icon}
              </div>
              <p className="text-stone-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter mt-1">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* SECURITY STATUS */}
        <div className="bg-stone-900 rounded-[40px] p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center overflow-hidden relative border border-stone-800">
          <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 text-amber-600 mb-4">
                <ShieldCheck size={20} />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[3px]">Security Registry</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-2">
                {isBound ? "Hardware Linked" : "Unbound Terminal"}
              </h3>
              <p className="text-stone-400 text-xs font-bold max-w-md leading-relaxed opacity-80 uppercase tracking-wider">
                {isBound 
                  ? `Node bound to unique signature: [${user.deviceId?.substring(0, 14)}...]. Terminal restricted.` 
                  : "Account unbound. Initial hardware linking required for full privilege set."}
              </p>
          </div>
          <ShieldCheck size={200} className="absolute -right-10 -bottom-10 text-white/[0.03] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Profile;