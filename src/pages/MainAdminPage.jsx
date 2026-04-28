import { useState } from 'react';
import { useStore, db, approveNGO, rejectNGO } from '../firebaseStore';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../App';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import NotificationBell from '../components/NotificationBell';
import LogoutButton from '../components/LogoutButton';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';

export default function MainAdminPage() {
  const store = useStore();
  const [activeNav, setActiveNav] = useState('Overview');
  const [reqTab, setReqTab] = useState('NGO'); // NGO or Volunteer
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [taskUrgencyFilter, setTaskUrgencyFilter] = useState('All');
  const [taskLocationFilter, setTaskLocationFilter] = useState('');
  const { showToast } = useToast();

  if (store.loading) return <div className="p-8 text-slate-900">Loading Framework...</div>;

  if (!store.userRole) return <Navigate to="/login" replace />;
  if (store.userRole !== 'admin') return <Navigate to="/" replace />;

  const handleStatusChange = async (type, id, newStatus) => {
    try {
      if (type === 'NGO') {
        if (newStatus === 'approved') await approveNGO(id);
        if (newStatus === 'rejected') await rejectNGO(id);
      } else {
        const payload = { status: newStatus };
        if (newStatus === 'approved') payload.verifiedAt = new Date().toISOString();
        await updateDoc(doc(db, 'Users', String(id)), payload);
      }
      showToast(`${type} request ${newStatus}.`, newStatus === 'approved' ? 'success' : 'error');
    } catch (e) {
      console.error(e);
      showToast(`Error updating ${type} request`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex font-sans">
      {/* Immersive Left Sidebar */}
      <div className="w-[260px] bg-white  border-r border-slate-200 text-slate-900 flex flex-col shrink-0">
        <div className="h-[72px] flex items-center px-5 border-b border-slate-200">
          <span className="font-sans text-[16px] tracking-wide font-bold text-emerald-700">🌱 Global Admin</span>
        </div>
        
        <div className="flex flex-col flex-1 py-8 space-y-1">
          {['Overview', 'Requests', 'Global Tasks', 'NGO Management', 'Volunteer Management', 'System Settings'].map(nav => (
            <button 
              key={nav}
              onClick={() => setActiveNav(nav)}
              className={`text-left px-5 py-3.5 font-bold text-[14px] transition-all duration-300 relative ${activeNav === nav ? 'text-slate-900 bg-white/5' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {activeNav === nav && <motion.div layoutId="navIndicator" className="absolute left-0 top-0 bottom-0 w-[4px] bg-emerald-700"></motion.div>}
              {nav}
            </button>
          ))}
        </div>
        
        <button className="p-8 text-left text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors border-t border-slate-200">
          Secure Logout Session
        </button>
      </div>

      {/* Main Content Area */}
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="font-sans text-2xl text-slate-900 font-bold tracking-tight">{activeNav}</h1>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <LogoutButton label="Log Out" />
            </div>
          </div>

          {activeNav === 'Overview' && (
            <div className="space-y-8 w-full mx-auto">
              <div className="grid grid-cols-4 gap-8">
                <StatCard value={store.users.filter(n=>n.role === 'ngo' && n.status==='approved').length} label="Total Verified NGOs" trend="1" />
                <StatCard value={store.users.filter(n=>(n.role === 'volunteer' || n.role === 'field_worker') && (n.status==='approved' || n.status==='active')).length} label="Active Volunteers" trend="12%" />
                <StatCard value={store.tasks.length} label="Total Global Tasks" trend="45" />
                <StatCard value={store.tasks.filter(n=>n.status==='completed').length} label="Successful Resolutions" trend="20" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="bg-white  rounded-2xl border border-slate-200 p-8 shadow-md">
                   <h3 className="font-sans text-2xl font-bold mb-4 text-slate-900">System Architecture Health</h3>
                   <div className="h-64 flex items-center justify-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">Core operational metrics mapped successfully.</div>
                 </div>
                 <div className="bg-white  rounded-2xl border border-slate-200 p-8 shadow-md">
                   <h3 className="font-sans text-2xl font-bold mb-4 text-slate-900">Global Deployment Map</h3>
                   <div className="h-64 flex items-center justify-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">Geospatial telemetry awaiting sync.</div>
                 </div>
              </div>
            </div>
          )}

          {activeNav === 'Requests' && (
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full mx-auto bg-white  rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-md">
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button className={`flex-1 py-4 px-8 text-[14px] font-bold transition-all uppercase tracking-widest ${reqTab === 'NGO' ? 'text-emerald-700 border-b-2 border-emerald-400 bg-white/5' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setReqTab('NGO')}>NGO Alliance Requests</button>
                <button className={`flex-1 py-4 px-8 text-[14px] font-bold transition-all uppercase tracking-widest ${reqTab === 'Volunteer' ? 'text-emerald-700 border-b-2 border-emerald-400 bg-white/5' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setReqTab('Volunteer')}>Volunteer Network Requests</button>
              </div>

              <div className="flex-1 overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-slate-50/80  border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Identity</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">{reqTab === 'NGO' ? 'Reg Number' : 'Skillset'}</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Contact Relay</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">System Status</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(reqTab === 'NGO' ? store.users.filter(u => u.role === 'ngo') : store.users.filter(u => u.role === 'volunteer' || u.role === 'field_worker')).map((req) => (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900 text-[15px]">{req.name}</p>
                          <p className="text-[12px] text-slate-600 font-medium tracking-wide">Applied {req.appliedDate}</p>
                        </td>
                        <td className="px-5 py-5 font-medium text-slate-700">{reqTab === 'NGO' ? req.regNumber || 'N/A' : (req.skills ? req.skills.join(', ') : 'N/A')}</td>
                        <td className="px-5 py-5 font-medium text-slate-700">{req.email}</td>
                        <td className="px-5 py-5"><StatusBadge type="status" value={req.status} /></td>
                        <td className="px-5 py-5 text-right flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {req.status === 'pending' && (
                              <>
                                <button className="text-emerald-700 font-bold text-[12px] bg-emerald-500/10 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors" onClick={() => handleStatusChange(reqTab, req.id, 'approved')}>Authorize</button>
                                <button className="text-red-700 font-bold text-[12px] bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors" onClick={() => handleStatusChange(reqTab, req.id, 'rejected')}>Reject</button>
                              </>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeNav === 'Global Tasks' && (
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-md">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex gap-4">
                <select className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] outline-none" value={taskStatusFilter} onChange={e=>setTaskStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="created">Created</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] outline-none" value={taskUrgencyFilter} onChange={e=>setTaskUrgencyFilter(e.target.value)}>
                  <option value="All">All Urgencies</option>
                  <option value="5">Critical (5)</option>
                  <option value="4">High (4)</option>
                  <option value="3">Moderate (3)</option>
                  <option value="2">Low (2)</option>
                </select>
                <input type="text" placeholder="Filter by Location..." className="px-5 py-2.5 flex-1 rounded-xl bg-white border border-slate-200 text-[14px] outline-none" value={taskLocationFilter} onChange={e=>setTaskLocationFilter(e.target.value)} />
              </div>
              <div className="flex-1 overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Task Type</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Location</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Urgency</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">People Affected</th>
                      <th className="px-5 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {store.tasks.filter(t => {
                      if (taskStatusFilter !== 'All' && t.status !== taskStatusFilter) return false;
                      if (taskUrgencyFilter !== 'All' && String(t.urgency) !== String(taskUrgencyFilter)) return false;
                      if (taskLocationFilter && !t.location?.toLowerCase().includes(taskLocationFilter.toLowerCase())) return false;
                      return true;
                    }).map((task) => (
                      <tr key={task.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-5 font-bold text-slate-900 text-[15px]">{task.type}</td>
                        <td className="px-5 py-5 font-medium text-slate-700">{task.location}</td>
                        <td className="px-5 py-5"><StatusBadge type="urgency" value={task.urgency} /></td>
                        <td className="px-5 py-5 font-medium text-slate-700">{task.people_affected}</td>
                        <td className="px-5 py-5"><StatusBadge type="status" value={task.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {['NGO Management', 'Volunteer Management', 'System Settings'].includes(activeNav) && (
            <div className="flex items-center justify-center h-[500px] border-2 border-dashed border-slate-200 rounded-2xl bg-white/20">
              <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">{activeNav} Framework Initiating...</p>
            </div>
          )}

        </div>
      </motion.main>
    </div>
  );
}
