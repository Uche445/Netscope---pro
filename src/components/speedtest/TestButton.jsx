import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

export default function TestButton({ 
  isRunning, 
  onStart, 
  onStop, 
  disabled = false,
  testPhase = "idle" 
}) {
  const getButtonContent = () => {
    if (isRunning) {
      return {
        icon: Square,
        text: `Stop Test`,
        gradient: "from-red-500 to-red-600",
        glow: "red"
      };
    }
    
    if (testPhase === "completed") {
      return {
        icon: RotateCcw,
        text: "Test Again",
        gradient: "from-cyber-primary to-cyber-secondary",
        glow: "cyber-primary"
      };
    }
    
    return {
      icon: Play,
      text: "Start Speed Test",
      gradient: "from-cyber-primary to-cyber-secondary",
      glow: "cyber-primary"
    };
  };

  const { icon: Icon, text, gradient, glow } = getButtonContent();

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        onClick={isRunning ? onStop : onStart}
        disabled={disabled}
        className={`
          relative overflow-hidden px-8 py-6 text-lg font-semibold rounded-xl
          bg-gradient-to-r ${gradient} 
          hover:shadow-lg hover:shadow-${glow}/25
          border border-white/10
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        style={{
          boxShadow: `0 0 30px rgba(0, 245, 255, ${isRunning ? 0.3 : 0.1})`
        }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          {text}
        </div>
        
        {/* Animated background */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        )}
      </Button>
    </motion.div>
  );
}