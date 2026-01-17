import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { createNotePage, updateNotePage, deleteNotePage, addFlashcard } from '../lib/db'; 
import MDEditor from '@uiw/react-md-editor'; 
import { 
  ArrowLeft, BookOpen, Plus, FileText, Trash2, 
  PanelLeft, Check, Loader2, Layers, X 
} from 'lucide-react';

// Debounce helper
const useDebounce = (effect, deps, delay) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
  }, [...deps || [], delay]);
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = UserAuth();
  
  const [course, setCourse] = useState(null);
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  
  // Editor State
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Flashcard Modal State
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');

  // 1. Fetch Course Info
  useEffect(() => {
    if (!user || !courseId) return;
    getDoc(doc(db, "courses", courseId)).then(snap => {
      if (snap.exists()) setCourse(snap.data());
    });
  }, [user, courseId]);

  // 2. Fetch Pages (Real-time)
  useEffect(() => {
    if (!user || !courseId) return;
    
    const q = query(
      collection(db, "course_pages"), 
      where("courseId", "==", courseId),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const pageList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setPages(pageList);
    });
    return () => unsub();
  }, [user, courseId]);

  // 3. Auto-Select First Page
  useEffect(() => {
    if (pages.length > 0 && activePageId === null) {
      setActivePageId(pages[0].id);
    }
  }, [pages, activePageId]);

  // 4. Sync Active Page to Editor
  useEffect(() => {
    if (!activePageId) {
      setTitle('');
      setContent('');
      return;
    }
    const page = pages.find(p => p.id === activePageId);
    if (page) {
      setTitle(page.title);
      setContent(page.content || '');
    } else {
      setTitle('Untitled Page');
      setContent('');
    }
  }, [activePageId]); 

  // 5. Auto-Save Logic
  useDebounce(() => {
    if (!activePageId || !user) return;
    const page = pages.find(p => p.id === activePageId);
    
    // Only save if content changed
    if ((page && (page.content !== content || page.title !== title)) || !page) {
      setIsSaving(true);
      updateNotePage(activePageId, { title, content }).then(() => {
        setIsSaving(false);
      });
    }
  }, [content, title], 2000);

  // --- Handlers ---

  const handleCreatePage = async () => {
    const newId = await createNotePage(user.uid, courseId, "Untitled Page");
    setActivePageId(newId);
  };

  const handleDeletePage = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this page?")) {
      await deleteNotePage(id);
      if (activePageId === id) setActivePageId(null);
    }
  };

  const handleOpenFlashcardModal = () => {
    // Grab highlighted text from browser
    const selection = window.getSelection().toString();
    setFlashcardBack(selection); // Auto-fill Answer
    setFlashcardFront(''); 
    setIsFlashcardModalOpen(true);
  };

  const handleSaveFlashcard = async (e) => {
    e.preventDefault();
    if (!flashcardFront || !flashcardBack) return;
    
    await addFlashcard(user.uid, courseId, flashcardFront, flashcardBack);
    setIsFlashcardModalOpen(false);
  };

  if (!course) return <div className="p-10 text-slate-500 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 overflow-hidden pb-4" data-color-mode="dark">
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <Link to="/courses" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
             <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">{course.title}</h1>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Notebook</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Save Status */}
          {isSaving ? (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 animate-pulse">
               <Loader2 size={12} className="animate-spin"/> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
               <Check size={12} /> Saved
            </span>
          )}

          <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

          {/* Create Flashcard Button */}
          <button 
              onClick={handleOpenFlashcardModal}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <Layers size={14} /> Make Flashcard
          </button>

          <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>
          
          {/* Sidebar Toggle */}
          <button 
             onClick={() => setShowSidebar(!showSidebar)}
             className={`p-2 rounded-lg border border-slate-700 transition-colors ${showSidebar ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-400 hover:text-white'}`}
          >
             <PanelLeft size={20} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* SIDEBAR */}
        {showSidebar && (
          <div className="w-64 shrink-0 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all animate-fade-in-left">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pages</span>
              <button onClick={handleCreatePage} className="p-1.5 hover:bg-indigo-600 hover:text-white rounded-lg text-slate-400 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all border ${
                    activePageId === page.id 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                      : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={16} className="shrink-0" />
                    <span className="text-sm font-medium truncate">{page.title || 'Untitled'}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeletePage(e, page.id)}
                    className={`p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all ${
                       activePageId === page.id ? 'text-indigo-200' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {pages.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-sm px-4">
                  <p>No pages yet.</p>
                  <button onClick={handleCreatePage} className="text-indigo-400 font-bold hover:underline mt-2">Create one +</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RICH EDITOR AREA */}
        <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {activePageId ? (
            <>
              {/* Title Input */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page Title"
                  className="w-full bg-transparent text-xl font-bold text-slate-100 placeholder:text-slate-600 outline-none"
                />
              </div>

              {/* MDEditor */}
              <div className="flex-1 overflow-hidden">
                <MDEditor
                  value={content}
                  onChange={setContent}
                  height="100%"
                  preview="edit" 
                  className="border-none !bg-slate-900 text-slate-200"
                  visibleDragbar={false}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <FileText size={64} className="opacity-20 mb-4" />
               <p>Select a page or create a new one to start writing.</p>
            </div>
          )}
        </div>
      </div>

      {/* FLASHCARD MODAL */}
      {isFlashcardModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500"/> New Flashcard
              </h3>
              <button onClick={() => setIsFlashcardModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveFlashcard} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Question (Front)</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. What is the key concept here?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                  value={flashcardFront}
                  onChange={(e) => setFlashcardFront(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Answer (Back)</label>
                <textarea 
                  rows="4"
                  placeholder="Answer (Auto-filled from highlight)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none resize-none"
                  value={flashcardBack}
                  onChange={(e) => setFlashcardBack(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all mt-2">
                Add to Deck
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseDetail;