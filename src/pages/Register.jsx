import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, User, ArrowLeft, ChevronRight, Monitor, Loader2 } from 'lucide-react';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'professor' 
  });

  useEffect(() => {
    const getPersistentDeviceId = () => {
      try {
        let systemId = localStorage.getItem('system_id');
        if (!systemId) {
          const fingerprint = [
            navigator.userAgent,
            window.screen.width + 'x' + window.screen.height,
            navigator.language
          ].join('|');
          systemId = `WEB-${btoa(fingerprint).substring(0, 24).toUpperCase()}`;
          localStorage.setItem('system_id', systemId);
        }
        setDeviceId(systemId);
      } catch (err) {
        setDeviceId(`WEB-FALLBACK-${Math.random().toString(36).substring(7)}`);
      } finally {
        setIsGenerating(false);
      }
    };
    setTimeout(getPersistentDeviceId, 800);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Call App.js function and wait for boolean result
      const success = await onRegister({
        ...formData,
        email: formData.email.toLowerCase().trim(),
        deviceId: deviceId 
      });

      if (success) {
        // Safe redirection via React Router
        navigate('/login'); 
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2F0] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        <div className="flex justify-between items-center px-2">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-all font-black text-[10px] uppercase tracking-[2px]"
          >
            <ArrowLeft size={14} /> Abort
          </button>
          
          <div className={`flex items-center gap-2 ${deviceId ? 'text-green-600' : 'text-amber-500 animate-pulse'}`}>
            <Monitor size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest hidden xs:inline">
              {deviceId ? `Terminal ID: ${deviceId.substring(0, 15)}...` : 'Syncing Hardware...'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl border border-stone-100 relative overflow-hidden">
          <UserPlus size={200} className="absolute -right-20 -top-20 text-stone-50 pointer-events-none rotate-12" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-stone-900 uppercase tracking-tighter italic leading-none mb-8">
              Faculty Enrollment
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-stone-400 uppercase ml-4 text-left block">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" required
                    className="w-full bg-stone-50 border-2 border-transparent rounded-[20px] py-4 pl-14 pr-6 focus:bg-white focus:border-amber-500 transition-all font-bold text-stone-900"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-stone-400 uppercase ml-4 text-left block">Academic Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="email" required
                    className="w-full bg-stone-50 border-2 border-transparent rounded-[20px] py-4 pl-14 pr-6 focus:bg-white focus:border-amber-500 transition-all font-bold text-stone-900"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase ml-4 text-left block">Security Cipher</label>
                <input 
                  type="password" required minLength={6}
                  className="w-full bg-stone-50 border-2 border-transparent rounded-[20px] py-4 px-6 focus:bg-white focus:border-amber-500 transition-all font-bold text-stone-900"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase ml-4 text-left block">Assigned Role</label>
                <select 
                  className="w-full bg-stone-50 border-2 border-transparent rounded-[20px] py-4 px-6 font-black text-stone-900 uppercase text-[10px] tracking-widest cursor-pointer appearance-none"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  value={formData.role}
                >
                  <option value="professor">Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  disabled={isGenerating || isSubmitting}
                  className={`w-full p-5 rounded-[25px] flex items-center justify-between transition-all group shadow-xl 
                    ${isGenerating || isSubmitting ? 'bg-amber-500 text-stone-900 cursor-wait' : 'bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-900'}`}
                >
                  <div className="flex items-center gap-3">
                    {(isGenerating || isSubmitting) && <Loader2 size={18} className="animate-spin" />}
                    <span className="font-black uppercase tracking-[3px] text-xs ml-2">
                      {isGenerating ? 'Identifying Terminal...' : isSubmitting ? 'Writing to Registry...' : 'Initialize Registry Node'}
                    </span>
                  </div>
                  {!isGenerating && !isSubmitting && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;