// Palette pulled from BubbleBackground.tsx
const PALETTE = [
  "#FFB6D9", "#D4A5FF", "#A5D8FF", "#FFE5A5", "#FFA5C7",
  "#FF9CEE", "#C9A0FF", "#A0E7FF", "#FFD4A3", "#FF94B3",
  "#E5B8F4", "#C9E4FF", "#FFE4B5", "#FFB8E6", "#D4B5FF",
  "#FFC4E1", "#E8B5FF", "#B5E8FF", "#FFEAA7", "#FFB8D1",
  "#FFD1F0", "#E0C3FF", "#C3E8FF", "#FFF4C4", "#FFD1E3",
];

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface GeneratedCardImageProps {
  seed: string;
  className?: string;
}

export const GeneratedCardImage = ({ seed, className }: GeneratedCardImageProps) => {
  const rand = mulberry32(hashString(seed));
  const filterId = `blur-${hashString(seed).toString(36)}`;

  const bubbles = Array.from({ length: 6 }, () => ({
    cx: rand() * 100,
    cy: rand() * 100,
    r: 25 + rand() * 45,
    color: PALETTE[Math.floor(rand() * PALETTE.length)],
    opacity: 0.55 + rand() * 0.35,
  }));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="#f0e6ff" />
      <g filter={`url(#${filterId})`}>
        {bubbles.map((b, i) => (
          <circle
            key={i}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill={b.color}
            opacity={b.opacity}
          />
        ))}
      </g>
    </svg>
  );
};
