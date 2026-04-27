import { Inbox } from 'lucide-react';

export default function EmptyState({ title, subtitle, ctaText, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-slate-600">
        <Inbox size={40} strokeWidth={1.5} />
      </div>
      <h3 className="font-sans text-[20px] font-bold text-slate-900 mb-2">{title}</h3>
      <p className="font-sans text-[15px] text-slate-600 max-w-md mb-6 leading-relaxed">{subtitle}</p>
      {ctaText && onCta && (
        <button className="cb-btn-ghost" onClick={onCta}>
          {ctaText}
        </button>
      )}
    </div>
  );
}
