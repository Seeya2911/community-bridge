import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, setDemoSession } from '../firebaseStore';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '../App';
import communityActionTwo from '../assets/community-action-2.jpg';
import RegisterVisualPanel from '../components/register/RegisterVisualPanel';
import { initialData as demoData } from '../mockData';

const demoAccounts = [
  ...(demoData.users || []),
  ...(demoData.ngoRequests || []).filter(account => account.username && account.password),
  ...(demoData.volunteerRequests || []).filter(account => account.username && account.password)
];

const findDemoAccount = (email, password) => {
  const normalizedEmail = String(email).toLowerCase();
  return demoAccounts.find(account => String(account.email || account.username || '').toLowerCase() === normalizedEmail && account.password === password) || null;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);
    const email = form.get('email');
    const password = form.get('password');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Check role
      if (email === 'admin@communitybridge.org') {
        navigate('/admin');
      } else {
        const userDoc = await getDoc(doc(db, 'Users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role === 'ngo') navigate('/ngo');
          else if (data.role === 'volunteer' || data.role === 'field_worker') navigate('/volunteer');
          else if (data.role === 'admin') navigate('/admin');
          else navigate('/');
        } else {
          navigate('/');
        }
      }
      showToast("Logged in successfully!", "success");
    } catch (error) {
      const demoAccount = findDemoAccount(email, password);
      if (error?.code === 'auth/invalid-credential' && demoAccount) {
        setDemoSession({
          uid: demoAccount.id,
          email: demoAccount.email || demoAccount.username,
          role: demoAccount.role || (demoAccount.name === 'Admin' ? 'admin' : 'ngo')
        });

        if (demoAccount.role === 'admin' || demoAccount.name === 'Admin') navigate('/admin');
        else if (demoAccount.role === 'ngo') navigate('/ngo');
        else navigate('/volunteer');

        showToast(`Logged in as ${demoAccount.name || demoAccount.email || 'demo user'}`, 'success');
        setLoading(false);
        return;
      }

      console.error(error);
      showToast(`Login failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Form Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-20 py-16 bg-white overflow-y-auto">
        <Link to="/" className="font-sans font-bold text-[20px] tracking-wide text-[var(--cb-green)] mb-12 flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          ← CommunityBridge
        </Link>
        
        <h1 className="font-sans text-[30px] font-bold text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-10 font-medium">Log in to your command center.</p>

        <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-[13px] text-slate-700">
          <p className="font-bold uppercase tracking-widest text-emerald-700 mb-2">Demo accounts</p>
          <div className="space-y-1">
            <p>Admin: admin@communitybridge.org / ADMIN@2025</p>
            <p>NGO: asha@ngo.org / ASHA@2025</p>
            <p>NGO: green@hope.org / GH@2025</p>
            <p>Volunteer: priya@gmail.com / PS@2025</p>
            <p>Volunteer: rahul@gmail.com / RM@2025</p>
            <p>Field worker: meena@field.local / MEENA@2025</p>
          </div>
        </div>

        <motion.form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
            <input required type="email" name="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Password</label>
            <input required type="password" name="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
          </div>
          
          <div className="pt-6">
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-slate-900 rounded-xl w-full py-4 shadow-xl text-[16px] font-bold uppercase tracking-wide transition-all disabled:opacity-50">
              {loading ? "Authenticating..." : "Login Securely"}
            </button>
          </div>
        </motion.form>
      </div>

      <RegisterVisualPanel imageSrc={communityActionTwo} />
    </div>
  );
}
