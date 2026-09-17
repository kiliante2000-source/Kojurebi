import { motion } from 'framer-motion';

export function Star({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`animate-twinkle ${className ?? ''}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden
    >
      <path
        d="M32 4 39 24 60 25 43 38 49 58 32 46 15 58 21 38 4 25 25 24Z"
        fill="#FFE14A"
        stroke="#1D3A6E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        d="M32 55C16 42 6 32 6 21C6 13 12.5 8 20 8C25 8 29 11 32 16C35 11 39 8 44 8C51.5 8 58 13 58 21C58 32 48 42 32 55Z"
        fill="#FF4F9A"
        stroke="#1D3A6E"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ className = 'text-6xl' }: { className?: string }) {
  return <span className={`wordmark relative inline-block ${className}`}>Kojurebi</span>;
}

export function Magnetic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  return <div className={className}>{children}</div>;
}

export function TiltFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const group = (copy: number) =>
    items.map((item, i) => (
      <span
        key={`${copy}-${item}-${i}`}
        className="inline-flex items-center font-head text-base font-extrabold uppercase tracking-[-0.04em] text-cobalt sm:text-3xl md:text-4xl"
      >
        {item}
        <span className="marquee-star" aria-hidden>
          ★
        </span>
      </span>
    ));

  return (
    <div className="marquee-wrap overflow-hidden border-t-3 border-cobalt bg-yellow py-3">
      <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
        <div className="marquee-group">{group(0)}</div>
        <div className="marquee-group" aria-hidden>
          {group(1)}
        </div>
      </div>
    </div>
  );
}

export function DraggableSticker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      drag
      dragMomentum
      dragElastic={0.12}
      whileDrag={{ scale: 1.08, zIndex: 40, cursor: 'grabbing' }}
      className={`absolute z-40 cursor-grab touch-none select-none md:z-30 ${className ?? ''}`}
      style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
    >
      {children}
    </motion.div>
  );
}

export function Cursor() {
  return null;
}
