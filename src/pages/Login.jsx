import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, User, Eye, EyeOff, 
  ArrowRight, ArrowLeft, Fingerprint, Loader2 
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get the persistent ID (Created during Register or first visit)
    let systemId = localStorage.getItem('system_id');
    if (!systemId) {
       const fingerprint = [navigator.userAgent, window.screen.width + 'x' + window.screen.height, navigator.language].join('|');
       systemId = `WEB-${btoa(fingerprint).substring(0, 24).toUpperCase()}`;
       localStorage.setItem('system_id', systemId);
    }

    try {
      await onLogin({ email, password, deviceId: systemId }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F2F0] animate-in fade-in duration-700">
      <div className="hidden lg:flex w-1/2 bg-stone-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <div className="inline-flex p-6 bg-white/5 backdrop-blur-xl rounded-[40px] mb-8 border border-white/10 shadow-2xl">
            <ShieldCheck size={80} className="text-amber-500" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Faculty<br /><span className="text-amber-500 text-6xl">Terminal</span>
          </h1>
          <p className="text-stone-400 font-bold text-sm tracking-wide leading-relaxed uppercase opacity-60 mt-4">
            Authorized Personnel Only
          </p>
        </div>
        <Fingerprint size={400} className="absolute -bottom-20 -left-20 text-white/[0.02] pointer-events-none" />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-8 left-6 sm:top-10 sm:left-12">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black text-[10px] uppercase tracking-[2px] group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase italic">Authorize Access</h2>
            <p className="text-stone-500 font-bold text-[10px] uppercase tracking-widest opacity-70">Hardware Binding Active</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] ml-1 block text-left">Academic Email</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input 
                  type="email" required placeholder="name@university.edu"
                  className="w-full bg-white border-2 border-stone-100 rounded-[24px] py-4 pl-14 pr-4 focus:outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] ml-1 block text-left">Security Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  className="w-full bg-white border-2 border-stone-100 rounded-[24px] py-4 pl-14 pr-12 focus:outline-none focus:border-amber-500 transition-all font-bold text-stone-800"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-white rounded-[24px] py-5 font-black text-[10px] uppercase tracking-[4px] flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Initialize Node"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-stone-500 font-bold text-[10px] uppercase tracking-widest">Need access?</p>
            <Link to="/register" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-black text-[11px] uppercase tracking-[2px]">
              Request Access Credentials <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;