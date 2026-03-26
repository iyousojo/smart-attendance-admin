import React, { useState, useEffect, useCallback } from 'react';
import { History, ArrowLeft, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || "https://studentattendanceapi-v4hq.onrender.com/api";

const BroadcastLog = () => {
  const [sessions, setSessions] = useState([]);
  const [viewingRoster, setViewingRoster] = useState(null);
  const [rosterData, setRosterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/professor/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setSessions(result.sessions);
    } catch (err) {
      console.error("Registry Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoster = async (session) => {
    setViewingRoster(session);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/session-details/${session._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) setRosterData(result.attendees);
    } catch (err) {
      console.error("Roster Retrieval Error:", err);
    }
  };

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  if (viewingRoster) {
    return (
      <div className="p-10 space-y-8 animate-in slide-in-from-right duration-500">
        <button onClick={() => setViewingRoster(null)} className="flex items-center gap-2 text-stone-500 font-black uppercase text-[10px] hover:text-stone-900 transition-colors">
          <ArrowLeft size={14} /> Back to Registry
        </button>
        
        <div className="bg-white p-8 rounded-[40px] border border-stone-100 flex justify-between items-end shadow-sm">
          <div>
            <h2 className="text-4xl font-black text-stone-900 uppercase italic tracking-tighter leading-none">{viewingRoster.courseCode}</h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[3px] mt-2">Deployment Roster • {new Date(viewingRoster.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-stone-900 text-amber-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
            {rosterData.length} Verified Entries
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-stone-100 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {rosterData.map((record) => (
                <tr key={record._id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-10 py-6 font-black text-stone-900 uppercase italic text-sm">{record.studentId?.name || "Anonymous Student"}</td>
                  <td className="px-10 py-6 text-stone-500 text-xs font-bold uppercase">{new Date(record.createdAt).toLocaleTimeString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      record.status === 'present' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <div className="flex justify-between items-end">
        <h1 className="text-6xl font-black text-stone-900 uppercase italic tracking-tighter">Broadcast Log</h1>
        <button onClick={fetchSessions} className="p-4 bg-white border border-stone-100 rounded-2xl text-stone-400 hover:text-stone-900 transition-all">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="grid gap-4">
        {sessions.map(s => (
          <div key={s._id} onClick={() => fetchRoster(s)} className="p-8 bg-white border border-stone-100 rounded-[35px] flex justify-between items-center hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer group">
             <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-amber-500 transition-colors">
                  <History size={24}/>
                </div>
                <div>
                   <h4 className="text-xl font-black text-stone-900 uppercase italic leading-none">{s.courseCode}</h4>
                   <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-2">Radius: {s.radius}m • Backup Code: {s.backupCode || 'N/A'}</p>
                </div>
             </div>
             <div className="text-right">
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${s.isActive ? "text-green-500" : "text-stone-300"}`}>
                  {s.isActive ? "● Live Node" : "Archive"}
                </p>
                <p className="text-[10px] font-black text-stone-900 uppercase italic">{new Date(s.createdAt).toLocaleDateString()}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BroadcastLog;