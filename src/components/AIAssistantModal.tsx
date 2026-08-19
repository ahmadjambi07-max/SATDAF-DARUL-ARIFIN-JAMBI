import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Santri, 
  Kamar, 
  RecordMutabaahSantri, 
  PelanggaranSantri, 
  Prestasi, 
  PengasuhGuru, 
  CatatanKeuangan 
} from '../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Trophy, 
  Building2, 
  UserCheck, 
  Copy, 
  Check, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface AIAssistantModalProps {
  santri: Santri[];
  kamar: Kamar[];
  mutabaahRecords: RecordMutabaahSantri[];
  pelanggaran: PelanggaranSantri[];
  prestasi: Prestasi[];
  guru: PengasuhGuru[];
  keuangan?: CatatanKeuangan[];
  userRole?: string;
  username?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIAssistantModal({
  santri,
  kamar,
  mutabaahRecords,
  pelanggaran,
  prestasi,
  guru,
  userRole,
  username
}: AIAssistantModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `**Assalamu'alaikum Warahmatullahi Wabarakatuh, ${username || 'Ustadz/Pengasuh'}!** 🙏✨

Saya adalah **Asisten AI SATDAF** Pondok Pesantren Darul Arifin Jambi. Saya siap membantu Anda menganalisis seluruh data santri, asrama, mutabaah, kedisiplinan, hingga memberikan rekomendasi solusi dan reward.

**Layanan Utama Saya:**
- 🏢 **Analisis Asrama/Kamar Bermasalah & Solusi Operasional**
- ⚠️ **Rekomendasi Pembinaan Santri Bermasalah (Pelanggaran & Mutabaah Low)**
- 🏆 **Rekomendasi Reward/Apresiasi Mendidik untuk Santri & Kamar Berprestasi**
- 📊 **Tanya Jawab Data Santri, Wali Kamar, & Statistik Terkini**

Silakan pilih topik cepat di bawah ini atau ketikkan pertanyaan Anda!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Summarize full SATDAF system context for Gemini AI
  const systemContextData = useMemo(() => {
    // 1. Santri Demographics
    const totalSantri = santri.length;
    const santriPa = santri.filter(s => s.gender === 'Laki-laki').length;
    const santriPi = santri.filter(s => s.gender === 'Perempuan').length;
    const santriAktif = santri.filter(s => s.status === 'Aktif').length;

    // 2. Kamar Mutabaah Performance Summary
    const roomScores: { [idKamar: string]: { namaKamar: string; gedung: string; waliKamar: string; scores: number[] } } = {};
    kamar.forEach(k => {
      roomScores[k.id] = { namaKamar: k.namaKamar, gedung: k.gedung, waliKamar: k.waliKamar || 'Musyrif', scores: [] };
    });

    mutabaahRecords.forEach(rec => {
      if (roomScores[rec.idKamar]) {
        roomScores[rec.idKamar].scores.push(rec.rataRataPersentase);
      }
    });

    const kamarStats = Object.values(roomScores).map(k => {
      const avg = k.scores.length > 0 ? Math.round(k.scores.reduce((a, b) => a + b, 0) / k.scores.length) : 0;
      return {
        namaKamar: k.namaKamar,
        gedung: k.gedung,
        waliKamar: k.waliKamar,
        avgMutabaahPct: avg,
        totalLogRecords: k.scores.length
      };
    }).sort((a, b) => a.avgMutabaahPct - b.avgMutabaahPct); // lowest first

    const kamarTerendah = kamarStats.slice(0, 3);
    const kamarTertinggi = [...kamarStats].reverse().slice(0, 3);

    // 3. Santri Pelanggaran (Problematic Santri)
    const santriPelanggaranPoin: { [idSantri: string]: { nama: string; kelas: string; idKamar: string; totalPoin: number; count: number; rincian: string[] } } = {};
    pelanggaran.forEach(p => {
      const pointVal = p.kategori === 'Berat' ? 25 : p.kategori === 'Sedang' ? 10 : 5;
      if (!santriPelanggaranPoin[p.idSantri]) {
        const sObj = santri.find(s => s.id === p.idSantri);
        santriPelanggaranPoin[p.idSantri] = {
          nama: p.namaSantri || sObj?.nama || 'Santri',
          kelas: p.kelasSantri || sObj?.kelas || '-',
          idKamar: sObj?.idKamar || '',
          totalPoin: 0,
          count: 0,
          rincian: []
        };
      }
      santriPelanggaranPoin[p.idSantri].totalPoin += pointVal;
      santriPelanggaranPoin[p.idSantri].count += 1;
      santriPelanggaranPoin[p.idSantri].rincian.push(`${p.jenisPelanggaran} (${p.kategori})`);
    });

    const topPelanggaran = Object.values(santriPelanggaranPoin)
      .sort((a, b) => b.totalPoin - a.totalPoin)
      .slice(0, 5)
      .map(s => {
        const kObj = kamar.find(k => k.id === s.idKamar);
        return {
          ...s,
          namaKamar: kObj?.namaKamar || 'Kamar -'
        };
      });

    // 4. Santri Berprestasi & High Mutabaah Score
    const topPrestasiList = prestasi.slice(0, 5).map(p => ({
      penerimaNama: p.penerimaNama,
      penerimaTipe: p.penerimaTipe,
      judul: p.judul,
      kategori: p.kategori,
      penyelenggara: p.penyelenggara
    }));

    // Mutabaah top santri
    const santriMutabaahAvg: { [idSantri: string]: { nama: string; nis: string; idKamar: string; scores: number[] } } = {};
    mutabaahRecords.forEach(r => {
      if (!santriMutabaahAvg[r.idSantri]) {
        santriMutabaahAvg[r.idSantri] = {
          nama: r.namaSantri,
          nis: r.nisSantri,
          idKamar: r.idKamar,
          scores: []
        };
      }
      santriMutabaahAvg[r.idSantri].scores.push(r.rataRataPersentase);
    });

    const topSantriMutabaah = Object.values(santriMutabaahAvg)
      .map(s => {
        const avg = Math.round(s.scores.reduce((a, b) => a + b, 0) / (s.scores.length || 1));
        const kObj = kamar.find(k => k.id === s.idKamar);
        return {
          nama: s.nama,
          nis: s.nis,
          namaKamar: kObj?.namaKamar || '-',
          avgMutabaah: avg
        };
      })
      .sort((a, b) => b.avgMutabaah - a.avgMutabaah)
      .slice(0, 5);

    const lowSantriMutabaah = Object.values(santriMutabaahAvg)
      .map(s => {
        const avg = Math.round(s.scores.reduce((a, b) => a + b, 0) / (s.scores.length || 1));
        const kObj = kamar.find(k => k.id === s.idKamar);
        return {
          nama: s.nama,
          nis: s.nis,
          namaKamar: kObj?.namaKamar || '-',
          avgMutabaah: avg
        };
      })
      .sort((a, b) => a.avgMutabaah - b.avgMutabaah)
      .slice(0, 5);

    return {
      demografis: { totalSantri, santriPa, santriPi, santriAktif, totalKamar: kamar.length, totalGuru: guru.length },
      kamarStatsSummary: { kamarTerendahMutabaah: kamarTerendah, kamarTertinggiMutabaah: kamarTertinggi },
      santriPelanggaranTertinggi: topPelanggaran,
      santriPrestasi: topPrestasiList,
      santriMutabaahTertinggi: topSantriMutabaah,
      santriMutabaahTerendah: lowSantriMutabaah,
      totalRecordMutabaah: mutabaahRecords.length,
      totalPelanggaranRecorded: pelanggaran.length
    };
  }, [santri, kamar, mutabaahRecords, pelanggaran, prestasi, guru]);

  // Handle Send Question to AI Backend
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: systemContextData,
          chatHistory: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server AI.');
      }

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.response || 'Maaf, tidak ada jawaban dari AI Assistant.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Mohon Maaf:** ${err.message || 'Gagal menghubungkan ke server AI Assistant.'}\n\n*Pastikan koneksi internet aktif dan variabel GEMINI_API_KEY telah terpasang di Secrets.*`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick preset prompts
  const presetPrompts = [
    {
      icon: <Building2 className="w-3.5 h-3.5 text-amber-500" />,
      label: "Solusi Kamar Bermasalah",
      prompt: "Tolong analisis kamar/asrama mana saja yang memiliki nilai mutabaah paling rendah atau kendala kedisiplinan, serta berikan rekomendasi tindakan konkret untuk Wali Kamar."
    },
    {
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
      label: "Pembinaan Santri Bermasalah",
      prompt: "Siapa saja santri yang membutuhkan perhatian pembinaan khusus (skor mutabaah rendah atau poin pelanggaran tinggi)? Berikan langkah pembinaan bertahap yang islami dan efektif."
    },
    {
      icon: <Trophy className="w-3.5 h-3.5 text-amber-500" />,
      label: "Rekomendasi Reward Santri",
      prompt: "Berdasarkan data santri berprestasi dan mutabaah tertinggi, berikan rekomendasi reward/apresiasi yang pantas, Islami, dan mendidik untuk santri serta kamar teladan."
    },
    {
      icon: <Brain className="w-3.5 h-3.5 text-teal-600" />,
      label: "Ringkasan Eksekutif SATDAF",
      prompt: "Berikan ringkasan eksekutif menyeluruh tentang kondisi santri, kamar, mutabaah, dan tingkat kedisiplinan di Pondok Pesantren Darul Arifin saat ini."
    }
  ];

  return (
    <>
      {/* Floating Active AI Assistant Button (Fixed Bottom Right Corner) */}
      <motion.div
        className="fixed bottom-20 md:bottom-6 right-3.5 md:right-6 z-40 flex items-center gap-2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
            isOpen 
              ? 'bg-slate-900 text-white border-slate-700 ring-2 ring-nature-forest/50' 
              : 'bg-gradient-to-r from-nature-forest via-emerald-800 to-teal-900 text-white border-emerald-500/40 hover:scale-105 active:scale-95 hover:shadow-emerald-900/30'
          }`}
          title="Buka AI Assistant SATDAF"
          id="btn-trigger-ai-assistant"
        >
          {/* Animated Background Shimmer Glow */}
          {!isOpen && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          )}

          {/* Active Online Indicator Pulse */}
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative z-10" />
          </div>

          <div className="p-1.5 bg-white/10 rounded-xl border border-white/20 text-nature-gold group-hover:rotate-12 transition-transform">
            <Bot className="w-5 h-5" />
          </div>

          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide uppercase text-white">AI Assistant</span>
              <span className="px-1.5 py-0.2 bg-nature-gold/30 text-nature-gold border border-nature-gold/40 text-[9px] font-black rounded-full">
                AKTIF
              </span>
            </div>
            <p className="text-[10px] text-slate-200/90 font-medium leading-none mt-0.5">
              Konsultasi Data & Solusi
            </p>
          </div>

          <Sparkles className="w-4 h-4 text-nature-gold animate-bounce hidden md:block" />
        </button>
      </motion.div>

      {/* AI Assistant Chat Drawer / Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-50 transition-all duration-300 ${
              isMaximized
                ? 'inset-3 md:inset-6 max-w-none max-h-none'
                : 'bottom-20 right-4 sm:right-6 w-[95vw] sm:w-[460px] md:w-[540px] h-[82vh] max-h-[680px]'
            } bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden`}
            id="ai-assistant-window"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-nature-forest to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800/40 relative overflow-hidden shrink-0">
              {/* Subtle Decorative Backdrop pattern */}
              <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-nature-gold/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-nature-gold shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-white">AI Assistant SATDAF</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-black rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Gemini AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Sistem Konsultasi Data, Solusi Asrama & Santri
                  </p>
                </div>
              </div>

              {/* Window Header Action Controls */}
              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={() => setMessages([
                    {
                      id: `reset_${Date.now()}`,
                      sender: 'assistant',
                      text: `**Sesi percakapan telah diperbarui.** Ada yang bisa saya bantu terkait data santri, analisis kamar, atau rekomendasi reward?`,
                      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    }
                  ])}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  title="Bersihkan Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMaximized(prev => !prev)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer hidden sm:block"
                  title={isMaximized ? "Kecilkan Ukuran" : "Perbesar Ukuran"}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                  title="Tutup AI Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider pl-2 shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-nature-gold fill-nature-gold" /> Rekomendasi AI:
              </span>
              {presetPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset.prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 bg-white hover:bg-nature-beige/40 text-slate-700 hover:text-nature-forest text-xs font-bold rounded-xl border border-slate-200/80 hover:border-nature-forest/40 shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {preset.icon}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Conversation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar Icon */}
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-black ${
                      msg.sender === 'user' 
                        ? 'bg-nature-forest text-white' 
                        : 'bg-gradient-to-br from-emerald-700 to-teal-900 text-nature-gold border border-emerald-600/30'
                    }`}>
                      {msg.sender === 'user' ? (username?.charAt(0) || 'U') : <Bot className="w-4.5 h-4.5" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`group relative p-4 rounded-2xl shadow-3xs border text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-nature-forest text-white border-nature-forest rounded-tr-none'
                        : 'bg-white text-slate-800 border-slate-200/90 rounded-tl-none'
                    }`}>
                      {/* Copy Action button for AI replies */}
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer shadow-3xs"
                          title="Salin Jawaban AI"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* Message Content */}
                      {msg.sender === 'user' ? (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      ) : (
                        <div className="prose prose-slate prose-sm max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-nature-forest prose-strong:text-slate-900 prose-ul:my-1.5 prose-li:my-0.5">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      )}

                      <span className={`text-[10px] block text-right mt-2 font-medium ${
                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-nature-gold flex items-center justify-center shrink-0 shadow-2xs">
                      <Bot className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs rounded-tl-none flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-nature-forest animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-nature-forest animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-nature-forest animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-slate-500 italic font-medium">
                        Sedang Menganalisis Data SATDAF & Memformulasikan Solusi...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Modal Input Form Footer */}
            <div className="bg-white p-3 sm:p-4 border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Tanyakan data, solusi kamar, atau rekomendasi reward santri..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-forest/40 focus:border-nature-forest focus:bg-white transition-all disabled:opacity-50"
                    id="input-ai-prompt"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Sparkles className="w-4 h-4 text-nature-forest/60" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isLoading}
                  className="px-4 py-3 bg-gradient-to-r from-nature-forest to-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  id="btn-send-ai-prompt"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-2">
                <span>Ditenagai oleh Google Gemini 3.6 Flash</span>
                <span className="italic">Data bersifat terenkripsi & internal SATDAF</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
