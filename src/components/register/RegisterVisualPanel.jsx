import { motion } from 'framer-motion';

export default function RegisterVisualPanel({ imageSrc }) {
  return (
    <aside className="hidden lg:flex w-[55%] relative items-center justify-center bg-slate-50 border-l border-slate-200 overflow-hidden" aria-label="Registration hero image and quote">
      <img
        src={imageSrc}
        alt="Volunteer and NGO collaboration"
        className="w-full h-full object-cover object-center opacity-70"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-emerald-900/40 mix-blend-overlay"></div>

      <div className="absolute bottom-20 left-16 right-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-sans text-white text-3xl font-bold leading-tight mb-6 tracking-tight"
        >
          "The smallest act of kindness is worth more than the grandest intention."
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-4"
        >
          <div className="h-[2px] w-10 bg-emerald-300"></div>
          <p className="text-emerald-200 font-bold tracking-widest uppercase">Oscar Wilde</p>
        </motion.div>
      </div>
    </aside>
  );
}
