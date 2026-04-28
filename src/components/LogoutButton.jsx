import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, clearDemoSession } from '../firebaseStore';

export default function LogoutButton({ className = '', label = 'Log Out' }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      clearDemoSession();
      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800 ${className}`}
      aria-label="Log out of the current dashboard"
    >
      {label}
    </button>
  );
}