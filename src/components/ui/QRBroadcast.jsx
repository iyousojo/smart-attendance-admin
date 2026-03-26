import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Download, Zap, Eye, EyeOff, Lock, Fingerprint, ShieldCheck } from 'lucide-react';

const QRBroadcast = ({ sessionData, onClose }) => {
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const qrRef = useRef(null);

  // DATA MAPPING: Ensuring we use keys from our MongoDB Schema
  // (courseCode instead of name, _id instead of id)
  const qrValue = JSON.stringify({
    sessionId: sessionData._id,
    courseCode: sessionData.courseCode,
    location: sessionData.location, // Contains {lat, lng}
    radius: sessionData.radius,
    ts: Date.now() // Prevents replay attacks if scanned late
  });

  const backupCode = sessionData.backupCode || "------";

  const handleDownload = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // High-res output (2048px for print quality)
      canvas.width = 2048;
      canvas.height = 2048;
      ctx.fillStyle = "white"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const qrSize = 1600;
      const margin = (2048 - qrSize) / 2;
      ctx.drawImage(img, margin, margin, qrSize, qrSize);
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `NODE_${sessionData.courseCode}_${new Date().toISOString().split('T')[0]}.png`;
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    const shareText = `Join Attendance for ${sessionData.courseCode}. Code: ${backupCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Class Node', text: shareText, url: window.location.href });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Session details copied to clipboard.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4 overflow-y-auto no-scrollbar selection:bg-amber-500/30">
      
      {/* Background Grid FX */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:40px_40px]" />

      <button 
        onClick={onClose} 
        className="fixed top-6 right-6 md:top-10 md:right-10 text-stone-500 hover:text-white transition-all z-[10000] p-3 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10"
      >
        <X size={28} />
      </button>

      <div className="w-full max-w-lg flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 py-10">
        
        {/* Security Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <Zap size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-amber-500 font-black text-[9px] uppercase tracking-[4px]">Active Deployment</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
            Live<span className="text-amber-500">Node</span>
          </h1>
          <p className="mt-4 text-stone-500 font-bold uppercase tracking-[4px] text-[10px]">Registry Auth Protocol v4.0</p>
        </div>

        {/* QR Core Display */}
        <div className="w-full bg-stone-900/30 border border-white/5 rounded-[60px] p-8 md:p-12 flex flex-col items-center shadow-2xl mb-8 relative group backdrop-blur-sm">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40">
            <ShieldCheck size={12} className="text-amber-500" />
            <span className="text-[8px] font-black text-white uppercase tracking-[4px]">Geofenced Encrypted Payload</span>
          </div>

          <div ref={qrRef} className="bg-white p-6 rounded-[44px] mt-4 shadow-[0_0_80px_rgba(234,179,8,0.1)] transition-all group-hover:scale-[1.03] duration-700">
            <div className="w-56 h-56 md:w-72 md:h-72">
              <QRCodeSVG 
                value={qrValue} 
                size={512} 
                style={{ width: '100%', height: '100%' }}
                level="H" 
                marginSize={1}
                fgColor="#000000" 
              />
            </div>
          </div>
        </div>

        {/* Manual Fallback (Backup Code) */}
        <div className="w-full bg-stone-900/50 border border-white/5 rounded-[32px] p-6 mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Fingerprint size={16} className="text-amber-500" />
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-[2px]">Bypass Access</span>
            </div>
            <button 
              onClick={() => setIsCodeVisible(!isCodeVisible)}
              className="p-2 text-stone-600 hover:text-amber-500 transition-colors"
            >
              {isCodeVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="bg-black/40 border border-white/5 rounded-2xl py-6 text-center relative overflow-hidden group/code">
            <h4 className={`text-5xl md:text-6xl font-mono font-black tracking-[12px] leading-none transition-all duration-500 ${isCodeVisible ? 'text-white' : 'text-stone-800'}`}>
              {isCodeVisible ? backupCode : "••••••"}
            </h4>
            <div className="absolute bottom-0 left-0 h-[2px] bg-amber-500/50 transition-all duration-1000 w-0 group-hover/code:w-full" />
          </div>
        </div>

        {/* Dynamic Context Table */}
        <div className="w-full grid grid-cols-2 gap-4 px-2 mb-10">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Course Code</span>
            <span className="text-sm font-bold text-white uppercase italic">{sessionData.courseCode}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-right">
            <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Node Radius</span>
            <span className="text-sm font-bold text-amber-500 tabular-nums">{sessionData.radius}M ZONE</span>
          </div>
        </div>

        {/* System Actions */}
        <div className="flex gap-4 w-full px-2">
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-stone-900 rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:bg-amber-500 transition-all active:scale-95 shadow-xl"
          >
            <Download size={16} /> Save Node
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-3 py-5 bg-stone-900 border border-white/10 text-stone-400 rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:text-white hover:bg-stone-800 transition-all active:scale-95"
          >
            <Share2 size={16} /> Share Link
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRBroadcast;