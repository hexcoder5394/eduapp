import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Trash2, X, Save, Clock } from 'lucide-react';
import { UserAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, onSnapshot, 
  addDoc, deleteDoc, doc, updateDoc, 
  orderBy, limit 
} from 'firebase/firestore';
import { differenceInDays, format, parseISO } from 'date-fns';

const ExamCountdown = () => {
  const { user } = UserAuth();
  const [exam, setExam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  // 1. FETCH EXAM (Filtered by User)
  useEffect(() => {
    if (!user) return;

    // SECURE QUERY: Only get exams where userId matches current user
    const q = query(
      collection(db, "exams"), 
      where("userId", "==", user.uid), 
      orderBy("date", "asc"), // Get the soonest one
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        setExam({ ...docData.data(), id: docData.id });
        // Pre-fill form
        setTitle(docData.data().title);
        setDate(docData.data().date);
      } else {
        setExam(null);
        setTitle('');
        setDate('');
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. SAVE EXAM
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !date) return;

    try {
      if (exam) {
        // Update existing
        await updateDoc(doc(db, "exams", exam.id), {
          title,
          date
        });
      } else {
        // Create new (Attach userId!)
        await addDoc(collection(db, "exams"), {
          userId: user.uid, // <--- CRITICAL SECURITY FIX
          title,
          date,
          createdAt: new Date()
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving exam:", error);
    }
  };

  // 3. DELETE EXAM
  const handleDelete = async () => {
    if (!exam) return;
    try {
      await deleteDoc(doc(db, "exams", exam.id));
      setExam(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  // --- RENDER HELPERS ---
  const daysLeft = exam ? differenceInDays(parseISO(exam.date), new Date()) : 0;
  
  if (isEditing || !exam) {
    return (
      <div className="h-full min-h-[160px] rounded-2xl bg-indigo-600 p-6 text-white flex flex-col justify-between relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute -right-6 -bottom-6 text-indigo-500 opacity-50">
           <Calendar size={100} />
         </div>

         <div className="z-10 w-full h-full flex flex-col">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Edit2 size={16}/> {exam ? 'Edit Exam' : 'Set Exam Goal'}
            </h3>
            
            <form onSubmit={handleSave} className="flex flex-col gap-2 flex-1 justify-center">
              <input 
                type="text" 
                placeholder="Exam Name (e.g. AWS SAA)" 
                className="bg-indigo-700/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-indigo-300 outline-none focus:bg-indigo-700 transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input 
                type="date" 
                className="bg-indigo-700/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white outline-none focus:bg-indigo-700 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-white text-indigo-600 text-xs font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                  Save
                </button>
                {exam && (
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 bg-indigo-800 text-indigo-200 text-xs font-bold py-2 rounded-lg hover:bg-indigo-900">
                    Cancel
                  </button>
                )}
              </div>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="group h-full min-h-[160px] rounded-2xl bg-indigo-600 p-6 text-white flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-500/20">
      
      {/* Edit Button (Hidden until hover) */}
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 p-2 bg-indigo-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-indigo-600 z-20"
      >
        <Edit2 size={14} />
      </button>

      {/* Delete Button (Hidden until hover) */}
      <button 
        onClick={handleDelete}
        className="absolute bottom-4 right-4 p-2 bg-indigo-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-20"
      >
        <Trash2 size={14} />
      </button>

      {/* Header */}
      <div className="z-10">
        <div className="flex items-center gap-2 mb-1 opacity-90">
          <Calendar size={18} />
          <span className="text-xs font-bold tracking-widest uppercase">Exam Goal</span>
        </div>
      </div>

      {/* Background Icon */}
      <div className="absolute -right-6 -bottom-6 text-indigo-500 opacity-50 rotate-12 transition-transform group-hover:rotate-0">
        <Calendar size={120} />
      </div>

      {/* Main Content */}
      <div className="z-10">
        <h3 className="text-lg font-bold leading-tight mb-1 truncate pr-8">{exam.title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-mono font-bold tracking-tighter">{daysLeft}</span>
          <span className="text-sm font-medium text-indigo-200">Days Left</span>
        </div>
        <p className="text-[10px] text-indigo-300 mt-1 font-medium">
          Target: {format(parseISO(exam.date), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};

export default ExamCountdown;