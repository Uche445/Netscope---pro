// src/components/ui/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { Gauge, BarChart, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium',
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

// Accept className prop here
export default function Sidebar({ className }) { 
  return (
    // Apply the received className prop to the <aside> tag
    <aside className={cn("flex h-full w-64 flex-col gap-6 border-r border-white/10 bg-white/5 p-6", className)}> 
      {/* `cn()` helper will merge the existing classes with the new ones passed via `className` prop.
        The `w-64` is essential here and matches SIDEBAR_WIDTH_PX in App.js.
        The `h-full` will now work in conjunction with `fixed` from App.js to span the viewport height.
      */}
      <h1 className="text-xl font-semibold tracking-wide">
        Net<span className="text-cyan-400">Scope Pro</span>
      </h1>

      <div className="flex flex-col gap-1">
        <Item to="/"          icon={Gauge}    label="Speed Test" />
        <Item to="/analytics" icon={BarChart} label="Analytics" />
        <Item to="/diagnostics"icon={Shield}  label="Diagnostics"/>
      </div>

      <div className="mt-auto text-xs text-slate-500 space-y-1">
        <p>Connection: <span className="text-cyan-400">Active</span></p>
        <p>Last Test: --</p>
        <p>Tests Today: 0</p>
      </div>
    </aside>
  );
}