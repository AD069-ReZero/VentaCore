import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface TechnicalRevealProps {
  text: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  speedMs?: number;
  delayMs?: number;
}

const GLYPHS = '0123456789ABCDEF_//-[]<>';

export const TechnicalReveal: React.FC<TechnicalRevealProps> = ({
  text,
  className = '',
  prefix = '',
  suffix = '',
  speedMs = 25,
  delayMs = 0,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10% 0px' });

  useEffect(() => {
    if (!isInView) return;

    let timeoutId: NodeJS.Timeout;
    let frame = 0;
    const totalFrames = text.length;

    const startScramble = () => {
      const interval = setInterval(() => {
        if (frame >= totalFrames) {
          setDisplayText(text);
          clearInterval(interval);
          return;
        }

        const scrambled = text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < frame) return text[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('');

        setDisplayText(scrambled);
        frame += 1;
      }, speedMs);
    };

    if (delayMs > 0) {
      timeoutId = setTimeout(startScramble, delayMs);
    } else {
      startScramble();
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isInView, text, speedMs, delayMs]);

  return (
    <span
      ref={containerRef}
      className={`font-mono text-xs tracking-wider inline-flex items-center ${className}`}
    >
      {prefix && <span className="opacity-60 mr-1">{prefix}</span>}
      <span className="tabular-nums">{displayText}</span>
      {suffix && <span className="opacity-60 ml-1">{suffix}</span>}
    </span>
  );
};
