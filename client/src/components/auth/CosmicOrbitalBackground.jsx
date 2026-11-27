import React from 'react';
import {
  Database,
  Sparkles,
  FileText,
  Package,
  ShieldCheck,
  BarChart3,
  GitBranch,
  Layers,
  Cpu,
  Zap,
  Search,
  Activity,
  Code,
  QrCode,
  Bot,
  Share2,
  Globe,
  Lock,
  Link2,
  CheckCircle2,
  FileCode,
  Bookmark,
} from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Calculates exact (x, y) percentage coordinates on a circle circumference
 * @param {number} angleDeg Angle in degrees (0° = 12 o'clock / top, clockwise)
 * @returns {{ left: string, top: string }} CSS percentage positions
 */
const getOrbitPosition = (angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + 50 * Math.sin(rad);
  const y = 50 - 50 * Math.cos(rad);
  return { left: `${x.toFixed(4)}%`, top: `${y.toFixed(4)}%` };
};

export const CosmicOrbitalBackground = ({ flyUp = false }) => {
  // Outer Circle (8 nodes at 45° increments: 0, 45, 90, 135, 180, 225, 270, 315)
  const outerNodes = [
    { icon: Database, label: 'Data Engine', angle: 0 },
    { icon: Sparkles, label: 'DocuMind AI', angle: 45 },
    { icon: FileText, label: 'Smart PDF', angle: 90 },
    { icon: Package, label: 'SmartTools', angle: 135 },
    { icon: ShieldCheck, label: 'Zero Trust', angle: 180 },
    { icon: BarChart3, label: 'DataInsight', angle: 225 },
    { icon: GitBranch, label: 'Workflows', angle: 270 },
    { icon: Layers, label: 'Multi-Format', angle: 315 },
  ];

  // Middle Circle (8 nodes offset by 22.5°: 22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5)
  const middleNodes = [
    { icon: Cpu, label: 'Neural Models', angle: 22.5 },
    { icon: Zap, label: 'Instant Sync', angle: 67.5 },
    { icon: Search, label: 'Neural Search', angle: 112.5 },
    { icon: Activity, label: 'Live Analytics', angle: 157.5 },
    { icon: Code, label: 'REST API', angle: 202.5 },
    { icon: QrCode, label: 'DocuQR', angle: 247.5 },
    { icon: Bot, label: 'AI Agents', angle: 292.5 },
    { icon: Share2, label: 'Collaboration', angle: 337.5 },
  ];

  // Inner Circle (6 nodes at 60° increments: 0, 60, 120, 180, 240, 300)
  const innerNodes = [
    { icon: Globe, label: 'Multilingual', angle: 0 },
    { icon: Lock, label: 'AES-256', angle: 60 },
    { icon: Link2, label: 'Integrations', angle: 120 },
    { icon: CheckCircle2, label: 'Citations', angle: 180 },
    { icon: FileCode, label: 'Converters', angle: 240 },
    { icon: Bookmark, label: 'Exam Notes', angle: 300 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Dynamic Keyframes for Clockwise (Right) and Counter-Clockwise (Left) Orbit Movement */}
      <style>{`
        @keyframes orbit-spin-right {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-left {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .orbit-spin-cw-outer {
          animation: orbit-spin-right 65s linear infinite;
        }
        .orbit-counter-outer {
          animation: orbit-spin-left 65s linear infinite;
        }
        .orbit-spin-ccw-mid {
          animation: orbit-spin-left 48s linear infinite;
        }
        .orbit-counter-mid {
          animation: orbit-spin-right 48s linear infinite;
        }
        .orbit-spin-cw-inner {
          animation: orbit-spin-right 32s linear infinite;
        }
        .orbit-counter-inner {
          animation: orbit-spin-left 32s linear infinite;
        }
        .orbit-track-group:hover,
        .orbit-track-group:hover * {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Deep cosmic background with Light/Dark mode adaptability */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712] transition-colors duration-300" />

      {/* Radial depth glows */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.2) 0%, rgba(8, 20, 48, 0.45) 45%, rgba(3, 7, 18, 0.95) 85%)',
        }}
      />

      {/* Top Spotlight / Light Beam pointing downwards */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[480px] opacity-25 dark:opacity-35 blur-3xl pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(34, 211, 238, 0.45) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Subtle top spotlight rays */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[360px] opacity-15 dark:opacity-25 blur-2xl bg-gradient-to-b from-cyan-300/40 via-cyan-500/10 to-transparent pointer-events-none transition-opacity duration-300"
        style={{ clipPath: 'polygon(44% 0%, 56% 0%, 90% 100%, 10% 100%)' }}
      />

      {/* Constellation Stars and Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-35 transition-opacity duration-300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top Left Constellation */}
        <g stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1" fill="none">
          <line x1="8%" y1="12%" x2="14%" y2="19%" />
          <line x1="14%" y1="19%" x2="11%" y2="28%" />
          <line x1="14%" y1="19%" x2="22%" y2="16%" />
          <line x1="22%" y1="16%" x2="26%" y2="24%" />
        </g>
        <circle cx="8%" cy="12%" r="2" fill="#22D3EE" filter="url(#starGlow)" />
        <circle cx="14%" cy="19%" r="3" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="11%" cy="28%" r="1.5" fill="#22D3EE" />
        <circle cx="22%" cy="16%" r="2.5" fill="#A5F3FC" filter="url(#starGlow)" />
        <circle cx="26%" cy="24%" r="2" fill="#22D3EE" />

        {/* Top Right Constellation */}
        <g stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1" fill="none">
          <line x1="88%" y1="8%" x2="94%" y2="14%" />
          <line x1="94%" y1="14%" x2="90%" y2="22%" />
          <line x1="90%" y1="22%" x2="82%" y2="26%" />
          <line x1="82%" y1="26%" x2="86%" y2="34%" />
        </g>
        <circle cx="88%" cy="8%" r="2" fill="#22D3EE" />
        <circle cx="94%" cy="14%" r="3" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="90%" cy="22%" r="2" fill="#22D3EE" filter="url(#starGlow)" />
        <circle cx="82%" cy="26%" r="2.5" fill="#A5F3FC" filter="url(#starGlow)" />
        <circle cx="86%" cy="34%" r="1.5" fill="#22D3EE" />

        {/* Bottom Left Constellation */}
        <g stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" fill="none">
          <line x1="5%" y1="78%" x2="12%" y2="84%" />
          <line x1="12%" y1="84%" x2="18%" y2="80%" />
        </g>
        <circle cx="5%" cy="78%" r="2" fill="#22D3EE" />
        <circle cx="12%" cy="84%" r="2.5" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="18%" cy="80%" r="1.5" fill="#22D3EE" />

        {/* Bottom Right Constellation */}
        <g stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" fill="none">
          <line x1="92%" y1="72%" x2="85%" y2="82%" />
          <line x1="85%" y1="82%" x2="90%" y2="90%" />
        </g>
        <circle cx="92%" cy="72%" r="2" fill="#22D3EE" />
        <circle cx="85%" cy="82%" r="2.5" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="90%" cy="90%" r="2" fill="#22D3EE" />

        {/* Twinkling background stars */}
        <circle cx="35%" cy="8%" r="1.2" fill="#22D3EE" opacity="0.6" />
        <circle cx="65%" cy="10%" r="1" fill="#67E8F9" opacity="0.5" />
        <circle cx="78%" cy="50%" r="1.5" fill="#A5F3FC" opacity="0.4" />
        <circle cx="22%" cy="62%" r="1.2" fill="#22D3EE" opacity="0.4" />
        <circle cx="48%" cy="92%" r="1" fill="#67E8F9" opacity="0.5" />
      </svg>

      {/* Orbital Circles Wrapper: Centered behind Auth Form. Flies UP slowly with login */}
      <div
        className={cn(
          "absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1050px] h-[1050px] flex items-center justify-center pointer-events-none transition-all duration-[2400ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
          flyUp && "-translate-y-[150vh] scale-105 opacity-0 pointer-events-none"
        )}
      >
        {/* Core glow behind central card */}
        <div className="absolute w-[440px] h-[440px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* ============================================================== */}
        {/* CIRCLE 1: Outer Orbit Track (920px) -> Moves RIGHT (Clockwise) */}
        {/* ============================================================== */}
        <div className="absolute w-[920px] h-[920px] rounded-full border-[1.5px] border-cyan-500/35 dark:border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:shadow-[0_0_25px_rgba(6,182,212,0.2)] orbit-spin-cw-outer orbit-track-group pointer-events-auto transition-colors duration-300 hover:border-[#00D9FF] dark:hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.45)]">
          {/* Subtle concentric dashed accent guide track inside */}
          <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/20 dark:border-cyan-400/15 pointer-events-none" />

          {/* 8 Nodes arranged mathematically on the circular line */}
          {outerNodes.map((node) => (
            <div
              key={node.label}
              style={getOrbitPosition(node.angle)}
              className="absolute -translate-x-1/2 -translate-y-1/2 orbit-counter-outer"
            >
              <OrbitIconNode icon={node.icon} label={node.label} />
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* CIRCLE 2: Middle Orbit Track (680px) -> Moves LEFT (Counter-CW) */}
        {/* ============================================================== */}
        <div className="absolute w-[680px] h-[680px] rounded-full border-[1.5px] border-cyan-500/40 dark:border-cyan-400/35 shadow-[0_0_20px_rgba(6,182,212,0.18)] dark:shadow-[0_0_25px_rgba(6,182,212,0.22)] orbit-spin-ccw-mid orbit-track-group pointer-events-auto transition-colors duration-300 hover:border-[#00D9FF] dark:hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.45)]">
          {/* Subtle concentric dashed accent guide track inside */}
          <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/20 dark:border-cyan-400/20 pointer-events-none" />

          {/* 8 Nodes arranged mathematically on the circular line */}
          {middleNodes.map((node) => (
            <div
              key={node.label}
              style={getOrbitPosition(node.angle)}
              className="absolute -translate-x-1/2 -translate-y-1/2 orbit-counter-mid"
            >
              <OrbitIconNode icon={node.icon} label={node.label} />
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* CIRCLE 3: Inner Orbit Track (470px) -> Moves RIGHT (Clockwise) */}
        {/* ============================================================== */}
        <div className="absolute w-[470px] h-[470px] rounded-full border-[1.5px] border-cyan-500/45 dark:border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] dark:shadow-[0_0_25px_rgba(6,182,212,0.25)] orbit-spin-cw-inner orbit-track-group pointer-events-auto transition-colors duration-300 hover:border-[#00D9FF] dark:hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.45)]">
          {/* Subtle concentric dashed accent guide track inside */}
          <div className="absolute inset-1 rounded-full border border-dashed border-cyan-500/25 dark:border-cyan-400/20 pointer-events-none" />

          {/* 6 Nodes arranged mathematically on the circular line */}
          {innerNodes.map((node) => (
            <div
              key={node.label}
              style={getOrbitPosition(node.angle)}
              className="absolute -translate-x-1/2 -translate-y-1/2 orbit-counter-inner"
            >
              <OrbitIconNode icon={node.icon} label={node.label} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

/**
 * Reusable Orbit Icon Node Component
 * - Default: Neutral theme styling (slate-500/400).
 * - Smooth Hover Effect:
 *   When cursor hovers over an icon:
 *     - Color: #00D9FF
 *     - Border: #00D9FF
 *     - Subtle glow: shadow-[0_0_16px_rgba(0,217,255,0.5)]
 *   When cursor leaves:
 *     - Restores original styling cleanly with smooth transition.
 */
const OrbitIconNode = ({ icon: Icon, label }) => {
  return (
    <div className="relative group/node flex items-center justify-center cursor-pointer select-none">
      {/* Anchor dot centered on the circle line: Neutral by default, turns cyan (#00D9FF) on cursor hover */}
      <span className="absolute w-2 h-2 rounded-full bg-slate-400/50 dark:bg-slate-600/60 -z-10 transition-all duration-300 ease-out group-hover/node:scale-150 group-hover/node:bg-[#00D9FF] group-hover/node:shadow-[0_0_12px_#00D9FF]" />

      {/* Circular icon badge:
          DEFAULT: Neutral border, neutral background, neutral icon text
          HOVER: Changes color, border, and subtle glow to cyan (#00D9FF)
          LEAVE: Restores original styling smoothly */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 dark:bg-[#0b1329]/95 border border-slate-300 dark:border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none transition-all duration-300 ease-out group-hover/node:scale-125 group-hover/node:-translate-y-1 group-hover/node:border-[#00D9FF] group-hover/node:text-[#00D9FF] group-hover/node:bg-[#00D9FF]/10 dark:group-hover/node:bg-[#00D9FF]/15 group-hover/node:shadow-[0_0_16px_rgba(0,217,255,0.5)] active:scale-110">
        <Icon className="w-4 h-4 transition-transform duration-300 group-hover/node:scale-110" />
      </div>

      {/* Floating tooltip badge: only appears on cursor hover */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap bg-slate-900/95 dark:bg-black/95 text-[#00D9FF] border border-[#00D9FF]/50 shadow-[0_0_12px_rgba(0,217,255,0.35)] opacity-0 group-hover/node:opacity-100 group-hover/node:scale-100 scale-90 transition-all duration-200 pointer-events-none z-30">
        {label}
      </div>
    </div>
  );
};

export default CosmicOrbitalBackground;
