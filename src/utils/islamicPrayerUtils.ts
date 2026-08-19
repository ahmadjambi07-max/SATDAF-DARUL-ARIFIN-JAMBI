// Utility for Indonesian Hijri Calendar and Kemenag-compliant Prayer Times (Jadwal Sholat)
// Specifically optimized for Provinsi Jambi & GPS Geolocation

export interface LocationInfo {
  id: string;
  name: string;
  kabupatenKota: string;
  latitude: number;
  longitude: number;
  isGps?: boolean;
}

export const JAMBI_LOCATIONS: LocationInfo[] = [
  { id: 'kota-jambi', name: 'Kota Jambi', kabupatenKota: 'Kota Jambi', latitude: -1.6101, longitude: 103.6131 },
  { id: 'muaro-jambi', name: 'Kab. Muaro Jambi (Sengeti)', kabupatenKota: 'Kab. Muaro Jambi', latitude: -1.4117, longitude: 103.6067 },
  { id: 'batanghari', name: 'Kab. Batanghari (Muara Bulian)', kabupatenKota: 'Kab. Batanghari', latitude: -1.7241, longitude: 103.2797 },
  { id: 'tanjab-barat', name: 'Kab. Tanjung Jabung Barat (Kuala Tungkal)', kabupatenKota: 'Kab. Tanjab Barat', latitude: -0.8164, longitude: 103.4631 },
  { id: 'tanjab-timur', name: 'Kab. Tanjung Jabung Timur (Muara Sabak)', kabupatenKota: 'Kab. Tanjab Timur', latitude: -1.1350, longitude: 103.8732 },
  { id: 'sarolangun', name: 'Kab. Sarolangun', kabupatenKota: 'Kab. Sarolangun', latitude: -2.3025, longitude: 102.6534 },
  { id: 'merangin', name: 'Kab. Merangin (Bangko)', kabupatenKota: 'Kab. Merangin', latitude: -2.0628, longitude: 102.2687 },
  { id: 'bungo', name: 'Kab. Bungo (Muara Bungo)', kabupatenKota: 'Kab. Bungo', latitude: -1.4983, longitude: 102.1227 },
  { id: 'tebo', name: 'Kab. Tebo (Muara Tebo)', kabupatenKota: 'Kab. Tebo', latitude: -1.4489, longitude: 102.3789 },
  { id: 'kerinci', name: 'Kab. Kerinci (Siulak)', kabupatenKota: 'Kab. Kerinci', latitude: -2.0833, longitude: 101.4000 },
  { id: 'sungai-penuh', name: 'Kota Sungai Penuh', kabupatenKota: 'Kota Sungai Penuh', latitude: -2.0601, longitude: 101.3934 },
];

export const HIJRI_MONTHS = [
  'Muharram',
  'Shafar',
  'Rabi\'ul Awwal',
  'Rabi\'ul Akhir',
  'Jumadil Awwal',
  'Jumadil Akhir',
  'Rajab',
  'Sya\'ban',
  'Ramadhan',
  'Syawwal',
  'Dzulqa\'dah',
  'Dzulhijjah'
];

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jum\'at',
  'Sabtu'
];

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export interface HijriDateResult {
  day: number;
  monthIndex: number;
  monthName: string;
  year: number;
  dayName: string;
  formatted: string;
  fullDateString: string;
}

