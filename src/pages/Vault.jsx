import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { addVaultResource, deleteVaultResource } from '../lib/db';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Link2, Trash2, Tag, Plus, ExternalLink, Video, FileText, Wrench } from 'lucide-react';

const Vault = () => {
  const { user } = UserAuth();
  const [resources, setResources] = useState([]);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [type, setType] = useState('article');

  // Fetch Resources
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "vault_resources"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setResources(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !url) return;
    
    // Process tags (comma separated)
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t);

    await addVaultResource(user.uid, { title, url, tags, type });
    
    // Reset
    setTitle('');
    setUrl('');
    setTagInput('');
    setIsAdding(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={16} />;
      case 'tool': return <Wrench size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Resource Vault</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition-all"
        >
          <Plus size={18} /> Add Resource
        </button>
      </div>

      {/* ADD FORM */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" placeholder="Title (e.g. React Hooks Guide)" required
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
              value={title} onChange={e => setTitle(e.target.value)}
            />
            <input 
              type="url" placeholder="URL (https://...)" required
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
              value={url} onChange={e => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
               <input 
                type="text" placeholder="Tags (e.g. react, hooks, frontend)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
                value={tagInput} onChange={e => setTagInput(e.target.value)}
              />
            </div>
            <select 
              value={type} onChange={e => setType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-indigo-500 outline-none"
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="tool">Tool</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500">Save to Vault</button>
          </div>
        </form>
      )}

      {/* RESOURCES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(res => (
          <div key={res.id} className="group flex flex-col justify-between p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`p-2 rounded-lg bg-slate-800 text-slate-400 ${res.type === 'video' ? 'text-red-400 bg-red-500/10' : ''} ${res.type === 'tool' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}>
                  {getIcon(res.type)}
                </span>
                <button onClick={() => deleteVaultResource(res.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-200 mb-1 line-clamp-2">
                <a href={res.url} target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
                  {res.title}
                </a>
              </h3>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {res.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 text-slate-500 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <a 
              href={res.url} target="_blank" rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all"
            >
              <ExternalLink size={14} /> Open Link
            </a>
          </div>
        ))}
      </div>
      
      {resources.length === 0 && !isAdding && (
        <div className="text-center py-20 text-slate-500">
          <Link2 size={48} className="mx-auto mb-4 opacity-20" />
          <p>Your vault is empty. Save links here!</p>
        </div>
      )}
    </div>
  );
};

export default Vault;