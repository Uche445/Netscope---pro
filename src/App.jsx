import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';

import Sidebar from './components/ui/Sidebar';
import Dashboard from './pages/SpeedTestPage';
import Analytics from './pages/Analytics';
import Diagnostics from './pages/Diagnostics';

export default function App() {
  // State to manage the sidebar's open/closed state for mobile view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar's visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-white">
        
        {/*
          The new Sidebar component, which is now controlled by state.
          It will be hidden on mobile by default and can be opened with the toggle button.
          On larger screens, it's always visible.
        */}
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        {/* This container ensures the content area can grow and scroll independently */}
        <div className="flex flex-col flex-1">
          {/*
            A responsive header that only appears on small screens (`lg:hidden`).
            It contains the app's title and a button to open the sidebar.
          */}
          <header className="flex items-center justify-between p-4 bg-white/5 lg:hidden">
            <h1 className="text-xl font-semibold tracking-wide">
              Net<span className="text-cyan-400">Scope Pro</span>
            </h1>
            <button onClick={toggleSidebar} className="p-1 rounded-md text-slate-500 hover:text-white">
              <Menu size={24} />
            </button>
          </header>

          {/* The main content area. The `lg:ml-64` class is crucial here.
            It provides a left margin on large screens to make space for the sidebar,
            but on smaller screens, it has no margin, allowing the content to fill the screen.
          */}
          <main className="flex-1 p-8 overflow-y-auto lg:ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
