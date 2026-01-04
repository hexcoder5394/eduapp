import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserAuth } from '../../context/AuthContext';
import { format, isPast, isToday } from 'date-fns';

const ScheduledTasks = () => {
  const { user } = UserAuth();
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Fetch all incomplete tasks
    const q = query(
      collection(db, "tasks"), 
      where("userId", "==", user.uid),
      where("isCompleted", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        scheduledAt: doc.data().scheduledAt?.toDate() || null
      }));

      // Filter: Only show tasks that HAVE a date
      const scheduledOnly = allTasks.filter(t => t.scheduledAt !== null);

      // Sort by date (Soonest first)
      scheduledOnly.sort((a, b) => a.scheduledAt - b.scheduledAt);

      setDueTasks(scheduledOnly);
    });

    return () => unsubscribe();
  }, [user]);

  if (dueTasks.length === 0) return null; // Hide card if nothing is scheduled

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900 border border-slate-800 p-6">
      <h2 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Clock size={16} className="text-indigo-500" /> Scheduled / Due
      </h2>

      <div className="space-y-3">
        {dueTasks.slice(0, 3).map(task => {
          const isOverdue = isPast(task.scheduledAt);
          
          return (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
              isOverdue 
                ? 'bg-red-500/5 border-red-500/20' 
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                {isOverdue ? <AlertCircle size={18} /> : <Clock size={18} />}
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                <p className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                  {isOverdue ? "Overdue: " : "Due: "} 
                  {isToday(task.scheduledAt) ? "Today, " : ""} 
                  {format(task.scheduledAt, "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduledTasks;