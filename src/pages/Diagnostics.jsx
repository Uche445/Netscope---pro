import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import TestButton from "../components/speedtest/TestButton";
import { motion } from "framer-motion";
import { 
  Shield, 
  Wifi, 
  Globe, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Fingerprint,
  MessageCircle,
  CloudOff
} from "lucide-react";

// A simple utility to merge Tailwind classes conditionally.
// This is a common pattern and was the cause of the previous error.
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// The diagnostic test data is a structured array of objects
const diagnosticTestsData = [
  {
    key: "connectivity",
    title: "Internet Connectivity",
    icon: Globe,
    description: "Tests basic internet connection"
  },
  {
    key: "dns",
    title: "DNS Resolution",
    icon: Server,
    description: "Checks domain name resolution"
  },
  {
    key: "latency",
    title: "Network Latency",
    icon: Clock,
    description: "Measures response time to servers"
  },
  {
    key: "packet_loss",
    title: "Packet Loss",
    icon: Wifi,
    description: "Tests for data transmission issues"
  },
  {
    key: "security",
    title: "Security Check",
    icon: Shield,
    description: "Scans for network vulnerabilities"
  },
  {
    key: "vpn_tunnel",
    title: "VPN Tunnel Integrity",
    icon: Fingerprint,
    description: "Checks for active and secure VPN tunnels"
  }
];

// Helper function to get the status icon based on the status string
const getStatusIcon = (status) => {
  switch (status) {
    case "good":
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case "error":
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400 animate-spin" />;
  }
};

// Helper function to get the status color based on the status string
const getStatusColor = (status) => {
  switch (status) {
    case "good": return "border-green-400/30 bg-green-400/10";
    case "warning": return "border-yellow-400/30 bg-yellow-400/10";
    case "error": return "border-red-400/30 bg-red-400/10";
    default: return "border-gray-400/30 bg-gray-400/10";
  }
};

