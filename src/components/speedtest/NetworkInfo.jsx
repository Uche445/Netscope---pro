// src/components/speedtest/NetworkInfo.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Adjust path if needed
import { Globe, Wifi, MapPin, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function NetworkInfo({ networkData }) {
  if (!networkData) return null; // Or render a loading state

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto mb-8 grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyber-primary" />
            IP Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-white">{networkData.ip}</p>
        </CardContent>
      </Card>

      <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyber-secondary" />
            ISP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-white">{networkData.isp}</p>
        </CardContent>
      </Card>

      <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyber-accent" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-white">{networkData.location}</p>
        </CardContent>
      </Card>

      <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-secondary" />
            Connection Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-white">
            {networkData.vpn_status === "active" ? networkData.vpn_provider : networkData.connection_type}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}