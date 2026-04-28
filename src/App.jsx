import { lazy, Suspense, useState, useEffect, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { seedDatabase, auth, useStore } from './firebaseStore';

const MainAdminPage = lazy(() => import('./pages/MainAdminPage'));
const NGODashboardPage = lazy(() => import('./pages/NGODashboardPage'));
const VolunteerDashboardPage = lazy(() => import('./pages/VolunteerDashboardPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

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
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none" role="status" aria-live="polite" aria-atomic="true">
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
              role="alert"
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

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-medium">
          Loading interface...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<MainAdminPage />} />
        <Route path="/ngo" element={<NGODashboardPage />} />
        <Route path="/volunteer" element={<VolunteerDashboardPage />} />
        <Route path="/join-ngo" element={<RegisterPage defaultType="NGO" />} />
        <Route path="/join-volunteer" element={<RegisterPage defaultType="Volunteer" />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<MethodologyPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  return (
    <ToastManager>
      <AppRoutes />
      {/* Developer quick-nav removed in production */}
    </ToastManager>
  );
}
