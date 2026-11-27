import React from 'react';
import { motion } from 'motion/react';
import { DocifyLogo } from './DocifyLogo';
import { cn } from '../../utils/cn';

/**
 * DocifyLoadingBar Component
 * A trendy, futuristic loading bar that integrates the Docify Logo with:
 * - Glowing electric cyan gradient track
 * - Animated Docify logo with pulse and neon aura
 * - Percentage badge, customizable status label, and scanline shimmer
 * - Supports both determinate (0-100%) and indeterminate streaming modes
 * 
 * @param {number} [progress] 0 to 100. If undefined, runs in continuous scanning mode
 * @param {string} [label] Descriptive text (e.g., "Analyzing document with Docify AI...")
 * @param {string} [sublabel] Secondary text (e.g., "Extracting multilingual OCR & vector embeddings")
 * @param {'sm'|'md'|'lg'} [size='md'] Bar thickness and logo scale
 * @param {boolean} [showLogo=true] Whether to display the Docify logo
 * @param {boolean} [showPercentage=true] Whether to display the percentage badge
 * @param {string} [className] Custom container classes
 */
export const DocifyLoadingBar = ({
  progress,
  label,
  sublabel,
  size = 'md',
  showLogo = true,
  showPercentage = true,
  className,
}) => {
  const isIndeterminate = typeof progress !== 'number' || isNaN(progress);
  const clampedProgress = isIndeterminate ? 0 : Math.min(100, Math.max(0, Math.round(progress)));

  const sizeConfig = {
    sm: {
      barHeight: 'h-1.5',
      logoSize: 'xs',
      text: 'text-xs',
      subtext: 'text-[10px]',
      badge: 'text-[10px]',
    },
    md: {
      barHeight: 'h-2.5',
      logoSize: 'sm',
      text: 'text-xs sm:text-sm',
      subtext: 'text-[11px]',
      badge: 'text-xs',
    },
    lg: {
      barHeight: 'h-3.5',
      logoSize: 'md',
      text: 'text-sm sm:text-base',
      subtext: 'text-xs',
      badge: 'text-xs',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={cn('w-full space-y-2 select-none', className)}>
      {/* Top Header: Logo, Status Label, and Percentage */}
      {(label || showLogo || (showPercentage && !isIndeterminate)) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {showLogo && (
              <div className="relative shrink-0 flex items-center justify-center">
                <DocifyLogo size={currentSize.logoSize} animated={true} withGlow={true} />
              </div>
            )}
            <div className="min-w-0">
              {label && (
                <p className={cn('font-heading font-semibold text-light-heading dark:text-dark-heading truncate flex items-center gap-1.5', currentSize.text)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span>{label}</span>
                </p>
              )}
              {sublabel && (
                <p className={cn('text-light-body dark:text-dark-body truncate opacity-80', currentSize.subtext)}>
                  {sublabel}
                </p>
              )}
            </div>
          </div>

          {/* Percentage Badge */}
          {showPercentage && !isIndeterminate && (
            <div className="shrink-0 flex items-center gap-1">
              <span className={cn('font-mono font-bold text-cyan-600 dark:text-cyan-400', currentSize.badge)}>
                {clampedProgress}%
              </span>
            </div>
          )}

          {/* Indeterminate AI Pulsing Badge */}
          {isIndeterminate && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/25 shrink-0 animate-pulse">
              Docify Engine
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className={cn(
        'relative w-full rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/40 dark:border-cyan-500/20 overflow-hidden shadow-inner backdrop-blur-xs',
        currentSize.barHeight
      )}>
        {/* Glow ambient background beam */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

        {/* Fill Bar */}
        {isIndeterminate ? (
          /* Indeterminate Scanning Light Sweep */
          <motion.div
            className="absolute top-0 bottom-0 w-2/5 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            animate={{
              left: ['-40%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
          />
        ) : (
          /* Determinate Progress Fill */
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-teal-300 shadow-[0_0_14px_rgba(6,182,212,0.65)] relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ ease: 'easeOut', duration: 0.35 }}
          >
            {/* Shimmer light sweep inside the bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent w-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DocifyLoadingBar;
