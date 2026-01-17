import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// CRITICAL FIX: Added 'BrainCircuit' to this list
import { LayoutDashboard, Library, FolderGit2, LogOut, Menu, Zap, User, BrainCircuit } from 'lucide-react';
import { UserAuth } from '../../context/AuthContext';
import UserLevel from './UserLevel'; 

const Sidebar = () => {
  const { logOut } = UserAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={24} /> },
    { name: 'Courses', path: '/courses', icon: <Library size={24} /> },
    { name: 'Projects', path: '/projects', icon: <FolderGit2 size={24} /> },
    { name: 'Flashcards', path: '/flashcards', icon: <BrainCircuit size={24} /> }, // This caused the error!
    { name: 'Profile', path: '/profile', icon: <User size={24} /> },
  ];

  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`fixed left-0 top-0 z-50 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col justify-between ${
        isExpanded ? 'w-64 shadow-2xl shadow-black/50' : 'w-20'
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Logo / Header */}
        <div className={`flex items-center gap-3 p-5 h-20 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
          <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xl">
            E
          </div>
          <span className={`text-xl font-bold text-slate-100 whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
          }`}>
            EduManager
          </span>
        </div>

        {/* Level Widget - Only show full widget when expanded */}
        <div className="px-3 mb-4 overflow-hidden">
           {isExpanded ? (
             <div className="animate-fade-in">
               <UserLevel />
             </div>
           ) : (
             <div className="flex justify-center py-2">
               <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                 <Zap size={20} />
               </div>
             </div>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-3 py-3 transition-all whitespace-nowrap overflow-hidden ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                } ${isExpanded ? 'justify-start' : 'justify-center'}`
              }
            >
              <div className="min-w-[1.5rem]">{item.icon}</div>
              <span className={`font-medium transition-opacity duration-200 ${
                isExpanded ? 'opacity-100' : 'opacity-0 hidden'
              }`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section (Sign Out) */}
      <div className="p-3">
        <button
          onClick={handleSignOut}
          className={`flex w-full items-center gap-4 rounded-xl px-3 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors whitespace-nowrap overflow-hidden ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <div className="min-w-[1.5rem]"><LogOut size={24} /></div>
          <span className={`font-medium transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 hidden'
          }`}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;