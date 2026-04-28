import { useState, useEffect } from 'react';
import { useStore, db, updateVolunteerAvailability, updateTaskStatus, createTask, acceptTask, completeTask, demoteFieldWorker, notifyTaskDeclined } from '../firebaseStore';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { processReport } from '../nlpUtils';
import { useToast } from '../App';
import StatusBadge from '../components/StatusBadge';
import MapMock from '../components/MapMock';
import EmptyState from '../components/EmptyState';
import NotificationBell from '../components/NotificationBell';
import LogoutButton from '../components/LogoutButton';
import { MapPin, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Navigate } from 'react-router-dom';

export default function VolunteerDashboardPage() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('Active Tasks');
  const [isAvailable, setIsAvailable] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [nlpInput, setNlpInput] = useState('');
  const [nlpData, setNlpData] = useState(null);
  const { showToast } = useToast();

  const userEmail = store.userProfile?.email || ""; 
  const userRole = store.userRole;

  useEffect(() => {
    if (!store.loading && store.userProfile) {
      setIsAvailable(store.userProfile.available);
    }
  }, [store.loading, store.userProfile]);

  if (store.loading) return <div className="p-8 text-slate-900">Loading Framework...</div>;

  if (!userRole) return <Navigate to="/login" replace />;
  if (userRole !== 'volunteer' && userRole !== 'field_worker') {
    return <Navigate to={`/${userRole === 'admin' ? 'admin' : 'ngo'}`} replace />;
  }

  const me = store.userProfile;
  const activeTasks = store.tasks.filter(n => n.assigned_to === me?.id && ['assigned', 'in_progress'].includes(n.status));

  const toggleAvailability = async () => {
    if (me) {
      const newAvail = !me.available;
      setIsAvailable(newAvail);
      try {
        await updateVolunteerAvailability(me.id, newAvail);
        showToast(newAvail ? "You are now online and ready" : "You are currently offline");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const taskToUpdate = store.tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    const user = store.userProfile;
    const assignment = store.assignments.find(a => a.task_id === taskId && ['assigned', 'accepted'].includes(a.status));
    const assignmentId = assignment ? assignment.id : null;
    
    try {
      if (newStatus === 'created') {
        // Decline / abort assignment — notify the NGO
        const ngoId = assignment?.ngo_id;
        await updateDoc(doc(db, 'Tasks', String(taskId)), { status: 'created', assigned_to: null, assigned_by: null, updatedAt: new Date() });
        if (assignmentId) await updateDoc(doc(db, 'Assignments', String(assignmentId)), { status: 'declined' });
        
        if (user) {
          if (user.role === 'field_worker') await demoteFieldWorker(user.id);
          else await updateDoc(doc(db, 'Users', String(user.id)), { status: 'active', available: true });
        }

        // Notify the NGO that assigned this task
        await notifyTaskDeclined(taskId, ngoId, user?.name || 'Volunteer', taskToUpdate.type);
        showToast("Task declined.", "error");
      } else if (newStatus === 'in_progress') {
        await acceptTask(taskId, assignmentId);
        showToast("Mission Accepted! Stay safe.", "success");
      } else if (newStatus === 'completed') {
        await completeTask(taskId, assignmentId, user?.id);
        if (user) {
          await updateDoc(doc(db, 'Users', String(user.id)), { tasksCompleted: (user.tasksCompleted || 0) + 1 });
          if (user.role === 'field_worker') await demoteFieldWorker(user.id);
        }
        
        await addDoc(collection(db, 'Notifications'), {
          type: 'task_completed',
          message: `Task ${taskToUpdate.type} completed by ${user?.name || 'Volunteer'}.`,
          task_id: taskId,
          createdAt: new Date().toISOString()
        });

        setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000);
        showToast("Operation Success! +1 to your streak 🎉", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const type = form.get('type');
    const location = form.get('location');
    const urgency = parseInt(form.get('urgency'));
    const people_affected = parseInt(form.get('people_affected'));
    const description = form.get('description');

    try {
      await createTask({
        type,
        location,
        urgency,
        people_affected,
        description,
        source: 'nlp_report',
        created_by: me?.id || 'unknown'
      });
      showToast('Field report submitted! Central Command has been alerted.', 'success');
      e.target.reset();
      setNlpInput('');
      setNlpData(null);
      setActiveTab('Active Tasks');
    } catch (e) {
      console.error(e);
      showToast('Failed to submit report', 'error');
    }
  };

  const handleAnalyze = () => {
    if (!nlpInput.trim()) return;
    const result = processReport(nlpInput, "Current GPS");
    setNlpData(result);
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
              <span className="text-[11px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-widest">operative</span>
              <span className="text-[11px] text-amber-700 font-bold uppercase tracking-widest px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">⭐ {me?.rating || '5.0'} Clearance</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <NotificationBell />
          <LogoutButton label="Log Out" className="shrink-0" />
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
      </div>

      <div className="flex-1 flex overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a]">
        
        {/* Left Nav */}
        <div className="w-[300px] bg-white border-r border-slate-200  flex flex-col shrink-0 z-10 shadow-[5px_0_30px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col flex-1 py-4">
            {(userRole === 'field_worker' ? ['Submit Report', 'Active Tasks', 'Live Map Viewer', 'Tasks', 'Leaderboard'] : ['Active Tasks', 'Live Map Viewer', 'Tasks', 'Leaderboard']).map((nav, index) => (
              <button 
                key={nav} onClick={() => setActiveTab(nav)}
                className={`text-left px-5 py-5 font-bold text-[14px] transition-all duration-300 relative flex items-center justify-between ${activeTab === nav ? 'bg-white/5 text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {activeTab === nav && <motion.div layoutId="volTabInd" className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-700"></motion.div>}
                <span className="flex items-center gap-4 tracking-wide uppercase">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded shadow-sm border ${activeTab === nav ? 'border-emerald-500/50 text-emerald-700 bg-emerald-500/10' : 'border-slate-200 text-slate-600 bg-transparent'}`}>0{index + 1}</span>
                  {nav}
                </span>
                {nav === 'Active Tasks' && activeTasks.length > 0 && activeTasks.some(t => t.status === 'assigned') && (
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
               {activeTab === 'Submit Report' && (
                 <motion.div key="submitReport" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
                   <h2 className="font-sans text-[20px] font-bold text-slate-900 mb-6">File New Incident Report (AI Assisted)</h2>
                   
                   {!nlpData ? (
                     <div className="space-y-6">
                       <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Raw Field Report</label>
                       <textarea 
                         value={nlpInput} 
                         onChange={(e) => setNlpInput(e.target.value)} 
                         required rows="4" 
                         placeholder="E.g. 10 people injured in Rampur, urgent medical help needed..." 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                       ></textarea>
                       <button onClick={handleAnalyze} disabled={!nlpInput.trim()} className="bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-md w-full transition-colors uppercase tracking-widest text-[14px]">
                         Analyze with AI
                       </button>
                     </div>
                   ) : (
                     <form onSubmit={submitReport} className="space-y-6">
                       <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6">
                         <div className="flex justify-between items-center">
                           <span className="text-emerald-800 font-bold text-[14px]">AI Confidence Score: {nlpData.confidence}%</span>
                           <button type="button" onClick={() => setNlpData(null)} className="text-[12px] font-bold text-emerald-700 underline">Edit Raw Text</button>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                         <div>
                           <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Incident Type</label>
                           <select name="type" defaultValue={nlpData.type} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                             <option value="Medical">Medical</option>
                             <option value="Food">Food / Water</option>
                             <option value="Shelter">Shelter / Rescue</option>
                             <option value="general">General Incident</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Urgency Level (1-5)</label>
                           <select name="urgency" defaultValue={nlpData.urgency} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                             <option value="5">5 - Critical (Life Threatening)</option>
                             <option value="4">4 - High</option>
                             <option value="3">3 - Moderate</option>
                             <option value="2">2 - Low</option>
                             <option value="1">1 - Monitor</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Zone Location</label>
                           <input name="location" defaultValue={nlpData.location} required placeholder="Coordinates or Address" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                         </div>
                         <div>
                           <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">People Affected</label>
                           <input name="people_affected" defaultValue={nlpData.people_affected} type="number" required placeholder="Estimated count" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                         </div>
                         <div className="col-span-2">
                           <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Detailed Description</label>
                           <textarea name="description" defaultValue={nlpData.description} required rows="3" placeholder="Briefing details..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"></textarea>
                         </div>
                       </div>
                       <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-md w-full transition-colors uppercase tracking-widest text-[14px]">
                         Confirm & Submit Report To Command
                       </button>
                     </form>
                   )}
                 </motion.div>
               )}

               {activeTab === 'Active Tasks' && (
                 <motion.div key="activeTasks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                   {activeTasks.length > 0 ? (
                     <div className="space-y-8">
                       {activeTasks.map(activeTask => (
                         <div key={activeTask.id} className={`bg-white rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 shadow-md relative ${activeTask.status === 'assigned' ? 'shadow-red-500/20' : 'shadow-emerald-500/20'}`}>
                           <div className={`absolute top-0 left-0 w-full h-1 ${activeTask.status === 'assigned' ? 'bg-red-500 shadow-sm' : 'bg-emerald-700 shadow-sm'}`}></div>
                           
                           <div className="p-8">
                             <div className="flex justify-between items-start mb-10">
                               <div>
                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><StatusBadge type="urgency" value={activeTask.urgency} /></motion.div>
                                 <h2 className="font-sans text-[16px] md:text-[20px] text-slate-900 mt-4 leading-tight font-bold tracking-tight">{activeTask.type} Crisis Package</h2>
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
                                   <p className="text-[16px] font-bold text-slate-900">{activeTask.people_affected} Civilians Intact</p>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="bg-slate-50/80 p-8 rounded-2xl border border-slate-200 shadow-inner">
                               <h4 className="font-bold text-[13px] uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-700"></span> Mission Briefing Data</h4>
                               <p className="text-[20px] font-light text-slate-700 leading-relaxed font-sans tracking-wide">{activeTask.description || "No further details provided."}</p>
                               <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">Assigned By: {activeTask.assigned_by || 'Command'}</p>
                                  <p className="text-[12px] text-emerald-500 font-bold tracking-widest uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">T+ {activeTask.createdAt?.toDate ? activeTask.createdAt.toDate().toLocaleTimeString() : 'Unknown'}</p>
                               </div>
                             </div>
                           </div>
                           
                           <div className="bg-slate-50/90 border-t border-slate-200 p-8 flex justify-end gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                             {activeTask.status === 'assigned' ? (
                               <>
                                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-red-700 font-bold tracking-widest uppercase text-[14px] px-5 py-4 border border-red-500/30 hover:bg-red-500/10 rounded-xl transition-colors" onClick={() => handleUpdateTaskStatus(activeTask.id, 'created')}>Decline / Abort</motion.button>
                                 <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900 font-bold tracking-widest uppercase text-[15px] px-8 py-4 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.4)]" onClick={() => handleUpdateTaskStatus(activeTask.id, 'in_progress')}>ACCEPT & LAUNCH</motion.button>
                               </>
                             ) : (
                               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold tracking-widest uppercase text-[16px] px-8 py-5 rounded-xl shadow-[0_10px_40px_rgba(255,255,255,0.2)] transition-colors" onClick={() => handleUpdateTaskStatus(activeTask.id, 'completed')}>VERIFY SECURED & EXTRACT ✅</motion.button>
                             )}
                           </div>
                         </div>
                       ))}
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
                   <MapMock needs={activeTasks.length > 0 ? activeTasks : store.tasks.filter(n => n.status === 'created')} compact={false} />
                 </motion.div>
               )}

                {activeTab === 'Tasks' && (
                 <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white !p-0 overflow-hidden shadow-md rounded-2xl border border-slate-200">
                   <table className="w-full text-left text-[14px]">
                     <thead className="bg-slate-50/60 border-b border-slate-200">
                       <tr>
                         <th className="px-5 py-6 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Task Identity</th>
                         <th className="px-5 py-6 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Geo-Zone</th>
                         <th className="px-5 py-6 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Updated Date</th>
                         <th className="px-5 py-6 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Current Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {store.tasks.filter(t => t.assigned_to === me?.id).map((task, idx) => (
                         <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={task.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-5 py-6 font-bold text-slate-900 text-[15px]">{task.type} Mission</td>
                           <td className="px-5 py-6 font-medium text-slate-700">{task.location}</td>
                           <td className="px-5 py-6 text-slate-500 font-bold tracking-widest uppercase text-[11px]">{task.updatedAt?.toDate ? task.updatedAt.toDate().toLocaleDateString() : 'Unknown'}</td>
                           <td className="px-5 py-6"><StatusBadge type="status" value={task.status} /></td>
                         </motion.tr>
                       ))}
                     </tbody>
                   </table>
                 </motion.div>
               )}

               {activeTab === 'Leaderboard' && (
                 <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white !p-0 overflow-hidden shadow-md rounded-2xl border border-slate-200">
                   <div className="p-8 border-b border-slate-200 bg-slate-50/50">
                     <h3 className="font-sans font-bold text-[20px] text-slate-900 flex items-center gap-2"><span className="text-2xl">🏆</span> Global Hero Rankings</h3>
                     <p className="text-slate-500 text-[14px] font-medium mt-1">Recognizing top volunteers for their life-saving impact.</p>
                   </div>
                   <table className="w-full text-left text-[14px]">
                     <thead className="bg-slate-50/80 border-b border-slate-200">
                       <tr>
                         <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Rank</th>
                         <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Operative</th>
                         <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Skills</th>
                         <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Missions Resolved</th>
                         <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Rating</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {store.users
                         .filter(u => u.role === 'volunteer' || u.role === 'field_worker')
                         .sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))
                         .map((vol, idx) => (
                           <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={vol.id} className={`transition-colors ${idx === 0 ? 'bg-amber-50/30' : idx === 1 ? 'bg-slate-100/30' : idx === 2 ? 'bg-orange-50/30' : 'hover:bg-slate-50/50'}`}>
                             <td className="px-5 py-5">
                               <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-[13px] ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' : idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-slate-50 text-slate-500'}`}>
                                 #{idx + 1}
                               </span>
                             </td>
                             <td className="px-5 py-5 font-bold text-slate-900">{vol.name} {me?.id === vol.id && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase ml-2 tracking-widest border border-emerald-200">You</span>}</td>
                             <td className="px-5 py-5 text-slate-600 text-[13px] font-medium">{(vol.skills || []).slice(0,2).join(', ')}{(vol.skills?.length > 2 ? '...' : '')}</td>
                             <td className="px-5 py-5 font-bold text-emerald-700 text-[16px]">{vol.tasksCompleted || 0}</td>
                             <td className="px-5 py-5 text-amber-600 font-bold flex items-center gap-1">⭐ {vol.rating || '5.0'}</td>
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
