import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Tag, Calendar, Edit2, Save, X } from 'lucide-react';
import { db } from '../../lib/firebase';
import { addTask, toggleTask, deleteTask, updateTask } from '../../lib/db';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { UserAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const TaskQueue = () => {
  const { user } = UserAuth();
  const [tasks, setTasks] = useState([]);
  
  // Add New Task State
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState(''); // For scheduling
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // 1. Real-time Database Listener (Fixes the "Disappearing" bug)
  useEffect(() => {
    if (!user) return;
    
    // Order by created date so new ones appear top/bottom as you prefer
    const q = query(
      collection(db, "tasks"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        // Convert Firebase Timestamp to JS Date if it exists
        scheduledAt: doc.data().scheduledAt?.toDate() || null
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Add
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    await addTask(user.uid, { 
      title: newTask, 
      scheduledAt: newDate || null 
    });
    
    setNewTask('');
    setNewDate('');
  };

  // Handle Start Edit
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  // Handle Save Edit
  const saveEdit = async (id) => {
    await updateTask(id, { title: editTitle });
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-100">Task Queue</h2>
        <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          {tasks.filter(t => !t.isCompleted).length} Pending
        </span>
      </div>
      
      {/* ADD TASK FORM */}
      <form onSubmit={handleAdd} className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            placeholder="Add a new task..." 
            className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none placeholder:text-slate-600"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit" className="text-indigo-400 hover:text-white transition-colors">
            <Plus size={20} />
          </button>
        </div>
        
        {/* Date Picker Input */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
           <Calendar size={14} className="text-slate-500" />
           <input 
             type="datetime-local" 
             className="bg-transparent text-xs text-slate-400 outline-none w-full"
             value={newDate}
             onChange={(e) => setNewDate(e.target.value)}
           />
        </div>
      </form>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <p className="text-sm text-slate-500">No tasks. Clear mind!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all">
              
              {/* Checkbox */}
              <button 
                onClick={() => toggleTask(task.id, task.isCompleted)}
                className={`mt-0.5 ${task.isCompleted ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {task.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              
              {/* Content (View vs Edit Mode) */}
              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      className="bg-slate-900 text-slate-200 text-sm px-2 py-1 rounded border border-indigo-500 w-full outline-none"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(task.id)} className="text-emerald-500"><Save size={16}/></button>
                    <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16}/></button>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm truncate ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    {task.scheduledAt && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-400">
                        <Calendar size={10} />
                        {format(task.scheduledAt, "MMM d, h:mm a")}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== task.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(task)} className="text-slate-600 hover:text-indigo-400">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskQueue;