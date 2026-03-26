import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Zap, Radio, Clock, RefreshCw, Map, Lock, AlertTriangle } from 'lucide-react';

const SessionModal = ({ isOpen, onClose, onSubmit }) => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [isLocating, setIsLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Initializing...');
  
  const [sessionData, setSessionData] = useState({
    courseCode: '', 
    durationMins: 60,
    lateAfterMins: 15,
    radius: 200 
  });

  const fetchLocation = () => {
    setIsLocating(true);
    setLocationStatus('Pinging Satellites...');

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // Wait 10 seconds for high accuracy
      maximumAge: 0
    };

    const handleSuccess = (pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGpsAccuracy(pos.coords.accuracy);
      setIsLocating(false);
      setLocationStatus('Signal Locked');
    };

    const handleError = (err) => {
      console.warn(`GPS Warning (${err.code}): ${err.message}`);
      
      // FALLBACK: If high accuracy times out (code 3), try one more time with low accuracy (faster)
      if (err.code === 3) {
        setLocationStatus('Optimizing for Indoors...');
        navigator.geolocation.getCurrentPosition(handleSuccess, (finalErr) => {
          setIsLocating(false);
          setLocationStatus('Signal Error');
        }, { enableHighAccuracy: false, timeout: 5000 });
      } else {
        setIsLocating(false);
        setLocationStatus('Permission Denied');
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  };

  useEffect(() => {
    if (isOpen) fetchLocation();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coords.lat) return;
    
    onSubmit({
      ...sessionData,
      durationMins: Number(sessionData.durationMins),
      lateAfterMins: Number(sessionData.lateAfterMins),
      radius: 200,
      lat: coords.lat,
      lng: coords.lng
    });
  };

  if (!isOpen) return null;

  const isLowSignal = gpsAccuracy > 40;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#F5F2F0] w-full max-w-lg rounded-[40px] shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="bg-stone-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">Initialize Node</h2>
            <p className="text-stone-500 text-[10px] font-black uppercase tracking-[3px] mt-1">Spatial Authorization Protocol</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-stone-500 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <form className="p-8 md:p-10 space-y-6 overflow-y-auto no-scrollbar" onSubmit={handleSubmit}>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Course Identity</label>
              <input 
                required
                type="text" 
                value={sessionData.courseCode}
                onChange={(e) => setSessionData({...sessionData, courseCode: e.target.value.toUpperCase()})}
                placeholder="e.g. COMP 402" 
                className="w-full bg-white border-2 border-stone-100 rounded-[24px] py-5 px-6 focus:border-stone-900 transition-colors outline-none font-bold text-stone-900" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Limit (Min)</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input 
                    required 
                    type="number" 
                    value={sessionData.durationMins} 
                    onChange={(e) => setSessionData({...sessionData, durationMins: e.target.value})} 
                    className="w-full bg-white border-2 border-stone-100 rounded-[22px] py-4 pl-14 pr-4 font-bold outline-none focus:border-stone-900" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Late After</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input 
                    required 
                    type="number" 
                    value={sessionData.lateAfterMins} 
                    onChange={(e) => setSessionData({...sessionData, lateAfterMins: e.target.value})} 
                    className="w-full bg-white border-2 border-stone-100 rounded-[22px] py-4 pl-14 pr-4 font-bold outline-none focus:border-stone-900" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          {isLowSignal && !isLocating && (
            <div className="p-5 bg-red-600 rounded-[28px] border-b-4 border-red-800 flex items-start gap-4 animate-in fade-in zoom-in duration-300 shadow-lg shadow-red-900/20">
              <div className="p-2 bg-white/20 rounded-xl text-white">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider leading-none">GPS Accuracy Warning</h4>
                <p className="text-[9px] font-bold text-red-100 uppercase tracking-tight leading-relaxed">
                   Low precision ({Math.round(gpsAccuracy)}m). Geofence might fail. 
                   <span className="block mt-1 text-white font-black underline">Be ready to provide the Backup Code.</span>
                </p>
              </div>
            </div>
          )}

          {/* Status Card with Real-time Feedback */}
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${isLowSignal ? 'bg-white border-red-200' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-5">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isLocating ? 'bg-amber-500' : isLowSignal ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    <Radio size={14} className={isLocating ? 'animate-ping' : ''} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest block leading-none ${isLowSignal && !isLocating ? 'text-red-600' : 'text-stone-900'}`}>
                       {locationStatus}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                        {gpsAccuracy ? `+/- ${Math.round(gpsAccuracy)}m Accuracy` : 'Seeking Satellite...'}
                    </span>
                  </div>
               </div>
               <button type="button" onClick={fetchLocation} disabled={isLocating} className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all">
                 <RefreshCw size={16} className={isLocating ? 'animate-spin text-amber-500' : 'text-stone-600'} />
               </button>
            </div>
            
            <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between border border-stone-100">
                <div className="flex items-center gap-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">
                    <Map size={12} className="text-stone-300" />
                    Live Coords:
                </div>
                <span className="font-mono text-[10px] font-bold text-stone-600">
                    {coords.lat ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'AWAITING LOCK'}
                </span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLocating || !coords.lat}
            className={`w-full py-6 rounded-[28px] font-black text-xs uppercase tracking-[4px] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${
              isLocating || !coords.lat 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : isLowSignal
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-stone-900 text-white hover:bg-black'
            }`}
          >
            <Zap size={18} className={isLocating ? 'animate-pulse' : isLowSignal ? 'text-white' : 'text-amber-500'} />
            {isLocating ? 'Syncing...' : isLowSignal ? 'Deploy (Low Signal)' : 'Initialize Node'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;