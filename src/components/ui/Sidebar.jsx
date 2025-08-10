// src/components/ui/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { Gauge, BarChart, Shield, X, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

// This is a new, simplified Item component for better readability and future-proofing.
const Item = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white/10 text-cyan-400'
          : 'text-slate-500 hover:bg-white/5'
      )
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

// We'll now manage the sidebar's visibility and its state (open/closed)
// This new component also takes `isOpen` and `onClose` props.
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay to close the sidebar when clicking outside on mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      
      {/* This is the main sidebar container. We use Tailwind's responsive classes
          to control its visibility and position. */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col gap-6 border-r border-white/10 bg-white/5 p-6 transition-transform duration-300 ease-in-out",
          {
            '-translate-x-full lg:translate-x-0': !isOpen,
          }
        )}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">
            Net<span className="text-cyan-400">Scope Pro</span>
          </h1>
          {/* Close button for mobile view */}
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-white lg:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <Item to="/" icon={Gauge} label="Speed Test" onClick={onClose} />
          <Item to="/analytics" icon={BarChart} label="Analytics" onClick={onClose} />
          <Item to="/diagnostics" icon={Shield} label="Diagnostics" onClick={onClose} />
        </div>

        <div className="mt-auto text-xs text-slate-500 space-y-1">
          <p>Connection: <span className="text-cyan-400">Active</span></p>
          <p>Last Test: --</p>
          <p>Tests Today: 0</p>
        </div>
      </aside>
    </>
  );
}
