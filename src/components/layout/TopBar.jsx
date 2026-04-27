import { Link } from 'react-router-dom';

export default function TopBar({ onSignIn }) {
  return (
    <nav aria-label="Primary" className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
      <div className="flex justify-between items-center px-8 md:px-12 h-[72px] max-w-[1400px] mx-auto">
        <Link to="/" className="font-sans font-bold text-[18px] text-slate-900 flex items-center cursor-pointer" aria-label="Go to home">
          <span className="text-emerald-700 mr-2 text-[20px]">🌱</span> CommunityBridge
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
          <Link to="/features" className="hover:text-emerald-700 transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-emerald-700 transition-colors">Methodology</Link>
          <Link to="/impact" className="hover:text-emerald-700 transition-colors">Our Impact</Link>
        </div>

        {onSignIn ? (
          <button
            type="button"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-2.5 rounded-md transition-colors text-[14px]"
            onClick={onSignIn}
            aria-label="Open sign in dialog"
          >
            Sign In
          </button>
        ) : (
          <Link
            to="/"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-2.5 rounded-md transition-colors text-[14px]"
            aria-label="Go to sign in on home page"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
