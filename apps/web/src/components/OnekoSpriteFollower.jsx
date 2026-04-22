import { useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion';

const STATES = {
  idle: 'idle',
  alert: 'alert',
  run: 'run',
  sleep: 'sleep',
  scratch: 'scratch',
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const defaultGifs = {
  idle: '/assets/pikachu.svg',
  alert: '/assets/pikachu.svg',
  run: '/assets/pikachu.svg',
  sleep: '/assets/pikachu.svg',
  scratch: '/assets/pikachu.svg',
};

/**
 * Oneko-style cursor follower.
 * - Pass `gifUrls` for multi-file animation swapping
 * - Or pass `spriteSheetUrl` and `frameMap` to drive a single PNG spritesheet
 */
export default function OnekoSpriteFollower({
  gifUrls = defaultGifs,
  spriteSheetUrl,
  frameMap,
  frameSize = { width: 32, height: 32 },
  frameRate = 8,
}) {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState(STATES.idle);
  const [imageFallback, setImageFallback] = useState(false);

  const targetX = useMotionValue(-80);
  const targetY = useMotionValue(-80);

  const x = useSpring(targetX, { stiffness: 260, damping: 20, mass: 0.7, bounce: 0.28 });
  const y = useSpring(targetY, { stiffness: 240, damping: 20, mass: 0.72, bounce: 0.3 });

  const face = useMotionValue(1);
  const tilt = useMotionValue(0);
  const bob = useMotionValue(0);
  const finalY = useTransform([y, bob], ([baseY, bobY]) => baseY + bobY);

  const frameX = useMotionValue(0);
  const frameY = useMotionValue(0);
  const bgPosX = useTransform(frameX, (v) => -v);
  const bgPosY = useTransform(frameY, (v) => -v);

  const spriteRef = useRef({ x: -80, y: -80 });
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    lastX: window.innerWidth / 2,
    lastY: window.innerHeight / 2,
    lastMoveAt: performance.now(),
    leftWindow: false,
  });
  const stateRef = useRef(STATES.idle);
  const prevFrameRef = useRef({ x: -80, t: 0 });
  const alertUntilRef = useRef(0);
  const scratchUntilRef = useRef(0);
  const edgeRef = useRef('right');

  useMotionValueEvent(x, 'change', (v) => {
    spriteRef.current.x = v;
  });

  useMotionValueEvent(y, 'change', (v) => {
    spriteRef.current.y = v;
  });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;

    setEnabled(true);

    const onMouseMove = (event) => {
      const now = performance.now();
      const m = mouseRef.current;

      m.x = event.clientX;
      m.y = event.clientY;
      m.lastX = event.clientX;
      m.lastY = event.clientY;
      m.lastMoveAt = now;
      m.leftWindow = false;

      alertUntilRef.current = now + 600;

      face.set(event.clientX >= spriteRef.current.x ? 1 : -1);
    };

    const onMouseLeave = (event) => {
      const now = performance.now();
      const m = mouseRef.current;
      m.leftWindow = true;
      m.lastMoveAt = now;

      const cx = event.clientX;
      const cy = event.clientY;
      if (cx <= 4) edgeRef.current = 'left';
      else if (cx >= window.innerWidth - 4) edgeRef.current = 'right';
      else if (cy <= 4) edgeRef.current = 'top';
      else edgeRef.current = 'bottom';

      scratchUntilRef.current = now + 1400;
    };

    const onResize = () => {
      targetX.set(clamp(spriteRef.current.x, 12, window.innerWidth - 12));
      targetY.set(clamp(spriteRef.current.y, 12, window.innerHeight - 12));
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [face, targetX, targetY]);

  useAnimationFrame((now) => {
    if (!enabled) return;

    const m = mouseRef.current;
    const dx = m.x - spriteRef.current.x;
    const dy = m.y - spriteRef.current.y;
    const distance = Math.hypot(dx, dy);

    const edgeThreshold = 26;
    const nearEdge =
      m.x < edgeThreshold ||
      m.y < edgeThreshold ||
      m.x > window.innerWidth - edgeThreshold ||
      m.y > window.innerHeight - edgeThreshold;

    let nextState = STATES.idle;

    if (now < scratchUntilRef.current || (m.leftWindow && nearEdge)) {
      nextState = STATES.scratch;

      if (edgeRef.current === 'left') {
        targetX.set(16);
        targetY.set(clamp(m.y, 16, window.innerHeight - 16));
      } else if (edgeRef.current === 'right') {
        targetX.set(window.innerWidth - 16);
        targetY.set(clamp(m.y, 16, window.innerHeight - 16));
      } else if (edgeRef.current === 'top') {
        targetX.set(clamp(m.x, 16, window.innerWidth - 16));
        targetY.set(16);
      } else {
        targetX.set(clamp(m.x, 16, window.innerWidth - 16));
        targetY.set(window.innerHeight - 16);
      }
    } else if (now - m.lastMoveAt > 20000) {
      nextState = STATES.sleep;
      targetX.set(spriteRef.current.x);
      targetY.set(spriteRef.current.y);
    } else if (distance > 15) {
      nextState = STATES.run;
      const pull = clamp(distance / 140, 0.7, 1.35);
      targetX.set(clamp(spriteRef.current.x + dx * pull, 12, window.innerWidth - 12));
      targetY.set(clamp(spriteRef.current.y + dy * pull, 12, window.innerHeight - 12));
    } else if (now < alertUntilRef.current) {
      nextState = STATES.alert;
      targetX.set(spriteRef.current.x);
      targetY.set(spriteRef.current.y);
    } else {
      nextState = STATES.idle;
      targetX.set(spriteRef.current.x);
      targetY.set(spriteRef.current.y);
    }

    if (stateRef.current !== nextState) {
      stateRef.current = nextState;
      setState(nextState);
    }

    const dt = Math.max(1, now - (prevFrameRef.current.t || now - 16));
    const vx = (spriteRef.current.x - prevFrameRef.current.x) / (dt / 1000);
    tilt.set(clamp(vx / 160, -6, 6));
    prevFrameRef.current = { x: spriteRef.current.x, t: now };
  });

  useEffect(() => {
    if (!enabled) return;

    if (state === STATES.run || state === STATES.alert) {
      animate(bob, [0, -2, 0], {
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      });
    } else if (state === STATES.sleep) {
      animate(bob, [0, -1, 0], {
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      });
    } else {
      animate(bob, 0, { duration: 0.2 });
    }
  }, [bob, enabled, state]);

  useEffect(() => {
    if (!spriteSheetUrl || !frameMap) return;

    const map = frameMap[state] || frameMap.idle;
    if (!map?.length) return;

    let i = 0;
    frameX.set(map[0].x * frameSize.width);
    frameY.set(map[0].y * frameSize.height);

    const step = 1000 / frameRate;
    const timer = setInterval(() => {
      i = (i + 1) % map.length;
      frameX.set(map[i].x * frameSize.width);
      frameY.set(map[i].y * frameSize.height);
    }, step);

    return () => clearInterval(timer);
  }, [frameMap, frameRate, frameSize.height, frameSize.width, frameX, frameY, spriteSheetUrl, state]);

  const gifSource = useMemo(() => {
    if (imageFallback) return '/assets/pikachu.svg';
    return gifUrls[state] || gifUrls.idle || '/assets/pikachu.svg';
  }, [gifUrls, imageFallback, state]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-70" aria-hidden>
      <motion.div
        className="absolute"
        style={{ x, y: finalY, scaleX: face, rotate: tilt }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {spriteSheetUrl ? (
            <motion.div
              className="h-16 w-16 bg-no-repeat"
              style={{
                backgroundImage: `url(${spriteSheetUrl})`,
                backgroundPositionX: bgPosX,
                backgroundPositionY: bgPosY,
                imageRendering: 'pixelated',
              }}
            />
          ) : (
            <img
              src={gifSource}
              alt=""
              draggable={false}
              onError={() => setImageFallback(true)}
              className="h-16 w-16 select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
