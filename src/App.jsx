import { useState, useEffect, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MainAdminPage from './pages/MainAdminPage';
import NGODashboardPage from './pages/NGODashboardPage';
import VolunteerDashboardPage from './pages/VolunteerDashboardPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import { initializeStore } from './mockData';

// ---- Toast Subsystem ----
const ToastContext = createContext({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

function ToastManager({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`px-8 py-4 rounded-xl shadow-md font-bold font-sans text-[14px] flex items-center min-w-[300px] border tracking-wide pointer-events-auto ${
                t.type === 'success' ? 'bg-emerald-900 border-emerald-500 text-emerald-700' : 
                t.type === 'error' ? 'bg-red-900 border-red-500 text-red-700' : 
                'bg-white border-slate-200 text-slate-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-4 ${
                t.type === 'success' ? 'bg-emerald-400' : 
                t.type === 'error' ? 'bg-red-400' : 
                'bg-slate-400'
              }`}></div>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
// --------------------------

export default function App() {
  useEffect(() => {
    initializeStore();
  }, []);

  const path = window.location.pathname;

  let PageComponent;
  if (path === '/admin') {
    PageComponent = <MainAdminPage />;
  } else if (path === '/ngo') {
    PageComponent = <NGODashboardPage />;
  } else if (path === '/volunteer') {
    PageComponent = <VolunteerDashboardPage />;
  } else if (path === '/join-ngo') {
    PageComponent = <RegisterPage defaultType="NGO" />;
  } else if (path === '/join-volunteer') {
    PageComponent = <RegisterPage defaultType="Volunteer" />;
  } else if (path === '/features' || path === '/how-it-works' || path === '/impact') {
    PageComponent = (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col text-center">
        <h1 className="font-sans text-[60px] font-bold text-emerald-700 mb-8 tracking-tight">Offline Sector</h1>
        <p className="text-slate-600 font-medium text-[20px]">The databank for `{path}` has not been initialized yet.</p>
        <a href="/" className="mt-12 bg-emerald-700 hover:bg-emerald-800 text-slate-900 font-bold tracking-widest uppercase px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all">Return to Command Center</a>
      </div>
    );
  } else {
    PageComponent = <LandingPage />;
  }

  return (
    <ToastManager>
      {PageComponent}
      {/* Dev Page Accessor */}
      <div className="fixed bottom-4 left-4 z-[999] flex gap-2 bg-white  p-2 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pl-2 pr-2 flex items-center">Dev</span>
        <a href="/" className="px-3 py-1.5 bg-white hover:bg-slate-700 text-slate-900 text-[11px] rounded-lg transition-colors font-bold tracking-widest uppercase shadow-inner">Landing</a>
        <a href="/ngo" className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] rounded-lg border border-emerald-500/30 transition-colors font-bold tracking-widest uppercase">NGO</a>
        <a href="/volunteer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] rounded-lg border border-blue-500/30 transition-colors font-bold tracking-widest uppercase">Volunteer</a>
        <a href="/admin" className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] rounded-lg border border-purple-500/30 transition-colors font-bold tracking-widest uppercase">Admin</a>
      </div>
    </ToastManager>
  );
}
