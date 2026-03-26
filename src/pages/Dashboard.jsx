import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, Plus, List, MapPin, QrCode, 
  SignalLow, Radar, Menu, ShieldCheck, RefreshCw, Navigation
} from 'lucide-react';
import SessionModal from '../components/ui/SessionModal';
import QRBroadcast from '../components/ui/QRBroadcast';

const API_BASE = import.meta.env.VITE_API_URL || "https://studentattendanceapi-v4hq.onrender.com/api";

const Dashboard = ({ user, setIsSidebarOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSessionView, setActiveSessionView] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // GPS & Integrity State
  const [gpsStats, setGpsStats] = useState({ 
    integrity: "0%", 
    accuracy: "SEARCHING...", 
    status: "idle" 
  });
  const [stats, setStats] = useState({ liveNodes: 0, totalLogs: 0 });

  // 1. ACTIVE GPS MONITORING
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsStats({ integrity: "0%", accuracy: "UNSUPPORTED", status: "error" });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        // Logic: Accuracy < 30m = 100%, Accuracy > 200m = low integrity
        let percentage = Math.max(0, Math.min(100, 100 - (acc / 2)));
        if (acc < 15) percentage = 100; // High precision

        setGpsStats({
          integrity: `${Math.round(percentage)}%`,
          accuracy: `${Math.round(acc)}m Precision`,
          status: percentage > 70 ? "optimal" : "warning"
        });
      },
      (err) => {
        setGpsStats({ integrity: "0%", accuracy: "SIGNAL LOST", status: "error" });
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/professor/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        const activeOnly = result.sessions.filter(s => s.isActive);
        setSessions(result.sessions);
        setStats({
          liveNodes: activeOnly.length,
          totalLogs: result.sessions.length
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleCreateSession = async (sessionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(sessionData)
      });
      const result = await response.json();
      if (result.success) {
        setSessions([result.data, ...sessions]);
        setIsModalOpen(false);
        setActiveSessionView(result.data);
      }
    } catch (err) { alert("Terminal Connection Failure"); }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50/50">
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-stone-100 sticky top-0 z-[10]">
        <div className="flex items-center space-x-2">
          <div className="bg-stone-900 p-1.5 rounded-lg text-amber-500"><ShieldCheck size={18} /></div>
          <span className="font-black italic uppercase text-xs tracking-tighter text-stone-900">SmartAdm</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-stone-50 rounded-xl text-stone-900 border border-stone-100">
          <Menu size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 no-scrollbar pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-stone-900 uppercase italic leading-none">Command Center</h1>
            <p className="text-stone-400 font-bold mt-4 uppercase tracking-[4px] text-[10px]">Active Registry: {user?.name || "Identifying..."}</p>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-stone-900 text-white px-10 py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[3px] flex items-center justify-center gap-4 hover:bg-amber-500 hover:text-stone-900 transition-all shadow-2xl active:scale-95 group">
            <Plus size={20} className="text-amber-500 group-hover:text-stone-900 transition-colors" />
            Initialize Session
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Live Deployments" value={stats.liveNodes.toString().padStart(2, '0')} icon={<Radar className={stats.liveNodes > 0 ? "text-green-500 animate-pulse" : "text-stone-300"} />} />
          <StatCard label="Session Registry" value={stats.totalLogs} icon={<UserCheck className="text-amber-500" />} />
          
          {/* UPTIME INTEGRITY CARD - ACTIVE GPS TRACKING */}
          <StatCard 
            label="Uptime Integrity" 
            value={gpsStats.integrity} 
            subValue={gpsStats.accuracy}
            icon={<SignalLow className={gpsStats.status === 'optimal' ? "text-green-500" : "text-red-500 animate-bounce"} />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[44px] border border-stone-100 p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-stone-900 font-black text-xs uppercase tracking-[4px] flex items-center gap-4">
                <List size={20} className="text-amber-500" />
                Recent Deployments
              </h3>
              <button onClick={fetchDashboardData} className="flex items-center gap-2 text-[9px] font-black text-stone-400 uppercase hover:text-stone-900 transition-colors">
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                Sync Cloud
              </button>
            </div>
            
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.slice(0, 5).map((session) => (
                  <ActiveSessionRow key={session._id} session={session} onViewQR={() => setActiveSessionView(session)} />
                ))
              ) : (
                <div className="py-24 text-center border-4 border-dashed border-stone-50 rounded-[40px]">
                   <p className="text-stone-300 font-black uppercase text-xs tracking-[4px]">No history detected</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-stone-900 rounded-[44px] p-10 text-white flex flex-col justify-between shadow-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-[10px] uppercase tracking-[5px] mb-8 flex items-center gap-4 text-amber-500">
                <Navigation size={22} className="animate-pulse" />
                GPS LINK
              </h3>
              <p className="text-stone-400 text-sm font-bold leading-relaxed mb-6">
                Broadcast nodes require high-fidelity GPS locks. Currently tracking at <span className="text-white italic">{gpsStats.accuracy}</span>.
              </p>
              {gpsStats.status === 'optimal' ? (
                <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl text-green-400">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase italic">Signal Locked</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-2xl text-red-400">
                  <SignalLow size={16} />
                  <span className="text-[10px] font-black uppercase italic">Degraded Signal</span>
                </div>
              )}
            </div>
            
            <div className="mt-12 relative z-10">
               <div className="flex justify-between items-end mb-3">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Signal Stability</p>
                  <p className="text-3xl font-black text-amber-500 italic tracking-tighter">{gpsStats.integrity}</p>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                    style={{ width: gpsStats.integrity }}
                  />
               </div>
            </div>
          </div>
        </div>
      </main>

      <SessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateSession} />
      {activeSessionView && (
        <QRBroadcast sessionData={activeSessionView} onClose={() => setActiveSessionView(null)} />
      )}
    </div>
  );
};

const ActiveSessionRow = ({ session, onViewQR }) => (
  <div onClick={onViewQR} className={`group flex items-center justify-between p-6 bg-stone-50 rounded-[30px] border-2 border-transparent hover:border-amber-500 hover:bg-white transition-all cursor-pointer ${!session.isActive ? 'opacity-40 grayscale' : ''}`}>
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-stone-100 group-hover:bg-stone-900 group-hover:text-amber-500 transition-all shadow-sm">
        <QrCode size={24} />
      </div>
      <div>
        <h4 className="font-black text-stone-900 text-lg tracking-tight uppercase italic">{session.courseCode}</h4>
        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Radius: {session.radius}m • Backup: {session.backupCode}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-2xl font-black tracking-tighter ${session.isActive ? 'text-stone-900' : 'text-stone-300'}`}>{session.isActive ? 'LIVE' : 'ENDED'}</p>
      <div className="flex items-center justify-end gap-2 mt-1">
        <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500 animate-pulse' : 'bg-stone-200'}`} />
        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">V.Registry-04</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, subValue, icon }) => (
  <div className="bg-white p-8 rounded-[35px] border border-stone-100 shadow-sm flex items-center justify-between hover:border-amber-500/30 transition-all group">
    <div>
      <p className="text-stone-400 text-[10px] font-black uppercase tracking-[3px] mb-3">{label}</p>
      <h2 className="text-5xl font-black text-stone-900 tracking-tighter italic leading-none">{value}</h2>
      {subValue && <p className="text-[9px] font-black text-amber-600 uppercase mt-2">{subValue}</p>}
    </div>
    <div className="bg-stone-50 p-5 rounded-[22px] border border-stone-100 group-hover:bg-stone-900 group-hover:text-amber-500 transition-all">
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);

export default Dashboard;