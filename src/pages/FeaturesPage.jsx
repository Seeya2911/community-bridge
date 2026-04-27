import { motion } from 'framer-motion';
import { BellRing, Database, MapPinned, Radar, ShieldCheck, Users2 } from 'lucide-react';
import InsightPageShell from '../components/marketing/InsightPageShell';

const features = [
  {
    icon: Radar,
    title: 'Realtime Distress Intake',
    description: 'Capture field reports from mobile responders in seconds, with clean structured forms and instant queueing.',
    accent: 'from-emerald-500 to-green-600'
  },
  {
    icon: MapPinned,
    title: 'Geo-Precise Coordination',
    description: 'Every request is pinned to actionable coordinates so teams can route resources without ambiguity.',
    accent: 'from-cyan-500 to-blue-600'
  },
  {
    icon: ShieldCheck,
    title: 'Verification Guardrails',
    description: 'Built-in trust checks reduce false positives and improve confidence before deployment decisions.',
    accent: 'from-violet-500 to-purple-600'
  },
  {
    icon: BellRing,
    title: 'Priority Alerting',
    description: 'Severity-based notifications escalate urgent incidents to the right owners at the right time.',
    accent: 'from-amber-500 to-orange-600'
  },
  {
    icon: Database,
    title: 'Unified Operation Ledger',
    description: 'Keep one source of truth for requests, assignments, outcomes, and historical performance.',
    accent: 'from-slate-500 to-slate-700'
  },
  {
    icon: Users2,
    title: 'Volunteer Skill Matching',
    description: 'Pair mission needs with verified volunteer capabilities to close requests faster and smarter.',
    accent: 'from-teal-500 to-emerald-700'
  }
];

export default function FeaturesPage() {
  return (
    <InsightPageShell
      badge="Platform Features"
      title="An Operations Layer Built For Urgent, Human-Centered Response"
      subtitle="CommunityBridge gives NGOs and volunteers a shared control surface for intake, triage, and deployment with less delay and more trust."
    >
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7" aria-label="Feature cards">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-2xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-sm`}>
                <Icon size={22} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-[21px] leading-tight font-bold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">{item.description}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Feature impact highlights">
        {[
          ['97%', 'report formatting accuracy'],
          ['2.8x', 'faster assignment turnaround'],
          ['24/7', 'visibility across operations'],
          ['1', 'unified mission dashboard']
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-[30px] font-black tracking-tight text-emerald-700">{value}</p>
            <p className="text-[13px] uppercase tracking-wide text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </section>
    </InsightPageShell>
  );
}
