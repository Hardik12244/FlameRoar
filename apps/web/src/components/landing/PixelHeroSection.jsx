import React, { useEffect, useRef } from "react";
import "./PixelHeroSection.css";

const BASE_W = 768;
const BASE_H = 432;

const FONT_7X9 = {
  A: [
    "0011100",
    "0110110",
    "1100011",
    "1100011",
    "1111111",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
  ],
  E: [
    "1111111",
    "1100000",
    "1100000",
    "1111110",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1111111",
  ],
  F: [
    "1111111",
    "1100000",
    "1100000",
    "1111110",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
  ],
  L: [
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
    "1111111",
  ],
  M: [
    "1100011",
    "1110111",
    "1111111",
    "1101011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
  ],
  O: [
    "0011100",
    "0110110",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "0110110",
    "0011100",
  ],
  R: [
    "1111110",
    "1100011",
    "1100011",
    "1111110",
    "1101100",
    "1100110",
    "1100011",
    "1100011",
    "1100011",
  ],
};

function seeded(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function drawSky(w, h) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = false;

  const bands = [
    [0.16, "#0a2266"],
    [0.36, "#0e3c89"],
    [0.58, "#1361b4"],
    [0.78, "#2b8fda"],
    [1.0, "#63cbe9"],
  ];

  let y = 0;
  for (const [ratio, color] of bands) {
    const ny = Math.floor(h * ratio);
    ctx.fillStyle = color;
    ctx.fillRect(0, y, w, ny - y);
    y = ny;
  }

  return c;
}

function generateStars(w, h) {
  const rand = seeded(44092);
  const stars = [];
  const count = Math.floor((w * h) / 900);
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.floor(rand() * w),
      y: Math.floor(rand() * h * 0.42),
      s: rand() > 0.8 ? 2 : 1,
      p: Math.floor(rand() * 10),
    });
  }
  return stars;
}

function drawCloudLayer(w, h) {
  const c = makeCanvas(w * 2, h);
  const ctx = c.getContext("2d", { alpha: true });
  const rand = seeded(90211);
  ctx.imageSmoothingEnabled = false;

  const cloudBase = "rgba(165, 218, 255, 0.20)";
  const cloudShade = "rgba(127, 190, 240, 0.16)";

  for (let i = 0; i < 12; i += 1) {
    const cx = Math.floor(rand() * c.width);
    const cy = Math.floor(rand() * (h * 0.36) + h * 0.17);
    const rw = Math.floor(rand() * 42) + 30;
    const rh = Math.floor(rand() * 16) + 12;

    for (let yy = 0; yy < rh; yy += 2) {
      for (let xx = 0; xx < rw; xx += 2) {
        const nx = xx / rw - 0.5;
        const ny = yy / rh - 0.5;
        const d = nx * nx * 1.7 + ny * ny;
        if (d < 0.25) {
          ctx.fillStyle = (xx + yy) % 6 === 0 ? cloudShade : cloudBase;
          ctx.fillRect(cx + xx, cy + yy, 2, 2);
        }
      }
    }
  }
  return c;
}

