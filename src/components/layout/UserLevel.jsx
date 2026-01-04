import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Changed import
import { UserAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

const UserLevel = () => {
  const { user } = UserAuth();
  const [totalMinutes, setTotalMinutes] = useState(0);

  // Simple Level Logic
  const LEVELS = [
    { level: 1, minXP: 0, title: "Novice" },
    { level: 2, minXP: 500, title: "Apprentice" },
    { level: 3, minXP: 1500, title: "Scholar" },
    { level: 4, minXP: 3000, title: "Specialist" },
    { level: 5, minXP: 5000, title: "Architect" },
  ];

  useEffect(() => {
    if (!user) return;
    
    // SWITCHED TO REAL-TIME LISTENER (onSnapshot)
    const q = query(collection(db, "study_logs"), where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const minutes = snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0);
      setTotalMinutes(minutes);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculate Stats
  const currentXP = Math.floor((totalMinutes / 60) * 100); // 1 Hour = 100 XP
  
  let currentLevelObj = LEVELS[0];
  let nextLevelObj = LEVELS[1];
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXP >= LEVELS[i].minXP) {
      currentLevelObj = LEVELS[i];
      nextLevelObj = LEVELS[i + 1] || { minXP: 99999, title: "Max" };
    }
  }

  const xpInCurrentLevel = currentXP - currentLevelObj.minXP;
  const xpNeededForNext = nextLevelObj.minXP - currentLevelObj.minXP;
  const progressPercent = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);

  return (
    <div className="mb-6 rounded-xl bg-slate-900 p-4 border border-slate-800">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
          <Zap size={18} fill="currentColor" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Level {currentLevelObj.level}</h3>
          <p className="text-xs text-slate-400">{currentLevelObj.title}</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1 text-right">
        {currentXP} / {nextLevelObj.minXP} XP
      </p>
    </div>
  );
};

export default UserLevel;