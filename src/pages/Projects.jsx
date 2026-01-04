import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { addProject, deleteProject, updateProjectStatus } from '../lib/db';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Plus, Trash2, Github, ExternalLink, FolderGit2, Code2 } from 'lucide-react';

const Projects = () => {
  const { user } = UserAuth();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    techStack: '', 
    repoUrl: '', 
    liveUrl: '' 
  });

  // 1. READ: Real-time Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProjects(projectsData);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. CREATE: Handle Submit
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) return;
    
    await addProject(user.uid, newProject);
    setNewProject({ title: '', description: '', techStack: '', repoUrl: '', liveUrl: '' });
    setIsModalOpen(false);
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Building': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Planning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Polishing': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Projects</h1>
          <p className="text-slate-400">Track your dev portfolio</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex flex-col justify-between h-full group">
            
            {/* Top Section */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <FolderGit2 size={24} />
                </div>
                
                {/* Status Badge (Click to cycle status - simple implementation) */}
                <button 
                  onClick={() => {
                    const nextStatus = project.status === 'Planning' ? 'Building' : project.status === 'Building' ? 'Polishing' : 'Planning';
                    updateProjectStatus(project.id, nextStatus);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} hover:opacity-80 transition-opacity`}
                >
                  {project.status}
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">{project.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.split(',').map((tech, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">
                    <Code2 size={12} /> {tech.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <div className="flex gap-3">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <Github size={20} />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
              
              <button 
                onClick={() => deleteProject(project.id)}
                className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
          <FolderGit2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No projects yet. Build something awesome!</p>
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Create New Project</h2>
            <form onSubmit={handleAddProject} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Project Name (e.g. SelfPilot OS)" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Short description..." 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 h-24 resize-none"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Tech Stack (comma separated: React, Firebase, Tailwind)" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                value={newProject.techStack}
                onChange={(e) => setNewProject({...newProject, techStack: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="url" 
                  placeholder="GitHub Repo URL" 
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={newProject.repoUrl}
                  onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                />
                <input 
                  type="url" 
                  placeholder="Live Demo URL" 
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;