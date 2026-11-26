import React from 'react';
import {
  Link2,
  Sparkles,
  Database,
  Package,
  LifeBuoy,
  UserCheck,
  Activity,
  FileText,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CosmicOrbitalBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Deep cosmic dark background */}
      <div className="absolute inset-0 bg-[#030712]" />

      {/* Radial depth glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.15) 0%, rgba(8, 20, 48, 0.5) 45%, rgba(3, 7, 18, 0.95) 85%)',
        }}
      />

      {/* Top Spotlight / Light Beam pointing downwards */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[480px] opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(34, 211, 238, 0.45) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Subtle top spotlight rays */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[360px] opacity-25 blur-2xl bg-gradient-to-b from-cyan-300/40 via-cyan-500/10 to-transparent"
        style={{ clipPath: 'polygon(44% 0%, 56% 0%, 90% 100%, 10% 100%)' }}
      />

      {/* Constellation Stars and Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
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
        <g stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" fill="none">
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
        <g stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" fill="none">
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
        <g stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" fill="none">
          <line x1="5%" y1="78%" x2="12%" y2="84%" />
          <line x1="12%" y1="84%" x2="18%" y2="80%" />
        </g>
        <circle cx="5%" cy="78%" r="2" fill="#22D3EE" />
        <circle cx="12%" cy="84%" r="2.5" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="18%" cy="80%" r="1.5" fill="#22D3EE" />

        {/* Bottom Right Constellation */}
        <g stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" fill="none">
          <line x1="92%" y1="72%" x2="85%" y2="82%" />
          <line x1="85%" y1="82%" x2="90%" y2="90%" />
        </g>
        <circle cx="92%" cy="72%" r="2" fill="#22D3EE" />
        <circle cx="85%" cy="82%" r="2.5" fill="#67E8F9" filter="url(#starGlow)" />
        <circle cx="90%" cy="90%" r="2" fill="#22D3EE" />

        {/* Random subtle twinkling background stars */}
        <circle cx="35%" cy="8%" r="1.2" fill="#22D3EE" opacity="0.6" />
        <circle cx="65%" cy="10%" r="1" fill="#67E8F9" opacity="0.5" />
        <circle cx="78%" cy="50%" r="1.5" fill="#A5F3FC" opacity="0.4" />
        <circle cx="22%" cy="62%" r="1.2" fill="#22D3EE" opacity="0.4" />
        <circle cx="48%" cy="92%" r="1" fill="#67E8F9" opacity="0.5" />
      </svg>

      {/* Orbital Rings & Nodes Centered Behind the Auth Card */}
      <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] flex items-center justify-center pointer-events-none">
        {/* Outer Orbit Ring (920px) */}
        <div className="absolute w-[920px] h-[920px] rounded-full border border-cyan-500/15" />

        {/* Middle Orbit Ring (680px) */}
        <div className="absolute w-[680px] h-[680px] rounded-full border border-cyan-500/20" />

        {/* Inner Orbit Ring (480px) */}
        <div className="absolute w-[480px] h-[480px] rounded-full border border-cyan-500/25" />

        {/* Core glow behind card */}
        <div className="absolute w-[360px] h-[360px] rounded-full bg-cyan-500/10 blur-3xl" />

        {/* --- Floating Orbital Node Badges --- */}
        {/* Upper-left outer orbit: Link icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '18%', top: '22%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Link2 className="w-4 h-4" />
          </div>
        </div>

        {/* Mid-left outer orbit: Sparkles icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '11%', top: '48%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Lower-left outer orbit: Database icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '17%', top: '74%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Database className="w-4 h-4" />
          </div>
        </div>

        {/* Mid-left inner orbit: Layers / Box icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '26%', top: '56%' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Bottom-left orbit: LifeBuoy icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '30%', top: '85%' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <LifeBuoy className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Upper-right outer orbit: UserCheck icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '83%', top: '34%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Mid-right middle orbit: ShieldCheck icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '76%', top: '54%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Right middle orbit: Activity pulse icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '69%', top: '70%' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Lower-right outer orbit: Package / Delivery icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '82%', top: '78%' }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <Package className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom-right orbit: FileText icon */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: '73%', top: '88%' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#0a1228]/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:border-cyan-400 hover:scale-110 transition-all duration-300">
            <FileText className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicOrbitalBackground;