function drawMountainLayer(w, h, options) {
  const c = makeCanvas(w * 2, h);
  const ctx = c.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = false;

  const rand = seeded(options.seed);
  const ridge = [];
  let current = options.baseY;

  for (let x = 0; x < c.width; x += 1) {
    const wave = Math.sin((x + options.phase) * options.freq) * options.amp * 0.48;
    const drift = (rand() - 0.5) * options.roughness;
    current += drift;
    const min = options.baseY - options.amp;
    const max = options.baseY + options.amp;
    if (current < min) current = min;
    if (current > max) current = max;
    ridge.push(Math.floor(current + wave));
  }

  for (let x = 0; x < c.width; x += 1) {
    const peak = ridge[x];
    for (let y = peak; y < h; y += 1) {
      const d = y - peak;
      let color = options.palette.mid;
      if (d < 5) color = options.palette.light;
      else if (d > 18) color = options.palette.dark;
      if (((x + y) & 3) === 0 && d > 8) color = options.palette.dither;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return c;
}

function drawForegroundLayer(w, h) {
  const c = makeCanvas(w * 2, h);
  const ctx = c.getContext("2d", { alpha: true });
  const rand = seeded(55192);
  ctx.imageSmoothingEnabled = false;

  for (let x = 0; x < c.width; x += 1) {
    const hill = Math.floor(h * 0.86 + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.007) * 9);
    for (let y = hill; y < h; y += 1) {
      let color = "#0b3b2f";
      if (((x + y) & 3) === 0) color = "#14543f";
      if (y - hill < 3) color = "#1e7157";
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  for (let i = 0; i < 48; i += 1) {
    const tx = Math.floor(rand() * c.width);
    const base = Math.floor(h * 0.88 + rand() * 12);
    const th = Math.floor(rand() * 12) + 9;
    for (let y = 0; y < th; y += 1) {
      const spread = Math.floor((th - y) * 0.42);
      for (let xx = -spread; xx <= spread; xx += 1) {
        const px = tx + xx;
        const py = base - y;
        if (px < 0 || py < 0 || px >= c.width || py >= h) continue;
        let color = "#0b2e28";
        if ((xx + y) % 5 === 0) color = "#17483c";
        ctx.fillStyle = color;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }

  return c;
}

function expandMask(mask, rows, cols, radius = 1) {
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!mask[y][x]) continue;
      for (let oy = -radius; oy <= radius; oy += 1) {
        for (let ox = -radius; ox <= radius; ox += 1) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          out[ny][nx] = 1;
        }
      }
    }
  }
  return out;
}

function buildLogo(text = "FLAMEROAR") {
  const scale = 5;
  const spacing = 1;
  const rows = 9;
  const chars = text.split("");
  const letterWidths = chars.map((ch) => (FONT_7X9[ch] ? FONT_7X9[ch][0].length : 7));
  const cols = letterWidths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);

  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  let cursor = 0;

  chars.forEach((ch, idx) => {
    const glyph = FONT_7X9[ch] || FONT_7X9.A;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < glyph[y].length; x += 1) {
        if (glyph[y][x] === "1") grid[y][cursor + x] = 1;
      }
    }
    cursor += glyph[0].length + (idx < chars.length - 1 ? spacing : 0);
  });

  const outlineThin = expandMask(grid, rows, cols, 1);
  const outlineWide = expandMask(grid, rows, cols, 2);

  const pad = 6;
  const c = makeCanvas((cols + pad * 2) * scale, (rows + pad * 2) * scale);
  const ctx = c.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = false;

  const startX = pad * scale;
  const startY = pad * scale;

  const depth = 3;
  const shadowColor = "rgba(46, 25, 10, 0.8)";
  const outlineOuterColor = "#2f1707";
  const outlineColor = "#5b2f12";
  const midColor = "#dba21f";
  const highlightColor = "#ffe171";
  const darkColor = "#a96710";
  const sideColor = "#7c4511";

  for (let d = depth + 1; d >= 1; d -= 1) {
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!grid[y][x]) continue;
        ctx.fillStyle = d === depth + 1 ? shadowColor : sideColor;
        ctx.fillRect(startX + (x + d) * scale, startY + (y + d) * scale, scale, scale);
      }
    }
  }

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (outlineWide[y][x] && !outlineThin[y][x]) {
        ctx.fillStyle = outlineOuterColor;
        ctx.fillRect(startX + x * scale, startY + y * scale, scale, scale);
      }
      if (outlineThin[y][x] && !grid[y][x]) {
        ctx.fillStyle = outlineColor;
        ctx.fillRect(startX + x * scale, startY + y * scale, scale, scale);
      }
    }
  }

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!grid[y][x]) continue;
      const hasUp = y > 0 && grid[y - 1][x];
      const hasLeft = x > 0 && grid[y][x - 1];
      const hasRight = x < cols - 1 && grid[y][x + 1];
      const hasDown = y < rows - 1 && grid[y + 1][x];

      let color = midColor;
      if (!hasUp || y <= 1 || !hasLeft) color = highlightColor;
      if (!hasRight || !hasDown) color = darkColor;
      if (!hasUp && !hasRight) color = highlightColor;

      ctx.fillStyle = color;
      ctx.fillRect(startX + x * scale, startY + y * scale, scale, scale);
    }
  }

  const deco = [
    [2, 1, "#2ca04d"],
    [3, 0, "#45c463"],
    [4, 1, "#1f7e3a"],
    [cols - 2, 0, "#45c463"],
    [cols - 1, 1, "#2ca04d"],
    [cols + 1, 4, "#ff8e2b"],
    [cols + 2, 3, "#ffb04e"],
    [cols + 2, 5, "#e16f1d"],
  ];

  deco.forEach(([gx, gy, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(startX + gx * scale, startY + gy * scale, scale, scale);
  });

  return c;
}

