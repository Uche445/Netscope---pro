// src/components/speedtest/RecentTests.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'; // Make sure these are correctly imported
import { Activity, Download, Globe, Server } from 'lucide-react'; // Example icons
import { cn } from '../../lib/utils'; // Correct relative path

const RecentTests = ({ tests = [] }) => { // 'tests' prop will be the array of recent speed tests
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> {/* Icon for Recent Tests */}
          Recent Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4"> {/* Add spacing between test items */}
        {tests.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No tests yet.</p>
        ) : (
          <div className="space-y-2"> {/* Space between list items */}
            {tests.map((test, index) => (
              <div
                key={index} // Using index as key is okay if items don't change order or get deleted/added much
                className="flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex flex-col text-sm text-gray-300">
                  <span className="font-semibold text-white">{test.date} {test.time}</span>
                  <span className="flex items-center gap-1">
                    {test.isVpn && <Server className="w-4 h-4 text-purple-400" />} {/* VPN icon */}
                    <Download className="w-4 h-4 text-green-400" /> {test.download} Mbps
                  </span>
                </div>
                <div className="flex flex-col items-end text-sm text-gray-300">
                  <span className="font-semibold text-white">{test.ping} ms ping</span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-blue-400" /> {test.isp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTests;