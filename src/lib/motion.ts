import { type Variants } from 'motion/react';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: 'easeOut',
    },
  }),
};

export const maskReveal: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: (custom = 0) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.9,
      delay: custom * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const technicalBadgeVariant: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const cardHoverVariant = {
  rest: { y: 0, borderColor: 'rgba(255, 255, 255, 0.08)' },
  hover: {
    y: -4,
    borderColor: 'rgba(112, 255, 94, 0.35)',
    boxShadow: '0 12px 30px -10px rgba(112, 255, 94, 0.12)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};
