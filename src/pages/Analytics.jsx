
import React, { useState, useEffect } from "react";
import SpeedTest from "../entities/SpeedTest";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, Activity, Calendar, Fingerprint } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

export default function AnalyticsPage() {
  const [testData, setTestData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    const tests = await SpeedTest.list("-created_date", 100);
    
    // Filter by time range
    const cutoffDate = subDays(new Date(), timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);
    const filteredTests = tests.filter(test => 
      new Date(test.created_date) >= cutoffDate
    );
    
    setTestData(filteredTests);
    setIsLoading(false);
  };

  const getChartData = () => {
    return testData.map(test => ({
      date: format(new Date(test.created_date), "MMM dd"),
      download: test.download_speed,
      upload: test.upload_speed,
      ping: test.ping,
      timestamp: test.created_date
    })).reverse();
  };

  const getAverages = () => {
    if (testData.length === 0) return { download: 0, upload: 0, ping: 0 };
    
    return {
      download: testData.reduce((sum, test) => sum + test.download_speed, 0) / testData.length,
      upload: testData.reduce((sum, test) => sum + test.upload_speed, 0) / testData.length,
      ping: testData.reduce((sum, test) => sum + test.ping, 0) / testData.length
    };
  };
  
  const getVpnUsage = () => {
    if (testData.length === 0) return 0;
    const vpnTests = testData.filter(test => test.vpn_status === 'active').length;
    return (vpnTests / testData.length) * 100;
  };

  const getTrend = (metric) => {
    if (testData.length < 2) return { direction: "stable", percentage: 0 };
    
    const recent = testData.slice(0, Math.floor(testData.length / 2));
    const older = testData.slice(Math.floor(testData.length / 2));
    
    const recentAvg = recent.reduce((sum, test) => sum + test[metric], 0) / recent.length;
    const olderAvg = older.reduce((sum, test) => sum + test[metric], 0) / older.length;
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: percentage > 5 ? "up" : percentage < -5 ? "down" : "stable",
      percentage: Math.abs(percentage)
    };
  };

  const averages = getAverages();
  const vpnUsage = getVpnUsage();
  const downloadTrend = getTrend("download_speed");
  const uploadTrend = getTrend("upload_speed");
  const pingTrend = getTrend("ping");

  const StatCard = ({ title, value, unit, trend, icon: Icon, color, trendComponent }) => (
    <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-${color}/20 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          {trendComponent || (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
              {trend.direction === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
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
          <div className="text-2xl font-bold text-white">
            {value.toFixed(1)} {unit}
          </div>
          <div className="text-sm text-gray-400">{title}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen cyber-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white cyber-text-glow">Speed Analytics</h1>
            <p className="text-gray-400 mt-1">Performance insights and trends</p>
          </div>
          
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  timeRange === range 
                    ? "bg-cyber-primary text-white" 
                    : "bg-cyber-surface/50 text-gray-400 hover:text-white"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Average Download"
            value={averages.download}
            unit="Mbps"
            trend={downloadTrend}
            icon={TrendingUp}
            color="cyan-400"
          />
          <StatCard
            title="Average Upload"
            value={averages.upload}
            unit="Mbps"
            trend={uploadTrend}
            icon={Activity}
            color="green-400"
          />
          <StatCard
            title="Average Latency"
            value={averages.ping}
            unit="ms"
            trend={pingTrend}
            icon={Calendar}
            color="blue-400"
          />
          <StatCard
            title="Tests with VPN"
            value={vpnUsage}
            unit="%"
            icon={Fingerprint}
            color="purple-400"
            trendComponent={<div />}
          />
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyber-primary" />
                  Speed Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    />
                    <YAxis 
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(26, 31, 46, 0.9)",
                        border: "1px solid rgba(0, 245, 255, 0.3)",
                        borderRadius: "8px",
                        color: "white"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="download" 
                      stroke="#00f5ff" 
                      strokeWidth={3}
                      dot={{ fill: "#00f5ff", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#00f5ff", strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upload" 
                      stroke="#00ff88" 
                      strokeWidth={3}
                      dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#00ff88", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyber-accent" />
                  Latency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    />
                    <YAxis 
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(26, 31, 46, 0.9)",
                        border: "1px solid rgba(0, 245, 255, 0.3)",
                        borderRadius: "8px",
                        color: "white"
                      }}
                    />
                    <Bar 
                      dataKey="ping" 
                      fill="#0066ff"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Test History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
            <CardHeader>
              <CardTitle className="text-white">Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Download</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Upload</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Ping</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">ISP</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">VPN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testData.slice(0, 10).map((test, index) => (
                      <motion.tr
                        key={test.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-cyber-border/50 hover:bg-cyber-dark/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-white">
                          {format(new Date(test.created_date), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="py-3 px-4 text-cyber-primary font-semibold">
                          {test.download_speed?.toFixed(1)} Mbps
                        </td>
                        <td className="py-3 px-4 text-cyber-accent font-semibold">
                          {test.upload_speed?.toFixed(1)} Mbps
                        </td>
                        <td className="py-3 px-4 text-white">
                          {test.ping?.toFixed(0)} ms
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {test.isp || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-white">
                          {test.vpn_status === 'active' ? (
                            <Fingerprint className="w-5 h-5 text-purple-400" />
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {testData.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No test data available. Run some speed tests to see analytics.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
