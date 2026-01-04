import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { UserAuth } from '../../context/AuthContext';
import { Loader2, MailWarning } from 'lucide-react'; // Added MailWarning

const Layout = () => {
  const { user, loading, logOut } = UserAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // --- NEW: EMAIL VERIFICATION CHECK ---
  // If user signed up via Password (not Google) and hasn't verified yet
  if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <MailWarning size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Verify your email</h1>
          <p className="text-slate-400 mb-6">
            We sent a verification link to <span className="text-slate-200 font-medium">{user.email}</span>. 
            Please check your inbox (and spam) to unlock your dashboard.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              I've Verified It
            </button>
            <button 
              onClick={() => logOut()} 
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="pl-24 pr-8 py-8 w-full min-h-screen transition-all">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;