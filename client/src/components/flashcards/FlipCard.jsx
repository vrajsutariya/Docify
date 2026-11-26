import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';

export const FlipCard = ({
  front = '',
  back = '',
  topic = 'General',
  box = 1,
  isFlipped = false,
  onFlip,
  language = 'en',
}) => {
  const isIndic = language === 'gu' || language === 'hi';

  const boxColors = {
    1: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    2: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    3: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  const boxLabels = {
    1: 'Box 1: Frequent',
    2: 'Box 2: Review',
    3: 'Box 3: Mastered',
  };

  return (
    <div
      className="w-full max-w-xl mx-auto h-[340px] cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* FRONT OF CARD */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-xl hover:shadow-2xl transition-shadow"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Top Meta */}
          <div className="flex items-center justify-between">
            <Badge variant="brand" size="sm" className="text-[10px]">
              {topic}
            </Badge>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${boxColors[box] || boxColors[1]}`}
            >
              {boxLabels[box] || boxLabels[1]}
            </span>
          </div>

          {/* Front Content (Concept / Question) */}
          <div className="my-auto text-center space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-brand-orange font-mono font-semibold">
              Question / Concept
            </div>
            <h3
              className={`font-heading font-bold text-lg sm:text-xl text-light-heading dark:text-dark-heading leading-relaxed ${
                isIndic ? 'indic-text' : ''
              }`}
            >
              {front}
            </h3>
          </div>

          {/* Card Bottom Hint */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-light-body dark:text-dark-body opacity-60">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click card to reveal answer</span>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-light-surface via-light-surface to-brand-red/5 dark:from-dark-surface dark:via-dark-surface dark:to-brand-red/10 border-2 border-brand-red/40 dark:border-brand-redBright/40 shadow-xl overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Card Top Meta */}
          <div className="flex items-center justify-between">
            <Badge variant="success" size="sm" className="text-[10px]">
              Answer & Takeaway
            </Badge>
            <span className="text-[10px] font-mono text-light-body">
              {topic}
            </span>
          </div>

          {/* Back Content (Answer & Explanation) */}
          <div className="my-auto space-y-3">
            <p
              className={`text-sm sm:text-base text-light-heading dark:text-dark-heading leading-relaxed font-medium ${
                isIndic ? 'indic-text' : ''
              }`}
            >
              {back}
            </p>
          </div>

          {/* Card Bottom Hint */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-brand-red dark:text-brand-redBright font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click to flip back</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