export interface PrayerTimesResult {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface NextPrayerInfo {
  name: string;
  key: keyof PrayerTimesResult;
  time: string;
  remainingSeconds: number;
  countdownFormatted: string;
  isNext: boolean;
}

/**
 * Calculates Islamic Hijri date from Gregorian date with customizable offset (+/- days)
 */
export function getHijriDate(date: Date, offsetDays: number = 0): HijriDateResult {
  const targetDate = new Date(date);
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  const day = targetDate.getDate();
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();
  const dayOfWeek = targetDate.getDay();

  // Astronomical Julian Day calculation
  let m = month + 1;
  let y = year;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Convert Julian Day to Hijri (Kemenag standard tabular approximation with adjustment)
  const epoch = 1948439.5;
  const daysSinceEpoch = jd - epoch;
  const cycle = Math.floor(daysSinceEpoch / 10631);
  const cycleDays = daysSinceEpoch - cycle * 10631;
  const hYear = Math.floor((cycleDays * 30 + 10630) / 10631) + cycle * 30;
  
  let remainder = cycleDays - Math.floor((hYear - cycle * 30 - 1) * 10631 / 30);
  let hMonth = 1;
  while (hMonth <= 12) {
    const monthLength = (hMonth % 2 === 1 || (hMonth === 12 && isHijriLeapYear(hYear))) ? 30 : 29;
    if (remainder <= monthLength) break;
    remainder -= monthLength;
    hMonth++;
  }
  const hDay = Math.max(1, Math.min(30, Math.floor(remainder)));
  const monthName = HIJRI_MONTHS[(hMonth - 1) % 12];
  const dayName = INDONESIAN_DAYS[dayOfWeek];

  return {
    day: hDay,
    monthIndex: hMonth - 1,
    monthName,
    year: hYear,
    dayName,
    formatted: `${hDay} ${monthName} ${hYear} H`,
    fullDateString: `${dayName}, ${hDay} ${monthName} ${hYear} H`
  };
}

function isHijriLeapYear(year: number): boolean {
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(year % 30);
}

/**
 * Format Gregorian date in Indonesian
 */
export function getGregorianDateFormatted(date: Date): { dayName: string; formatted: string; fullDateString: string } {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const day = date.getDate();
  const monthName = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const formatted = `${day} ${monthName} ${year} M`;
  return {
    dayName,
    formatted,
    fullDateString: `${dayName}, ${formatted}`
  };
}

/**
 * Astronomical Prayer Time Calculation with Indonesian Ministry of Religious Affairs (Kemenag RI) standards
 * - Fajr / Subuh: 20°
 * - Isha / Isya: 18°
 * - Ihtiyat (safety margin): +2 minutes on Dzuhur, Ashar, Maghrib, Isya, Subuh
 * - Imsak: 10 minutes before Subuh
 * - Dhuha: Sun altitude ~4.5° (approx 20-25 mins after sunrise)
 */
export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffset: number = 7, // WIB (UTC+7 for Jambi)
  ihtiyatMinutes: number = 2
): PrayerTimesResult {
  const dayOfYear = getDayOfYear(date);
  
  // Declination and Equation of Time
  const gamma = 2 * Math.PI * (dayOfYear - 1) / 365;
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const deg = (radian: number) => (radian * 180) / Math.PI;

  const latRad = rad(latitude);
  
  // Solar Noon (Dzuhur transit)
  const timeOffset = eqtime + 4 * longitude - 60 * timezoneOffset;
  const tst = 12 * 60 - timeOffset; // in minutes from midnight
  const noonMinutes = tst;

  // Function to calculate hour angle for a given sun angle
  const getHourAngle = (angle: number): number => {
    const cosHA = (Math.sin(rad(angle)) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  // 1. Subuh: Sun altitude = -20° (Kemenag standard)
  const subuhHA = getHourAngle(-20);
  const subuhMinutes = noonMinutes - (subuhHA * 4) + ihtiyatMinutes;

  // 2. Imsak: 10 minutes before Subuh
  const imsakMinutes = subuhMinutes - 10;

  // 3. Sunrise / Terbit: Sun altitude = -0.833°
  const sunriseHA = getHourAngle(-0.833);
  const sunriseMinutes = noonMinutes - (sunriseHA * 4);

  // 4. Dhuha: Sun altitude = +4.5°
  const dhuhaHA = getHourAngle(4.5);
  const dhuhaMinutes = noonMinutes - (dhuhaHA * 4) + ihtiyatMinutes;

  // 5. Dzuhur: Solar noon + safety margin
  const dzuhurMinutes = noonMinutes + ihtiyatMinutes;

  // 6. Ashar: Shafi'i shadow length ratio = 1 + tan(|latitude - declination|)
  const asharAltitudeRad = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - decl))));
  const asharAngle = deg(asharAltitudeRad);
  const asharHA = getHourAngle(asharAngle);
  const asharMinutes = noonMinutes + (asharHA * 4) + ihtiyatMinutes;

  // 7. Maghrib: Sun altitude = -0.833° (sunset) + ihtiyat
  const maghribMinutes = noonMinutes + (sunriseHA * 4) + ihtiyatMinutes;

  // 8. Isya: Sun altitude = -18° (Kemenag standard) + ihtiyat
  const isyaHA = getHourAngle(-18);
  const isyaMinutes = noonMinutes + (isyaHA * 4) + ihtiyatMinutes;

  const formatMinutes = (mins: number): string => {
    let m = Math.round(mins);
    if (m < 0) m += 24 * 60;
    if (m >= 24 * 60) m -= 24 * 60;
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return {
    imsak: formatMinutes(imsakMinutes),
    subuh: formatMinutes(subuhMinutes),
    terbit: formatMinutes(sunriseMinutes),
    dhuha: formatMinutes(dhuhaMinutes),
    dzuhur: formatMinutes(dzuhurMinutes),
    ashar: formatMinutes(asharMinutes),
    maghrib: formatMinutes(maghribMinutes),
    isya: formatMinutes(isyaMinutes),
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export const PRAYER_DISPLAY_CONFIG = [
  { key: 'imsak' as const, label: 'Imsak', icon: 'Moon', desc: 'Waktu Menahan Makan/Minum' },
  { key: 'subuh' as const, label: 'Subuh', icon: 'Sunrise', desc: 'Fajar Shadiq' },
  { key: 'terbit' as const, label: 'Terbit', icon: 'Sun', desc: 'Matahari Terbit' },
  { key: 'dhuha' as const, label: 'Dhuha', icon: 'SunMedium', desc: 'Awal Waktu Sholat Dhuha' },
  { key: 'dzuhur' as const, label: 'Dzuhur', icon: 'Sun', desc: 'Tergelincir Matahari' },
  { key: 'ashar' as const, label: 'Ashar', icon: 'CloudSun', desc: 'Bayangan Lebih Panjang' },
  { key: 'maghrib' as const, label: 'Maghrib', icon: 'Sunset', desc: 'Matahari Terbenam' },
  { key: 'isya' as const, label: 'Isya', icon: 'MoonStar', desc: 'Hilang Syafaq Merah' },
];

/**
 * Calculates countdown and highlights the next upcoming prayer time
 */
export function getNextPrayerInfo(times: PrayerTimesResult, currentDate: Date): NextPrayerInfo {
  const now = currentDate;
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayersInOrder: { key: keyof PrayerTimesResult; label: string; timeStr: string; minutes: number }[] = [
    { key: 'subuh', label: 'Subuh', timeStr: times.subuh, minutes: parseTimeToMinutes(times.subuh) },
    { key: 'dhuha', label: 'Dhuha', timeStr: times.dhuha, minutes: parseTimeToMinutes(times.dhuha) },
    { key: 'dzuhur', label: 'Dzuhur', timeStr: times.dzuhur, minutes: parseTimeToMinutes(times.dzuhur) },
    { key: 'ashar', label: 'Ashar', timeStr: times.ashar, minutes: parseTimeToMinutes(times.ashar) },
    { key: 'maghrib', label: 'Maghrib', timeStr: times.maghrib, minutes: parseTimeToMinutes(times.maghrib) },
    { key: 'isya', label: 'Isya', timeStr: times.isya, minutes: parseTimeToMinutes(times.isya) },
  ];

  for (const prayer of prayersInOrder) {
    if (prayer.minutes > currentMinutes) {
      const diffSecs = Math.max(0, Math.floor((prayer.minutes - currentMinutes) * 60));
      return {
        name: prayer.label,
        key: prayer.key,
        time: prayer.timeStr,
        remainingSeconds: diffSecs,
        countdownFormatted: formatSecondsToHMS(diffSecs),
        isNext: true
      };
    }
  }

  // If all prayers today have passed, the next prayer is tomorrow's Subuh
  const firstPrayerTomorrow = prayersInOrder[0];
  const minutesTillMidnight = 24 * 60 - currentMinutes;
  const diffSecs = Math.max(0, Math.floor((minutesTillMidnight + firstPrayerTomorrow.minutes) * 60));
  return {
    name: firstPrayerTomorrow.label,
    key: firstPrayerTomorrow.key,
    time: firstPrayerTomorrow.timeStr,
    remainingSeconds: diffSecs,
    countdownFormatted: formatSecondsToHMS(diffSecs),
    isNext: true
  };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatSecondsToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
