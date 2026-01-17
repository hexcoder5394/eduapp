import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { addProject, deleteProject, updateProjectStatus } from '../lib/db';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Plus, Trash2, ExternalLink, Github, FolderGit2, CheckCircle2, ChevronDown } from 'lucide-react';

const Projects = () => {
  const { user } = UserAuth();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newProject, setNewProject] = useState({ 
    title: '', description: '', techStack: '', repoUrl: '', liveUrl: '', status: 'Planning' 
  });

  const STATUS_OPTIONS = ['Planning', 'Building', 'Polishing', 'Done'];

  // Helper to display "Done" as "Completed"
  const getStatusLabel = (status) => status === 'Done' ? 'Completed' : status;

  // Helper for status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Planning': return 'text-slate-400 bg-slate-800 border-slate-700';
      case 'Building': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Polishing': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Done': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  // 1. Fetch Projects
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) return;
    
    await addProject(user.uid, newProject);
    setNewProject({ title: '', description: '', techStack: '', repoUrl: '', liveUrl: '', status: 'Planning' });
    setIsModalOpen(false);
  };

  // 3. Handle Status Change
  const handleStatusChange = async (projectId, newStatus) => {
    await updateProjectStatus(projectId, newStatus);
  };

  return (
    <div className="pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Projects</h1>
          <p className="text-slate-400">Track your dev portfolio</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all font-medium"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
            
            <div>
              {/* Top Row: Icon, Status, Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <FolderGit2 size={24} />
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <div className="relative group/status">
                    <button className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)} <ChevronDown size={12}/>
                    </button>
                    {/* Hover Menu */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 hidden group-hover/status:block">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(project.id, status)}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 ${
                            project.status === status ? 'text-indigo-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => deleteProject(project.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2 truncate">{project.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                {project.description || "No description provided."}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack?.split(',').slice(0, 3).map((tech, i) => (
                  <span key={i} className="px-2 py-1 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-500 font-mono">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
              {project.status !== 'Done' ? (
                <button 
                  onClick={() => handleStatusChange(project.id, 'Done')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                >
                  <CheckCircle2 size={14} /> Mark Completed
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 text-emerald-500 text-xs font-bold opacity-50 cursor-default">
                   <CheckCircle2 size={14} /> Project Finished
                </div>
              )}
              
              <div className="flex gap-2">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <Github size={16} />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 text-slate-500">
           <p>Start your first project to build your portfolio!</p>
        </div>
      )}

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Create New Project</h2>
            <form onSubmit={handleAddProject} className="flex flex-col gap-4">
              <input 
                type="text" placeholder="Project Title" required
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" rows="3"
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none resize-none"
                value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="text" placeholder="Tech Stack (React, Firebase...)"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                  value={newProject.techStack} onChange={(e) => setNewProject({...newProject, techStack: e.target.value})}
                />
                <select 
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                  value={newProject.status} onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                >
                  <option value="Planning">Planning</option>
                  <option value="Building">Building</option>
                  <option value="Polishing">Polishing</option>
                  <option value="Done">Completed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="url" placeholder="GitHub Repo URL"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                  value={newProject.repoUrl} onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                />
                 <input 
                  type="url" placeholder="Live Demo URL"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none"
                  value={newProject.liveUrl} onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;