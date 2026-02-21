import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaveformProps {
  subtle?: boolean;
  className?: string;
}

const Waveform = ({ subtle, className }: WaveformProps) => (
  <svg
    viewBox="0 0 200 30"
    className={cn(
      "w-full preserveAspectRatio-none",
      subtle ? "max-w-[200px] opacity-15" : "max-w-xs opacity-20",
      className
    )}
    preserveAspectRatio="none"
  >
    {Array.from({ length: 40 }).map((_, i) => {
      const h = 4 + Math.sin(i * 0.5) * 8 + Math.random() * 6;
      return (
        <motion.rect
          key={i}
          x={i * 5}
          y={15 - h / 2}
          width={2.5}
          height={h}
          rx={1.25}
          fill="url(#waveGradShared)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0.3, 1, 0.5, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />
      );
    })}
    <defs>
      <linearGradient id="waveGradShared" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(263, 84%, 58%)" />
        <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
      </linearGradient>
    </defs>
  </svg>
);

export default Waveform;
