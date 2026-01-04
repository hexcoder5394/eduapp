import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { saveCourseNote } from '../lib/db';
import ReactMarkdown from 'react-markdown'; // <--- The Magic Library
import { ArrowLeft, Save, BookOpen, Clock } from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams(); // Get ID from URL
  const { user } = UserAuth();
  
  const [course, setCourse] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false); // Toggle Edit/Preview

  // 1. Fetch Course Info & Notes
  useEffect(() => {
    if (!user || !courseId) return;

    // Get Course Details
    getDoc(doc(db, "courses", courseId)).then(snap => {
      if (snap.exists()) setCourse(snap.data());
    });

    // Get Notes (Real-time)
    const noteId = `${user.uid}_${courseId}`;
    const unsub = onSnapshot(doc(db, "course_notes", noteId), (snap) => {
      if (snap.exists()) {
        setNoteContent(snap.data().content);
      }
    });

    return () => unsub();
  }, [user, courseId]);

  // 2. Save Notes
  const handleSaveNote = async () => {
    setIsSaving(true);
    await saveCourseNote(user.uid, courseId, noteContent);
    setTimeout(() => setIsSaving(false), 1000);
  };

  if (!course) return <div className="p-10 text-slate-500">Loading course...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6">
        <Link to="/courses" className="text-sm text-slate-500 hover:text-indigo-400 flex items-center gap-1 mb-4">
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
             <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{course.title}</h1>
            <p className="text-slate-400 flex items-center gap-2 mt-1">
               <span className="capitalize">{course.platform}</span> • {course.status}
            </p>
          </div>
        </div>
      </div>

      {/* MARKDOWN EDITOR SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex gap-4 text-sm font-medium">
             <button 
               onClick={() => setIsPreview(false)}
               className={`transition-colors ${!isPreview ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Write
             </button>
             <button 
               onClick={() => setIsPreview(true)}
               className={`transition-colors ${isPreview ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
               Preview
             </button>
          </div>
          <button 
            onClick={handleSaveNote}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isSaving ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Save size={14} /> {isSaving ? 'Saved!' : 'Save Notes'}
          </button>
        </div>

        {/* Editor Area */}
        <div className="h-[500px] flex">
          {isPreview ? (
            // PREVIEW MODE (Rendered Markdown)
            <div className="w-full h-full p-6 overflow-y-auto prose prose-invert max-w-none text-slate-300">
               {/* This renders the markdown string as HTML */}
               <ReactMarkdown>{noteContent}</ReactMarkdown>
               
               {!noteContent && <p className="text-slate-600 italic">Nothing to preview yet...</p>}
            </div>
          ) : (
            // EDIT MODE (Textarea)
            <textarea
              className="w-full h-full bg-slate-900 p-6 text-slate-200 outline-none resize-none font-mono text-sm leading-relaxed"
              placeholder="# Course Notes&#10;&#10;- Key concept 1&#10;- Key concept 2&#10;&#10;```javascript&#10;console.log('Code snippets work too!');&#10;```"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;