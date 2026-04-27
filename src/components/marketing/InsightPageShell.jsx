import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../layout/TopBar';

export default function InsightPageShell({ badge, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar />

      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 pt-[72px]">
        <div className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-cyan-200/40 blur-3xl"></div>

        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-20 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[12px] uppercase tracking-wider font-bold"
          >
            {badge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-5 text-[38px] md:text-[54px] leading-[1.05] font-black tracking-tight max-w-4xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 text-[17px] md:text-[19px] leading-relaxed text-slate-600 max-w-3xl"
          >
            {subtitle}
          </motion.p>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 md:px-10 py-12 md:py-16">{children}</main>
    </div>
  );
}
