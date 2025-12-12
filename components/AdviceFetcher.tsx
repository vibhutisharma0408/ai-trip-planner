"use client";

import { useEffect, useState } from "react";

export default function AdviceFetcher() {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/ai-advice", { method: "POST" });
        const data = await res.json();
        setText(
          `${data.summary ?? ""} ${data.suggestion ?? ""} Highest: ${
            data.highestCategory ?? "N/A"
          }`
        );
      } catch (error) {
        setText("Unable to load advice right now.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  return <p className="text-sm text-slate-700">{text}</p>;
}

