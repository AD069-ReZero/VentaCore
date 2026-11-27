import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  showHudBrackets?: boolean;
  variant?: 'fade-up' | 'scale-in' | 'subtle-slide';
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  showHudBrackets = true,
  variant = 'fade-up',
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: '-15% 0px',
  });

  const getVariants = (): import('motion/react').Variants => {
    switch (variant) {
      case 'scale-in':
        return {
          hidden: { opacity: 0, scale: 0.96, y: 30 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
          },
        };
      case 'subtle-slide':
        return {
          hidden: { opacity: 0, x: -20 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
          },
        };
      case 'fade-up':
      default:
        return {
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
          },
        };
    }
  };

  return (
    <motion.section
      ref={containerRef}
      id={id}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`relative ${className}`}
    >
      {/* Optional Decorative HUD Corner Brackets */}
      {showHudBrackets && (
        <>
          <div
            className={`absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 transition-opacity duration-700 pointer-events-none ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 transition-opacity duration-700 pointer-events-none ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 transition-opacity duration-700 pointer-events-none ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 transition-opacity duration-700 pointer-events-none ${
              isInView ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}

      {children}
    </motion.section>
  );
};