function drawWrapped(ctx, layer, x) {
  const w = layer.width / 2;
  const offset = ((x % w) + w) % w;
  ctx.drawImage(layer, -offset, 0);
  ctx.drawImage(layer, w - offset, 0);
}

export default function PixelHeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    let rafId = 0;
    let start = 0;

    let sky;
    let clouds;
    let stars;
    let backMountains;
    let midMountains;
    let frontHills;
    let foreground;
    let logo;

    const setup = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      canvas.width = BASE_W * dpr;
      canvas.height = BASE_H * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      sky = drawSky(BASE_W, BASE_H);
      clouds = drawCloudLayer(BASE_W, BASE_H);
      stars = generateStars(BASE_W, BASE_H);

      backMountains = drawMountainLayer(BASE_W, BASE_H, {
        seed: 1701,
        baseY: Math.floor(BASE_H * 0.66),
        amp: 18,
        freq: 0.042,
        phase: 12,
        roughness: 1.3,
        palette: {
          light: "#7d9dcf",
          mid: "#5d79b0",
          dark: "#465f90",
          dither: "#3e5380",
        },
      });

      midMountains = drawMountainLayer(BASE_W, BASE_H, {
        seed: 2714,
        baseY: Math.floor(BASE_H * 0.73),
        amp: 23,
        freq: 0.051,
        phase: 70,
        roughness: 1.5,
        palette: {
          light: "#4fd67c",
          mid: "#2faf62",
          dark: "#1f8b4f",
          dither: "#197445",
        },
      });

      frontHills = drawMountainLayer(BASE_W, BASE_H, {
        seed: 3312,
        baseY: Math.floor(BASE_H * 0.8),
        amp: 14,
        freq: 0.059,
        phase: 130,
        roughness: 1.9,
        palette: {
          light: "#66ea7a",
          mid: "#38bf5b",
          dark: "#27914a",
          dither: "#1f7b3f",
        },
      });

      foreground = drawForegroundLayer(BASE_W, BASE_H);
      logo = buildLogo("FLAMEROAR");
    };

    const render = (t) => {
      if (!start) start = t;
      const dt = (t - start) * 0.001;

      ctx.clearRect(0, 0, BASE_W, BASE_H);
      ctx.drawImage(sky, 0, 0);

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const tw = ((Math.floor(dt * 5) + s.p) % 6) < 2;
        ctx.fillStyle = tw ? "#fffbe9" : s.s === 2 ? "#dce8ff" : "#a9d2ff";
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }

      drawWrapped(ctx, clouds, dt * 2.6);
      drawWrapped(ctx, backMountains, dt * 4.5);
      drawWrapped(ctx, midMountains, dt * 8);
      drawWrapped(ctx, frontHills, dt * 12.5);
      drawWrapped(ctx, foreground, dt * 16.5);

      const logoX = Math.floor((BASE_W - logo.width) / 2);
      const logoY = Math.floor(BASE_H * 0.2 + Math.sin(dt * 0.7) * 1.5);

      const glowX = Math.floor(BASE_W / 2);
      const glowY = Math.floor(logoY + logo.height * 0.52);
      const glowRings = [108, 82, 58, 40];
      const glowColors = ["rgba(253, 214, 104, 0.14)", "rgba(251, 205, 90, 0.16)", "rgba(249, 191, 74, 0.2)", "rgba(255, 223, 139, 0.22)"];

      for (let i = 0; i < glowRings.length; i += 1) {
        const r = glowRings[i];
        ctx.fillStyle = glowColors[i];
        for (let yy = -r; yy <= r; yy += 2) {
          for (let xx = -r; xx <= r; xx += 2) {
            if (xx * xx + yy * yy <= r * r) {
              ctx.fillRect(glowX + xx, glowY + yy, 2, 2);
            }
          }
        }
      }

      ctx.fillStyle = "rgba(40, 23, 9, 0.42)";
      for (let y = 0; y < 6; y += 1) {
        for (let x = 0; x < logo.width + 18; x += 2) {
          if ((x + y) % 4 === 0) {
            ctx.fillRect(logoX - 9 + x, logoY + logo.height + 5 + y, 2, 1);
          }
        }
      }

      ctx.drawImage(logo, logoX, logoY);
      rafId = requestAnimationFrame(render);
    };

    setup();
    rafId = requestAnimationFrame(render);

    const onResize = () => {
      setup();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="section pixel-hero" aria-label="Pixel art hero section">
      <canvas ref={canvasRef} className="pixel-hero-canvas" role="img" aria-label="Pixel-art landscape with FLAMEROAR logo" />
    </section>
  );
}
