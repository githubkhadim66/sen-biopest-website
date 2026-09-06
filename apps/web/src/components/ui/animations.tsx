'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, type Variants } from 'framer-motion';

// ============ FADE IN UP ============
export function FadeInUp({
  children,
  delay = 0,
  duration = 0.35,
  className = '',
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ FADE IN LEFT/RIGHT ============
export function FadeInFrom({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.4,
  className = '',
  once = true,
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-30px' });
  const x = direction === 'left' ? -30 : 30;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ SCALE IN ============
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ STAGGER CONTAINER ============
const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export function StaggerContainer({
  children,
  className = '',
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

// ============ COUNTER ANIMATION ============
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <span ref={ref} className={className}>
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {prefix}
          <CountUp target={value} duration={duration} />
          {suffix}
        </motion.span>
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </span>
  );
}

function CountUp({ target, duration }: { target: number; duration: number }) {
  return (
    <motion.span
      initial={0}
      animate={target}
      transition={{ duration, ease: 'easeOut' }}
    >
      {/* Using a workaround with useMotionValue */}
      <CountUpInner target={target} duration={duration} />
    </motion.span>
  );
}

function CountUpInner({ target, duration }: { target: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionRef = useRef({ val: 0 });

  return (
    <motion.span
      ref={ref}
      animate={{ opacity: 1 }}
      onAnimationStart={() => {
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          if (ref.current) ref.current.textContent = current.toString();
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }}
    >
      0
    </motion.span>
  );
}

// ============ PARALLAX IMAGE ============
export function ParallaxImage({
  src,
  alt,
  className = '',
  speed = 0.3,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-[120%] object-cover -mt-[10%]"
        loading="lazy"
      />
    </div>
  );
}

// ============ REVEAL LINE ============
export function RevealLine({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============ FLOATING ANIMATION ============
export function FloatingElement({
  children,
  className = '',
  amplitude = 10,
  duration = 4,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}) {
  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ MAGNETIC BUTTON ============
export function MagneticWrapper({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ ANIMATED GRADIENT TEXT ============
export function GradientText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ['0% center', '200% center'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    >
      {children}
    </motion.span>
  );
}
