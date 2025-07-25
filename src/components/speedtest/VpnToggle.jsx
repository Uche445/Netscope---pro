// src/components/speedtest/VpnToggle.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Adjust path if needed
import { Fingerprint } from 'lucide-react';

export default function VpnToggle({ isVpnActive, onVpnChange }) {
  return (
    <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-cyber-secondary" />
          VPN Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <label className="flex items-center justify-between text-sm">
          <span>Simulate VPN Connection</span>
          <input
            type="checkbox"
            checked={isVpnActive}
            onChange={() => onVpnChange(!isVpnActive)}
            className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-gray-600 transition-all
                       before:block before:h-4 before:w-4 before:translate-x-1 before:rounded-full
                       before:bg-white before:transition-all checked:bg-cyber-primary
                       checked:before:translate-x-5"
          />
        </label>
      </CardContent>
    </Card>
  );
}