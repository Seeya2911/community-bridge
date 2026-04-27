import { Shield, Target, Users } from 'lucide-react';

export default function ProcessSection() {
  return (
    <section className="py-[100px] px-8 bg-slate-50 border-t border-slate-200" aria-labelledby="process-heading">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 id="process-heading" className="text-[36px] text-slate-900 font-bold tracking-tight mb-4">
            A Streamlined Chain of Action.
          </h2>
          <p className="text-slate-600 text-[18px] max-w-2xl mx-auto leading-relaxed">
            Our infrastructure eliminates redundancy, ensuring critical aid is directed securely and instantly to
            verified zones of need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="flex flex-col items-start bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
              <Target size={24} aria-hidden="true" />
            </div>
            <h3 className="text-[20px] font-bold mb-3 text-slate-900">1. Instant Field Reports</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed">
              Operatives submit distress signals natively without relying on proprietary software installations.
            </p>
          </article>

          <article className="flex flex-col items-start bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
              <Shield size={24} aria-hidden="true" />
            </div>
            <h3 className="text-[20px] font-bold mb-3 text-slate-900">2. Algorithmic Triage</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed">
              Incoming structured data is automatically classified to isolate precise geolocations and resource
              requirements.
            </p>
          </article>

          <article className="flex flex-col items-start bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-6 border border-emerald-100">
              <Users size={24} aria-hidden="true" />
            </div>
            <h3 className="text-[20px] font-bold mb-3 text-slate-900">3. Verified Deployment</h3>
            <p className="text-slate-600 text-[15px] leading-relaxed">
              The closest authorized personnel matching the exact capability profile are dispatched via secure routing.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
