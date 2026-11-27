import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

/**
 * Docify Brand Logo Component
 * A unique, trendy, and professional identity representing:
 * - Smart Document Intelligence (layered folded sheets)
 * - Multidimensional AI Engine (radiant quantum neural core & data filaments)
 * - Sleek futuristic "D" monogram with electric cyan gradients
 * 
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} [size='md'] Size preset
 * @param {'icon'|'badge'|'full'} [variant='icon'] Layout variant
 * @param {boolean} [animated=false] Whether to animate the inner AI core & glow
 * @param {boolean} [withGlow=false] Adds an ambient cyan neon aura
 * @param {string} [className] Custom class names
 */
export const DocifyLogo = ({
  size = 'md',
  variant = 'icon',
  animated = false,
  withGlow = false,
  className,
  ...props
}) => {
  const sizeMap = {
    xs: { box: 20, icon: 'w-5 h-5', text: 'text-sm', badge: 'text-[9px]' },
    sm: { box: 28, icon: 'w-7 h-7', text: 'text-base', badge: 'text-[10px]' },
    md: { box: 36, icon: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px]' },
    lg: { box: 48, icon: 'w-12 h-12', text: 'text-2xl', badge: 'text-xs' },
    xl: { box: 64, icon: 'w-16 h-16', text: 'text-3xl', badge: 'text-xs' },
    '2xl': { box: 80, icon: 'w-20 h-20', text: 'text-4xl', badge: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // The Pure SVG Vector Mark
  const LogoSVG = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        currentSize.icon,
        'shrink-0 select-none transition-all duration-300',
        withGlow && 'drop-shadow-[0_0_12px_rgba(6,182,212,0.55)]',
        className
      )}
      {...props}
    >
      <defs>
        {/* Core Electric Cyan Gradient */}
        <linearGradient id="docify-cyan-grad" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Ambient Glass / Sheet Gradient */}
        <linearGradient id="docify-sheet-grad" x1="20" y1="16" x2="80" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#083344" stopOpacity="0.85" />
        </linearGradient>

        {/* Dynamic AI Core Glow */}
        <linearGradient id="docify-spark-grad" x1="42" y1="36" x2="68" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Dark Squircle Background for Badge Variant */}
        <linearGradient id="docify-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A1628" />
          <stop offset="100%" stopColor="#020813" />
        </linearGradient>

        {/* Subtle Cyber Grid Glow Filter */}
        <filter id="docify-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Optional Badge Squircle Base */}
      {variant === 'badge' && (
        <>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#docify-bg-grad)"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="20"
            fill="none"
            stroke="url(#docify-cyan-grad)"
            strokeWidth="0.8"
            strokeOpacity="0.15"
          />
        </>
      )}

      {/* Layer 1: Layered Smart Document Sheets (Isometric Depth) */}
      <g opacity="0.92">
        {/* Back document sheet */}
        <path
          d="M26 18 C26 14.6863 28.6863 12 32 12 H60 L78 30 V72 C78 75.3137 75.3137 78 72 78 H32 C28.6863 78 26 75.3137 26 72 V18 Z"
          fill="url(#docify-sheet-grad)"
          stroke="#06B6D4"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        {/* Document folded corner tab */}
        <path
          d="M60 12 V28 C60 29.1046 60.8954 30 62 30 H78"
          stroke="#22D3EE"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#06B6D4"
          fillOpacity="0.25"
        />
        {/* Document subtle data scan-lines */}
        <line x1="36" y1="38" x2="52" y2="38" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
        <line x1="36" y1="46" x2="48" y2="46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.25" />
      </g>

      {/* Layer 2: Main Stylized "D" Cyber Ribbon with Gradient */}
      <path
        d="M22 26 C22 22.6863 24.6863 20 28 20 H54 C68.3594 20 80 31.6406 80 46 C80 58.7495 70.7893 69.3496 58.6416 71.5518 L64 80 C64.7 81.1 63.8 82.5 62.5 82.5 H28 C24.6863 82.5 22 79.8137 22 76.5 V26 Z"
        fill="url(#docify-cyan-grad)"
        filter="url(#docify-glow-filter)"
      />

      {/* Layer 3: Inner Negative-Space Counter of the "D" (creating modern continuous ribbon) */}
      <path
        d="M34 32 C34 30.8954 34.8954 30 36 30 H52 C60.8366 30 68 37.1634 68 46 C68 54.8366 60.8366 62 52 62 H36 C34.8954 62 34 61.1046 34 60 V32 Z"
        fill={variant === 'badge' ? '#030814' : '#0B132B'}
        className="dark:fill-[#040914] fill-white transition-colors duration-200"
      />

      {/* Layer 4: AI Neural Quantum Spark (Central AI Core) */}
      <g>
        {/* Ambient AI Core Glow Ring */}
        <circle
          cx="52"
          cy="46"
          r="9"
          fill="#06B6D4"
          fillOpacity={animated ? '0.28' : '0.18'}
          className={animated ? 'animate-pulse' : ''}
        />

        {/* 4-Point AI Sparkle Star */}
        <path
          d="M52 36 C52 42 46 46 40 46 C46 46 52 50 52 56 C52 50 58 46 64 46 C58 46 52 42 52 36 Z"
          fill="url(#docify-spark-grad)"
        />

        {/* Center Radiant Core Pip */}
        <circle cx="52" cy="46" r="2.2" fill="#FFFFFF" />

        {/* Orbiting Quantum Electrons / Data Dots */}
        <circle cx="68" cy="36" r="1.8" fill="#38BDF8" opacity="0.8" />
        <circle cx="34" cy="68" r="1.8" fill="#22D3EE" opacity="0.8" />
      </g>
    </svg>
  );

  // If variant is 'full', wrap with the official Docify typographic brand
  if (variant === 'full') {
    return (
      <div className={cn('inline-flex items-center gap-2.5 group select-none', className)}>
        {/* Animated or Standard Logo Container */}
        <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          {LogoSVG}
          {animated && (
            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md -z-10 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Brand Wordmark */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn('font-heading font-black tracking-tight text-light-heading dark:text-dark-heading', currentSize.text)}>
              Doc<span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">ify</span>
            </span>
            <span className={cn(
              'hidden sm:inline-block font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-xs',
              currentSize.badge
            )}>
              AI Suite
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard icon or badge return
  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.06, rotate: 1.5 }}
        whileTap={{ scale: 0.95 }}
        className="relative inline-flex items-center justify-center shrink-0"
      >
        {LogoSVG}
        <div className="absolute inset-0 rounded-2xl bg-cyan-400/15 blur-sm -z-10 animate-pulse pointer-events-none" />
      </motion.div>
    );
  }

  return LogoSVG;
};

export default DocifyLogo;
