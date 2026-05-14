import { motion, useReducedMotion } from "framer-motion";

type WaveBackgroundProps = {
  className?: string;
  variant?: "soft" | "bold";
};

export function WaveBackground({ className = "", variant = "soft" }: WaveBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const opacity = variant === "soft" ? 0.18 : 0.32;

  const lines = [
    { d: "M0,160 C240,80 480,240 720,160 C960,80 1200,240 1440,160", stroke: "url(#waveGrad1)", strokeWidth: 1.2 },
    { d: "M0,220 C240,140 480,300 720,220 C960,140 1200,300 1440,220", stroke: "url(#waveGrad2)", strokeWidth: 1 },
    { d: "M0,280 C240,200 480,360 720,280 C960,200 1200,360 1440,280", stroke: "url(#waveGrad1)", strokeWidth: 0.8 },
    { d: "M0,340 C240,260 480,420 720,340 C960,260 1200,420 1440,340", stroke: "url(#waveGrad2)", strokeWidth: 0.8 },
    { d: "M0,400 C240,320 480,480 720,400 C960,320 1200,480 1440,400", stroke: "url(#waveGrad1)", strokeWidth: 0.6 },
  ];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 1440 500"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(228 67% 47%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(228 67% 47%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(265 70% 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(265 70% 60%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(235 70% 55%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(228 67% 47%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map((l, i) => (
          <motion.path
            key={i}
            d={l.d}
            stroke={l.stroke}
            strokeWidth={l.strokeWidth}
            fill="none"
            initial={{ x: 0 }}
            animate={reduceMotion ? undefined : { x: [0, -20, 0, 20, 0] }}
            transition={{
              duration: 18 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
