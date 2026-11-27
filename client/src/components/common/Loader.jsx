import React from 'react';
import { motion } from 'motion/react';
import { DocifyLogo } from './DocifyLogo';
import { DocifyLoadingBar } from './DocifyLoadingBar';
import { cn } from '../../utils/cn';

/**
 * Modern Brand Loader for Docify
 * Features the Docify logo with rotating cyber-orbitals and integrated loading bar
 * 
 * @param {'sm'|'md'|'lg'|'xl'} [size='md'] Overall scale
 * @param {string} [label] Descriptive loading text
 * @param {string} [sublabel] Secondary context message
 * @param {number} [progress] Optional 0-100 percentage
 * @param {boolean} [fullPage=false] Full viewport centering
 * @param {boolean} [showBar=true] Whether to show the loading bar
 * @param {string} [className] Extra styling
 */
export const Loader = ({
  size = 'md',
  label,
  sublabel,
  progress,
  className,
  fullPage = false,
  showBar = true,
}) => {
  const logoSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  };

  const ringSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const barSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'lg',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4 text-center select-none', className)}>
      {/* Central Animated Docify Brand Mark with Orbital Rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Cyber Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className={cn(
            'absolute rounded-full border border-dashed border-cyan-400/40 dark:border-cyan-400/50 pointer-events-none',
            ringSizes[size] || ringSizes.md
          )}
        />

        {/* Counter-Rotating Orbital Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className={cn(
            'absolute rounded-full border border-cyan-500/20 dark:border-cyan-300/30 pointer-events-none scale-110',
            ringSizes[size] || ringSizes.md
          )}
        />

        {/* Ambient Cyan Glow */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 dark:bg-cyan-500/25 blur-xl -z-10 animate-pulse pointer-events-none" />

        {/* The Docify Logo */}
        <DocifyLogo
          size={logoSizes[size] || 'md'}
          animated={true}
          withGlow={true}
        />
      </div>

      {/* Branded Loading Bar & Status */}
      {showBar && (
        <div className="w-full max-w-xs sm:max-w-sm mt-1 px-2">
          <DocifyLoadingBar
            progress={progress}
            label={label}
            sublabel={sublabel}
            size={barSizes[size] || 'md'}
            showLogo={false} // logo is already prominently featured above
            showPercentage={typeof progress === 'number'}
          />
        </div>
      )}

      {/* Standalone label when showBar is false */}
      {!showBar && label && (
        <p className="text-xs sm:text-sm font-heading font-semibold text-light-heading dark:text-dark-heading animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
