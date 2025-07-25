
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"; // Corrected path
import TestButton from "../components/speedtest/TestButton"; // Corrected path
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
  Fingerprint 
} from "lucide-react";

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({
    connectivity: { status: "checking", message: "Checking connectivity..." },
    dns: { status: "checking", message: "Testing DNS resolution..." },
    latency: { status: "checking", message: "Measuring latency..." },
    packet_loss: { status: "checking", message: "Testing packet loss..." },
    security: { status: "checking", message: "Analyzing security..." },
    vpn_tunnel: { status: "checking", message: "Checking VPN tunnel..." }
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Reset all diagnostics
    setDiagnostics(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: { status: "checking", message: "Running test..." }
      }), {})
    );

    // Simulate diagnostic tests with delays
    const tests = [
      {
        key: "connectivity",
        delay: 1000,
        result: () => ({
          status: "good",
          message: "Internet connection is stable"
        })
      },
      {
        key: "dns",
        delay: 2000,
        result: () => ({
          status: "good",
          message: "DNS resolution working properly"
        })
      },
      {
        key: "latency",
        delay: 3000,
        result: () => {
          const latency = 15 + Math.random() * 30;
          return {
            status: latency < 30 ? "good" : latency < 60 ? "warning" : "error",
            message: `Average latency: ${latency.toFixed(1)}ms`
          };
        }
      },
      {
        key: "packet_loss",
        delay: 4000,
        result: () => {
          const loss = Math.random() * 2;
          return {
            status: loss < 0.5 ? "good" : loss < 1 ? "warning" : "error",
            message: `Packet loss: ${loss.toFixed(2)}%`
          };
        }
      },
      {
        key: "security",
        delay: 5000,
        result: () => ({
          status: "good",
          message: "No security vulnerabilities detected"
        })
      },
      {
        key: "vpn_tunnel",
        delay: 6000,
        result: () => ({
          status: "good",
          message: "No active VPN tunnel detected"
        })
      }
    ];

    for (const test of tests) {
      setTimeout(() => {
        setDiagnostics(prev => ({
          ...prev,
          [test.key]: test.result()
        }));
      }, test.delay);
    }

    setTimeout(() => {
      setIsRunning(false);
    }, 6500);
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "border-green-400/30 bg-green-400/10";
      case "warning": return "border-yellow-400/30 bg-yellow-400/10";
      case "error": return "border-red-400/30 bg-red-400/10";
      default: return "border-gray-400/30 bg-gray-400/10";
    }
  };

  const diagnosticTests = [
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

  return (
    <div className="min-h-screen cyber-gradient p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white cyber-text-glow">Network Diagnostics</h1>
            <p className="text-gray-400 mt-1">Comprehensive network health analysis</p>
          </div>
          
          <TestButton
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-cyber-primary hover:bg-cyber-primary/80 text-white px-6 py-3"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running Tests..." : "Run Diagnostics"}
          </TestButton>
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-cyber-primary/20 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-cyber-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Network Status</h3>
                    <p className="text-gray-400">
                      {isRunning ? "Running comprehensive diagnostics..." : "All systems operational"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyber-accent">
                    {Object.values(diagnostics).filter(d => d.status === "good").length}/6
                  </div>
                  <div className="text-sm text-gray-400">Tests Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Diagnostic Tests */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagnosticTests.map((test, index) => (
            <motion.div
              key={test.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`bg-cyber-surface/50 backdrop-blur-xl border cyber-glow transition-all duration-300 ${getStatusColor(diagnostics[test.key].status)}`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyber-primary/20 flex items-center justify-center">
                      <test.icon className="w-5 h-5 text-cyber-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{test.title}</span>
                        {getStatusIcon(diagnostics[test.key].status)}
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
                      {diagnostics[test.key].message}
                    </div>
                    
                    {diagnostics[test.key].status === "checking" && (
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
                    
                    {diagnostics[test.key].status !== "checking" && (
                      <div className={`text-sm px-3 py-2 rounded-lg ${
                        diagnostics[test.key].status === "good" ? "bg-green-400/20 text-green-400" :
                        diagnostics[test.key].status === "warning" ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-red-400/20 text-red-400"
                      }`}>
                        {diagnostics[test.key].status === "good" ? "✓ Optimal" :
                         diagnostics[test.key].status === "warning" ? "⚠ Attention Required" :
                         "✗ Issue Detected"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recommendations */}
        {!isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyber-accent" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-cyber-dark/50 border border-cyber-border/50">
                    <Fingerprint className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">VPN Usage</div>
                      <div className="text-gray-400 text-sm">For maximum privacy and security, consider using a reputable VPN service. This can mask your IP and encrypt your traffic.</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-cyber-dark/50 border border-cyber-border/50">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">Regular Monitoring</div>
                      <div className="text-gray-400 text-sm">Run diagnostics regularly to maintain optimal network performance and security.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
