import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface TextRevealProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  mode?: 'words' | 'characters' | 'lines';
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  viewportMargin?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  as = 'div',
  mode = 'words',
  delay = 0,
  stagger = 0.04,
  duration = 0.8,
  once = true,
  viewportMargin = '-10% 0px',
}) => {
  const Component = motion[as] as React.ComponentType<HTMLMotionProps<any>>;

  // Split text according to selected mode
  const tokens = React.useMemo(() => {
    if (mode === 'characters') {
      return children.split('');
    }
    if (mode === 'lines') {
      return children.split('\n');
    }
    // Default words
    return children.split(' ');
  }, [children, mode]);

  const containerVariants: import('motion/react').Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: import('motion/react').Variants = {
    hidden: {
      opacity: 0,
      y: '100%',
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: '0%',
      filter: 'blur(0px)',
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1] as const, // Cinematic cubic-bezier
      },
    },
  };

  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin as any }}
      className={`inline-flex flex-wrap items-baseline ${className}`}
    >
      {tokens.map((token, index) => (
        <span
          key={`${token}-${index}`}
          className={`inline-block overflow-hidden pb-1 -mb-1 align-top ${
            mode === 'characters' ? 'mr-0' : 'mr-[0.25em] last:mr-0'
          }`}
        >
          <motion.span
            variants={itemVariants}
            className="inline-block will-change-transform"
          >
            {token === ' ' ? '\u00A0' : token}
          </motion.span>
        </span>
      ))}
    </Component>
  );
};
