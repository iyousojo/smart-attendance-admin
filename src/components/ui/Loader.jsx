import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Loader = ({ message = "Verifying Identity" }) => {
  return (
    <div className="fixed inset-0 bg-[#F5F2F0] z-[100] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <div className="w-24 h-24 border-4 border-stone-200 border-t-accentAmber rounded-full animate-spin"></div>
        
        {/* Inner Pulsing Shield */}
        <div className="absolute">
          <ShieldCheck size={32} className="text-stone-900 animate-pulse" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-stone-900 font-black text-xs uppercase tracking-[4px] animate-pulse">
          {message}
        </h2>
        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-2">
          Establishing Secure Connection...
        </p>
      </div>
    </div>
  );
};

export default Loader;