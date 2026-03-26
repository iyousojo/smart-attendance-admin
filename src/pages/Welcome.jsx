import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, GraduationCap, Smartphone, ShieldAlert, ChevronRight, Lock, Loader2 } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // The provided Mega.nz link
  const METERED_DOWNLOAD_URL = "https://mega.nz/file/EikhhA4Q#umu5_7CRNExSCWTx0e0_x4Uk1w66rCGRsLQrQlnjw10";

  const handleDownload = (e) => {
    // We don't preventDefault() here so the browser still follows the link
    setIsDownloading(true);
    
    // Reset the button state after 5 seconds
    setTimeout(() => setIsDownloading(false), 5000);
  };

  const handleStaffAuth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/login'); 
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] flex items-center justify-center p-6 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* STUDENT PATH */}
        <div className="bg-white rounded-[60px] p-12 shadow-xl border border-stone-100 flex flex-col justify-between group hover:border-amber-500 transition-all">
          <div>
            <div className="w-16 h-16 bg-stone-900 rounded-[24px] flex items-center justify-center text-amber-500 mb-8">
              <Smartphone size={32} />
            </div>
            <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter italic leading-tight mb-4">
              Student <br />Terminal
            </h2>
            <p className="text-stone-500 font-bold text-sm leading-relaxed mb-8">
              Attendance check-in is restricted to the mobile application. This ensures **Hardware Binding** integrity.
            </p>
          </div>

          <div className="space-y-4">
            <a 
              href={METERED_DOWNLOAD_URL}
              target="_blank" // Opens Mega in a new tab for better UX
              rel="noopener noreferrer"
              onClick={handleDownload}
              className={`w-full h-20 rounded-[30px] flex items-center justify-center transition-all no-underline shadow-lg ${
                isDownloading 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-900'
              }`}
            >
              {isDownloading ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="font-black uppercase tracking-widest text-[10px]">Opening Secure Link...</span>
                </div>
              ) : (
                <div className="w-full px-8 flex items-center justify-between">
                  <span className="font-black uppercase tracking-widest text-xs">Download Student App</span>
                  <Download size={20} />
                </div>
              )}
            </a>
            <p className="text-center text-[9px] font-black text-stone-300 uppercase tracking-widest">Role: STUDENT_NODE</p>
          </div>
        </div>

        {/* STAFF PATH */}
        <div className="bg-stone-900 rounded-[60px] p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-amber-500 rounded-[24px] flex items-center justify-center text-stone-900 mb-8 shadow-xl shadow-amber-500/20">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-tight mb-4">
              Academic <br />Registry
            </h2>
            <div className="flex items-center gap-2 mb-6 text-amber-500 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
              <ShieldAlert size={14} />
              <span className="text-[9px] font-black uppercase tracking-[2px]">Strict Academic Purpose</span>
            </div>
            <p className="text-stone-400 font-bold text-sm leading-relaxed mb-8">
              Secure portal for **Professors** and **Administrators**. Manage geofences and audit logs.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <button 
              onClick={handleStaffAuth}
              disabled={isTransitioning}
              className={`w-full h-20 rounded-[30px] flex items-center justify-center transition-all font-black shadow-xl ${
                isTransitioning 
                ? 'bg-stone-800 text-amber-500 border border-stone-700' 
                : 'bg-white text-stone-900 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isTransitioning ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="uppercase tracking-[3px] text-[10px]">Securing Connection</span>
                </div>
              ) : (
                <div className="w-full px-8 flex items-center justify-between">
                  <span className="uppercase tracking-widest text-xs">Staff Authorization</span>
                  <ChevronRight size={20} />
                </div>
              )}
            </button>
            <p className="text-center text-[9px] font-black text-stone-500 uppercase tracking-widest">Role: PROFESSOR_NODE / ADMIN_NODE</p>
          </div>
          <Lock size={220} className="absolute -right-16 -bottom-16 text-white/5 pointer-events-none" />
        </div>

      </div>
    </div>
  );
};

export default Welcome;