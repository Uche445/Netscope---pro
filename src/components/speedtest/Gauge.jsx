// src/components/ui/Gauge.jsx
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '../../lib/utils'; // Correct relative path

import { motion } from "framer-motion";

export default function SpeedGauge({ 
  value, 
  maxValue = 1000, 
  label, 
  unit = "Mbps",
  color = "#00f5ff",
  size = 200 
}) {
  const radius = size / 2 - 20;
  const circumference = radius * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;
  
  const angle = (value / maxValue) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg 
          width={size} 
          height={size / 2 + 40}
          className="transform -rotate-90"
        >
          {/* Background arc */}
          <path
            d={`M 20 ${size / 2 + 20} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2 + 20}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d={`M 20 ${size / 2 + 20} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2 + 20}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 10px ${color})`
            }}
          />
          
          {/* Needle */}
          <motion.line
            x1={size / 2}
            y1={size / 2 + 20}
            x2={size / 2 + radius - 30}
            y2={size / 2 + 20}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ transform: `rotate(-90deg)`, transformOrigin: `${size / 2}px ${size / 2 + 20}px` }}
            animate={{ transform: `rotate(${angle}deg)`, transformOrigin: `${size / 2}px ${size / 2 + 20}px` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 5px ${color})`
            }}
          />
          
          {/* Center dot */}
          <circle
            cx={size / 2}
            cy={size / 2 + 20}
            r="6"
            fill={color}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`
            }}
          />
        </svg>
        
        {/* Value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <motion.div 
            className="text-3xl font-bold text-white cyber-text-glow"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {value.toFixed(1)}
          </motion.div>
          <div className="text-sm text-gray-400 font-medium">{unit}</div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <div className="text-lg font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">Speed Test</div>
      </div>
    </div>
  );
}