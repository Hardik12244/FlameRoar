import { useEffect, useRef, useState } from "react";

export default function AnimatedCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pikaVisible, setPikaVisible] = useState(true);
  const cursorRef = useRef(null);
  const companionRef = useRef(null);

  const target = useRef({ x: -100, y: -100 });
  const companion = useRef({ x: -120, y: -120 });
  const velocity = useRef({ x: 0, y: 0 });
  const facingRightRef = useRef(true);
  const hoveringInteractive = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const isDesktopPointer = media.matches;
    setEnabled(isDesktopPointer);
    if (!isDesktopPointer) return undefined;

    document.body.classList.add("cursor-game");

    const move = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
      }

      const clickable = e.target.closest(
        "button, a, input, textarea, select, [role='button']"
      );
      hoveringInteractive.current = Boolean(clickable);
    };

    let raf = 0;
    const tick = () => {
      const node = companionRef.current;
      if (node) {
        const tx = target.current.x;
        const ty = target.current.y;
        const dxCursor = tx - companion.current.x;
        const dir = dxCursor >= 0 ? 1 : -1;
        facingRightRef.current = dir >= 0;

        const followDistance = hoveringInteractive.current ? 30 : 46;
        const desiredX = tx - dir * followDistance;
        const desiredY = ty + 18;

        const dx = desiredX - companion.current.x;
        const dy = desiredY - companion.current.y;
        const accel = hoveringInteractive.current ? 0.058 : 0.046;

        velocity.current.x += dx * accel;
        velocity.current.y += dy * accel;

        velocity.current.x *= 0.78;
        velocity.current.y *= 0.72;

        const maxSpeed = hoveringInteractive.current ? 16 : 12;
        velocity.current.x = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.x));
        velocity.current.y = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.y));

        companion.current.x += velocity.current.x;
        companion.current.y += velocity.current.y;

        const dist = Math.hypot(dx, dy);
        const moving = dist > 1.6;
        const fast = dist > 56;

        node.style.transform = `translate(${companion.current.x - 28}px, ${companion.current.y - 44}px) scaleX(${facingRightRef.current ? 1 : -1})`;
        node.classList.toggle("walk", moving);
        node.classList.toggle("fast", fast);
        node.classList.toggle("idle", !moving);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-game");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={cursorRef} className="pixel-cursor" aria-hidden>
        <div className="pixel-cursor-orb" />
      </div>
      <div ref={companionRef} className="pixel-companion idle" aria-hidden>
        <span className="pixel-companion-shadow" />
        <div className="pixel-companion-wrap">
          {pikaVisible && (
            <img
              src="/assets/pikachu.svg"
              alt=""
              className="pixel-companion-img"
              draggable={false}
              onError={() => setPikaVisible(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}