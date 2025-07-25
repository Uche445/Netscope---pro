import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/ui/Sidebar';
import Dashboard from './pages/SpeedTestPage';
import Analytics from './pages/Analytics';
import Diagnostics from './pages/Diagnostics';

// This MUST match the `w-64` defined in your Sidebar component, which is 256px.
const SIDEBAR_WIDTH_PX = 256; 

export default function App() {
  return (
    <Router>
      {/* Outer container for the whole layout. flex ensures sidebar and content are side-by-side. */}
      <div className="flex min-h-screen"> 
        
        {/* The Fixed Sidebar */}
        {/* We pass the classes to make it fixed to the Sidebar component via the `className` prop */}
        <Sidebar className="fixed top-0 left-0 h-full z-50" /> 
        {/*
            `fixed`: Makes it fixed relative to the viewport.
            `top-0`, `left-0`: Positions it at the top-left corner of the viewport.
            `h-full`: Makes it span the full height of the viewport.
            `z-50`: Ensures it layers above other content.
            The background, border, etc., are handled internally by your Sidebar.jsx
        */}
        
        {/* Main Content Area: Takes the remaining horizontal space and handles its own vertical scrolling */}
        <main 
          className="flex-1 overflow-y-auto" // `flex-1` allows it to fill space, `overflow-y-auto` enables scrolling
          style={{ marginLeft: `${SIDEBAR_WIDTH_PX}px` }} // Pushes content away from the fixed sidebar
        >
          {/* Each Route element (Dashboard, Analytics, Diagnostics) will render here.
            If you want a consistent background (like cyber-gradient) across all pages, 
            you can add it to this `main` tag, along with `min-h-screen`.
            Example: <main className="flex-1 overflow-y-auto min-h-screen cyber-gradient" ...>
            Otherwise, keep the backgrounds defined within each page component (e.g., SpeedTestPage).
          */}
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/analytics"  element={<Analytics />} />
            <Route path="/diagnostics"element={<Diagnostics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}