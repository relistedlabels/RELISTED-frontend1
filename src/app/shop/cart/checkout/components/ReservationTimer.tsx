"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

export default function ReservationTimer() {
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  useEffect(() => {
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const distance = expiryTime.getTime() - now;

      if (distance <= 0) {
        setTimeLeft("0:00");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-amber-50 p-4 border border-amber-200 rounded-xl">
      <Clock className="w-6 h-6 text-amber-700 shrink-0" />
      <Paragraph1 className="font-medium text-amber-900">
        These items are reserved for{" "}
        <span className="font-bold">{timeLeft}</span>. Complete payment to
        secure them.
      </Paragraph1>
    </div>
  );
}
