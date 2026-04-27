import { motion } from 'framer-motion';
import { Activity, BadgeCheck, HandHeart, Sparkles } from 'lucide-react';
import InsightPageShell from '../components/marketing/InsightPageShell';

const metrics = [
  { value: '847+', label: 'verified operations closed', icon: BadgeCheck, color: 'text-emerald-700' },
  { value: '230+', label: 'active response personnel', icon: HandHeart, color: 'text-cyan-700' },
  { value: '38%', label: 'average response time improvement', icon: Activity, color: 'text-violet-700' },
  { value: '92%', label: 'field satisfaction confidence score', icon: Sparkles, color: 'text-amber-700' }
];

const stories = [
  {
    place: 'Nashik Rural Belt',
    summary: 'Water distribution requests were clustered and assigned in under 10 minutes, reducing overlap across two NGO teams.'
  },
  {
    place: 'Pune Periphery',
    summary: 'Volunteer skill matching increased first-aid assignment accuracy and cut handoff delays during a surge period.'
  },
  {
    place: 'Konkan Relief Corridor',
    summary: 'Shared visibility across organizations improved supply routing and boosted on-time delivery confidence.'
  }
];

export default function ImpactPage() {
  return (
    <InsightPageShell
      badge="Measured Impact"
      title="Proof That Better Coordination Creates Faster, More Reliable Relief"
      subtitle="Impact is tracked across response velocity, match quality, and mission completion confidence to keep teams outcome-focused."
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Impact metric cards">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6"
            >
              <Icon className={item.color} size={22} aria-hidden="true" />
              <p className="mt-4 text-[38px] leading-none font-black tracking-tight text-slate-900">{item.value}</p>
              <p className="mt-2 text-[13px] uppercase tracking-wide text-slate-500">{item.label}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="mt-10">
        <h2 className="text-[30px] font-black tracking-tight">Field Stories</h2>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {stories.map((story, idx) => (
            <motion.article
              key={story.place}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl bg-white border border-slate-200 p-6"
            >
              <p className="text-[12px] uppercase tracking-widest font-bold text-emerald-700">{story.place}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{story.summary}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-6 md:p-8">
        <h3 className="text-[28px] font-black tracking-tight">Impact Is A Practice, Not A Dashboard</h3>
        <p className="mt-3 max-w-3xl text-slate-300 leading-relaxed">
          CommunityBridge combines measurable indicators with narrative field feedback so organizations can improve response systems each cycle.
        </p>
      </section>
    </InsightPageShell>
  );
}
