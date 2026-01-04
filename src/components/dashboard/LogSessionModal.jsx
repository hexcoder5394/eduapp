import React, { useState, useEffect } from 'react';
import { X, Clock, FileText, PlayCircle, Save } from 'lucide-react'; // Added Icons
import { UserAuth } from '../../context/AuthContext';
import { logStudySession } from '../../lib/db';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const LogSessionModal = ({ isOpen, onClose, initialData = null, onStartTimer }) => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  
  // Form State
  const [type, setType] = useState('course');
  const [selectedId, setSelectedId] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  // Sync state with initialData
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.type) setType(initialData.type);
      if (initialData.duration) setDuration(initialData.duration);
    } else if (isOpen && !initialData) {
      setDuration(60);
    }
  }, [isOpen, initialData]);

  // Fetch options
  useEffect(() => {
    if (!user || !isOpen) return;
    const fetchResources = async () => {
      const collectionName = type === 'course' ? 'courses' : 'projects';
      const q = query(collection(db, collectionName), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
      setResources(data);
      
      if (initialData && initialData.type === type && initialData.id) {
        setSelectedId(initialData.id);
      } else if (data.length > 0 && !data.find(r => r.id === selectedId)) {
         setSelectedId(data[0].id);
      }
    };
    fetchResources();
  }, [type, user, isOpen, initialData]);

  // 1. Log Past Session (Save to DB)
  const handleLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    const resourceTitle = resources.find(r => r.id === selectedId)?.title || 'Unknown';
    try {
      await logStudySession(user.uid, {
        resourceId: selectedId,
        resourceType: type,
        resourceTitle: resourceTitle,
        duration: duration,
        notes: notes
      });
      onClose();
      setNotes('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Start Live Timer (New Feature)
  const handleStartTimer = () => {
    const resourceTitle = resources.find(r => r.id === selectedId)?.title || 'Unknown';
    onStartTimer({
      id: selectedId,
      title: resourceTitle,
      type: type,
      duration: Number(duration) // In Minutes
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Study Session</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex rounded-xl bg-slate-950 p-1">
            <button type="button" onClick={() => setType('course')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${type === 'course' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Course</button>
            <button type="button" onClick={() => setType('project')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${type === 'project' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Project</button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Select {type === 'course' ? 'Course' : 'Project'}</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 outline-none focus:border-indigo-500">
              {resources.map(r => (<option key={r.id} value={r.id}>{r.title}</option>))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Duration (Minutes)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500"/>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Notes (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Goals for this session..." className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-indigo-500"/>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3 mt-2">
             {/* Button 1: Start Timer */}
            <button 
              type="button"
              onClick={handleStartTimer}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98]"
            >
              <PlayCircle size={18} /> Start Timer
            </button>

            {/* Button 2: Log Past */}
            <button 
              type="button" 
              onClick={handleLog}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-3 font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-[0.98]"
            >
              <Save size={18} /> Log Past
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LogSessionModal;