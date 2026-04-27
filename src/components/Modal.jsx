import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div 
        className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] w-full max-w-[600px] max-h-[90vh] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-8 border-b border-[var(--cb-border)]">
          <h3 className="text-[var(--fs-h3)] font-sans font-semibold text-[var(--cb-slate)]">{title}</h3>
          <button 
            onClick={onClose}
            className="text-[var(--cb-gray)] hover:text-[var(--cb-slate)] transition-colors"
            aria-label="Close dialog"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
