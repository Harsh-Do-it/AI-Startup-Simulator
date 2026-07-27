import { useEffect, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 900, decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start;
    let frame;

    const step = (time) => {
      start ??= time;
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="font-data">{display.toFixed(decimals)}</span>;
}
