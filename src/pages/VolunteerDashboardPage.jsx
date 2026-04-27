import { useState, useEffect } from 'react';
import { getStore, setStore } from '../mockData';
import { useToast } from '../App';
import StatusBadge from '../components/StatusBadge';
import MapMock from '../components/MapMock';
import EmptyState from '../components/EmptyState';
import { MapPin, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

export default function VolunteerDashboardPage() {
  const [store, setStoreData] = useState(getStore());
  const [activeTab, setActiveTab] = useState('Active Task');
  const [isAvailable, setIsAvailable] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showToast } = useToast();

  const userEmail = "priya@gmail.com"; 

  useEffect(() => {
    const data = getStore();
    setStoreData(data);
    const me = data.volunteerRequests.find(v => v.email === userEmail);
    if(me) setIsAvailable(me.available);
  }, []);

  if (!store || !store.volunteerRequests) return <div className="p-8 text-slate-900">Loading Framework...</div>;

  const me = store.volunteerRequests.find(v => v.email === userEmail);
  const activeTask = store.communityNeeds.find(n => n.assignedVolunteer === me?.name && ['assigned', 'in_progress'].includes(n.status));

  const toggleAvailability = () => {
    const newStore = {...store};
    const user = newStore.volunteerRequests.find(v => v.email === userEmail);
    if (user) {
      user.available = !user.available;
      setIsAvailable(user.available);
      setStore(newStore); setStoreData(newStore);
      showToast(user.available ? "You are now online and ready" : "You are currently offline");
    }
  };

  const updateTaskStatus = (newStatus) => {
    if (!activeTask) return;
    const newStore = {...store};
    const task = newStore.communityNeeds.find(n => n.id === activeTask.id);
    const user = newStore.volunteerRequests.find(v => v.email === userEmail);
    
    if (newStatus === 'open') {
      task.status = 'open'; task.assignedVolunteer = null;
      showToast("Mission aborted.", "error");
    } else if (newStatus === 'in_progress') {
      task.status = 'in_progress';
      showToast("Mission Accepted! Stay safe.", "success");
    } else if (newStatus === 'resolved') {
      task.status = 'resolved';
      if (user) user.tasksCompleted += 1;
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000);
      showToast("Operation Success! +1 to your streak 🎉", "success");
    }
    setStore(newStore); setStoreData(newStore);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-slate-50 text-slate-700 flex flex-col font-sans relative overflow-hidden">
      
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={600} colors={['#10B981', '#34D399', '#fde047', '#ffffff']} />}

      {/* Immersive Top Header */}
      <div className="h-[72px] bg-white/70 backdrop-blur-2xl text-slate-900 flex items-center px-8 shrink-0 justify-between shadow-[0_5px_40px_rgba(0,0,0,0.5)] border-b border-slate-200 relative z-20">
        <div className="flex items-center gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 font-sans font-bold text-[16px] flex items-center justify-center border-2 border-slate-200 shadow-sm cursor-pointer">
            {me?.name.substring(0,2)}
          </motion.div>
          <div>
            <span className="font-sans text-[16px] tracking-tight font-bold">{me?.name}</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{me?.ngo} operative</span>
              <span className="text-[11px] text-amber-700 font-bold uppercase tracking-widest px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">⭐ {me?.rating} Clearance</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50/60 pr-2 pl-6 py-2.5 rounded-full border border-slate-200  shadow-inner">
          <span className={`text-[12px] font-bold tracking-widest uppercase ${isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
            {isAvailable ? '🟢 Online / Ready for Ops' : '🔴 Standby Module'}
          </span>
          <motion.button 
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleAvailability}
             className={`relative w-[64px] h-[34px] rounded-full transition-colors p-1 ${isAvailable ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.6)]' : 'bg-slate-700/50'}`}
           >
             <div className={`w-[26px] h-[26px] rounded-full bg-white shadow-md transition-transform duration-300 ${isAvailable ? 'translate-x-[30px]' : 'translate-x-0'}`}></div>
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a]">
        
        {/* Left Nav */}
        <div className="w-[300px] bg-white border-r border-slate-200  flex flex-col shrink-0 z-10 shadow-[5px_0_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col flex-1 py-4">
            {['Active Task', 'Live Map Viewer', 'Mission Logs', 'Comms Channel'].map((nav, index) => (
              <button 
                key={nav} onClick={() => setActiveTab(nav)}
                className={`text-left px-5 py-5 font-bold text-[14px] transition-all duration-300 relative flex items-center justify-between ${activeTab === nav ? 'bg-white/5 text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {activeTab === nav && <motion.div layoutId="volTabInd" className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-700"></motion.div>}
                <span className="flex items-center gap-4 tracking-wide uppercase">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded shadow-sm border ${activeTab === nav ? 'border-emerald-500/50 text-emerald-700 bg-emerald-500/10' : 'border-slate-200 text-slate-600 bg-transparent'}`}>0{index + 1}</span>
                  {nav}
                </span>
                {nav === 'Active Task' && activeTask && activeTask.status === 'assigned' && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           <div className="max-w-5xl mx-auto">
             <AnimatePresence mode="wait">
               {activeTab === 'Active Task' && (
                 <motion.div key="activeTask" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                   {activeTask ? (
                     <div className={`bg-white  rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 shadow-md relative ${activeTask.status === 'assigned' ? 'shadow-red-500/20' : 'shadow-emerald-500/20'}`}>
                       <div className={`absolute top-0 left-0 w-full h-1 ${activeTask.status === 'assigned' ? 'bg-red-500 shadow-sm' : 'bg-emerald-700 shadow-sm'}`}></div>
                       
                       <div className="p-8">
                         <div className="flex justify-between items-start mb-10">
                           <div>
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><StatusBadge type="urgency" value={activeTask.urgency} /></motion.div>
                             <h2 className="font-sans text-[16px] md:text-[20px] text-slate-900 mt-4 leading-tight font-bold tracking-tight">{activeTask.needType} Crisis Package</h2>
                           </div>
                           <div className="text-right">
                             {activeTask.status === 'assigned' && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="bg-red-50 border border-red-500 text-red-500 text-[12px] font-bold px-8 py-2 rounded-full uppercase tracking-widest inline-block shadow-[0_0_15px_rgba(239,68,68,0.5)]">INCOMING DIRECTIVE</motion.span>}
                             {activeTask.status === 'in_progress' && <span className="bg-emerald-50 border border-emerald-500 text-emerald-700 text-[12px] font-bold px-8 py-2 rounded-full uppercase tracking-widest inline-block shadow-[0_0_15px_rgba(16,185,129,0.5)]">ENGAGED EN ROUTE</span>}
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-8 mb-10 mt-6">
                           <div className="flex gap-5 items-center bg-slate-50/50 p-8 rounded-2xl border border-slate-200">
                             <div className="w-12 h-12 rounded-xl bg-blue-50 shadow-lg shadow-blue-500/10 flex items-center justify-center text-blue-700 border border-blue-500/30">
                               <MapPin size={28} />
                             </div>
                             <div>
                               <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Zone Coordinates</p>
                               <p className="text-[16px] font-bold text-slate-900">{activeTask.location}</p>
                             </div>
                           </div>
                           <div className="flex gap-5 items-center bg-slate-50/50 p-8 rounded-2xl border border-slate-200">
                             <div className="w-12 h-12 rounded-xl bg-amber-50 shadow-lg shadow-amber-500/10 flex items-center justify-center text-amber-700 border border-amber-500/30">
                               <Target size={28} />
                             </div>
                             <div>
                               <p className="text-[11px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Operation Goal</p>
                               <p className="text-[16px] font-bold text-slate-900">{activeTask.people} Civilians Intact</p>
                             </div>
                           </div>
                         </div>
                         
                         <div className="bg-slate-50/80 p-8 rounded-2xl border border-slate-200 shadow-inner">
                           <h4 className="font-bold text-[13px] uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-700"></span> Mission Briefing Data</h4>
                           <p className="text-[20px] font-light text-slate-700 leading-relaxed font-sans tracking-wide">{activeTask.description}</p>
                           <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                              <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">Verified Coordinator: {activeTask.reportedBy}</p>
                              <p className="text-[12px] text-emerald-500 font-bold tracking-widest uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">T+ {new Date(activeTask.reportedAt).toLocaleTimeString()}</p>
                           </div>
                         </div>
                       </div>
                       
                       <div className="bg-slate-50/90 border-t border-slate-200 p-8 flex justify-end gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                         {activeTask.status === 'assigned' ? (
                           <>
                             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-red-700 font-bold tracking-widest uppercase text-[14px] px-5 py-4 border border-red-500/30 hover:bg-red-500/10 rounded-xl transition-colors" onClick={() => updateTaskStatus('open')}>Abort Sequence</motion.button>
                             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900 font-bold tracking-widest uppercase text-[15px] px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.4)]" onClick={() => updateTaskStatus('in_progress')}>LOCK IN & LAUNCH</motion.button>
                           </>
                         ) : (
                           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold tracking-widest uppercase text-[16px] px-8 py-5 rounded-xl shadow-[0_10px_40px_rgba(255,255,255,0.2)] transition-colors" onClick={() => updateTaskStatus('resolved')}>VERIFY SECURED & EXTRACT ✅</motion.button>
                         )}
                       </div>
                     </div>
                   ) : (
                     <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-20">
                       <EmptyState 
                         title="Zero Active Directives" 
                         subtitle="Your grid is clear. Ensure standby module is set to green to receive automated dispatches from command." 
                       />
                     </motion.div>
                   )}
                 </motion.div>
               )}

               {activeTab === 'Live Map Viewer' && (
                 <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-[700px] bg-slate-50 rounded-[24px] shadow-md border border-slate-200 overflow-hidden">
                   <MapMock needs={activeTask ? [activeTask] : store.communityNeeds.filter(n=>n.status==='open')} compact={false} />
                 </motion.div>
               )}

               {activeTab === 'Mission Logs' && (
                 <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white  !p-0 overflow-hidden shadow-md rounded-2xl border border-slate-200">
                   <table className="w-full text-left text-[14px]">
                     <thead className="bg-slate-50/60 border-b border-slate-200">
                       <tr>
                         <th className="px-5 py-8 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Mission Identity</th>
                         <th className="px-5 py-8 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Geo-Zone</th>
                         <th className="px-5 py-8 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Timestamp</th>
                         <th className="px-5 py-8 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Final Evaluation</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {store.volunteerTaskHistory.map((task, idx) => (
                         <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={task.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-5 py-8 font-bold text-slate-900 text-[15px]">{task.name}</td>
                           <td className="px-5 py-8 font-medium text-slate-700">{task.location}</td>
                           <td className="px-5 py-8 text-slate-500 font-bold tracking-widest uppercase text-[11px]">{task.date}</td>
                           <td className="px-5 py-8"><StatusBadge type="status" value={task.status} /></td>
                         </motion.tr>
                       ))}
                     </tbody>
                   </table>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
