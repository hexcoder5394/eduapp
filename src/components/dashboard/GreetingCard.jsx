import React, { useState, useEffect } from 'react';
import { UserAuth } from '../../context/AuthContext';
import { Sun, Moon, Sunrise, Coffee } from 'lucide-react';

const GreetingCard = () => {
  const { user } = UserAuth();
  const [greeting, setGreeting] = useState({ text: 'Hello', icon: Sun, color: 'text-amber-500' });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 1. Update Time Live
    const timer = setInterval(() => setTime(new Date()), 60000);

    // 2. Determine Greeting
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting({ 
        text: 'Good Morning', 
        icon: Sunrise, 
        color: 'text-amber-400',
        subtext: 'Ready to seize the day?'
      });
    } else if (hour >= 12 && hour < 18) {
      setGreeting({ 
        text: 'Good Afternoon', 
        icon: Sun, 
        color: 'text-orange-500',
        subtext: 'Keep up the momentum!'
      });
    } else {
      setGreeting({ 
        text: 'Good Evening', 
        icon: Moon, 
        color: 'text-indigo-400',
        subtext: 'Time to wrap up & relax.'
      });
    }

    return () => clearInterval(timer);
  }, []);

  const displayName = user?.firstName || (user?.displayName ? user.displayName.split(' ')[0] : 'User');
  const Icon = greeting.icon;

  return (
    <div className="h-full min-h-[160px] flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden relative group">
      
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 ${greeting.color}`}>
        <Icon size={120} />
      </div>

      {/* Content with Animation */}
      <div className="z-10 animate-fade-in-up">
        {/* Dynamic Icon */}
        <div className={`mb-3 p-3 w-fit rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${greeting.color} shadow-lg ring-1 ring-white/5`}>
           <Icon size={24} className="animate-pulse-slow" /> 
        </div>

        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          {greeting.text}, <br />
          <span className="text-indigo-400">{displayName}</span>
        </h2>
        
        <p className="text-xs text-slate-500 mt-2 font-medium">
          {greeting.subtext}
        </p>
      </div>

      {/* Live Time Badge */}
      <div className="absolute bottom-4 right-4">
        <span className="text-[10px] font-mono text-slate-600 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-800">
           {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default GreetingCard;