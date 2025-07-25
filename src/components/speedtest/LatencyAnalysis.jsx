// src/components/speedtest/LatencyAnalysis.jsx
import React from 'react';
import { Card } from '../ui/card';

export default function LatencyAnalysis({ ping = 0, jitter = 0 }) {
  return (
    <Card className="w-full">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span className="i-lucide-activity text-lg" /> Latency Analysis
      </h2>

      <div className="space-y-4 text-lg">
        <div className="flex items-end justify-between">
          <span className="text-slate-400">Ping</span>
          <span className="font-bold">{ping.toFixed(1)} ms</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-slate-400">Jitter</span>
          <span className="font-bold">{jitter.toFixed(1)} ms</span>
        </div>
      </div>
    </Card>
  );
}
