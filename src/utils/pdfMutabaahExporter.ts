import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecordMutabaahSantri, PelanggaranSantri } from '../types';
import { calculateSantriGamificationStats } from '../data/gamificationEngine';

interface ExportMutabaahPDFOptions {
  record: RecordMutabaahSantri;
  pelanggaranList?: PelanggaranSantri[];
  allMutabaahRecords?: RecordMutabaahSantri[];
  isPortalOrangTua?: boolean;
}

/**
 * Sanitizes text to prevent font corruption in standard PDF Helvetica font.
 * Strips UTF-8 emojis, unicode block elements, and non-Latin1 symbols that cause garbled text in jsPDF.
 */
function cleanPDFText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/🎮/g, '')
    .replace(/📌/g, '')
    .replace(/↳/g, ' -> ')
    .replace(/✅/g, '[OK] ')
    .replace(/🔒/g, '[X] ')
    .replace(/🌟/g, '*')
    .replace(/•/g, '-')
    .replace(/█/g, '=')
    .replace(/░/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[^\x00-\x7F\xA0-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Draws a 5-point vector star on the PDF canvas.
 */
function drawVectorStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  fillRGB: [number, number, number],
  strokeRGB?: [number, number, number]
) {
  const spikes = 5;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  doc.setFillColor(fillRGB[0], fillRGB[1], fillRGB[2]);
  if (strokeRGB) {
    doc.setDrawColor(strokeRGB[0], strokeRGB[1], strokeRGB[2]);
    doc.setLineWidth(0.2);
  }

  let prevX = cx + Math.cos(rot) * outerRadius;
  let prevY = cy + Math.sin(rot) * outerRadius;

  for (let i = 0; i < spikes; i++) {
    const nextInnerX = cx + Math.cos(rot + step) * innerRadius;
    const nextInnerY = cy + Math.sin(rot + step) * innerRadius;
    const nextOuterX = cx + Math.cos(rot + step * 2) * outerRadius;
    const nextOuterY = cy + Math.sin(rot + step * 2) * outerRadius;

    doc.triangle(cx, cy, prevX, prevY, nextInnerX, nextInnerY, strokeRGB ? 'FD' : 'F');
    doc.triangle(cx, cy, nextInnerX, nextInnerY, nextOuterX, nextOuterY, strokeRGB ? 'FD' : 'F');

    rot += step * 2;
    prevX = nextOuterX;
    prevY = nextOuterY;
  }
}

/**
 * Draws an RPG Level Shield Emblem with Gold Star & Level Number
 */
function drawRPGLevelShield(doc: jsPDF, x: number, y: number, levelNum: number) {
  // Outer Shield Body
  doc.setFillColor(31, 62, 41); // Dark Green
  doc.setDrawColor(180, 150, 80); // Gold Border
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, 22, 25, 3, 3, 'FD');

  // Inner Banner Header
  doc.setFillColor(180, 150, 80); // Gold
  doc.rect(x + 1, y + 1, 20, 5, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text('LEVEL', x + 11, y + 4.5, { align: 'center' });

  // Big Level Number
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(245, 230, 180); // Warm Gold
  doc.text(`${levelNum}`, x + 11, y + 14.5, { align: 'center' });

  // Star Emblem at bottom of shield
  drawVectorStar(doc, x + 11, y + 20, 2.5, 1.2, [234, 179, 8], [180, 150, 80]);
}

/**
 * Draws a Golden Trophy / Medal Graphic
 */
function drawTrophyIcon(doc: jsPDF, x: number, y: number) {
  // Trophy Cup Top
  doc.setFillColor(234, 179, 8); // Gold
  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.3);
  doc.roundedRect(x + 2, y, 8, 6, 1, 1, 'FD');

  // Handles
  doc.setFillColor(202, 138, 4);
  doc.rect(x, y + 1.5, 2, 3, 'F');
  doc.rect(x + 10, y + 1.5, 2, 3, 'F');

  // Stem & Base
  doc.setFillColor(180, 150, 80);
  doc.rect(x + 5, y + 6, 2, 3, 'F');
  doc.roundedRect(x + 2, y + 9, 8, 2, 0.5, 0.5, 'F');

  // Star on cup
  drawVectorStar(doc, x + 6, y + 3, 1.2, 0.6, [255, 255, 255]);
}

