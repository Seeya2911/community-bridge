import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ value, label, trend, trendUp = true }) {
  return (
    <div className="bg-white  p-[24px] rounded-2xl border border-slate-200 shadow-xl flex flex-col justify-center">
      <div className="text-[20px] font-sans font-bold text-slate-900 mb-2">{value}</div>
      <div className="text-[13px] font-sans text-slate-600 font-bold tracking-widest uppercase flex justify-between items-end">
        <span>{label}</span>
        {trend && (
          <span className={`flex items-center gap-1 ${trendUp ? 'text-[var(--cb-low)]' : 'text-[var(--cb-critical)]'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