// New reusable component for each diagnostic item
const DiagnosticItem = ({ test, diagnostic, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Card className={cn(
        "bg-cyber-surface/50 backdrop-blur-xl border cyber-glow transition-all duration-300",
        getStatusColor(diagnostic.status)
      )}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyber-primary/20 flex items-center justify-center">
              <test.icon className="w-5 h-5 text-cyber-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-lg">{test.title}</span>
                {getStatusIcon(diagnostic.status)}
              </div>
              <p className="text-xs text-gray-400 font-normal mt-1">
                {test.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-white font-medium">
              {diagnostic.message}
            </div>
            
            {/* Show a motion-based progress bar only when checking */}
            {diagnostic.status === "checking" && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-cyber-primary h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </div>
            )}
            
            {/* Show the status badge when the test is done */}
            {diagnostic.status !== "checking" && (
              <div className={cn(
                "text-sm px-3 py-2 rounded-lg",
                {
                  "bg-green-400/20 text-green-400": diagnostic.status === "good",
                  "bg-yellow-400/20 text-yellow-400": diagnostic.status === "warning",
                  "bg-red-400/20 text-red-400": diagnostic.status === "error",
                }
              )}>
                {diagnostic.status === "good" ? "✓ Optimal" :
                  diagnostic.status === "warning" ? "⚠ Attention Required" :
                  "✗ Issue Detected"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Mock API call to simulate a diagnostic test
  const runSingleTest = (testKey) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let result;
        switch (testKey) {
          case "connectivity":
            result = { status: "good", message: "Internet connection is stable" };
            break;
          case "dns":
            result = { status: "good", message: "DNS resolution working properly" };
            break;
          case "latency":
            const latency = 15 + Math.random() * 30;
            result = {
              status: latency < 30 ? "good" : latency < 60 ? "warning" : "error",
              message: `Average latency: ${latency.toFixed(1)}ms`
            };
            break;
          case "packet_loss":
            const loss = Math.random() * 2;
            result = {
              status: loss < 0.5 ? "good" : loss < 1 ? "warning" : "error",
              message: `Packet loss: ${loss.toFixed(2)}%`
            };
            break;
          case "security":
            result = { status: "good", message: "No security vulnerabilities detected" };
            break;
          case "vpn_tunnel":
            const vpnStatus = Math.random() > 0.8 ? "error" : "good";
            result = {
              status: vpnStatus,
              message: vpnStatus === "good" ? "No active VPN tunnel detected" : "Active VPN tunnel detected and is stable"
            };
            break;
          default:
            result = { status: "error", message: "Unknown test" };
        }
        resolve({ [testKey]: result });
      }, 1000 + Math.random() * 1500); // Dynamic delay between 1s and 2.5s
    });
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    setRecommendations([]);

    // Set all diagnostics to 'checking' status initially
    const initialDiagnostics = diagnosticTestsData.reduce((acc, test) => ({
      ...acc,
      [test.key]: { status: "checking", message: "Running test..." }
    }), {});
    setDiagnostics(initialDiagnostics);

    // Run tests sequentially and update the state
    for (const test of diagnosticTestsData) {
      const result = await runSingleTest(test.key);
      setDiagnostics(prev => ({ ...prev, ...result }));
    }

    setIsRunning(false);
  };

  // Effect to run diagnostics on component mount
  useEffect(() => {
    runAllDiagnostics();
  }, []);

  // Effect to generate recommendations based on test results
  useEffect(() => {
    const newRecommendations = [];
    if (Object.values(diagnostics).every(d => d.status !== 'checking')) {
      if (diagnostics.latency?.status === 'warning' || diagnostics.latency?.status === 'error') {
        newRecommendations.push({
          id: 'latency_fix',
          title: "Improve Network Latency",
          icon: Clock,
          message: "A high latency can be caused by network congestion. Try closing other applications that are using the network or rebooting your router."
        });
      }
      if (diagnostics.packet_loss?.status === 'warning' || diagnostics.packet_loss?.status === 'error') {
        newRecommendations.push({
          id: 'packet_loss_fix',
          title: "Reduce Packet Loss",
          icon: Wifi,
          message: "Packet loss can lead to connection instability. Check your physical connections and ensure your network drivers are up to date."
        });
      }
      if (diagnostics.vpn_tunnel?.status === 'error') {
        newRecommendations.push({
          id: 'vpn_check',
          title: "Check VPN Settings",
          icon: Fingerprint,
          message: "If a VPN tunnel is unexpectedly detected, it may indicate a security issue. Review your network configuration or disable the VPN if not in use."
        });
      }
      if (Object.values(diagnostics).some(d => d.status === 'error')) {
        newRecommendations.push({
          id: 'general_help',
          title: "General Network Troubleshooting",
          icon: MessageCircle,
          message: "One or more tests failed. We recommend restarting your modem and router, and contacting your ISP if the issue persists."
        });
      }
      setRecommendations(newRecommendations);
    }
  }, [diagnostics]);

  // Determine overall status message
  const overallStatus = () => {
    const statuses = Object.values(diagnostics).map(d => d.status);
    if (statuses.some(s => s === 'error')) return "Critical issues detected. Immediate attention required.";
    if (statuses.some(s => s === 'warning')) return "Some network warnings detected.";
    if (statuses.every(s => s === 'good') && statuses.length === diagnosticTestsData.length) return "All systems operational.";
    if (statuses.some(s => s === 'checking')) return "Running comprehensive diagnostics...";
    return "All systems operational.";
  };

  return (
    <div className="min-h-screen cyber-gradient p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white cyber-text-glow">Network Diagnostics</h1>
            <p className="text-gray-400 mt-1">Comprehensive network health analysis</p>
          </div>
          
          <TestButton
            onClick={runAllDiagnostics}
            disabled={isRunning}
            className="bg-cyber-primary hover:bg-cyber-primary/80 text-white px-6 py-3"
          >
            <RefreshCw className={cn("w-5 h-5 mr-2", isRunning && "animate-spin")} />
            {isRunning ? "Running Tests..." : "Run Diagnostics"}
          </TestButton>
        </motion.div>

        {/* Overall Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyber-primary/20 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-cyber-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Network Status</h3>
                    <p className="text-gray-400">{overallStatus()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyber-accent">
                    {Object.values(diagnostics).filter(d => d.status === "good").length}/{diagnosticTestsData.length}
                  </div>
                  <div className="text-sm text-gray-400">Tests Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnostic Test Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagnosticTestsData.map((test, index) => (
            <DiagnosticItem 
              key={test.key} 
              test={test} 
              diagnostic={diagnostics[test.key] || { status: 'checking', message: 'Running test...' }} 
              index={index}
            />
          ))}
        </div>

        {/* Dynamic Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="flex items-start gap-3 p-4 rounded-lg bg-cyber-dark/50 border border-cyber-border/50">
                      <rec.icon className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-white font-medium">{rec.title}</div>
                        <div className="text-gray-400 text-sm">{rec.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
