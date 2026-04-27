import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Cpu, MapPinCheck, Send, UsersRound } from 'lucide-react';
import InsightPageShell from '../components/marketing/InsightPageShell';

const phases = [
  {
    icon: Send,
    title: 'Signal Capture',
    body: 'Field teams submit incidents with urgency, location, and need type through a minimal reporting interface.'
  },
  {
    icon: Cpu,
    title: 'Automated Triage',
    body: 'Structured data is classified, grouped, and prioritized so decision makers can focus attention immediately.'
  },
  {
    icon: MapPinCheck,
    title: 'Context Verification',
    body: 'Requests are cross-checked against area context, known constraints, and existing active missions.'
  },
  {
    icon: UsersRound,
    title: 'Resource Matching',
    body: 'The system proposes suitable NGOs and volunteers by skill, proximity, and mission readiness.'
  },
  {
    icon: ClipboardCheck,
    title: 'Execution And Feedback',
    body: 'Assignments are tracked through completion, and outcomes feed back into quality and planning loops.'
  }
];

export default function MethodologyPage() {
  return (
    <InsightPageShell
      badge="Response Methodology"
      title="A Five-Phase Workflow That Turns Raw Signals Into Coordinated Action"
      subtitle="Our methodology is designed for speed without sacrificing confidence, combining automation, verification, and human oversight."
    >
      <section className="relative" aria-label="Methodology timeline">
        <div className="absolute left-6 md:left-8 top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-300 via-cyan-300 to-blue-400"></div>
        <div className="space-y-5 md:space-y-6">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <motion.article
                key={phase.title}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="relative pl-16 md:pl-20"
              >
                <div className="absolute left-0 top-2 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-700">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6">
                  <p className="text-[12px] uppercase tracking-wider text-slate-500 font-bold">Phase {idx + 1}</p>
                  <h2 className="mt-1 text-[22px] font-bold tracking-tight">{phase.title}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{phase.body}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-600 to-cyan-700 p-6 md:p-8 text-white">
        <h3 className="text-[26px] font-black tracking-tight">Why This Works In The Field</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-[15px]">
          <p className="bg-white/10 rounded-xl p-4">Rapid intake avoids bottlenecks during peak distress periods.</p>
          <p className="bg-white/10 rounded-xl p-4">Automated triage keeps teams focused on high-impact interventions.</p>
          <p className="bg-white/10 rounded-xl p-4">Feedback loops improve assignment quality over time.</p>
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-100">
          Continuous optimization protocol <ArrowRight size={16} aria-hidden="true" />
        </p>
      </section>
    </InsightPageShell>
  );
}
