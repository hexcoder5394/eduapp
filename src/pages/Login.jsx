import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createUserProfile } from '../lib/db'; 
import { Boxes, Mail, Lock, ArrowRight, AlertCircle, User, Briefcase } from 'lucide-react';

const Login = () => {
  const { googleSignIn, emailSignIn, emailSignUp, sendVerification, user } = UserAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (user != null) navigate('/');
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try { await googleSignIn(); } catch (error) { console.log(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await emailSignIn(email, password);
        navigate('/'); 
      } else {
        const userCredential = await emailSignUp(email, password);
        const userId = userCredential.user.uid;
        await createUserProfile(userId, { firstName, lastName, age, profession, email, photoUrl: '' });
        await sendVerification();
        navigate('/');
      }
    } catch (err) {
      let msg = err.message.replace('Firebase: ', '');
      if (msg.includes('auth/email-already-in-use')) msg = 'Email already in use.';
      if (msg.includes('auth/invalid-credential')) msg = 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center bg-slate-950 overflow-hidden px-4'>
      
      {/* --- CSS ANIMATIONS --- */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-float-delayed { animation: float 12s ease-in-out infinite reverse; }
        .animate-entrance { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* --- BACKGROUND EFFECTS --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Animated Glowing Orbs */}
      <div className="absolute left-0 top-0 -translate-x-[30%] -translate-y-[30%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none animate-float"></div>
      <div className="absolute right-0 bottom-0 translate-x-[30%] translate-y-[30%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none animate-float-delayed"></div>

      {/* --- LOGIN CARD --- */}
      <div className='relative z-10 flex w-full max-w-[450px] flex-col items-center gap-6 rounded-2xl bg-slate-900/80 p-8 shadow-2xl ring-1 ring-slate-800 backdrop-blur-xl animate-entrance'>
        
        {/* Header Section */}
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/20'>
            <Boxes size={28} className='text-indigo-500' />
          </div>
          
          <div>
            <h1 className='text-2xl font-bold text-slate-100 tracking-tight'>
              {isLogin ? 'Welcome back to EduManager' : 'Get started with EduManager'}
            </h1>
            <p className='text-sm text-slate-400 mt-1'>
              {isLogin 
                ? 'Sign in to continue your learning journey.' 
                : 'Create an account to track your progress.'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='flex items-center gap-3 w-full rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 animate-pulse'>
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4'>
          
          {/* Sign Up Fields (Hidden on Login) */}
          {!isLogin && (
            <div className="flex flex-col gap-4 animate-entrance">
              <div className="flex gap-3">
                <div className='relative flex-1'>
                  <User className='absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
                  <input 
                    type="text" placeholder="First Name" required 
                    className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-9 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                </div>
                <div className='relative flex-1'>
                  <input 
                    type="text" placeholder="Last Name" required 
                    className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-4 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                 <div className='relative flex-1'>
                    <Briefcase className='absolute left-3 top-3.5 h-4 w-4 text-slate-500' />
                    <input 
                      type="text" placeholder="Profession" required 
                      className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-9 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
                      onChange={(e) => setProfession(e.target.value)} 
                    />
                 </div>
                 <div className='relative w-24'>
                    <input 
                      type="number" placeholder="Age" required 
                      className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-4 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
                      onChange={(e) => setAge(e.target.value)} 
                    />
                 </div>
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className='relative group'>
            <Mail className='absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors' />
            <input 
              type="email" placeholder="Email address" required 
              className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-9 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className='relative group'>
            <Lock className='absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors' />
            <input 
              type="password" placeholder="Password" required 
              className='w-full rounded-xl bg-slate-950/50 border border-slate-700 py-3 pl-9 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 hover:bg-slate-900' 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading} 
            className='group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition-all hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} className='transition-transform group-hover:translate-x-1' />}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className='w-full border-t border-slate-800 pt-5 text-center'>
          <p className='text-sm text-slate-500'>
            {isLogin ? "New here?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className='ml-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline'
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;