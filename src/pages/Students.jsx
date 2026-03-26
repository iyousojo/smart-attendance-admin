import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you're using axios
import { 
  Search, FileDown, MapPin, Clock, UserCheck, 
  Fingerprint, ChevronDown, ShieldCheck, Menu, Loader2 
} from 'lucide-react';

const Students = ({ onViewLocation, setIsSidebarOpen }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Replace with your actual API base URL
      const response = await axios.get('/api/attendance/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth storage
        }
      });

      if (response.data.success) {
        // Map MongoDB data to match UI structure
        const mappedData = response.data.data.map(log => ({
          id: log._id.slice(-7).toUpperCase(), // Short ID for display
          student: log.studentId?.name || 'Unknown Student',
          session: log.sessionId?.courseCode || 'N/A',
          time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          distance: log.distance ? `${Math.round(log.distance)}m` : '0.0m',
          status: log.method === 'scan' ? 'Verified' : 'Manual',
          lat: log.location?.lat,
          lng: log.location?.lng,
          rawStatus: log.status // 'present' or 'late'
        }));
        setAttendanceLogs(mappedData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch registry logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = log.student.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.session.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["Log ID", "Student", "Session", "Time", "Distance", "Status", "Lat", "Lng"];
    const rows = filteredLogs.map(log => [
      log.id, `"${log.student}"`, `"${log.session}"`, log.time, log.distance, log.status, log.lat, log.lng
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Registry_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-accentAmber" size={40} />
        <p className="font-black uppercase italic text-stone-400 tracking-widest text-xs">Syncing Registry...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50/30">
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-stone-100 sticky top-0 z-[20] shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-stone-900 p-1.5 rounded-lg text-accentAmber">
            <ShieldCheck size={18} />
          </div>
          <span className="font-black italic uppercase text-xs tracking-tighter text-stone-900">SmartAdm</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-stone-50 rounded-xl text-stone-900 border border-stone-100 active:scale-95 transition-transform">
          <Menu size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-10 no-scrollbar pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-stone-900 uppercase italic leading-none">
              Registry <span className="text-accentAmber">Logs</span>
            </h1>
            {error ? (
              <p className="text-red-500 font-bold uppercase tracking-[1px] text-[10px]">{error}</p>
            ) : (
              <p className="text-stone-400 font-bold uppercase tracking-[2px] text-[9px] md:text-[10px]">
                Active Records — Filter: <span className="text-accentAmber">{statusFilter}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap w-full md:w-auto gap-3">
            <div className="relative group flex-1 md:flex-none md:min-w-[180px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-5 pr-10 py-4 bg-white border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-accentAmber/10 cursor-pointer shadow-sm transition-all"
              >
                <option value="All">All Entry Types</option>
                <option value="Verified">GPS Verified</option>
                <option value="Manual">Manual Bypass</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none group-hover:text-accentAmber transition-colors" />
            </div>

            <div className="relative flex-[2] md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl text-sm font-bold focus:outline-none shadow-sm focus:border-stone-400 transition-colors"
              />
            </div>

            <button 
              onClick={handleExportCSV}
              className="p-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 group"
              disabled={filteredLogs.length === 0}
            >
              <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* DATA VIEWS (TABLE / CARDS) */}
        {filteredLogs.length > 0 ? (
          <>
            {/* Table View (Desktop) */}
            <div className="hidden md:block bg-white rounded-[32px] md:rounded-[44px] border border-stone-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50/50 border-b border-stone-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[3px]">Student Asset</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[3px]">Session Node</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[3px]">Time / Sync</th>
                    <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-[3px]">Status</th>
                    <th className="px-8 py-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-stone-50/80 transition-all group cursor-pointer" onClick={() => onViewLocation([log.lat, log.lng])}>
                      <td className="px-8 py-6">
                        <p className="font-black text-stone-900 group-hover:text-accentAmber transition-colors uppercase italic tracking-tight">{log.student}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mt-1">{log.id}</p>
                      </td>
                      <td className="px-8 py-6 text-stone-600 font-bold text-sm">{log.session}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-black text-stone-900 text-xs"><Clock size={12} className="text-stone-400" /> {log.time}</div>
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Dist: {log.distance}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          log.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-accentAmber/10 text-accentAmber border-accentAmber/20'
                        }`}>
                          {log.status === 'Verified' ? <UserCheck size={12} /> : <Fingerprint size={12} />}
                          {log.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right"><div className="p-2 inline-block bg-stone-100 rounded-xl text-stone-400 group-hover:bg-accentAmber group-hover:text-white shadow-sm"><MapPin size={18} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredLogs.map((log, index) => (
                <div key={index} onClick={() => onViewLocation([log.lat, log.lng])} className="bg-white p-6 rounded-[32px] border border-stone-100 active:scale-[0.98] transition-all shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-stone-900 uppercase italic tracking-tight">{log.student}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">{log.id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${log.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-accentAmber/20 text-accentAmber'}`}>
                      {log.status === 'Verified' ? <UserCheck size={12} /> : <Fingerprint size={12} />} {log.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-y border-stone-50">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-stone-300 uppercase">Session Node</span>
                       <span className="text-[10px] font-bold text-stone-600">{log.session}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-stone-300 uppercase">Distance</span>
                       <p className="text-[10px] font-bold text-stone-900">{log.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black text-stone-400 uppercase">
                     <span className="flex items-center gap-1"><Clock size={12} /> {log.time}</span>
                     <button className="flex items-center gap-1 text-accentAmber font-black"> <MapPin size={12} /> Geolocate </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <div className="bg-stone-100 p-6 rounded-full mb-4"><Search size={32} className="text-stone-400" /></div>
            <p className="font-black uppercase italic text-stone-400 tracking-widest text-sm">Registry data not found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Students;