/**
 * Draws a vector progress bar
 */
function drawVectorProgressBar(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  percent: number, 
  barColor: [number, number, number],
  showText: boolean = true
) {
  const safePct = Math.max(0, Math.min(100, Math.round(percent)));
  // Background
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'FD');

  // Fill Bar
  if (safePct > 0) {
    const fillWidth = Math.max(height, (width * safePct) / 100);
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(x, y, fillWidth, height, height / 2, height / 2, 'F');
  }

  // Percentage Text
  if (showText) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${safePct}%`, x + width + 3, y + height - 0.5);
  }
}

/**
 * Draws an Islamic Ayah / Verse Frame (Rub el Hizb / Star Badge) for Item Numbers
 */
function drawIslamicAyahNumberFrame(doc: jsPDF, cx: number, cy: number, numStr: string) {
  const r = 3.2;
  doc.setFillColor(254, 243, 199); // Soft Gold Light
  doc.setDrawColor(180, 150, 80); // Gold
  doc.setLineWidth(0.3);

  // Base Circle
  doc.circle(cx, cy, r, 'FD');

  // Inner gold ring
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.15);
  doc.circle(cx, cy, r - 0.5, 'S');

  // Center Number
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(31, 62, 41); // Dark Green
  doc.text(numStr, cx, cy + 0.8, { align: 'center' });
}

/**
 * 1. Mosque Icon (Spiritual Utama / General Islamic)
 */
function drawIslamicMosqueIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(21, 128, 61); // Emerald
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.2);
  doc.triangle(cx - 2.2, cy - 0.2, cx, cy - 2.8, cx + 2.2, cy - 0.2, 'F');

  drawVectorStar(doc, cx, cy - 3.2, 0.8, 0.4, [234, 179, 8]);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(21, 128, 61);
  doc.rect(cx - 2.2, cy - 0.2, 4.4, 2.7, 'FD');

  doc.setFillColor(21, 128, 61);
  doc.roundedRect(cx - 0.8, cy + 0.8, 1.6, 1.7, 0.6, 0.6, 'F');

  doc.setFillColor(15, 118, 110);
  doc.rect(cx - 3.3, cy - 2.0, 0.8, 4.5, 'F');
  doc.triangle(cx - 3.5, cy - 2.0, cx - 2.9, cy - 3.0, cx - 2.3, cy - 2.0, 'F');

  doc.rect(cx + 2.5, cy - 2.0, 0.8, 4.5, 'F');
  doc.triangle(cx + 2.3, cy - 2.0, cx + 2.9, cy - 3.0, cx + 3.5, cy - 2.0, 'F');
}

/**
 * 2. Kaaba Icon (Masjidil Haram / Shalat)
 */
function drawKaabaIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(15, 23, 42); // Very Dark Slate
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.roundedRect(cx - 2.8, cy - 2.8, 5.6, 5.6, 0.5, 0.5, 'FD');

  doc.setFillColor(234, 179, 8); // Gold
  doc.rect(cx - 2.8, cy - 1.2, 5.6, 0.9, 'F');

  doc.rect(cx + 0.4, cy + 0.2, 1.4, 2.2, 'F');

  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.3);
  doc.line(cx - 2.8, cy - 2.8, cx + 2.8, cy - 2.8);
}

/**
 * 3. Crescent Moon & Star Icon (Tahajud / Qiyam / Night Prayer)
 */
function drawCrescentMoonIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(30, 27, 75); // Deep Indigo
  doc.circle(cx, cy, 3.0, 'F');

  doc.setFillColor(250, 204, 21); // Gold Moon
  doc.circle(cx - 0.5, cy, 2.0, 'F');
  doc.setFillColor(30, 27, 75);
  doc.circle(cx + 0.3, cy - 0.4, 1.8, 'F');

  drawVectorStar(doc, cx + 1.2, cy - 0.8, 0.9, 0.4, [255, 255, 255]);
}

/**
 * 4. Open Quran Book Icon (Tilawah / Setoran / Murajaah)
 */
function drawQuranBookIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setDrawColor(120, 53, 15); // Dark Wood
  doc.setLineWidth(0.4);
  doc.line(cx - 2.5, cy + 2.2, cx + 2.5, cy - 0.5);
  doc.line(cx + 2.5, cy + 2.2, cx - 2.5, cy - 0.5);

  doc.setFillColor(255, 251, 235); // Cream
  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.2);
  doc.roundedRect(cx - 3.2, cy - 2.2, 3.0, 3.2, 0.3, 0.3, 'FD');
  doc.roundedRect(cx + 0.2, cy - 2.2, 3.0, 3.2, 0.3, 0.3, 'FD');

  doc.setDrawColor(21, 128, 61);
  doc.setLineWidth(0.15);
  doc.line(cx - 2.6, cy - 1.4, cx - 0.8, cy - 1.4);
  doc.line(cx - 2.6, cy - 0.6, cx - 0.8, cy - 0.6);

  doc.line(cx + 0.8, cy - 1.4, cx + 2.6, cy - 1.4);
  doc.line(cx + 0.8, cy - 0.6, cx + 2.6, cy - 0.6);

  doc.setFillColor(225, 29, 72);
  doc.rect(cx - 0.2, cy - 2.2, 0.4, 3.8, 'F');
}

/**
 * 5. Tasbih / Dzikir Beads Icon (Dzikir Ba'da Shalat)
 */
function drawTasbihBeadsIcon(doc: jsPDF, cx: number, cy: number) {
  const radius = 2.0;
  const count = 7;
  const beadR = 0.5;

  doc.setFillColor(13, 148, 136); // Teal Beads
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    const bx = cx + Math.cos(angle) * radius;
    const by = cy + Math.sin(angle) * radius;
    doc.circle(bx, by, beadR, 'F');
  }

  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.3);
  doc.line(cx, cy + radius, cx, cy + radius + 1.2);

  doc.setFillColor(234, 179, 8);
  doc.triangle(cx - 0.6, cy + radius + 2.2, cx, cy + radius + 1.0, cx + 0.6, cy + radius + 2.2, 'F');
}

/**
 * 6. Crown Icon (Mahkota Tahfizh)
 */
function drawCrownIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(234, 179, 8); // Gold
  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.2);

  doc.roundedRect(cx - 2.5, cy + 0.8, 5.0, 1.2, 0.2, 0.2, 'FD');

  doc.triangle(cx - 2.5, cy + 0.8, cx - 2.5, cy - 1.8, cx - 1.2, cy + 0.8, 'F');
  doc.triangle(cx - 1.2, cy + 0.8, cx, cy - 2.5, cx + 1.2, cy + 0.8, 'F');
  doc.triangle(cx + 1.2, cy + 0.8, cx + 2.5, cy - 1.8, cx + 2.5, cy + 0.8, 'F');

  doc.setFillColor(225, 29, 72); // Red Jewels
  doc.circle(cx - 2.5, cy - 1.8, 0.4, 'F');
  doc.circle(cx, cy - 2.5, 0.5, 'F');
  doc.circle(cx + 2.5, cy - 1.8, 0.4, 'F');
}

/**
 * 7. Shield Icon (Akhlak & Discipline)
 */
function drawShieldIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(126, 34, 206); // Purple
  doc.setDrawColor(192, 132, 252);
  doc.setLineWidth(0.2);

  doc.roundedRect(cx - 2.5, cy - 2.5, 5.0, 4.2, 0.6, 0.6, 'FD');
  doc.triangle(cx - 2.5, cy + 1.2, cx, cy + 2.8, cx + 2.5, cy + 1.2, 'F');

  drawVectorStar(doc, cx, cy - 0.2, 1.1, 0.5, [234, 179, 8]);
}

/**
 * 8. Speech Scroll / Language Icon (Bahasa Arab & Inggris)
 */
function drawSpeechScrollIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(2, 132, 199); // Sky Blue
  doc.setDrawColor(125, 211, 252);
  doc.setLineWidth(0.2);

  doc.roundedRect(cx - 2.8, cy - 2.2, 5.6, 3.8, 0.8, 0.8, 'FD');
  doc.triangle(cx - 1.2, cy + 1.6, cx - 2.2, cy + 2.8, cx - 0.2, cy + 1.6, 'F');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(cx - 1.8, cy - 0.8, cx + 1.8, cy - 0.8);
  doc.line(cx - 1.8, cy + 0.2, cx + 0.8, cy + 0.2);
}

/**
 * 9. Microphone Icon (Leadership & Public Speaking)
 */
function drawMicrophoneIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(217, 119, 6); // Amber
  doc.setDrawColor(180, 150, 80);
  doc.setLineWidth(0.2);
  doc.roundedRect(cx - 1.2, cy - 2.5, 2.4, 3.0, 0.8, 0.8, 'FD');

  doc.setFillColor(71, 85, 105);
  doc.rect(cx - 0.4, cy + 0.5, 0.8, 2.0, 'F');

  doc.line(cx - 1.2, cy + 2.5, cx + 1.2, cy + 2.5);

  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.25);
  doc.line(cx - 2.0, cy - 1.5, cx - 2.0, cy + 0.2);
  doc.line(cx + 2.0, cy - 1.5, cx + 2.0, cy + 0.2);
}

/**
 * 10. Health & Cleanliness Leaf Icon (Piket / Olahraga)
 */
function drawLeafHealthIcon(doc: jsPDF, cx: number, cy: number) {
  doc.setFillColor(16, 185, 129); // Emerald Leaf
  doc.setDrawColor(110, 231, 183);
  doc.setLineWidth(0.2);

  doc.circle(cx, cy, 2.8, 'FD');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(cx, cy - 1.8, cx, cy + 1.8);
  doc.line(cx - 1.8, cy, cx + 1.8, cy);
}

/**
 * Dispatcher to select and draw the appropriate Islamic/Iconic Vector Graphic
 */
function drawIslamicSkillIcon(
  doc: jsPDF,
  cx: number,
  cy: number,
  skillName: string,
  category: string,
  idx: number
) {
  const lowerName = skillName.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (lowerName.includes('shalat') || lowerName.includes('jamaah') || lowerName.includes('kaaba')) {
    drawKaabaIcon(doc, cx, cy);
  } else if (lowerName.includes('tahajud') || lowerName.includes('qiyam') || lowerName.includes('malam')) {
    drawCrescentMoonIcon(doc, cx, cy);
  } else if (lowerName.includes('tilawah') || lowerName.includes('qur') || lowerName.includes('hafalan') || lowerName.includes('murajaah') || lowerName.includes('setoran')) {
    drawQuranBookIcon(doc, cx, cy);
  } else if (lowerName.includes('dzikir') || lowerName.includes('tasbih') || lowerName.includes('doa')) {
    drawTasbihBeadsIcon(doc, cx, cy);
  } else if (lowerName.includes('spiritual') || lowerCat.includes('spiritual')) {
    drawIslamicMosqueIcon(doc, cx, cy);
  } else if (lowerName.includes('mahkota') || lowerCat.includes('tahfizh')) {
    drawCrownIcon(doc, cx, cy);
  } else if (lowerName.includes('bahasa') || lowerName.includes('arab') || lowerName.includes('inggris') || lowerName.includes('muhadatsah') || lowerCat.includes('bahasa')) {
    drawSpeechScrollIcon(doc, cx, cy);
  } else if (lowerName.includes('akhlak') || lowerName.includes('jujur') || lowerName.includes('disiplin') || lowerCat.includes('akhlak')) {
    drawShieldIcon(doc, cx, cy);
  } else if (lowerName.includes('kepemimpinan') || lowerName.includes('public') || lowerName.includes('speaking') || lowerName.includes('kultum') || lowerCat.includes('leadership')) {
    drawMicrophoneIcon(doc, cx, cy);
  } else if (lowerName.includes('kesehatan') || lowerName.includes('kebersihan') || lowerName.includes('piket') || lowerName.includes('olahraga') || lowerCat.includes('kesehatan')) {
    drawLeafHealthIcon(doc, cx, cy);
  } else {
    const fallbackList = [
      drawIslamicMosqueIcon,
      drawKaabaIcon,
      drawCrescentMoonIcon,
      drawQuranBookIcon,
      drawTasbihBeadsIcon,
      drawCrownIcon,
      drawShieldIcon,
      drawSpeechScrollIcon,
      drawMicrophoneIcon,
      drawLeafHealthIcon
    ];
    fallbackList[idx % fallbackList.length](doc, cx, cy);
  }
}

export function generateMutabaahWithGamificationPDF({
  record,
  pelanggaranList = [],
  allMutabaahRecords = [],
  isPortalOrangTua = false
}: ExportMutabaahPDFOptions): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Calculate Gamification Stats for this Santri
  const recordsForSantri = allMutabaahRecords.length > 0 
    ? allMutabaahRecords.filter(r => r.idSantri === record.idSantri)
    : [record];

  const stats = calculateSantriGamificationStats(
    record.idSantri,
    recordsForSantri,
    pelanggaranList
  );

  // -------------------------------------------------------------------------
  // PAGE 1: HEADER & IDENTITAS & GAME HERO SUMMARY
  // -------------------------------------------------------------------------

  // Top Dark Green Bar
  doc.setFillColor(31, 62, 41); // #1F3E29
  doc.rect(10, 8, 190, 4, 'F');

  // Header Star Graphics
  drawVectorStar(doc, 18, 18, 3, 1.5, [180, 150, 80]);
  drawVectorStar(doc, 192, 18, 3, 1.5, [180, 150, 80]);

  // Title Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(31, 62, 41);
  doc.text('PONDOK PESANTREN DARUL ARIFIN JAMBI', 105, 18, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Sistem Administrasi Terpadu & Portal Monitoring Santri (SATDAF)', 105, 22.5, { align: 'center' });
  doc.text('Jl. Lintas Jambi - Ma. Bulian KM 21, Pijoan, Muaro Jambi', 105, 26, { align: 'center' });

  // Double Decorative Divider
  doc.setDrawColor(180, 150, 80); // Gold
  doc.setLineWidth(0.5);
  doc.line(10, 28.5, 200, 28.5);
  doc.setDrawColor(31, 62, 41); // Dark Green
  doc.setLineWidth(1);
  doc.line(10, 30, 200, 30);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);
  doc.text('REKAPAN MUTABAAH YAUMIYYAH & PENCAPAIAN GAME SANTRI', 105, 36, { align: 'center' });

  // 1. IDENTITAS SANTRI BOX
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, 40, 190, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(31, 62, 41);
  doc.text('IDENTITAS SANTRI:', 13, 45);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Nama Santri   : ${cleanPDFText(record.namaSantri)}`, 13, 50);
  doc.text(`NISN / Kamar  : ${cleanPDFText(record.nisSantri)} / ${cleanPDFText(record.namaKamar)}`, 13, 55);

  doc.text(`Musyrif Kamar : ${cleanPDFText(record.musyrifNama)}`, 110, 45);
  doc.text(`Tanggal       : ${cleanPDFText(record.tanggal)}`, 110, 50);
  doc.text(`Capaian Skor  : ${record.totalSkor} Poin (${record.rataRataPersentase}%)`, 110, 55);

  // 2. HERO GAMIFIKASI & RPG CHARACTER STATUS BOX WITH VECTOR ICONS
  doc.setFillColor(240, 253, 244); // Light Green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(10, 64, 190, 32, 2.5, 2.5, 'FD');

  // Vector Level Shield
  drawRPGLevelShield(doc, 13, 67.5, stats.levelData.currentLevel);

  // Vector Trophy Icon
  drawTrophyIcon(doc, 110, 68);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61); // Emerald 700
  doc.text('STATUS GAMIFIKASI & PENCAPAIAN GAME MUTABAAH SANTRI', 38, 70);

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Level RPG       : Level ${stats.levelData.currentLevel} - ${cleanPDFText(stats.levelData.namaLevel)}`, 38, 76);
  doc.text(`Gelar Kehormatan: ${cleanPDFText(stats.rpgTitle)}`, 38, 81);
  doc.text(`Tier Avatar     : ${cleanPDFText(stats.currentAvatar.nama)}`, 38, 86);

  doc.text(`Total XP : ${stats.netXP} XP (Progres: ${stats.levelData.progressPct}%)`, 124, 76);
  doc.text(`Streak   : ${stats.currentStreakDays} Hari (${cleanPDFText(stats.currentStreakReward.titleReward)})`, 124, 81);
  doc.text(`Hari Sempurna (100%): ${stats.perfectDaysCount} Hari | Badges: ${stats.unlockedBadges.length} Lencana`, 124, 86);

  // Level Progress Bar
  drawVectorProgressBar(doc, 38, 89.5, 145, 3.5, stats.levelData.progressPct, [21, 128, 61]);

  // 3. TABLE 1: CHECKLIST MUTABAAH YAUMIYYAH HARIAN
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 41);
  doc.text('I. DETAIL REKAPAN CHECKLIST AMALAN YAUMIYYAH', 10, 101);

  const tableHeaders = [['No', 'Program / Amalan', 'Target', 'Capaian', 'Skor', 'Nilai Amal & Dalil']];
  const tableData = record.items.map((item) => {
    const mainText = cleanPDFText(item.nilaiAmal);
    const subText = item.dalil ? `[${cleanPDFText(item.dalil)}${item.referensi ? ' - ' + cleanPDFText(item.referensi) : ''}]` : '';
    const fullText = subText ? `${mainText}\n${subText}` : mainText;

    return [
      '', // Rendered with drawIslamicAyahNumberFrame in didDrawCell
      cleanPDFText(item.programName),
      `${item.target} ${cleanPDFText(item.satuan)}`,
      `${item.capaian} ${cleanPDFText(item.satuan)}`,
      `${item.skor} (${item.persentase}%)`,
      fullText
    ];
  });

  autoTable(doc, {
    startY: 104,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    styles: {
      font: 'Helvetica',
      fontSize: 7.5,
      cellPadding: 2.5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [31, 62, 41],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
      5: { cellWidth: 66 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const rowIdx = data.row.index;
        const { x, y, width, height } = data.cell;
        const centerY = y + height / 2;
        drawIslamicAyahNumberFrame(doc, x + width / 2, centerY, `${rowIdx + 1}`);
      }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page break for section II
  if (currentY + 60 > 280) {
    doc.addPage();
    currentY = 15;
  }

  // -------------------------------------------------------------------------
  // SECTION II: RINGKASAN RADAR ANALISIS 6 BIDANG PENGEMBANGAN SANTRI
  // -------------------------------------------------------------------------
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 41);
  doc.text('II. RINGKASAN RADAR ANALISIS 6 BIDANG PENGEMBANGAN SANTRI', 10, currentY);

  const radarHeaders = [['No', 'Kategori Pengembangan', 'Skor Radar', 'Visual Progress', 'Kategori Evaluasi']];
  const radarData = stats.radarCategories.map((rc) => {
    const statusText = rc.score >= 85 ? 'Sangat Baik (Unggul)' : rc.score >= 70 ? 'Baik (Terjaga)' : 'Perlu Pendampingan';
    return [
      '', // Rendered with drawIslamicAyahNumberFrame in didDrawCell
      `                ${cleanPDFText(rc.label)}`,
      `${rc.score}%`,
      `${rc.score}`, // Used by didDrawCell
      statusText
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: radarHeaders,
    body: radarData,
    theme: 'grid',
    styles: {
      font: 'Helvetica',
      fontSize: 7.5,
      cellPadding: 3.2
    },
    headStyles: {
      fillColor: [126, 34, 206], // Purple Accent
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 54 },
      2: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      3: { halign: 'center', cellWidth: 50 },
      4: { cellWidth: 58 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        const rowIdx = data.row.index;
        const rc = stats.radarCategories[rowIdx];
        const { x, y, width, height } = data.cell;
        const centerY = y + height / 2;

        // Column 0: Draw Islamic Ayah Verse Number Frame
        if (data.column.index === 0) {
          drawIslamicAyahNumberFrame(doc, x + width / 2, centerY, `${rowIdx + 1}`);
        }

        // Column 1: Draw Islamic / Iconic Vector Graphic for Radar Category
        if (data.column.index === 1 && rc) {
          drawIslamicSkillIcon(doc, x + 5.5, centerY, rc.label, rc.label, rowIdx);
        }

        // Column 3: Draw Vector Progress Bar
        if (data.column.index === 3) {
          const rawScore = parseInt(data.cell.raw as string, 10) || 0;
          const barWidth = width - 12;
          const barHeight = 3.5;
          const barX = x + 2;
          const barY = y + (height - barHeight) / 2;
          drawVectorProgressBar(doc, barX, barY, barWidth, barHeight, rawScore, [126, 34, 206]);
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Strength & Weakness Analysis Box
  doc.setFillColor(240, 253, 244); // Light Green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(10, currentY, 190, 18, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('ANALISIS KEKUATAN & REKOMENDASI PENINGKATAN:', 13, currentY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`- Kekuatan Utama : Ananda ${cleanPDFText(record.namaSantri)} memiliki capaian baik pada Al-Qur'an & Tahfizh serta Healthy Life.`, 13, currentY + 10);
  doc.text(`- Fokus Peningkatan : Perlu motivasi rutin pada Penguasaan Kosakata Bahasa Arab & Inggris agar lebih seimbang.`, 13, currentY + 14.5);

  currentY += 23;

  // Check page break for section III
  if (currentY + 65 > 280) {
    doc.addPage();
    currentY = 15;
  }

  // -------------------------------------------------------------------------
  // SECTION III: DETAIL CAPAIAN POHON SKILL SANTRI (SKILL TREE)
  // -------------------------------------------------------------------------
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 41);
  doc.text('III. POHON SKILL SANTRI (6 SKILL BRANCHES)', 10, currentY);

  const skillHeaders = [['No', 'Cabang / Sub-Skill Node', 'Kategori', 'Level Capaian', 'Progres %', 'Evaluasi']];
  const skillData = stats.skillTreeProgress.map((sk) => {
    const isRoot = !sk.parentId;
    const indentSpace = isRoot ? '                ' : '                          -> ';
    return [
      '', // Rendered with drawIslamicAyahNumberFrame in didDrawCell
      `${indentSpace}${cleanPDFText(sk.nama)}`,
      cleanPDFText(sk.kategori),
      `Lvl ${sk.currentLevel} / ${sk.maxLevel}`,
      `${sk.progressPct}`, // Used by didDrawCell
      sk.currentLevel >= 3 ? 'Istiqamah & Sangat Baik' : 'Dalam Pendampingan'
    ];
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: skillHeaders,
    body: skillData,
    theme: 'striped',
    styles: {
      font: 'Helvetica',
      fontSize: 7.5,
      cellPadding: 3.2
    },
    headStyles: {
      fillColor: [15, 118, 110], // Teal Accent
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 60 },
      2: { halign: 'center', cellWidth: 23 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 23 },
      4: { halign: 'center', cellWidth: 36 },
      5: { cellWidth: 38 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        const rowIdx = data.row.index;
        const sk = stats.skillTreeProgress[rowIdx];
        const { x, y, width, height } = data.cell;
        const centerY = y + height / 2;

        // Column 0: Draw Islamic Ayah Verse Number Frame
        if (data.column.index === 0) {
          drawIslamicAyahNumberFrame(doc, x + width / 2, centerY, `${rowIdx + 1}`);
        }

        // Column 1: Draw Islamic / Iconic Vector Graphic for each Skill
        if (data.column.index === 1 && sk) {
          const isRoot = !sk.parentId;
          const iconX = isRoot ? x + 5.5 : x + 11.5;
          drawIslamicSkillIcon(doc, iconX, centerY, sk.nama, sk.kategori, rowIdx);
        }

        // Column 4: Vector Progress Bar
        if (data.column.index === 4) {
          const rawPct = parseInt(data.cell.raw as string, 10) || 0;
          const barWidth = width - 12;
          const barHeight = 3.5;
          const barX = x + 2;
          const barY = y + (height - barHeight) / 2;
          drawVectorProgressBar(doc, barX, barY, barWidth, barHeight, rawPct, [15, 118, 110]);
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page break for section IV
  if (currentY + 55 > 280) {
    doc.addPage();
    currentY = 15;
  }

  // -------------------------------------------------------------------------
  // SECTION IV: PENCAPAIAN BADGE & LENCANA KEHORMATAN
  // -------------------------------------------------------------------------
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 41);
  doc.text('IV. DAFTAR LENCANA & BADGE KEHORMATAN MUTABAAH', 10, currentY);

  const badgeHeaders = [['No', 'Nama Badge / Lencana', 'Kategori', 'Tingkat (Rarity)', 'Bonus XP', 'Deskripsi Pencapaian']];
  const badgeData = stats.unlockedBadges.slice(0, 8).map((b) => [
    '', // Rendered with drawIslamicAyahNumberFrame in didDrawCell
    `                ${cleanPDFText(b.nama)}`,
    cleanPDFText(b.kategori),
    cleanPDFText(b.jenis),
    `+${b.xpBonus} XP`,
    cleanPDFText(b.deskripsi)
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: badgeHeaders,
    body: badgeData,
    theme: 'grid',
    styles: {
      font: 'Helvetica',
      fontSize: 7.5,
      cellPadding: 3.2
    },
    headStyles: {
      fillColor: [180, 150, 80], // Gold Accent
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 20 },
      5: { cellWidth: 65 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        const rowIdx = data.row.index;
        const { x, y, width, height } = data.cell;
        const centerY = y + height / 2;

        if (data.column.index === 0) {
          drawIslamicAyahNumberFrame(doc, x + width / 2, centerY, `${rowIdx + 1}`);
        }

        if (data.column.index === 1) {
          // Vector Star Icon beside badge name
          drawVectorStar(doc, x + 5.5, centerY, 1.8, 0.9, [234, 179, 8], [180, 150, 80]);
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page break for section V
  if (currentY + 50 > 280) {
    doc.addPage();
    currentY = 15;
  }

  // -------------------------------------------------------------------------
  // SECTION V: REWARD NYATA & PRIVILEGE KETENTUAN SANTRI
  // -------------------------------------------------------------------------
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 62, 41);
  doc.text('V. REWARD NYATA & PRIVILEGE KETENTUAN SANTRI', 10, currentY);

  const rewardHeaders = [['No', 'Hak Reward / Voucher', 'Kategori Privilege', 'Syarat Minimum', 'Status Klaim']];
  const rewardData = stats.availableRewards.map((rw) => [
    '', // Rendered with drawIslamicAyahNumberFrame in didDrawCell
    cleanPDFText(rw.nama),
    cleanPDFText(rw.kategori),
    cleanPDFText(rw.syaratMinimum),
    rw.isUnlocked ? '[ TERBUKA ] Dapat Diklaim' : '[ TERKUNCI ]'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: rewardHeaders,
    body: rewardData,
    theme: 'grid',
    styles: {
      font: 'Helvetica',
      fontSize: 7.5,
      cellPadding: 2.5
    },
    headStyles: {
      fillColor: [190, 18, 60], // Rose/Red Accent
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 53 },
      2: { halign: 'center', cellWidth: 35 },
      3: { cellWidth: 42 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 50 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const rowIdx = data.row.index;
        const { x, y, width, height } = data.cell;
        const centerY = y + height / 2;
        drawIslamicAyahNumberFrame(doc, x + width / 2, centerY, `${rowIdx + 1}`);
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check page break for Musyrif Note & Signatures
  if (currentY + 40 > 280) {
    doc.addPage();
    currentY = 15;
  }

  // Musyrif Note Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, currentY, 190, 16, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CATATAN & REKOMENDASI MUSYRIF KEPADA ORANG TUA:', 13, currentY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const noteText = cleanPDFText(record.catatanMusyrif) || 'Alhamdulillah ananda menunjukkan kedisiplinan dan capaian mutabaah yang sangat baik. Mohon terus disupport saat perizinan pulang.';
  doc.text(`Catatan: ${noteText}`, 13, currentY + 11);

  // Signatures Section
  const sigY = currentY + 23;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text(`Muaro Jambi, ${cleanPDFText(record.tanggal)}`, 140, sigY);
  doc.text('Musyrif Kamar / Wali,', 15, sigY + 5);
  doc.text(cleanPDFText(record.musyrifNama), 15, sigY + 18);

  if (isPortalOrangTua) {
    doc.text('Orang Tua / Wali Santri,', 140, sigY + 5);
    doc.text('( ..................................... )', 140, sigY + 18);
  } else {
    doc.text('Kepala Pengasuhan Santri,', 140, sigY + 5);
    doc.text('Kenny Syah Putra, S.Ag, S.Pd', 140, sigY + 18);
  }

  return doc;
}

export function downloadMutabaahWithGamificationPDF(options: ExportMutabaahPDFOptions) {
  const doc = generateMutabaahWithGamificationPDF(options);
  const { record } = options;
  const safeName = cleanPDFText(record.namaSantri).replace(/\s+/g, '_');
  const filename = `Mutabaah_Gamifikasi_${safeName}_${record.tanggal}.pdf`;

  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
  } catch (e) {
    doc.save(filename);
  }
}
