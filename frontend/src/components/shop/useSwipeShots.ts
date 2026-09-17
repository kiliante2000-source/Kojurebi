import { useEffect, useRef, useState } from 'react';
import type { PanInfo } from 'framer-motion';

export function useSwipeShots(length: number) {
  const [shot, setShot] = useState(0);
  const [hover, setHover] = useState(false);
  const swiped = useRef(false);
  const carousel = length > 1;

  useEffect(() => {
    if (!hover || !carousel) return;
    const timer = window.setInterval(() => {
      setShot((i) => (i + 1) % length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [hover, carousel, length]);

  const consumeSwipe = () => {
    if (!swiped.current) return false;
    swiped.current = false;
    return true;
  };

  const onPanEnd = (_event: unknown, info: PanInfo) => {
    if (!carousel) return;
    const dx = info.offset.x;
    const dy = info.offset.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    swiped.current = true;
    setHover(false);
    setShot((i) => (i + (dx < 0 ? 1 : -1) + length) % length);
  };

  return {
    shot,
    setShot,
    hover,
    carousel,
    consumeSwipe,
    stageProps: {
      style: { touchAction: carousel ? ('pan-y' as const) : undefined },
      onPanEnd,
      onPointerEnter: (event: { pointerType: string }) => {
        if (event.pointerType === 'touch') return;
        setHover(true);
      },
      onPointerLeave: (event: { pointerType: string }) => {
        setHover(false);
        if (event.pointerType === 'touch' || event.pointerType === 'pen') return;
        setShot(0);
      },
    },
  };
}
