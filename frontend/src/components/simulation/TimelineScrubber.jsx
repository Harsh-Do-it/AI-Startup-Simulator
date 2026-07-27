import React from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

const TimelineScrubber = ({
  selectedMonth,
  onChange,
  monthlyData = [],
  isPlaying,
  onTogglePlay,
}) => {
  const getStageColor = (stage) => {
    switch (stage) {
      case "Validation":
        return "bg-ink-200 text-ink-900";
      case "Early Traction":
        return "bg-brass-200 text-brass-900";
      case "Product-Market Learning":
        return "bg-ink-500 text-surface";
      case "Expansion":
        return "bg-ink-800 text-surface";
      default:
        return "bg-surface-container-highest text-ink-900";
    }
  };

  const currentMonthData =
    monthlyData.find((m) => m.month === selectedMonth) || {};

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-soft mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-headline text-lg font-bold text-ink-900">
            Month {selectedMonth} of 12
          </span>
          {currentMonthData.stage && (
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStageColor(
                currentMonthData.stage
              )}`}
            >
              {currentMonthData.stage}
            </span>
          )}
          {currentMonthData.isDelayed && (
            <span className="bg-burgundy-100 text-burgundy-800 text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-burgundy-300">
              Milestone Delayed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, selectedMonth - 1))}
            disabled={selectedMonth <= 1}
            className="p-1.5 rounded border border-outline-variant text-ink-700 hover:bg-surface-container-high disabled:opacity-30 transition"
            title="Previous Month"
          >
            <SkipBack size={16} />
          </button>
          {onTogglePlay && (
            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1.5 px-3 rounded bg-brass-500 text-ink-900 font-bold hover:bg-brass-600 transition flex items-center gap-1.5 text-xs"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Pause" : "Play Timeline"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange(Math.min(12, selectedMonth + 1))}
            disabled={selectedMonth >= 12}
            className="p-1.5 rounded border border-outline-variant text-ink-700 hover:bg-surface-container-high disabled:opacity-30 transition"
            title="Next Month"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      <div className="relative pt-2 pb-4 px-1">
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={selectedMonth}
          onChange={(e) => onChange(Number(e.target.value))}
          className="timeline-scrubber cursor-pointer w-full"
        />

        <div className="flex justify-between mt-3 px-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const isSelected = m === selectedMonth;
            const monthInfo = monthlyData.find((item) => item.month === m);
            const isPositive = monthInfo?.isCashFlowPositive;
            const isExhausted = monthInfo?.endingCash <= 0;

            return (
              <button
                key={m}
                type="button"
                onClick={() => onChange(m)}
                className="flex flex-col items-center group transition focus:outline-none"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mb-1 transition-all ${
                    isSelected
                      ? "bg-brass-500 scale-125 ring-2 ring-brass-200"
                      : isExhausted
                      ? "bg-burgundy-500"
                      : isPositive
                      ? "bg-ink-600"
                      : "bg-outline-variant group-hover:bg-ink-400"
                  }`}
                />
                <span
                  className={`text-[0.7rem] font-data font-semibold ${
                    isSelected
                      ? "text-ink-900 font-bold scale-110" : "text-ink-400 group-hover:text-ink-700"
                  }`}
                >
                  M{m}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center text-[0.7rem] text-ink-500 border-t border-outline-variant pt-2 mt-1 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink-600 inline-block"></span>{" "}
            Cash Flow Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-burgundy-500 inline-block"></span>{" "}
            Cash Exhausted
          </span>
        </div>
        <span className="italic">
          Scrub or click months to inspect detailed unit economics
        </span>
      </div>
    </div>
  );
};

export default TimelineScrubber;
