import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Activity, Calendar, Fingerprint } from "lucide-react";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
  const [testData, setTestData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);

    const tests = [
      { id: "1", created_date: new Date(2023, 0, 1).toISOString(), download_speed: 85.5, upload_speed: 25.1, ping: 15, vpn_status: 'inactive', isp: 'ISP-A' },
      { id: "2", created_date: new Date(2023, 0, 2).toISOString(), download_speed: 92.3, upload_speed: 30.7, ping: 12, vpn_status: 'active', isp: 'ISP-B' },
      { id: "3", created_date: new Date(2023, 0, 3).toISOString(), download_speed: 78.1, upload_speed: 20.9, ping: 18, vpn_status: 'inactive', isp: 'ISP-C' },
      { id: "4", created_date: new Date(2023, 0, 4).toISOString(), download_speed: 105.8, upload_speed: 35.2, ping: 10, vpn_status: 'inactive', isp: 'ISP-A' },
      { id: "5", created_date: new Date(2023, 0, 5).toISOString(), download_speed: 88.0, upload_speed: 28.5, ping: 16, vpn_status: 'inactive', isp: 'ISP-B' },
      { id: "6", created_date: new Date(2023, 0, 6).toISOString(), download_speed: 95.7, upload_speed: 31.8, ping: 14, vpn_status: 'active', isp: 'ISP-C' },
      { id: "7", created_date: new Date(2023, 0, 7).toISOString(), download_speed: 82.4, upload_speed: 24.3, ping: 20, vpn_status: 'inactive', isp: 'ISP-A' },
      { id: "8", created_date: new Date(2023, 0, 8).toISOString(), download_speed: 110.1, upload_speed: 40.5, ping: 9, vpn_status: 'inactive', isp: 'ISP-B' },
      { id: "9", created_date: new Date(2023, 0, 9).toISOString(), download_speed: 75.9, upload_speed: 19.4, ping: 22, vpn_status: 'inactive', isp: 'ISP-C' },
      { id: "10", created_date: new Date(2023, 0, 10).toISOString(), download_speed: 98.6, upload_speed: 33.1, ping: 11, vpn_status: 'active', isp: 'ISP-A' }
    ];

    const cutoffDate = subDays(new Date(), timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);
    const filteredTests = tests.filter(test => new Date(test.created_date) >= cutoffDate);

    setTestData(filteredTests);
    setIsLoading(false);
  };

  const getChartData = () => {
    const sortedData = [...testData].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return sortedData.map(test => ({
      date: format(new Date(test.created_date), "MMM dd"),
      download: test.download_speed,
      upload: test.upload_speed,
      ping: test.ping,
    }));
  };

  const getAverages = () => {
    if (!testData.length) return { download: 0, upload: 0, ping: 0 };
    const sum = (key) => testData.reduce((acc, t) => acc + (t[key] || 0), 0) / testData.length;
    return { download: sum("download_speed"), upload: sum("upload_speed"), ping: sum("ping") };
  };

  const getVpnUsage = () => {
    if (!testData.length) return 0;
    return (testData.filter(t => t.vpn_status === 'active').length / testData.length) * 100;
  };

  const getTrend = (metric) => {
    if (testData.length < 2) return { direction: "stable", percentage: 0 };
    const half = Math.floor(testData.length / 2);
    const older = testData.slice(0, half);
    const recent = testData.slice(half);
    const avg = (arr) => arr.reduce((sum, t) => sum + (t[metric] || 0), 0) / arr.length;
    const change = ((avg(recent) - avg(older)) / avg(older)) * 100;
    return {
      direction: change > 5 ? "up" : change < -5 ? "down" : "stable",
      percentage: Math.abs(change)
    };
  };

  const averages = getAverages();
  const vpnUsage = getVpnUsage();
  const downloadTrend = getTrend("download_speed");
  const uploadTrend = getTrend("upload_speed");
  const pingTrend = getTrend("ping");

  const StatCard = ({ title, value, unit, trend, icon: Icon, color, trendComponent }) => (
    <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg bg-${color}/20 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          {trendComponent || (
            <div className="flex items-center gap-1 text-xs">
              {trend.direction === "up" && <TrendingUp className="w-3 h-3 text-green-400" />}
              {trend.direction === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`font-medium ${
                trend.direction === "up" ? "text-green-400" : 
                trend.direction === "down" ? "text-red-400" : "text-gray-400"
              }`}>
                {trend.percentage > 0 ? `${trend.percentage.toFixed(1)}%` : "Stable"}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xl font-bold text-white">{value.toFixed(1)} {unit}</div>
          <div className="text-xs text-gray-400">{title}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-gradient flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-t-cyber-primary border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white cyber-text-glow">Speed Analytics</h1>
            <p className="text-gray-400 mt-1">Performance insights and trends</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {["7d", "30d", "90d"].map(range => (
              <button key={range} onClick={() => setTimeRange(range)} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm sm:text-base transition-all duration-300 ${
                timeRange === range ? "bg-cyber-primary text-white" : "bg-cyber-surface/50 text-gray-400 hover:text-white"
              }`}>
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="Average Download" value={averages.download} unit="Mbps" trend={downloadTrend} icon={TrendingUp} color="cyan-400" />
          <StatCard title="Average Upload" value={averages.upload} unit="Mbps" trend={uploadTrend} icon={Activity} color="green-400" />
          <StatCard title="Average Latency" value={averages.ping} unit="ms" trend={pingTrend} icon={Calendar} color="blue-400" />
          <StatCard title="Tests with VPN" value={vpnUsage} unit="%" icon={Fingerprint} color="purple-400" trendComponent={<div />} />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Speed Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-full min-h-[250px] sm:min-h-[300px]">
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyber-primary" /> Speed Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(26, 31, 46, 0.9)", border: "1px solid rgba(0, 245, 255, 0.3)", borderRadius: "8px", color: "white" }} />
                    <Line type="monotone" dataKey="download" stroke="#00f5ff" strokeWidth={3} dot={{ fill: "#00f5ff" }} />
                    <Line type="monotone" dataKey="upload" stroke="#00ff88" strokeWidth={3} dot={{ fill: "#00ff88" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Latency Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="w-full min-h-[250px] sm:min-h-[300px]">
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Activity className="w-5 h-5 text-cyber-accent" /> Latency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(26, 31, 46, 0.9)", border: "1px solid rgba(0, 245, 255, 0.3)", borderRadius: "8px", color: "white" }} />
                    <Bar dataKey="ping" fill="#0066ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mobile-Friendly Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
            <CardHeader><CardTitle className="text-white">Recent Test Results</CardTitle></CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      {["Date", "Download", "Upload", "Ping", "ISP", "VPN"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-gray-400 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {testData.slice(0, 10).map((test, i) => (
                      <motion.tr key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-cyber-border/50 hover:bg-cyber-dark/30 transition-colors">
                        <td className="py-2 px-3 text-white text-sm">{format(new Date(test.created_date), "MM-dd HH:mm")}</td>
                        <td className="py-2 px-3 text-cyber-primary font-semibold text-sm">{test.download_speed.toFixed(1)} Mbps</td>
                        <td className="py-2 px-3 text-cyber-accent font-semibold text-sm">{test.upload_speed.toFixed(1)} Mbps</td>
                        <td className="py-2 px-3 text-white text-sm">{test.ping.toFixed(0)} ms</td>
                        <td className="py-2 px-3 text-gray-400 text-sm">{test.isp}</td>
                        <td className="py-2 px-3 text-white text-sm">{test.vpn_status === 'active' ? <Fingerprint className="w-5 h-5 text-purple-400" /> : "-"}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden space-y-3">
                {testData.map((test) => (
                  <div key={test.id} className="bg-cyber-surface p-3 rounded-lg border border-cyber-border">
                    <div className="flex justify-between text-white text-sm">
                      <span>{format(new Date(test.created_date), "MM-dd HH:mm")}</span>
                      {test.vpn_status === 'active' && <Fingerprint className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div className="grid grid-cols-2 text-xs text-gray-400 mt-2 gap-1">
                      <span>Download:</span> <span className="text-cyber-primary font-semibold">{test.download_speed.toFixed(1)} Mbps</span>
                      <span>Upload:</span> <span className="text-cyber-accent font-semibold">{test.upload_speed.toFixed(1)} Mbps</span>
                      <span>Ping:</span> <span>{test.ping.toFixed(0)} ms</span>
                      <span>ISP:</span> <span>{test.isp || "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
