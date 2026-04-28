import { useState } from 'react';
import { useStore, markNotificationAsRead } from '../firebaseStore';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const store = useStore();
  const [isOpen, setIsOpen] = useState(false);

  // Take latest 20 notifications
  const notifications = (store.notifications || []).slice(0, 20);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-50 border-red-200 text-red-800';
    if (priority === 'medium') return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-white border-slate-200 text-slate-800';
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={24} className="text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 max-h-[500px] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-[14px]">Notifications</h3>
                {unreadCount > 0 && <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{unreadCount} Unread</span>}
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-[13px] font-medium">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-xl border ${getPriorityColor(n.priority)} ${n.read ? 'opacity-60' : 'opacity-100 shadow-sm'} transition-opacity`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{n.type.replace('_', ' ')}</span>
                        {!n.read && (
                          <button onClick={(e) => handleMarkAsRead(n.id, e)} className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                            Mark Read
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-[13px] leading-tight mb-1">{n.title}</h4>
                      <p className="text-[12px] opacity-80 leading-relaxed mb-3">{n.message}</p>
                      <div className="text-[10px] font-medium opacity-60">
                        {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleString() : 'Just now'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
