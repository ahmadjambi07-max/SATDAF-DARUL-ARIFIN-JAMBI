import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Navigation, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Check, 
  Bell, 
  BellOff,
  BellRing, 
  Volume2, 
  VolumeX, 
  Compass, 
  AlertCircle, 
  Square, 
  Smartphone, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JAMBI_LOCATIONS, 
  LocationInfo, 
  getHijriDate, 
  getGregorianDateFormatted, 
  calculatePrayerTimes, 
  getNextPrayerInfo, 
  PrayerTimesResult,
  PRAYER_DISPLAY_CONFIG
} from '../utils/islamicPrayerUtils';
import { adhanPlayer } from '../utils/adhanAudio';

interface IslamicHeaderBarProps {
  currentMenuTitle?: string;
  currentMenuSubtitle?: string;
}

export default function IslamicHeaderBar({ 
  currentMenuTitle,
  currentMenuSubtitle 
}: IslamicHeaderBarProps) {
  // State for current live time (updates every second)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Hijri adjustment offset stored in localStorage (-2 to +2 days)
  const [hijriOffset, setHijriOffset] = useState<number>(() => {
    const saved = localStorage.getItem('satdaf_hijri_offset');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Selected Location (default Kota Jambi or saved)
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(() => {
    const saved = localStorage.getItem('satdaf_prayer_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return JAMBI_LOCATIONS[0]; // Kota Jambi
  });

  // Sound and Notification states
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('satdaf_prayer_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('satdaf_adhan_volume');
    return saved !== null ? parseFloat(saved) : 0.85;
  });

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('satdaf_prayer_notification_enabled');
    return saved !== null ? saved === 'true' : false;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [testNotificationSuccess, setTestNotificationSuccess] = useState<string | null>(null);

  // GPS state
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessNotice, setGpsSuccessNotice] = useState<string | null>(null);

  // Expanded/Compact bar state
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('satdaf_prayer_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  // Settings dropdown state
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Ref to track last triggered prayer minute to prevent duplicate alerts in the same minute
  const lastTriggeredKeyRef = useRef<string>('');
  const [audioErrorNotice, setAudioErrorNotice] = useState<string | null>(null);

  // Setup Audio Player listener
  useEffect(() => {
    adhanPlayer.setOnStateChange((playing, _sheikhId, error) => {
      setIsPlayingAudio(playing);
      if (error) {
        setAudioErrorNotice(error);
        setTimeout(() => setAudioErrorNotice(null), 5000);
      }
    });
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync settings with localStorage
  useEffect(() => {
    localStorage.setItem('satdaf_prayer_location', JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('satdaf_hijri_offset', hijriOffset.toString());
  }, [hijriOffset]);

  useEffect(() => {
    localStorage.setItem('satdaf_prayer_expanded', isExpanded.toString());
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('satdaf_prayer_sound', soundAlertEnabled.toString());
  }, [soundAlertEnabled]);

  useEffect(() => {
    localStorage.setItem('satdaf_adhan_volume', soundVolume.toString());
    adhanPlayer.setVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem('satdaf_prayer_notification_enabled', notificationEnabled.toString());
  }, [notificationEnabled]);

  // Calculate Dates
  const gregorianInfo = useMemo(() => getGregorianDateFormatted(currentDate), [currentDate]);
  const hijriInfo = useMemo(() => getHijriDate(currentDate, hijriOffset), [currentDate, hijriOffset]);

  // Calculate Prayer Times based on location
  const prayerTimes: PrayerTimesResult = useMemo(() => {
    return calculatePrayerTimes(currentDate, selectedLocation.latitude, selectedLocation.longitude, 7, 2);
  }, [currentDate, selectedLocation]);

  // Next prayer countdown
  const nextPrayer = useMemo(() => {
    return getNextPrayerInfo(prayerTimes, currentDate);
  }, [prayerTimes, currentDate]);

  // Real-time automatic trigger when prayer time arrives
  useEffect(() => {
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const dateKey = currentDate.toDateString();

    const prayerCheckList: { name: string; time: string; key: keyof PrayerTimesResult }[] = [
      { name: 'Imsak', time: prayerTimes.imsak, key: 'imsak' },
      { name: 'Subuh', time: prayerTimes.subuh, key: 'subuh' },
      { name: 'Dhuha', time: prayerTimes.dhuha, key: 'dhuha' },
      { name: 'Dzuhur', time: prayerTimes.dzuhur, key: 'dzuhur' },
      { name: 'Ashar', time: prayerTimes.ashar, key: 'ashar' },
      { name: 'Maghrib', time: prayerTimes.maghrib, key: 'maghrib' },
      { name: 'Isya', time: prayerTimes.isya, key: 'isya' }
    ];

    for (const prayer of prayerCheckList) {
      if (prayer.time === currentTimeStr) {
        const triggerId = `${dateKey}-${prayer.key}-${currentTimeStr}`;
        if (lastTriggeredKeyRef.current !== triggerId) {
          lastTriggeredKeyRef.current = triggerId;

          const isSubuh = prayer.key === 'subuh';

          // 1. Play Adhan Audio in background
          if (soundAlertEnabled) {
            adhanPlayer.play('syekh-ali-mulla', soundVolume, isSubuh);
          }

          // 2. Trigger Native Android Notification if permitted
          if (notificationEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const title = `🕌 Waktu Sholat ${prayer.name} Telah Tiba!`;
              const body = `Telah masuk waktu sholat ${prayer.name} (${prayer.time} WIB) untuk wilayah ${selectedLocation.name}. Hayya 'alash-Sholah!`;
              
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                  (registration as any).showNotification(title, {
                    body,
                    icon: '/icon.svg',
                    badge: '/icon.svg',
                    tag: `satdaf-prayer-${prayer.key}`,
                    renotify: true,
                    vibrate: [200, 100, 200, 100, 400]
                  });
                });
              } else {
                new Notification(title, {
                  body,
                  icon: '/icon.svg',
                  tag: `satdaf-prayer-${prayer.key}`
                });
              }
            } catch (err) {
              console.warn("Notification error:", err);
            }
          }
        }
        break;
      }
    }
  }, [currentDate, prayerTimes, soundAlertEnabled, soundVolume, notificationEnabled, selectedLocation]);

  // Request Notification Permission on Android / Browser
  const handleToggleNotification = async () => {
    if (!('Notification' in window)) {
      alert("Peramban atau perangkat Anda tidak mendukung Web Notification API.");
      return;
    }

    if (notificationPermission === 'granted') {
      const nextState = !notificationEnabled;
      setNotificationEnabled(nextState);
      if (nextState) {
        sendTestNotification();
      }
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setNotificationEnabled(true);
        sendTestNotification();
      } else {
        setNotificationEnabled(false);
      }
    } catch (e) {
      console.warn("Failed requesting notification permission:", e);
    }
  };

  // Trigger immediate Test Notification
  const sendTestNotification = () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      try {
        const title = `🕌 Pengingat Sholat SATDAF Aktif!`;
        const body = `Notifikasi jadwal waktu sholat siap berkumandang tepat waktu untuk wilayah ${selectedLocation.name}.`;
        
        new Notification(title, {
          body,
          icon: '/icon.svg',
          tag: 'satdaf-test-notification'
        });
        
        setTestNotificationSuccess(`Notifikasi uji coba berhasil dikirim ke layar HP Anda!`);
        setTimeout(() => setTestNotificationSuccess(null), 5000);
      } catch (err) {
        console.warn("Test notification failed:", err);
      }
    }
  };

  const handleStopAudio = () => {
    adhanPlayer.stop();
  };

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung fitur Geolocation GPS.");
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);
    setGpsSuccessNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        let closestLocation = JAMBI_LOCATIONS[0];
        let minDistance = Infinity;

        JAMBI_LOCATIONS.forEach((loc) => {
          const d = Math.hypot(loc.latitude - lat, loc.longitude - lng);
          if (d < minDistance) {
            minDistance = d;
            closestLocation = loc;
          }
        });

        const isNearbyJambi = minDistance < 1.5;
        const locationObj: LocationInfo = {
          id: 'gps-current',
          name: isNearbyJambi ? `GPS: ${closestLocation.kabupatenKota}` : 'GPS: Lokasi Pengguna',
          kabupatenKota: isNearbyJambi ? closestLocation.kabupatenKota : 'Koordinat GPS',
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lng.toFixed(4)),
          isGps: true
        };

        setSelectedLocation(locationObj);
        setIsLocatingGps(false);
        setGpsSuccessNotice(`Koordinat GPS terdeteksi: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        setTimeout(() => setGpsSuccessNotice(null), 4000);
      },
      (error) => {
        setIsLocatingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("Izin akses lokasi GPS ditolak oleh peramban/perangkat.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsError("Sinyal GPS lokasi tidak tersedia saat ini.");
        } else {
          setGpsError("Batas waktu pengambilan GPS habis. Silakan pilih wilayah Jambi manual.");
        }
        setTimeout(() => setGpsError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Format live time string (HH:mm:ss WIB)
  const timeFormatted = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="w-full mb-4 sm:mb-6 select-none" id="islamic-header-and-prayer-widget">
      {/* Top Banner: Dual Hijri & Gregorian Calendar + Live Digital Clock + Location */}
      <div className="bg-gradient-to-r from-emerald-950 via-nature-forest to-emerald-900 text-white rounded-2xl p-3.5 sm:p-5 shadow-xl border border-emerald-800/80 relative overflow-hidden">
        
        {/* Background Islamic Arabesque Geometric Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none overflow-hidden flex items-center justify-end pr-4">
          <svg viewBox="0 0 200 200" className="w-48 h-48 text-nature-gold animate-spin-slow">
            <path fill="currentColor" d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
          
          {/* Section 1: Menu Title & Dual Calendar Dates */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-nature-gold/25 to-nature-gold/10 border border-nature-gold/40 text-nature-gold flex items-center justify-center shrink-0 shadow-inner">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              {currentMenuTitle && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-nature-gold/20 text-nature-gold text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-md border border-nature-gold/30">
                    {currentMenuTitle}
                  </span>
                  {currentMenuSubtitle && (
                    <span className="text-[10px] sm:text-xs text-slate-300 truncate hidden sm:inline">
                      • {currentMenuSubtitle}
                    </span>
                  )}
                </div>
              )}

              {/* Dual Dates Display */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* Hijri Calendar */}
                <div className="flex items-center gap-1.5 text-nature-gold font-bold text-xs sm:text-sm">
                  <Moon className="w-3.5 h-3.5 text-nature-gold shrink-0" />
                  <span className="font-serif tracking-wide">{hijriInfo.fullDateString}</span>
                  {hijriOffset !== 0 && (
                    <span className="text-[9px] px-1 py-0.2 bg-nature-gold/20 rounded text-amber-200">
                      ({hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset} hr)
                    </span>
                  )}
                </div>

                <span className="text-emerald-700 hidden sm:inline">•</span>

                {/* Gregorian (Masehi) Calendar */}
                <div className="flex items-center gap-1.5 text-slate-200 text-xs sm:text-sm font-medium">
                  <span className="opacity-90">{gregorianInfo.fullDateString}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Real-time Live Clock & Notification Toggles & Location */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 sm:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-emerald-800/60">
            
            {/* Live Clock & Next Prayer Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl flex items-center gap-2 shadow-inner">
                <Clock className="w-4 h-4 text-nature-gold animate-pulse" />
                <span className="font-mono font-black text-xs sm:text-sm text-white tracking-widest">
                  {timeFormatted} <span className="text-[9px] font-sans font-bold text-nature-sage">WIB</span>
                </span>
              </div>

              {/* Next Prayer Countdown Pill */}
              <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center gap-1.5 shadow-sm text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-nature-gold shrink-0" />
                <div className="text-[10px] sm:text-xs">
                  <span className="text-slate-300 font-normal">Menuju </span>
                  <span className="font-bold text-nature-gold">{nextPrayer.name}</span>: {' '}
                  <span className="font-mono font-bold text-white">{nextPrayer.countdownFormatted}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Sound Toggle, Android Notif & Location Picker */}
            <div className="flex items-center gap-1.5">
              
              {/* Quick Sound Toggle & Stop Button if playing */}
              {isPlayingAudio ? (
                <button
                  onClick={handleStopAudio}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow animate-pulse cursor-pointer"
                  title="Hentikan Kumandang Adzan"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] hidden sm:inline">Hentikan</span>
                </button>
              ) : (
                <button
                  onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    soundAlertEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                  title={soundAlertEnabled ? 'Suara Sholat Aktif' : 'Suara Sholat Nonaktif'}
                >
                  {soundAlertEnabled ? <Volume2 className="w-4 h-4 text-nature-gold" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}

              {/* Quick Android Notification Toggle Button */}
              <button
                onClick={handleToggleNotification}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  notificationEnabled && notificationPermission === 'granted'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={notificationEnabled ? 'Notifikasi HP Android Aktif' : 'Aktifkan Notifikasi HP Android'}
              >
                {notificationEnabled && notificationPermission === 'granted' ? (
                  <BellRing className="w-4 h-4 text-emerald-400 animate-bounce" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>

              {/* Wilayah Location & Settings Trigger */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSettings
                    ? 'bg-nature-gold text-slate-950 border-amber-300 shadow'
                    : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
                title="Pilih Wilayah Jambi & Pengaturan"
              >
                <MapPin className={`w-3.5 h-3.5 ${showSettings ? 'text-slate-950' : 'text-nature-gold'}`} />
                <span className="truncate max-w-[110px] sm:max-w-[150px]">{selectedLocation.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180 text-slate-950' : 'text-slate-400'}`} />
              </button>

              {/* GPS Quick Button */}
              <button
                onClick={handleDetectGPS}
                disabled={isLocatingGps}
                className="p-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow"
                title="Deteksi Lokasi GPS Otomatis"
              >
                <Compass className={`w-4 h-4 text-white ${isLocatingGps ? 'animate-spin' : ''}`} />
              </button>

              {/* Toggle Expand / Compact Schedule */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-slate-200 rounded-xl transition-colors cursor-pointer border border-emerald-700/50"
                title={isExpanded ? 'Sembunyikan Jadwal Rinci' : 'Tampilkan Jadwal Rinci'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Audio Playing Indicator Banner */}
        {isPlayingAudio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2.5 bg-gradient-to-r from-amber-500/20 via-emerald-800/40 to-amber-500/20 border border-amber-400/50 rounded-xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1 text-nature-gold animate-pulse">
                <span className="w-1 h-3 bg-nature-gold rounded-full inline-block animate-bounce"></span>
                <span className="w-1 h-5 bg-nature-gold rounded-full inline-block animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-4 bg-nature-gold rounded-full inline-block animate-bounce [animation-delay:0.3s]"></span>
              </div>
              <div className="truncate">
                <span className="font-bold text-nature-gold">Sedang Mengumandangkan Adzan Sholat</span>
              </div>
            </div>

            <button
              onClick={handleStopAudio}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-xs flex items-center gap-1 shrink-0 shadow cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Hentikan</span>
            </button>
          </motion.div>
        )}

        {/* GPS / Notification Success Notices */}
        {gpsSuccessNotice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsSuccessNotice}</span>
          </motion.div>
        )}

        {testNotificationSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>{testNotificationSuccess}</span>
          </motion.div>
        )}

        {gpsError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-200 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </motion.div>
        )}

        {audioErrorNotice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-200 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{audioErrorNotice}</span>
          </motion.div>
        )}

        {/* Settings Panel (Location + Audio/Notification + Hijri Correction) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3.5 pt-3.5 border-t border-emerald-800/80 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* 1. Pilih Kabupaten / Kota di Provinsi Jambi */}
                <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-emerald-800/60">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-nature-gold" />
                    <span>Pilih Wilayah (Provinsi Jambi):</span>
                  </label>
                  <select
                    value={selectedLocation.id}
                    onChange={(e) => {
                      const loc = JAMBI_LOCATIONS.find(l => l.id === e.target.value);
                      if (loc) setSelectedLocation(loc);
                    }}
                    className="w-full bg-slate-900 border border-emerald-700/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-nature-gold text-xs"
                  >
                    {JAMBI_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                    {selectedLocation.isGps && (
                      <option value="gps-current">
                        📍 {selectedLocation.name} ({selectedLocation.latitude}, {selectedLocation.longitude})
                      </option>
                    )}
                  </select>
                  <button
                    onClick={handleDetectGPS}
                    disabled={isLocatingGps}
                    className="w-full px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-nature-gold" />
                    <span>{isLocatingGps ? 'Mencari Sinyal GPS...' : 'Gunakan GPS Lokasi Saat Ini'}</span>
                  </button>
                </div>

                {/* 2. Pengaturan Notifikasi HP & Suara */}
                <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-emerald-800/60">
                  <label className="text-slate-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-nature-gold" />
                      <span>Notifikasi Android & Suara:</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      notificationEnabled && notificationPermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {notificationEnabled && notificationPermission === 'granted' ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleToggleNotification}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        notificationEnabled && notificationPermission === 'granted'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{notificationEnabled ? 'Notif HP: On' : 'Notif HP: Off'}</span>
                    </button>

                    <button
                      onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        soundAlertEnabled
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{soundAlertEnabled ? 'Suara: On' : 'Suara: Off'}</span>
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Volume:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                      className="w-full accent-nature-gold h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-nature-gold font-bold">{Math.round(soundVolume * 100)}%</span>
                  </div>

                  {/* Test Notification Button */}
                  <button
                    onClick={sendTestNotification}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kirim Uji Notifikasi ke Layar HP</span>
                  </button>
                </div>

                {/* 3. Koreksi Tanggal Hijriyah (Isbat) */}
                <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-emerald-800/60">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-nature-gold" />
                    <span>Koreksi Tanggal Hijriyah (Isbat):</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 border border-emerald-700/60 rounded-xl p-1">
                    {[-2, -1, 0, 1, 2].map((offset) => (
                      <button
                        key={offset}
                        onClick={() => setHijriOffset(offset)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          hijriOffset === offset
                            ? 'bg-nature-gold text-emerald-950 shadow'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {offset === 0 ? 'Normal' : offset > 0 ? `+${offset}` : offset}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-900/90 border border-emerald-700/60 rounded-xl p-2 text-[10px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Standar Hisab:</span>
                      <span className="font-bold text-nature-gold">Kemenag RI (Subuh 20°, Isya 18°)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pengaman Ihtiyat:</span>
                      <span className="font-bold text-emerald-400">+2 Menit</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Selesai / Tutup
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Expanded Prayer Times Card Grid (Kemenag Reference) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2.5"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {PRAYER_DISPLAY_CONFIG.map((item) => {
                const prayerKey = item.key;
                const timeValue = prayerTimes[prayerKey];
                const isNext = nextPrayer.key === prayerKey;

                return (
                  <div
                    key={prayerKey}
                    className={`rounded-xl p-2.5 text-center transition-all duration-200 border relative overflow-hidden ${
                      isNext
                        ? 'bg-gradient-to-b from-amber-500/20 to-emerald-950 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/50 scale-[1.02]'
                        : 'bg-slate-900/85 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    {isNext && (
                      <div className="absolute top-0 right-0 left-0 bg-amber-400 text-slate-950 text-[8px] font-black uppercase py-0.5 tracking-wider">
                        Waktu Berikutnya
                      </div>
                    )}

                    <div className={`mt-${isNext ? '3' : '1'} mb-1 flex items-center justify-center`}>
                      {prayerKey === 'imsak' && <Moon className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-blue-400'}`} />}
                      {prayerKey === 'subuh' && <Sunrise className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-cyan-400'}`} />}
                      {prayerKey === 'terbit' && <Sun className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-amber-400'}`} />}
                      {prayerKey === 'dhuha' && <Sun className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-yellow-400'}`} />}
                      {prayerKey === 'dzuhur' && <Sun className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-orange-400'}`} />}
                      {prayerKey === 'ashar' && <Sunset className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-rose-400'}`} />}
                      {prayerKey === 'maghrib' && <Sunset className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-purple-400'}`} />}
                      {prayerKey === 'isya' && <Moon className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-indigo-400'}`} />}
                    </div>

                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      {item.label}
                    </div>

                    <div className={`text-base sm:text-lg font-black font-mono mt-0.5 ${
                      isNext ? 'text-nature-gold' : 'text-white'
                    }`}>
                      {timeValue}
                    </div>

                    <div className="text-[8px] text-slate-400 truncate opacity-75 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Attribution & Status note */}
            <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 mt-1.5 px-2 gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Standar Hisab Kemenag RI
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-nature-gold" />
                  <span>Suara: <strong className="text-slate-200">{soundAlertEnabled ? 'Aktif' : 'Mati'}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3 text-emerald-400" />
                  <span>Notif Android: <strong className="text-slate-200">{notificationEnabled && notificationPermission === 'granted' ? 'Aktif' : 'Nonaktif'}</strong></span>
                </span>
                <span>
                  Wilayah: <strong className="text-slate-200">{selectedLocation.name}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
