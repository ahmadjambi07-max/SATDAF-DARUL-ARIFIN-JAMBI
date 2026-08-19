import React, { useState } from 'react';

export type BatikJawaType = 'kawung' | 'parang' | 'megamendung';

interface BatikJawaSidebarProps {
  type?: BatikJawaType;
  opacity?: number;
}

export default function BatikJawaSidebar({
  type = 'kawung',
  opacity = 0.08,
}: BatikJawaSidebarProps) {
  // Generate SVG patterns as inline background data-urls for high-performance repeating grids
  
  // 1. Classic Kawung Pattern (Geometric circles forming almond-shaped petals)
  const kawungSvg = `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='0.8' opacity='0.7'%3E%3C!-- Main Kawung Intersecting Circles --%3E%3Ccircle cx='0' cy='0' r='24' /%3E%3Ccircle cx='80' cy='0' r='24' /%3E%3Ccircle cx='0' cy='80' r='24' /%3E%3Ccircle cx='80' cy='80' r='24' /%3E%3Ccircle cx='40' cy='40' r='24' /%3E%3Ccircle cx='40' cy='0' r='24' /%3E%3Ccircle cx='0' cy='40' r='24' /%3E%3Ccircle cx='80' cy='40' r='24' /%3E%3Ccircle cx='40' cy='80' r='24' /%3E%3C!-- Central Diamond Flowers (Isen-isen) --%3E%3Cpath d='M40,32 L44,40 L40,48 L36,40 Z' fill='%23D4AF37' fill-opacity='0.15' /%3E%3Cpath d='M0,32 L4,40 L0,48 L-4,40 Z' fill='%23D4AF37' fill-opacity='0.15' /%3E%3Cpath d='M80,32 L84,40 L80,48 L76,40 Z' fill='%23D4AF37' fill-opacity='0.15' /%3E%3C!-- Internal details/dots inside petals (Cecek) --%3E%3Ccircle cx='40' cy='24' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='40' cy='28' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='40' cy='52' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='40' cy='56' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='24' cy='40' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='28' cy='40' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='52' cy='40' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='56' cy='40' r='1' fill='%23D4AF37' /%3E%3C!-- Accent Lines --%3E%3Cline x1='34' y1='34' x2='46' y2='46' /%3E%3Cline x1='46' y1='34' x2='34' y2='46' /%3E%3C/g%3E%3C/svg%3E`;

  // 2. Classic Parang Rusak Pattern (Diagonal wavy bands with mlinjon hooks)
  const parangSvg = `data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1' opacity='0.7'%3E%3C!-- Diagonal Waves (S-Curves) representing continuous swords/spirit --%3E%3Cpath d='M-50,50 L50,-50 M-50,100 L100,-50 M0,100 L100,0 M50,100 L150,0' stroke-width='2' stroke-dasharray='1,2' /%3E%3C!-- Parang Curved Hooks --%3E%3Cpath d='M10,20 C15,15 25,15 30,25 C35,35 25,45 20,40 C15,35 20,28 25,30' stroke-width='1.5' /%3E%3Cpath d='M60,70 C65,65 75,65 80,75 C85,85 75,95 70,90 C65,85 70,78 75,80' stroke-width='1.5' /%3E%3Cpath d='M60,20 C65,15 75,15 80,25 C85,35 75,45 70,40 C65,35 70,28 75,30' stroke-width='1.5' /%3E%3Cpath d='M10,70 C15,65 25,65 30,75 C35,85 25,95 20,90 C15,85 20,78 25,80' stroke-width='1.5' /%3E%3C!-- Mlinjon (Diamond Accents) --%3E%3Cpolygon points='40,15 45,20 40,25 35,20' fill='%23D4AF37' fill-opacity='0.2' /%3E%3Cpolygon points='90,65 95,70 90,75 85,70' fill='%23D4AF37' fill-opacity='0.2' /%3E%3Cpolygon points='90,15 95,20 90,25 85,20' fill='%23D4AF37' fill-opacity='0.2' /%3E%3Cpolygon points='40,65 45,70 40,75 35,70' fill='%23D4AF37' fill-opacity='0.2' /%3E%3C!-- Cecek dots --%3E%3Ccircle cx='40' cy='20' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='90' cy='70' r='1' fill='%23D4AF37' /%3E%3C/g%3E%3C/svg%3E`;

  // 3. Classic Megamendung Pattern (Flowing cloud layers)
  const megamendungSvg = `data:image/svg+xml,%3Csvg width='120' height='80' viewBox='0 0 120 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1' opacity='0.75'%3E%3C!-- Cloud Contour Layer 1 (Outer) --%3E%3Cpath d='M10,40 C10,20 40,20 50,30 C60,20 90,20 110,40 C110,60 80,60 70,50 C60,60 20,60 10,40 Z' /%3E%3C!-- Cloud Contour Layer 2 (Middle) --%3E%3Cpath d='M20,40 C20,28 42,28 48,35 C54,28 78,28 92,40 C92,52 74,52 68,45 C62,52 28,52 20,40 Z' stroke-width='0.8' /%3E%3C!-- Cloud Contour Layer 3 (Inner core) --%3E%3Cpath d='M30,40 C30,34 44,34 46,38 C48,34 66,34 74,40 C74,46 64,46 62,42 C60,46 36,46 30,40 Z' fill='%23D4AF37' fill-opacity='0.1' stroke-width='0.6' /%3E%3C!-- Cloud Tail/Flow Lines --%3E%3Cpath d='M110,40 C115,40 120,45 120,50 C120,55 110,55 105,50' /%3E%3Cpath d='M10,40 C5,40 0,35 0,30 C0,25 10,25 15,30' /%3E%3C!-- Dots & sparkles --%3E%3Ccircle cx='60' cy='15' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='5' cy='65' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='115' cy='15' r='1' fill='%23D4AF37' /%3E%3C/g%3E%3C/svg%3E`;

  // Determine current active SVG string
  const activeBatikSvg = 
    type === 'parang' ? parangSvg :
    type === 'megamendung' ? megamendungSvg :
    kawungSvg;

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden transition-all duration-700 ease-in-out"
      style={{ 
        zIndex: 1, 
        opacity: opacity,
        backgroundImage: `url("${activeBatikSvg}")`,
        backgroundRepeat: 'repeat',
      }}
      id={`batik-jawa-sidebar-${type}`}
    />
  );
}
