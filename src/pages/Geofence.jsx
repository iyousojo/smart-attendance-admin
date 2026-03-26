import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Fingerprint, Keyboard, Navigation, Layers, Radar, Menu, 
  ChevronDown, MapPin, RefreshCcw, Users, AlertCircle, ChevronUp,
  Target // New icon for "Recenter to Admin"
} from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';

// --- STYLES ---
const tacticalStyles = `
  .radar-scanner-pulse {
    position: relative; width: 100px; height: 100px;
    background: rgba(217, 119, 6, 0.1); border-radius: 50%;
    border: 1px solid rgba(217, 119, 6, 0.4);
    animation: pulse-ring 4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }
  @keyframes pulse-ring { 0% { transform: scale(0.33); opacity: 1; } 80%, 100% { opacity: 0; } }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .leaflet-container { width: 100%; height: 100%; z-index: 1; }
  .custom-popup .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; border: 1px solid #e5e7eb; }
`;

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 18, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
};

const Geofence = ({ setIsSidebarOpen }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const [adminPos, setAdminPos] = useState(null); // Tracks Professor's Location

  // 1. Fetch Active Sessions
  const fetchSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://studentattendanceapi-v4hq.onrender.com/api/attendance/active-deployments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success && res.data.sessions.length > 0) {
        setSessions(res.data.sessions);
        if (!activeSession) {
          setActiveSession(res.data.sessions[0]);
          setMapTarget([res.data.sessions[0].location.lat, res.data.sessions[0].location.lng]);
        }
        setError(null);
      } else {
        setError("No active protocols found.");
      }
    } catch (err) {
      setError(err.response?.status === 401 ? "Unauthorized Access" : "Terminal Link Failed");
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  // 2. Fetch Attendees
  const fetchAttendance = useCallback(async () => {
    if (!activeSession) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://studentattendanceapi-v4hq.onrender.com/api/attendance/session-details/${activeSession._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setStudents(res.data.attendees); 
    } catch (err) {
      console.error("Feed Sync Error:", err);
    }
  }, [activeSession]);

  // 3. Track Professor's Position
  const trackAdminPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setAdminPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("GPS tracking disabled"),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = tacticalStyles;
    document.head.appendChild(styleSheet);
    fetchSessions();
    trackAdminPosition(); // Initial track
  }, [fetchSessions, trackAdminPosition]);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
      <Radar className="animate-spin text-amber-600 mb-4" size={48} />
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Initializing Grid...</p>
    </div>
  );

  if (error || !activeSession) return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
      <AlertCircle className="text-stone-300 mb-4" size={48} />
      <h3 className="text-stone-900 font-bold mb-2">No Active Protocol</h3>
      <p className="text-stone-500 text-sm max-w-xs mb-6">{error || "Deploy a session to begin live tracking."}</p>
      <button onClick={fetchSessions} className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Retry Sync</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 z-[100]">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setIsSidebarOpen?.(true)} className="lg:hidden p-2 hover:bg-stone-100 rounded-lg">
            <Menu size={20} className="text-stone-600" />
          </button>
          <div className="min-w-0">
            <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-tighter leading-none mb-1">Live Deployment</h2>
            <div className="relative inline-flex items-center gap-2">
              <select 
                value={activeSession._id}
                onChange={(e) => {
                  const s = sessions.find(x => x._id === e.target.value);
                  setActiveSession(s);
                  setMapTarget([s.location.lat, s.location.lng]);
                }}
                className="appearance-none bg-transparent pr-6 text-sm font-black text-stone-900 focus:outline-none cursor-pointer truncate max-w-[150px]"
              >
                {sessions.map(s => <option key={s._id} value={s._id}>{s.courseCode}</option>)}
              </select>
              <ChevronDown size={14} className="text-stone-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={fetchAttendance} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 active:rotate-180 transition-transform">
            <RefreshCcw size={16} />
          </button>
          <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-stone-900/20">
            {students.length}
          </div>
        </div>
      </header>

      {/* MAP */}
      <main className="flex-1 relative bg-stone-200">
        <MapContainer center={[activeSession.location.lat, activeSession.location.lng]} zoom={18} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <RecenterMap coords={mapTarget} />

          {/* ADMIN (PROFESSOR) MARKER */}
          {adminPos && (
            <Marker position={adminPos} icon={new L.DivIcon({
              className: 'admin-node',
              html: `<div style="background-color: #000; width: 24px; height: 24px; border: 3px solid #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);">
                      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    </div>`,
              iconSize: [24, 24]
            })}>
              <Popup>You are here (Node Commander)</Popup>
            </Marker>
          )}

          {/* RADIUS GEOFENCE */}
          <Circle 
            center={[activeSession.location.lat, activeSession.location.lng]} 
            radius={activeSession.radius || 200} 
            pathOptions={{ color: '#D97706', weight: 2, fillOpacity: 0.05, dashArray: '10, 10' }} 
          />

          {/* LIVE STUDENT NODES */}
          {students.map(record => (
            <Marker 
              key={record._id} 
              position={[record.location.lat, record.location.lng]} 
              icon={new L.DivIcon({
                className: 'node',
                html: `<div style="background-color: ${record.status === 'present' ? '#10b981' : '#f59e0b'}; width: 20px; height: 20px; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                        <span style="font-size:8px; color:white; font-weight:900;">${record.method === 'manual' ? 'M' : ''}</span>
                      </div>`,
                iconSize: [20, 20]
              })}
            >
              <Popup closeButton={false} className="custom-popup">
                <div className="p-3 text-center min-w-[120px]">
                  <p className="font-black text-[12px] text-stone-900 leading-tight mb-1">{record.studentId?.name || "Unknown"}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 py-1 rounded-md">
                    {record.status} • {record.method}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* FLOATING ACTION BUTTONS */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-[100]">
          {/* Recenter to Admin (You) */}
          <button 
            onClick={() => {
              trackAdminPosition();
              if (adminPos) setMapTarget([...adminPos]);
            }}
            className="p-4 bg-white shadow-2xl rounded-2xl border border-stone-200 text-stone-600 hover:text-stone-900 transition-all active:scale-95 group"
            title="Locate Admin"
          >
            <Target size={20} className="group-hover:text-amber-600" />
          </button>
          
          {/* Recenter to Geofence Center */}
          <button 
            onClick={() => setMapTarget([activeSession.location.lat, activeSession.location.lng])}
            className="p-4 bg-white shadow-2xl rounded-2xl border border-stone-200 text-stone-600 hover:text-stone-900 transition-all active:scale-95 group"
            title="Recenter Geofence"
          >
            <Navigation size={20} className="group-hover:text-amber-600" />
          </button>
        </div>

        {/* BOTTOM INTEGRITY FEED */}
        <div className={`absolute bottom-0 left-0 right-0 md:left-4 md:bottom-4 md:right-auto z-[100] transition-all duration-300 ${isFeedExpanded ? 'h-[50vh] md:h-96' : 'h-16'} md:w-80`}>
          <div className="h-full bg-white/95 backdrop-blur-md md:rounded-3xl shadow-2xl border-t md:border border-stone-200 flex flex-col overflow-hidden">
            <button 
              onClick={() => setIsFeedExpanded(!isFeedExpanded)}
              className="flex items-center justify-between px-6 py-5 w-full bg-white transition-colors hover:bg-stone-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-stone-900">Live Signals ({students.length})</span>
              </div>
              {isFeedExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
              {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                  <Radar size={32} className="mb-2 text-stone-300" />
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Scanning Grid...</p>
                </div>
              ) : (
                students.map(st => (
                  <button 
                    key={st._id} 
                    onClick={() => { setMapTarget([st.location.lat, st.location.lng]); setIsFeedExpanded(false); }}
                    className="w-full flex items-center gap-4 p-4 hover:bg-stone-50 rounded-[20px] transition-all text-left"
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-stone-100 text-stone-600`}>
                        {st.method === 'manual' ? <Keyboard size={16} /> : <Fingerprint size={16} />}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${st.status === 'present' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black text-stone-900 truncate tracking-tight">{st.studentId?.name || "Unknown Student"}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                        {st.status} • {new Date(st.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <MapPin size={14} className="text-stone-300" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Geofence;