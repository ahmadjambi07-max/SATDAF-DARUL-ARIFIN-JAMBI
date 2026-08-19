import React, { useState } from 'react';
import { 
  Smartphone, 
  Share, 
  PlusSquare, 
  Bookmark, 
  MoreVertical, 
  X, 
  Download, 
  Check, 
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookmarkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarkGuideModal({ isOpen, onClose }: BookmarkGuideModalProps) {
  const [deviceTab, setDeviceTab] = useState<'android' | 'ios' | 'desktop'>('android');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto cursor-pointer" 
          id="bookmark-modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-nature-border overflow-hidden my-8 cursor-default"
            id="bookmark-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Banner Header with SATDAF App Icon Preview */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white text-center relative overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all cursor-pointer z-50 flex items-center justify-center shadow-md"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>

            {/* App Icon Preview Circle */}
            <div className="relative z-10 space-y-3">
              <div className="relative w-24 h-24 mx-auto p-1.5 bg-gradient-to-tr from-amber-400 via-emerald-500 to-amber-200 rounded-3xl shadow-xl border border-amber-300/40">
                <img 
                  src="/icon.svg" 
                  alt="Ikon Aplikasi SATDAF" 
                  className="w-full h-full object-cover rounded-2xl shadow-inner"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-amber-300/30">
                  📱 Ikon Layar Utama & Bookmark
                </span>
                <h2 className="font-serif font-black text-xl text-white mt-1.5">
                  Jadikan SATDAF Aplikasi di HP
                </h2>
                <p className="text-xs text-emerald-100/90 max-w-xs mx-auto mt-1 font-medium leading-relaxed">
                  Pasang ikon resmi SATDAF Darul Arifin di layar utama smartphone agar mudah dibuka layaknya aplikasi instan!
                </p>
              </div>
            </div>

            {/* Decorative Background Glow */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Body Content & Device Switcher */}
          <div className="p-6 space-y-5">
            {/* Device Selector Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1">
              <button
                onClick={() => setDeviceTab('android')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  deviceTab === 'android'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Android</span>
              </button>

              <button
                onClick={() => setDeviceTab('ios')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  deviceTab === 'ios'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>iPhone / iPad</span>
              </button>

              <button
                onClick={() => setDeviceTab('desktop')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  deviceTab === 'desktop'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-amber-400" />
                <span>Komputer</span>
              </button>
            </div>

            {/* Steps Content according to active tab */}
            {deviceTab === 'android' && (
              <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-slate-800 text-xs">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-emerald-700" /> Cara Pasang di Android (Google Chrome):
                </h4>
                <ol className="space-y-2.5 pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      Buka web ini di <strong>Google Chrome</strong> HP Android Anda.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      Ketuk tombol <strong>Titik Tiga (⋮)</strong> di sudut kanan atas Chrome.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> (atau <em>Add to Home screen / Instal Aplikasi</em>).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      Klik <strong>"Tambah"</strong>. Ikon emas <strong>SATDAF</strong> akan langsung muncul di halaman depan HP Anda!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {deviceTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Share className="w-4 h-4 text-blue-600" /> Cara Pasang di iPhone / iPad (Safari):
                </h4>
                <ol className="space-y-2.5 pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      Buka web ini menggunakan browser resmi <strong>Safari</strong> di iPhone/iPad.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      Ketuk tombol <strong>Bagikan (Share)</strong> berbentuk kotak bersimbol panah di bagian bawah layar Safari.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      Gulir opsi ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      Ketuk <strong>"Tambah"</strong> di pojok kanan atas. Ikon SATDAF siap digunakan!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {deviceTab === 'desktop' && (
              <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-slate-800 text-xs">
                <h4 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                  <Bookmark className="w-4 h-4 text-amber-700" /> Bookmark & Instal di Komputer:
                </h4>
                <ol className="space-y-2.5 pl-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      Tekan kombinasi tombol <strong>Ctrl + D</strong> (Windows) atau <strong>Cmd + D</strong> (Mac) untuk menjadikan Bookmark browser.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      Atau klik ikon <strong>Instal Aplikasi (⊕)</strong> yang berada di sebelah kanan address bar browser Chrome/Edge.
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href="/icon.svg"
                download="satdaf_app_icon.svg"
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-300"
              >
                <Download className="w-4 h-4 text-emerald-800" />
                <span>Unduh Gambar Ikon (SVG)</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Link Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    <span>Salin Alamat Website</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Explicit Close Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Tutup Halaman Panduan</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </AnimatePresence>
  );
}
