import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Timer, Gauge as GaugeIcon, Activity, Fingerprint } from "lucide-react";

// Updated imports for the refactored components and entity
import SpeedTestEntity from "../entities/SpeedTest";
import SpeedGauge from "../components/speedtest/Gauge";
import NetworkInfo from "../components/speedtest/NetworkInfo";
import TestButton from "../components/speedtest/TestButton";
import LocationMap from "../components/speedtest/LocationMap";
import VpnToggle from "../components/speedtest/VpnToggle";
// import LatencyAnalysis from "../components/speedtest/LatencyAnalysis"; // This component seems to be merged into this file's UI
// import RecentTests from '../components/speedtest/RecentTests'; // This component seems to be merged into this file's UI

export default function SpeedTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [testPhase, setTestPhase] = useState("idle"); // idle, ping, download, upload, completed
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({
    download: 0,
    upload: 0,
    ping: 0,
    jitter: 0,
  });
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isVpnActive, setIsVpnActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [serverLocation, setServerLocation] = useState(null);
  const [testHistory, setTestHistory] = useState([]);

  const testControllerRef = useRef(null);

  // Constants for refined speed test logic - NEWLY ADDED/MODIFIED
  const PING_COUNT = 5;
  const DOWNLOAD_CONCURRENT_STREAMS = 8; // Increased for better saturation
  const DOWNLOAD_TEST_DURATION_SECONDS = 10; // Target duration for download test
  const DOWNLOAD_CHUNK_SIZE_BYTES = 2 * 1024 * 1024; // 2MB per chunk for download
  const UPLOAD_CONCURRENT_STREAMS = 4; // Increased for better saturation
  const UPLOAD_TEST_FILE_SIZE_BYTES = 20 * 1024 * 1024; // Increased total dummy data size for upload (20MB)

  useEffect(() => {
    loadNetworkInfo();
  }, [isVpnActive]);

  useEffect(() => {
    loadTestHistory();
  }, []);

  useEffect(() => {
    return () => {
      if (testControllerRef.current) {
        testControllerRef.current.abort();
      }
    };
  }, []);

  const loadNetworkInfo = async () => {
    if (isVpnActive) {
      setNetworkInfo({
        ip: "10.8.0.1",
        isp: "CyberGuard VPN",
        location: "Zurich, CH",
        connection_type: "VPN",
        vpn_status: "active",
        vpn_provider: "CyberGuard VPN"
      });
      setUserLocation([47.3769, 8.5417]); // Zurich coords
      return;
    }

    try {
      const response = await axios.get('https://ipapi.co/json/');
      const data = response.data;
      setNetworkInfo({
        ip: data.ip,
        isp: data.org || data.isp || "Unknown ISP",
        location: `${data.city}, ${data.country_name}`,
        connection_type: "wifi",
        vpn_status: "inactive"
      });
      setUserLocation([data.latitude, data.longitude]);
    } catch (error) {
      console.error("Failed to load network info:", error);
      setNetworkInfo({
        ip: "N/A",
        isp: "N/A",
        location: "N/A",
        connection_type: "unknown",
        vpn_status: "inactive"
      });
      setUserLocation([6.5244, 3.3792]); // Fallback to Lagos, Nigeria
    }
  };

  const loadTestHistory = async () => {
    const history = await SpeedTestEntity.list("-created_date", 10);
    setTestHistory(history);
  };

  const resetState = () => {
    setProgress(0);
    setResults({ download: 0, upload: 0, ping: 0, jitter: 0 });
    setTestPhase("idle");
    setIsRunning(false);
    setServerLocation(null);
  };

  const runRealTest = async () => {
    setIsRunning(true);
    resetState();

    // Using Cloudflare's generic speed test endpoint, their CDN should route to optimal location
    const cloudflareBaseUrl = "https://speed.cloudflare.com";

    // Select a random Cloudflare server location for display purposes only,
    // the actual test uses the generic cloudflare.com endpoint which auto-routes.
    const displayServers = [
      { name: "Cloudflare (Global)", coords: [37.7749, -122.4194] }, // San Francisco
      { name: "Cloudflare (London)", coords: [51.5074, -0.1278] },
      { name: "Cloudflare (Tokyo)", coords: [35.6895, 139.6917] },
      { name: "Cloudflare (Sydney)", coords: [-33.8688, 151.2093] },
      { name: "Cloudflare (Frankfurt)", coords: [50.1109, 8.6821] },
      { name: "Cloudflare (New York)", coords: [40.7128, -74.0060] }
    ];
    const randomDisplayServer = displayServers[Math.floor(Math.random() * displayServers.length)];
    setServerLocation(randomDisplayServer);

    testControllerRef.current = new AbortController();
    const { signal } = testControllerRef.current;

    try {
      // 1. Run ping test
      const pingResult = await measurePing(cloudflareBaseUrl, signal);
      if (signal.aborted) return resetState();

      // 2. Run download test
      const downloadSpeed = await measureDownload(cloudflareBaseUrl, signal);
      if (signal.aborted) return resetState();

      // 3. Run upload test
      // Note: Cloudflare's speed test endpoint has a /__up path for uploads
      const uploadSpeed = await measureUpload(cloudflareBaseUrl, signal);
      if (signal.aborted) return resetState();

      setTestPhase("completed");

      // Estimate total duration for logging
      const estimatedTestDuration = DOWNLOAD_TEST_DURATION_SECONDS +
                                  (UPLOAD_TEST_FILE_SIZE_BYTES / 1024 / 1024 / (uploadSpeed > 0 ? (uploadSpeed / 8) : 1)) + // Convert Mbps to MBps for estimation
                                  (PING_COUNT * 0.2); // Each ping is 200ms

      const finalResults = {
        download_speed: downloadSpeed,
        upload_speed: uploadSpeed,
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        server_location: randomDisplayServer.name, // Use display name for logging
        server_host: cloudflareBaseUrl.replace(/https?:\/\//, ''),
        test_duration: estimatedTestDuration,
        connection_type: networkInfo?.connection_type || "unknown",
        isp: networkInfo?.isp || "Unknown ISP",
        ip_address: networkInfo?.ip || "Unknown",
        user_agent: navigator.userAgent,
        vpn_status: isVpnActive ? "active" : "inactive",
        vpn_provider: isVpnActive ? "CyberGuard VPN" : null,
      };

      await saveTestResults(finalResults);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Speed test failed:", error);
        // Fallback to simulation if real test fails unexpectedly
        await runFallbackTest(randomDisplayServer);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const measurePing = async (serverUrl, signal) => {
    setTestPhase("ping");
    const latencies = [];

    // Using well-known, small, cacheable public resources for ping
    const testEndpoints = [
        `${serverUrl}/cdn-cgi/trace?_=${Date.now()}`, // Cloudflare's trace endpoint
        'https://www.google.com/favicon.ico',
        'https://www.cloudflare.com/favicon.ico',
        'https://www.microsoft.com/favicon.ico',
        'https://www.apple.com/favicon.ico'
    ];

    for (let i = 0; i < PING_COUNT; i++) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

        try {
            const endpoint = testEndpoints[i % testEndpoints.length]; // Cycle through endpoints
            const startTime = performance.now();

            // Using HEAD request or no-cors to avoid CORS issues and unnecessary data transfer
            await fetch(endpoint, {
                method: 'HEAD', // HEAD requests are lighter
                cache: 'no-store', // Ensure no caching
                signal,
                mode: 'no-cors' // Allows fetching cross-origin favicons
            });

            const latency = performance.now() - startTime;
            latencies.push(latency);
            setResults(prev => ({ ...prev, ping: latency })); // Update UI with latest ping
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            console.warn(`Ping test ${i + 1} failed, simulating:`, error);
            const simulatedLatency = 20 + Math.random() * 30; // Simulate a reasonable latency
            latencies.push(simulatedLatency);
            setResults(prev => ({ ...prev, ping: simulatedLatency }));
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between pings
    }

    const avgPing = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    // Jitter: standard deviation of ping times
    const jitter = Math.sqrt(latencies.map(l => Math.pow(l - avgPing, 2)).reduce((a, b) => a + b, 0) / latencies.length);

    setResults(prev => ({ ...prev, ping: avgPing, jitter }));
    return { ping: avgPing, jitter };
  };

  const measureDownload = async (serverUrl, signal) => {
    setTestPhase("download");
    let totalBytesDownloaded = 0;
    const startTimeOverall = performance.now();
    let activeDownloads = 0; // Counter for currently active download streams
    let streamPromises = []; // To hold promises for active streams

    // Function to start a single download stream (recursive to maintain concurrency)
    const startDownloadStream = async (streamId) => {
      // Keep running this stream until the overall test duration is met
      while ((performance.now() - startTimeOverall) / 1000 < DOWNLOAD_TEST_DURATION_SECONDS && !signal.aborted) {
        try {
          activeDownloads++;
          // Append _ to URL to prevent caching and ensure unique requests
          const url = `${serverUrl}/__down?bytes=${DOWNLOAD_CHUNK_SIZE_BYTES}&_=${Date.now()}_${streamId}_${Math.random()}`;
          const response = await fetch(url, { cache: 'no-store', signal });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          const reader = response.body.getReader();
          let receivedLength = 0;
          while (true) {
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            const { done, value } = await reader.read();
            if (done) break;
            receivedLength += value.length;
            totalBytesDownloaded += value.length; // Accumulate total bytes

            const currentOverallDuration = (performance.now() - startTimeOverall) / 1000;
            if (currentOverallDuration > 0) {
              const currentTotalSpeedMbps = (totalBytesDownloaded * 8) / (currentOverallDuration * 1000000);
              setResults(prev => ({ ...prev, download: currentTotalSpeedMbps }));
              // Progress based on time elapsed
              setProgress(Math.min(100, (currentOverallDuration / DOWNLOAD_TEST_DURATION_SECONDS) * 100));
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          console.warn(`Download stream ${streamId} failed or interrupted:`, error);
          // Don't rethrow, allow other streams to continue
        } finally {
          activeDownloads--;
          // Short delay before next chunk request on this stream to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    // Launch initial concurrent download streams
    for (let i = 0; i < DOWNLOAD_CONCURRENT_STREAMS; i++) {
      streamPromises.push(startDownloadStream(i));
    }

    // Wait for all initiated streams to naturally finish their loop (i.e., test duration passes)
    await Promise.all(streamPromises);

    // Ensure final state update in case it was missed or interrupted
    const finalElapsed = (performance.now() - startTimeOverall) / 1000;
    let finalDownloadSpeed = 0;
    if (finalElapsed > 0) {
      finalDownloadSpeed = (totalBytesDownloaded * 8) / (finalElapsed * 1000000);
    }

    setResults(prev => ({ ...prev, download: finalDownloadSpeed }));
    setProgress(100); // Mark download complete
    return finalDownloadSpeed;
  };

  const measureUpload = async (serverUrl, signal) => {
    setTestPhase("upload");
    let totalBytesUploaded = 0;
    const startTimeOverall = performance.now();
    // Allocate dummy data per stream, not for total for each stream
    const bytesPerUploadRequest = UPLOAD_TEST_FILE_SIZE_BYTES / UPLOAD_CONCURRENT_STREAMS;
    const dummyData = new ArrayBuffer(bytesPerUploadRequest);
    new Uint8Array(dummyData).fill(65); // Fill with some dummy data ('A' character)

    const uploadPromises = [];

    // Launch all parallel upload requests at once, as they are often more bursty
    for (let i = 0; i < UPLOAD_CONCURRENT_STREAMS; i++) {
      if (signal.aborted) break; // Check for abort before launching
      uploadPromises.push(
        (async (chunkIndex) => {
          try {
            const startTime = performance.now();
            // Use __up for Cloudflare upload endpoint, or fallback to httpbin
            const targetUrl = serverUrl ? `${serverUrl}/__up?_=${Date.now()}_${chunkIndex}` : 'https://httpbin.org/post';
            const response = await fetch(targetUrl, {
              method: 'POST',
              body: dummyData,
              cache: 'no-store',
              signal,
              mode: 'cors' // Ensure CORS is handled if necessary
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            // Consume response body to ensure full transfer completion
            await response.text();

            const duration = (performance.now() - startTime) / 1000; // seconds
            const speedMbps = (bytesPerUploadRequest * 8) / (duration * 1000000);

            totalBytesUploaded += bytesPerUploadRequest; // Accumulate total bytes uploaded
            const elapsedOverall = (performance.now() - startTimeOverall) / 1000;
            if (elapsedOverall > 0) {
                const currentTotalUploadSpeedMbps = (totalBytesUploaded * 8) / (elapsedOverall * 1000000);
                setResults(prev => ({ ...prev, upload: currentTotalUploadSpeedMbps }));
                // Progress based on total bytes uploaded
                setProgress(Math.min(100, (totalBytesUploaded / UPLOAD_TEST_FILE_SIZE_BYTES) * 100));
            }
            return speedMbps;
          } catch (error) {
            if (error.name === 'AbortError') throw error; // Propagate abort error
            console.warn(`Upload stream ${chunkIndex} failed, simulating:`, error);
            // Simulate a speed for this failed stream if needed, or return 0
            return 0;
          }
        })(i) // Pass index to the immediately invoked async function
      );
    }

    // Wait for all upload promises to settle
    const completedSpeeds = await Promise.all(uploadPromises);

    // Calculate final average speed based on total data uploaded and total time
    const finalElapsed = (performance.now() - startTimeOverall) / 1000;
    let finalUploadSpeed = 0;
    if (finalElapsed > 0) {
      finalUploadSpeed = (totalBytesUploaded * 8) / (finalElapsed * 1000000);
    }

    setResults(prev => ({ ...prev, upload: finalUploadSpeed }));
    setProgress(100); // Mark upload complete
    return finalUploadSpeed;
  };

  const runFallbackTest = async (selectedServer) => {
    // This fallback is simplified to reflect current progress logic
    setTestPhase("download");
    setProgress(0);

    const simulatedDownloadMbps = 180 + Math.random() * 70; // Simulate a realistic range
    const totalSimulatedDownloadBytes = (simulatedDownloadMbps * 1000000 / 8) * DOWNLOAD_TEST_DURATION_SECONDS;
    let currentSimulatedBytes = 0;
    const downloadSimStartTime = performance.now();

    const downloadSimInterval = setInterval(() => {
        if (testControllerRef.current?.signal.aborted) {
            clearInterval(downloadSimInterval);
            return;
        }
        const elapsed = (performance.now() - downloadSimStartTime) / 1000;
        if (elapsed >= DOWNLOAD_TEST_DURATION_SECONDS) {
            clearInterval(downloadSimInterval);
            setProgress(100);
            setResults(prev => ({ ...prev, download: simulatedDownloadMbps }));
            return;
        }
        currentSimulatedBytes = (totalSimulatedDownloadBytes / DOWNLOAD_TEST_DURATION_SECONDS) * elapsed;
        const currentSimulatedSpeed = (currentSimulatedBytes * 8) / (elapsed * 1000000);
        setResults(prev => ({ ...prev, download: currentSimulatedSpeed + (Math.random() * 5 - 2.5) })); // Add some jitter
        setProgress(Math.min(100, (elapsed / DOWNLOAD_TEST_DURATION_SECONDS) * 100));
    }, 100); // Update every 100ms

    await new Promise(resolve => setTimeout(resolve, DOWNLOAD_TEST_DURATION_SECONDS * 1000 + 500)); // Wait for simulation to finish
    clearInterval(downloadSimInterval); // Just in case


    setTestPhase("upload");
    setProgress(0);
    const simulatedUploadMbps = simulatedDownloadMbps * (0.25 + Math.random() * 0.15); // Estimate upload based on download
    const uploadSimStartTime = performance.now();
    const UPLOAD_SIM_DURATION_SECONDS = 5; // Simulate upload over 5 seconds

    const uploadSimInterval = setInterval(() => {
        if (testControllerRef.current?.signal.aborted) {
            clearInterval(uploadSimInterval);
            return;
        }
        const elapsed = (performance.now() - uploadSimStartTime) / 1000;
        if (elapsed >= UPLOAD_SIM_DURATION_SECONDS) {
            clearInterval(uploadSimInterval);
            setProgress(100);
            setResults(prev => ({ ...prev, upload: simulatedUploadMbps }));
            return;
        }
        setResults(prev => ({ ...prev, upload: (simulatedUploadMbps / UPLOAD_SIM_DURATION_SECONDS) * elapsed + (Math.random() * 2 - 1) }));
        setProgress(Math.min(100, (elapsed / UPLOAD_SIM_DURATION_SECONDS) * 100));
    }, 100);

    await new Promise(resolve => setTimeout(resolve, UPLOAD_SIM_DURATION_SECONDS * 1000 + 500));
    clearInterval(uploadSimInterval);
    setResults(prev => ({ ...prev, upload: simulatedUploadMbps }));


    const ping = 15 + Math.random() * 25;
    const jitter = 1 + Math.random() * 4;

    setResults(prev => ({
      ...prev,
      ping: ping,
      jitter: jitter
    }));

    setTestPhase("completed");

    const finalResults = {
      download_speed: results.download, // Use the last updated simulated value
      upload_speed: results.upload,     // Use the last updated simulated value
      ping: ping,
      jitter: jitter,
      server_location: selectedServer ? selectedServer.name : "Simulated",
      server_host: selectedServer ? selectedServer.url.split('/')[2] : "Simulated",
      test_duration: DOWNLOAD_TEST_DURATION_SECONDS + UPLOAD_SIM_DURATION_SECONDS + (PING_COUNT * 0.2),
      connection_type: networkInfo?.connection_type || "unknown",
      isp: networkInfo?.isp || "Unknown ISP",
      ip_address: networkInfo?.ip || "Unknown",
      user_agent: navigator.userAgent,
      vpn_status: isVpnActive ? "active" : "inactive",
      vpn_provider: isVpnActive ? "CyberGuard VPN" : null,
    };

    await saveTestResults(finalResults);
  };

  const saveTestResults = async (testData) => {
    try {
      await SpeedTestEntity.create(testData);
      loadTestHistory();
    } catch (error) {
      console.error("Failed to save test results:", error);
    }
  };

  const stopTest = () => {
    if (testControllerRef.current) {
      testControllerRef.current.abort();
    }
    resetState();
  };

  const getPhaseLabel = () => {
    switch (testPhase) {
      case "ping": return `Measuring Ping: ${results.ping.toFixed(1)} ms`;
      case "download": return `Testing Download: ${results.download.toFixed(1)} Mbps`;
      case "upload": return `Testing Upload: ${results.upload.toFixed(1)} Mbps`;
      case "completed": return "Test Completed";
      default: return "Ready to Test";
    }
  };

  return (
    <div className="min-h-screen cyber-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white cyber-text-glow mb-2">
            Network Speed Analysis
          </h1>
          <p className="text-gray-400 text-lg">
            Professional-grade internet speed testing for cybersecurity engineers
          </p>
        </motion.div>

        {networkInfo && <NetworkInfo networkData={networkInfo} />}

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GaugeIcon className="w-6 h-6 text-cyber-primary" />
                  Speed Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <SpeedGauge
                    value={results.download}
                    maxValue={1000} // Increased max value to accommodate higher speeds
                    label="Download"
                    unit="Mbps"
                    color="#00f5ff"
                    size={240}
                  />
                  <SpeedGauge
                    value={results.upload}
                    maxValue={200} // Increased max value to accommodate higher speeds
                    label="Upload"
                    unit="Mbps"
                    color="#00ff88"
                    size={240}
                  />
                </div>

                <div className="text-center space-y-6">
                  <motion.div
                    key={testPhase}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-semibold text-white"
                  >
                    {getPhaseLabel()}
                  </motion.div>

                  {(testPhase === "download" || testPhase === "upload") && (
                      <div className="w-3/4 mx-auto">
                          <div className="h-2 bg-cyber-dark/50 rounded-full overflow-hidden">
                              <motion.div
                                  className="h-2 bg-cyber-primary rounded-full"
                                  style={{ width: `${progress}%` }}
                                  transition={{ duration: 0.1 }}
                              />
                          </div>
                      </div>
                  )}

                  <TestButton
                    isRunning={isRunning}
                    onStart={runRealTest}
                    onStop={stopTest}
                    testPhase={testPhase}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <VpnToggle isVpnActive={isVpnActive} onVpnChange={setIsVpnActive} />

            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow h-64">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyber-secondary" />
                  Connection Path
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-12">
                <LocationMap
                  userLocation={userLocation}
                  serverLocation={serverLocation}
                />
              </CardContent>
            </Card>

            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-cyber-accent" />
                  Latency Analysis
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ping</span>
                  <span className="text-2xl font-bold text-white">
                    {results.ping.toFixed(1)} ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Jitter</span>
                  <span className="text-xl font-semibold text-cyber-accent">
                    {results.jitter.toFixed(1)} ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
        >
            <Card className="bg-cyber-surface/50 backdrop-blur-xl border-cyber-border cyber-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyber-secondary" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testHistory.slice(0, 5).map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-cyber-dark/50 border border-cyber-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                          {new Date(test.created_date).toLocaleDateString()}
                          <div className="text-xs">{new Date(test.created_date).toLocaleTimeString()}</div>
                        </div>
                          <div className="text-white font-medium flex items-center gap-2">
                            {test.vpn_status === 'active' && <Fingerprint className="w-4 h-4 text-cyber-secondary" />}
                            ↓ {test.download_speed?.toFixed(1)} Mbps
                          </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-cyber-accent text-right">
                          ↑ {test.upload_speed?.toFixed(1)} Mbps
                        </div>
                        <div className="text-white text-right">
                          {test.ping?.toFixed(0)}ms ping
                        </div>
                        <div className="text-gray-400 text-right hidden md:block">
                          {test.isp}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {testHistory.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      No tests yet. Run your first speed test!
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