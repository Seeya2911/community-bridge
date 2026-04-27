import { useState, useEffect } from 'react';
import { getStore, setStore } from '../mockData';
import { useToast } from '../App';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import MapMock from '../components/MapMock';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', Needs: 12, Resolved: 8 },
  { name: 'Tue', Needs: 19, Resolved: 15 },
  { name: 'Wed', Needs: 15, Resolved: 18 },
  { name: 'Thu', Needs: 22, Resolved: 12 },
  { name: 'Fri', Needs: 18, Resolved: 20 },
  { name: 'Sat', Needs: 35, Resolved: 22 },
  { name: 'Sun', Needs: 28, Resolved: 30 },
];

export default function NGODashboardPage() {
  const [store, setStoreData] = useState(getStore());
  const [activeTab, setActiveTab] = useState('Priority List');
  const [needFilter, setNeedFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [selectedNeed, setSelectedNeed] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    setStoreData(getStore());
  }, []);

  if (!store || !store.communityNeeds) return <div className="p-8 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div></div>;

  let filteredNeeds = [...store.communityNeeds];
  if (needFilter !== 'All') filteredNeeds = filteredNeeds.filter(n => n.needType === needFilter);
  if (urgencyFilter !== 'All') filteredNeeds = filteredNeeds.filter(n => n.urgency == urgencyFilter);
  const openNeeds = filteredNeeds.filter(n => n.status === 'open').sort((a,b) => b.urgency - a.urgency);

  const handleAssign = (needId, volName) => {
    const newStore = { ...store };
    const need = newStore.communityNeeds.find(n => n.id === needId);
    if (need) { need.status = 'assigned'; need.assignedVolunteer = volName; }
    const vol = newStore.volunteerRequests.find(v => v.name === volName);
    if (vol) vol.available = false;
    setStore(newStore); setStoreData(newStore);
    showToast(`Squad Deployed: Volunteer ${volName} assigned successfully!`, 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans">
      
      {/* Top Bar - Filters */}
      <div className="h-[72px] bg-white  text-slate-900 flex items-center px-5 shrink-0 justify-between shadow-md relative z-20 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-500/50 text-emerald-700 font-sans font-bold text-[20px] flex items-center justify-center">AF</div>
          <span className="font-sans text-[20px] tracking-wide font-bold">Asha Foundation Command</span>
        </div>
        
        <div className="flex gap-5 w-full justify-end">
           <select className="px-5 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-[14px] outline-none hover:border-emerald-500/50 transition-colors cursor-pointer focus:ring-1 focus:ring-emerald-500" value={needFilter} onChange={e=>setNeedFilter(e.target.value)}>
             <option className="text-black" value="All">Need Type Filter: Offline</option>
             <option className="text-black" value="Food">Food Infrastructure</option>
             <option className="text-black" value="Medical">Medical Support</option>
             <option className="text-black" value="Shelter">Shelter Extraction</option>
           </select>
           <select className="px-5 py-2.5 rounded-xl bg-slate-50/50 border border-slate-200 text-[14px] outline-none hover:border-emerald-500/50 transition-colors cursor-pointer focus:ring-1 focus:ring-emerald-500" value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)}>
             <option className="text-black" value="All">Urgency Level: All Zones</option>
             <option className="text-black" value="5">Critical Protocols</option>
             <option className="text-black" value="4">High Protocols</option>
             <option className="text-black" value="3">Moderate Protocols</option>
           </select>
           <input type="text" className="px-5 py-2.5 w-[350px] rounded-xl bg-slate-50/50 text-slate-900 border border-slate-200 text-[14px] outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Search zone identifiers..." />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-80px)]">
        
        {/* Left Side - Animated Interactive Map View */}
        <motion.div initial={{ x: -100 }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 100 }} className="w-[50%] h-full bg-slate-50 shrink-0 flex flex-col relative z-10 border-r border-slate-200 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
          <MapMock needs={filteredNeeds} compact={false} />
        </motion.div>

        {/* Right Side - Content/Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a]">
          
          <div className="flex bg-white/20  px-5 pt-4 border-b border-slate-200 gap-8 shrink-0 relative">
            {['Priority List', 'Volunteer Assignment', 'Telemetry Stats', 'Field Operatives'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 text-[14px] font-bold border-b-[3px] transition-all uppercase tracking-widest relative ${activeTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8 relative">
             <AnimatePresence mode="wait">
              {activeTab === 'Priority List' && (
                <motion.div key="list" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white backdrop-blur-lg rounded-2xl overflow-hidden shadow-md border border-slate-200">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Tracker ID / Zone</th>
                        <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Incident Category</th>
                        <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Threat Level</th>
                        <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Operation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {openNeeds.map((need, idx) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={need.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                          <td className="px-5 py-5 font-bold text-slate-900">ZX-{need.id.toString().slice(-4)} • <span className="text-slate-700 font-medium">{need.location}</span></td>
                          <td className="px-5 py-5 text-slate-700">{need.needType} <span className="text-[12px] text-emerald-700 ml-2 font-bold px-2 py-0.5 bg-emerald-500/10 rounded">[{need.people} CIVS]</span></td>
                          <td className="px-5 py-5">
                            <StatusBadge type="urgency" value={need.urgency} />
                          </td>
                          <td className="px-5 py-5">
                            <StatusBadge type="status" value={need.status} />
                            <button className="ml-4 text-[11px] font-bold tracking-widest uppercase border border-amber-500/50 text-amber-500 px-3 py-1 rounded hover:bg-amber-500/10 transition-colors" onClick={() => { setSelectedNeed(need.id); setActiveTab('Volunteer Assignment'); }}>Assign Unit</button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'Volunteer Assignment' && (
                <motion.div key="assign" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 text-[16px] font-bold shadow-md mb-8 outline-none focus:border-emerald-500" value={selectedNeed || ''} onChange={(e) => setSelectedNeed(Number(e.target.value))}>
                     <option value="">Select a critical operation to deploy tactical volunteers...</option>
                     {openNeeds.map(n => <option key={n.id} value={n.id}>{n.location} — {n.needType} (Threat Priority {n.urgency})</option>)}
                  </select>
                  
                  {selectedNeed && (
                     <div className="space-y-5">
                       {store.volunteerRequests.filter(v => v.status === 'accepted' && v.available).map((vol, idx) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={vol.id} className="bg-white  p-8 rounded-2xl flex items-center justify-between border border-slate-200 hover:border-emerald-500/50 hover:shadow-md hover:bg-white transition-all cursor-pointer">
                           <div className="flex items-center gap-8">
                             <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center text-slate-900 font-sans font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">{vol.name.substring(0,2)}</div>
                             <div>
                               <p className="font-bold text-[20px] text-slate-900 flex items-center gap-3">{vol.name} <span className="text-[11px] bg-slate-50 px-2 py-1 rounded text-amber-700 tracking-widest font-bold">⭐ {vol.rating} RATING ({vol.tasksCompleted} OP)</span></p>
                               <p className="text-[13px] text-emerald-700 mt-1 font-bold tracking-widest uppercase">Specialization: {vol.skills.join(' • ')}</p>
                             </div>
                           </div>
                           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-emerald-700 hover:bg-emerald-800 text-slate-900 font-bold tracking-widest text-[13px] uppercase rounded-xl py-3 px-5 shadow-lg shadow-emerald-500/20" onClick={() => handleAssign(selectedNeed, vol.name)}>Deploy Unit To Zone</motion.button>
                         </motion.div>
                       ))}
                     </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'Telemetry Stats' && (
                <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <StatCard value={openNeeds.length} label="Current Open Needs" trend="+2 since morning" trendUp={false} />
                    <StatCard value={store.volunteerRequests.filter(v=>v.available).length} label="Units Ready for Deployment" trend="Optimal Readiness" />
                  </div>
                  <div className="bg-white  p-8 rounded-3xl border border-slate-200 h-[450px]">
                    <h3 className="font-sans font-bold text-[16px] text-slate-900 mb-8 tracking-wide">Incident Resolution Trajectory</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" />
                        <YAxis stroke="#475569" />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="Needs" stroke="#ef4444" fillOpacity={1} fill="url(#colorNeeds)" />
                        <Area type="monotone" dataKey="Resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Field Operatives' && (
                <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-200 rounded-3xl bg-white/20">
                  <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">Field Operatives GPS Tracking Offline</p>
                </div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
