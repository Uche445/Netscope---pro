import { cn } from '../../lib/utils';

export default function StatCard({ icon: Icon, label, value, color = 'cyan' }) {
  return (
    <div className={cn(
      'flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-6 py-4',
      'min-w-[180px]'
    )}>
      <span className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10',
        color === 'cyan'   && 'text-cyan-400',
        color === 'green'  && 'text-green-400',
        color === 'blue'   && 'text-blue-400',
        color === 'orange' && 'text-orange-400',
      )}>
        <Icon size={20} />
      </span>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-base font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
