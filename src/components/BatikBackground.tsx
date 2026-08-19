import React from 'react';

interface BatikBackgroundProps {
  className?: string;
  opacity?: number;
  showCorners?: boolean;
}

export default function BatikBackground({
  className = '',
  opacity = 0.05,
  showCorners = true,
}: BatikBackgroundProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      id="batik-background-container"
    >
      {/* 1. Seamless Repeating Batik Bali Pattern Layer */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: opacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1'%3E%3C!-- Central Mandala / Bunga Patra --%3E%3Ccircle cx='60' cy='60' r='14' stroke-dasharray='3,3' /%3E%3Ccircle cx='60' cy='60' r='8' /%3E%3Ccircle cx='60' cy='60' r='3' fill='%23D4AF37' /%3E%3C!-- Petals of Central Flower --%3E%3Cpath d='M60,40 C63,48 57,48 60,60 C63,48 67,48 60,40 Z' /%3E%3Cpath d='M60,80 C63,72 57,72 60,60 C63,72 67,72 60,80 Z' /%3E%3Cpath d='M40,60 C48,63 48,57 60,60 C48,63 48,67 40,60 Z' /%3E%3Cpath d='M80,60 C72,63 72,57 60,60 C72,63 72,67 80,60 Z' /%3E%3C!-- Diagonal Petals --%3E%3Cpath d='M46,46 C52,52 50,48 60,60' /%3E%3Cpath d='M74,74 C68,68 70,72 60,60' /%3E%3Cpath d='M74,46 C68,52 70,48 60,60' /%3E%3Cpath d='M46,74 C52,68 50,72 60,60' /%3E%3C!-- Floral Spirals (Ukir Patra Bali) --%3E%3Cpath d='M60,20 C75,20 85,30 85,45 C85,55 75,60 65,55 C55,50 55,40 65,35 C70,32 75,35 73,40 C72,42 68,42 67,40 C66,38 70,35 68,35' /%3E%3Cpath d='M60,100 C45,100 35,90 35,75 C35,65 45,60 55,65 C65,70 65,80 55,85 C50,88 45,85 47,80 C48,78 52,78 53,80 C54,82 50,85 52,85' /%3E%3Cpath d='M20,60 C20,45 30,35 45,35 C55,35 60,45 55,55 C50,65 40,65 35,55 C32,50 35,45 40,47 C42,48 42,52 40,53 C38,54 35,50 35,52' /%3E%3Cpath d='M100,60 C100,75 90,85 75,85 C65,85 60,75 65,65 C70,55 80,55 85,65 C88,70 85,75 80,73 C78,72 78,68 80,67 C82,66 85,70 85,68' /%3E%3C!-- Outer Border Accent & Interconnecting Dots --%3E%3Ccircle cx='0' cy='0' r='4' /%3E%3Ccircle cx='120' cy='0' r='4' /%3E%3Ccircle cx='0' cy='120' r='4' /%3E%3Ccircle cx='120' cy='120' r='4' /%3E%3Cpath d='M0,0 C20,20 40,10 60,0 C80,10 100,20 120,0' /%3E%3Cpath d='M0,120 C20,100 40,110 60,120 C80,110 100,100 120,120' /%3E%3Cpath d='M0,0 C20,20 10,40 0,60 C10,80 20,100 0,120' /%3E%3Cpath d='M120,0 C100,20 110,40 120,60 C110,80 100,100 120,120' /%3E%3C!-- Traditional Cecek (Dots) for Batik Texture --%3E%3Ccircle cx='15' cy='15' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='105' cy='15' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='15' cy='105' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='105' cy='105' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23D4AF37' /%3E%3Ccircle cx='90' cy='30' r='1.5' fill='%23D4AF37' /%3E%3Ccircle cx='30' cy='90' r='1.5' fill='%23D4AF37' /%3E%3Ccircle cx='90' cy='90' r='1.5' fill='%23D4AF37' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* 2. Intricate Classic Balinese Corner Ornaments Layer */}
      {showCorners && (
        <>
          {/* Top Right Corner Ornament */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-15 md:opacity-20 transition-all duration-500 ease-in-out"
            style={{ transform: 'rotate(90deg)' }}
          >
            <BatikCornerSVG />
          </div>

          {/* Bottom Left Corner Ornament */}
          <div 
            className="absolute bottom-0 left-0 w-64 h-64 opacity-15 md:opacity-20 transition-all duration-500 ease-in-out"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <BatikCornerSVG />
          </div>

          {/* Top Left Corner Ornament (Optional Subtle Shadow or Blend) */}
          <div 
            className="absolute top-0 left-0 w-48 h-48 opacity-10 md:opacity-12"
            style={{ transform: 'rotate(0deg)' }}
          >
            <BatikCornerSVG />
          </div>

          {/* Bottom Right Corner Ornament */}
          <div 
            className="absolute bottom-0 right-0 w-48 h-48 opacity-10 md:opacity-12"
            style={{ transform: 'rotate(180deg)' }}
          >
            <BatikCornerSVG />
          </div>
        </>
      )}
    </div>
  );
}

// A high-quality custom vector SVG illustrating a traditional Balinese wood carving / Batik Patra spiral motif
function BatikCornerSVG() {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-nature-gold"
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Main large spiral branch (Patra Punggel style) */}
        <path d="M0,0 C40,40 80,60 120,60 C160,60 180,40 180,20 C180,0 150,-10 130,10 C110,30 110,60 130,80 C150,100 180,90 190,70 C200,50 190,20 170,10" />
        
        {/* Leaf curls coming off the main branch */}
        <path d="M50,30 C70,15 85,15 90,30 C95,45 80,55 65,45 C55,37 60,25 70,25" />
        <path d="M80,47 C105,40 115,50 110,65 C105,80 90,80 85,65 C80,55 90,47 95,55" />
        <path d="M110,58 C135,62 140,80 125,95 C110,110 95,95 105,80 C115,65 125,75 120,85" />
        
        {/* Additional decorative jagged flames (Angkup) */}
        <path d="M10,0 C25,12 35,5 45,15 M20,5 C35,22 45,15 55,25" />
        <path d="M5,20 C18,35 28,28 38,43 M12,30 C28,50 38,43 48,58" />
        
        {/* Concentric detail lines inside the main spiral */}
        <path d="M125,50 C145,50 160,38 160,25 C160,12 140,8 130,18" strokeDasharray="2,2" />
        <path d="M132,22 C140,22 145,18 145,14" />
        
        {/* Fine dots (Cecek) for the batik style */}
        <circle cx="150" cy="15" r="2" fill="currentColor" />
        <circle cx="165" cy="28" r="1.5" fill="currentColor" />
        <circle cx="155" cy="45" r="1.5" fill="currentColor" />
        <circle cx="140" cy="55" r="1.5" fill="currentColor" />
        <circle cx="120" cy="75" r="1.5" fill="currentColor" />
        <circle cx="100" cy="88" r="1.5" fill="currentColor" />
        <circle cx="80" cy="98" r="2" fill="currentColor" />
        
        <circle cx="172" cy="52" r="1" fill="currentColor" />
        <circle cx="180" cy="40" r="1" fill="currentColor" />
        <circle cx="185" cy="62" r="1" fill="currentColor" />
        
        {/* Tiny outer floral cluster */}
        <path d="M160,85 C170,85 175,90 170,100 C165,110 155,105 155,95 Z" />
        <circle cx="162" cy="95" r="2" fill="currentColor" />
      </g>
    </svg>
  );
}
