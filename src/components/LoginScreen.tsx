import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Eye, 
  EyeOff, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import BatikBackground from './BatikBackground';
import BookmarkGuideModal from './BookmarkGuideModal';
import { PenggunaApp } from '../types';
import { DEFAULT_PENGGUNA_APP } from '../data/mockPengguna';

interface LoginScreenProps {
  penggunaList?: PenggunaApp[];
  onLogin: (role: string, username: string, allowedMenus?: string[], namaLengkap?: string) => void;
}

export default function LoginScreen({ penggunaList = [], onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Effective list of users
  const activeUserList = penggunaList.length > 0 ? penggunaList : DEFAULT_PENGGUNA_APP;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase();

    // Look for registered user account
    const matchedUser = activeUserList.find(u => u.username.toLowerCase() === trimmedUser);

    if (!matchedUser) {
      setError(`Username "${username}" tidak terdaftar dalam sistem. Hanya akun pengguna yang terdaftar di menu Role Pengguna yang dapat mengakses website ini.`);
      return;
    }

    if (matchedUser.status !== 'Aktif') {
      setError(`Akun @${matchedUser.username} telah dinonaktifkan oleh Administrator. Silakan hubungi Sekretariat IT Darul Arifin.`);
      return;
    }

    if (matchedUser.password !== password) {
      setError('Kata sandi yang Anda masukkan salah. Silakan coba kembali.');
      return;
    }

    // Success login!
    onLogin(
      matchedUser.role, 
      matchedUser.username, 
      matchedUser.allowedMenus, 
      matchedUser.namaLengkap
    );
  };


  return (
    <div className="min-h-screen bg-nature-beige text-nature-charcoal flex items-center justify-center relative p-4 overflow-hidden select-none" id="login-container">
      {/* Background Batik Bali */}
      <BatikBackground opacity={0.08} showCorners={true} />

      <div className="w-full max-w-lg relative z-10 space-y-6" id="login-inner">
        {/* Brand Header */}
        <div className="text-center space-y-3" id="login-logo-header">
          {/* Animated Logo Container with Spinning Islamic Star Pattern Outer Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center mx-auto" id="login-logo-container">
            {/* Outer Glowing Star Pattern Rotating SVG */}
            <motion.div 
              className="absolute inset-0 text-nature-gold/40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
                <path d="M50,5 L63,35 L95,37 L70,60 L78,92 L50,75 L22,92 L30,60 L5,37 L37,35 Z" strokeDasharray="5,3" />
              </svg>
            </motion.div>
            
            {/* Core Icon Container */}
            <div className="w-14 h-14 rounded-2xl bg-nature-forest text-white flex items-center justify-center border-2 border-nature-gold shadow-lg z-10">
              <BookOpen className="w-7 h-7 text-nature-gold" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[12px] font-black text-nature-gold uppercase tracking-[0.25em] block leading-none">SATDAF</span>
            <h1 className="font-serif italic text-2xl font-black text-nature-forest tracking-wide leading-snug">
              Darul Arifin Jambi
            </h1>
            <span className="text-[9px] text-nature-sage font-extrabold uppercase tracking-[0.1em] block leading-none">
              SISTEM ADMINISTRASI TERPADU & PORTAL MONITORING
            </span>
          </div>
        </div>

        {/* Login Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-nature-border shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden"
          id="login-card"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-nature-forest via-nature-sage to-nature-gold" />

          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="font-serif font-black text-slate-800 text-lg leading-none">Silakan Masuk</h2>
            <p className="text-xs text-slate-400">Gunakan kredensial yang terdaftar di IT Center Darul Arifin</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 font-medium leading-relaxed"
              id="login-error-msg"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin / pengasuh / akademik"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 focus:border-nature-forest rounded-xl transition-all focus:outline-none bg-slate-50/50"
                  id="login-username-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 focus:border-nature-forest rounded-xl transition-all focus:outline-none bg-slate-50/50"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  id="login-toggle-pass-btn"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="login-submit-btn"
            >
              <UserCheck className="w-4 h-4" />
              Masuk ke Portal SATDAF
            </button>
          </form>


        </motion.div>

        {/* Security Notice & Bookmark Shortcut */}
        <div className="space-y-3" id="login-footer-actions">
          <button
            type="button"
            onClick={() => setShowBookmarkModal(true)}
            className="w-full py-2 bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 border border-emerald-800/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            id="btn-open-bookmark-guide-login"
          >
            <Smartphone className="w-4 h-4 text-emerald-800 animate-bounce" />
            <span>Simpan Ikon SATDAF di HP / Smartphone</span>
          </button>

          <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto" id="login-security-notice">
            Halaman ini diatur oleh kebijakan hak akses internal Pondok Pesantren Darul Arifin Jambi. Penyalahgunaan akses terekam oleh log sistem IT Center.
          </p>
        </div>

        {/* Modal Guide */}
        <BookmarkGuideModal 
          isOpen={showBookmarkModal} 
          onClose={() => setShowBookmarkModal(false)} 
        />
      </div>
    </div>
  );
}
