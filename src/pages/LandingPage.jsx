import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { useToast } from '../App';
import { motion } from 'framer-motion';
import communityActionOne from '../assets/community-action-1.jpg';
import ProcessSection from '../components/landing/ProcessSection';
import TopBar from '../components/layout/TopBar';

const AnimatedCounter = ({ from = 0, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percent = Math.min(progress / (duration * 1000), 1);
      const ease = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
      setCount(Math.floor(from + (to - from) * ease));
      if (percent < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <>{count}</>;
};

export default function LandingPage() {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('NGO'); 
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    showToast(`Authenticating Credentials...`, 'info');
    setTimeout(() => {
      navigate(activeTab === 'Admin' ? '/admin' : activeTab === 'NGO' ? '/ngo' : '/volunteer');
    }, 1000);
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.6 } }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] bg-white border border-slate-300 rounded px-3 py-2 text-sm font-semibold text-slate-900">
        Skip to main content
      </a>
      
      <TopBar onSignIn={() => setLoginModalOpen(true)} />

      <main id="main-content" className="pt-[72px] relative z-10 w-full">
        
        {/* Core Hero Layout (Serious, split screen styling) */}
        <div className="flex flex-col lg:flex-row min-h-[80vh] w-full">
          
          {/* Left Text Block */}
          <motion.div initial="hidden" animate="show" variants={{show: {transition: {staggerChildren: 0.1}}}} className="w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-20 py-16 lg:py-0">
            <motion.span variants={itemVars} className="text-emerald-700 text-[12px] font-bold uppercase py-1.5 px-4 rounded bg-emerald-50 w-max mb-6 tracking-wide border border-emerald-100">
              Google Solution Challenge 2025
            </motion.span>
            
            <motion.h1 variants={itemVars} className="text-[48px] lg:text-[56px] font-sans font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Connecting Communities. <br/><span className="text-emerald-700">Mobilising Hope.</span>
            </motion.h1>
            
            <motion.p variants={itemVars} className="text-[18px] text-slate-600 mb-10 max-w-[550px] leading-relaxed">
              We provide a secure, AI-driven orchestration platform for humanitarian organizations. Turning disparate field reports into verified, targeted action immediately.
            </motion.p>
            
            <motion.div variants={itemVars} className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
              <Link to="/join-ngo" className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3.5 rounded-md text-[15px] font-medium transition-colors flex items-center justify-center gap-2" aria-label="Register your organization">
                Register Organization <ArrowRight size={18} />
              </Link>
              <Link to="/join-volunteer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-8 py-3.5 rounded-md text-[15px] font-medium transition-colors text-center" aria-label="Join as a volunteer">
                Join as Volunteer
              </Link>
            </motion.div>

            <motion.div variants={itemVars} className="flex gap-12 items-center border-l-4 border-emerald-100 pl-6 mt-4">
               <div className="flex flex-col">
                 <span className="text-[32px] font-bold text-slate-900 leading-tight"><AnimatedCounter to={847} />+</span>
                 <span className="text-[13px] text-slate-500 font-medium mt-1">Verified Operations</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[32px] font-bold text-slate-900 leading-tight"><AnimatedCounter to={230} />+</span>
                 <span className="text-[13px] text-slate-500 font-medium mt-1">Active Personnel</span>
               </div>
            </motion.div>
          </motion.div>

          {/* Right Image Block */}
          <div className="w-full lg:w-[50%] relative h-[500px] lg:h-auto bg-slate-100">
             <img src={communityActionOne} alt="Community Bridge field action" className="w-full h-full object-cover object-center" loading="eager" fetchPriority="high" decoding="async" />
             {/* Small professional inset metric over the image */}
             <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center"><CheckCircle size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900 text-[15px]">Data Verified</p>
                  <p className="text-slate-500 text-[13px]">Real-time field telemetry</p>
                </div>
             </div>
          </div>
        </div>

        <ProcessSection />
      </main>

      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} title="Platform Authentication">
        <div className="flex bg-slate-100 p-1.5 rounded-md border border-slate-200 mb-6">
          {['NGO', 'Volunteer', 'Admin'].map(tab => (
            <button key={tab} type="button" className={`flex-1 py-2 font-medium text-[14px] transition-all rounded ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <form onSubmit={handleLogin} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Registered Email</label>
            <input type="email" required className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-[15px] outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" placeholder="e.g., admin@organization.org" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" required className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-[15px] outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" placeholder="••••••••" />
          </div>
          <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-md w-full py-3 mt-4 text-[15px] font-medium transition-colors">Sign In</button>
        </form>
      </Modal>
    </div>
  );
}
