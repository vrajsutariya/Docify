import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  className,
  menuClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const alignClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      className={cn('relative inline-block text-left', className)}
    >
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-xs font-medium text-light-heading dark:text-dark-heading hover:border-accent dark:hover:border-accent-light"
          >
            <span>Options</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-lg py-1.5 focus:outline-none backdrop-blur-md',
              alignClasses[align],
              menuClassName
            )}
          >
            {items.map((item, idx) => {
              if (item.divider) {
                return (
                  <div
                    key={`div-${idx}`}
                    className="my-1 border-t border-light-border dark:border-dark-border"
                  />
                );
              }

              const Icon = item.icon;
              return (
                <button
                  key={item.id || item.label || idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium',
                    item.active
                      ? 'text-accent-dark dark:text-accent-light bg-accent/10 font-semibold'
                      : 'text-light-heading dark:text-dark-heading hover:bg-light-bg dark:hover:bg-dark-bg',
                    item.danger && 'text-status-error hover:bg-status-error/10',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
