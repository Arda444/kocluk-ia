"use client";

import { useTimer } from "@/components/TimerProvider";
import { formatClock } from "@/lib/time";

export function ElapsedLabel({
  taskId,
  elapsedSeconds,
  targetMinutes,
}: {
  taskId: string;
  elapsedSeconds: number;
  targetMinutes: number;
}) {
  const { task, elapsed } = useTimer();
  const seconds = task?.id === taskId ? elapsed : elapsedSeconds;
  const over = seconds > Math.max(1, targetMinutes) * 60;

  return (
    <span>
      hedef {targetMinutes} dk
      {seconds ? (
        <span className={over ? " text-wrong" : " text-correct"}>
          {` · tutulan ${formatClock(seconds)}`}
        </span>
      ) : null}
    </span>
  );
}
