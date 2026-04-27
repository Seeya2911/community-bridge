import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getStore, setStore } from '../mockData';
import { useToast } from '../App';
import communityActionTwo from '../assets/community-action-2.jpg';
import RegisterVisualPanel from '../components/register/RegisterVisualPanel';

export default function RegisterPage({ defaultType = 'NGO' }) {
  const [formType, setFormType] = useState(defaultType); // NGO or Volunteer
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submitRegistration = (e) => {
    e.preventDefault();
    const store = getStore();
    const isNgo = formType === 'NGO';
    const form = new FormData(e.target);
    
    const payload = {
      id: Date.now(), 
      name: form.get('name'), 
      email: form.get('email'),
      contact: form.get('contact'),
      status: "pending", 
      appliedDate: new Date().toISOString().split('T')[0]
    };

    if (isNgo) {
      store.ngoRequests.push({ ...payload, regNumber: form.get('regNumber'), address: form.get('address'), website: form.get('website'), docs: ["Docs"] });
    } else {
      store.volunteerRequests.push({ ...payload, ngo: form.get('targetNgo'), gender: form.get('gender'), skills: [form.get('skills')], description: form.get('description'), doneVolunteering: form.get('doneVolunteering') === 'on' });
    }
    
    setStore(store);
    showToast("Application submitted successfully! Redirecting...");
    setTimeout(() => { navigate('/'); }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <a href="#registration-form" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] bg-white border border-slate-300 rounded px-3 py-2 text-sm font-semibold text-slate-900">
        Skip to registration form
      </a>
      {/* Left Form Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-20 py-16 bg-white overflow-y-auto">
        <Link to="/" className="font-sans font-bold text-[20px] tracking-wide text-[var(--cb-green)] mb-12 flex items-center cursor-pointer hover:opacity-80 transition-opacity" aria-label="Go back to home page">
          ← CommunityBridge
        </Link>
        
        <h1 className="font-sans text-[20px] font-bold text-slate-800 mb-2">Join the Platform</h1>
        <p className="text-slate-500 mb-10 font-medium">Be part of the rapid response network. Verified accounts usually get access within 24 hours.</p>

        <div className="flex bg-slate-100 p-1.5 rounded-lg mb-8 border border-slate-200 shadow-inner">
          <button 
            type="button"
            aria-pressed={formType === 'NGO'}
            className={`flex-1 py-3 text-[14px] font-bold rounded-md transition-all ${formType === 'NGO' ? 'bg-white text-[var(--cb-green)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setFormType('NGO')}
          >
            Register as NGO
          </button>
          <button 
            type="button"
            aria-pressed={formType === 'Volunteer'}
            className={`flex-1 py-3 text-[14px] font-bold rounded-md transition-all ${formType === 'Volunteer' ? 'bg-white text-[var(--cb-green)] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setFormType('Volunteer')}
          >
            Register as Volunteer
          </button>
        </div>

        <motion.form id="registration-form" key={formType} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submitRegistration} className="space-y-6" aria-live="polite">
          {formType === 'NGO' && (
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Organisation Name</label>
                <input required name="name" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g., Asha Foundation" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Registration ID</label>
                <input required name="regNumber" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="NGO/MH/2021..." />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Official Email</label>
                <input required type="email" name="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="contact@ngo.org" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Contact Number</label>
                <input required name="contact" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Website Link</label>
                <input name="website" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Headquarters Address</label>
                <textarea required name="address" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" rows="2" placeholder="Full Location Details"></textarea>
              </div>
              <div className="col-span-2 bg-slate-50 p-8 rounded-xl border border-slate-200">
                <label className="block text-[12px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Upload Verification Docs</label>
                <p className="text-[12px] text-slate-500 mb-4 font-medium">Please include Registration Certificate, PAN Card, and 80G/12A.</p>
                <input type="file" multiple className="w-full text-[13px] text-slate-500 file:mr-4 file:py-2.5 file:px-8 file:rounded-full file:border-0 file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-colors file:cursor-pointer cursor-pointer" />
              </div>
            </div>
          )}

          {formType === 'Volunteer' && (
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Target NGO Affiliation</label>
                <select required name="targetNgo" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="">Which active platform NGO do you want to join?</option>
                  <option value="Asha Foundation">Asha Foundation</option>
                  <option value="Sahyog Trust">Sahyog Trust</option>
                  <option value="GreenHope NGO">GreenHope NGO</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Full Name</label>
                <input required name="name" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g., Priya Sharma" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Gender</label>
                <select required name="gender" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Primary Field Skill</label>
                <select required name="skills" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  <option value="Medical">Medical / First Aid Responder</option>
                  <option value="Teaching">Education / Teaching Tutoring</option>
                  <option value="Logistics">Logistics / Supply Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
                <input required type="email" name="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="priya@example.com" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Contact Number</label>
                <input required name="contact" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="+91 98765 00000" />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Why do you want to join this mission?</label>
                <textarea required name="description" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" rows="2" placeholder="Briefly describe your motivation..."></textarea>
              </div>
              <div className="col-span-2 bg-slate-50 p-8 rounded-lg border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-8">
                <div className="flex-1 w-full">
                  <label className="block text-[12px] font-bold text-slate-600 mb-3 uppercase tracking-wide">Upload Identity Proof</label>
                  <input type="file" className="w-full text-[13px] text-slate-500 file:mr-4 file:py-2 file:px-8 file:rounded-full file:border-0 file:font-bold file:bg-blue-100 file:text-blue-700 cursor-pointer" />
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-white px-8 py-4 rounded-xl border border-slate-200 shadow-sm">
                  <input type="checkbox" name="doneVolunteering" className="w-5 h-5 text-[var(--cb-green)] rounded" />
                  <label className="text-[14px] font-bold text-slate-700">Prior Experience?</label>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-6">
            <button type="submit" className="bg-gradient-to-r from-emerald-500 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-slate-900 rounded-xl w-full py-4 shadow-xl text-[16px] font-bold uppercase tracking-wide transition-all">
              Submit Application
            </button>
          </div>
        </motion.form>
      </div>

      <RegisterVisualPanel imageSrc={communityActionTwo} />
    </div>
  );
}
