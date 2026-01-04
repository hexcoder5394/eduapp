import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- 1. Import Link
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { addCourse, deleteCourse, updateCourseProgress } from '../lib/db';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Plus, Trash2, ExternalLink, BookOpen } from 'lucide-react';

const Courses = () => {
  const { user } = UserAuth();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newCourse, setNewCourse] = useState({ title: '', platform: '', link: '' });

  // 1. READ: Real-time Listener to fetch courses
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const coursesArray = [];
      querySnapshot.forEach((doc) => {
        coursesArray.push({ ...doc.data(), id: doc.id });
      });
      setCourses(coursesArray);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. CREATE: Handle Form Submit
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.platform) return;
    
    await addCourse(user.uid, newCourse);
    setNewCourse({ title: '', platform: '', link: '' }); // Reset form
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Courses</h1>
          <p className="text-slate-400">Manage your learning roadmap</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group">
            
            {/* Top Row: Icon & Delete */}
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <BookOpen size={24} />
              </div>
              <button 
                onClick={() => deleteCourse(course.id)}
                className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Info (Linked to Detail Page) */}
            <Link to={`/courses/${course.id}`}>
              <h3 className="text-lg font-bold text-slate-100 mb-1 truncate hover:text-indigo-400 transition-colors cursor-pointer">
                {course.title}
              </h3>
            </Link>
            <p className="text-sm text-slate-400 mb-4">{course.platform}</p>

            {/* Progress Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">Progress</span>
                <span className="text-indigo-400 font-mono">{course.progress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={course.progress}
                onChange={(e) => updateCourseProgress(course.id, Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Footer Link */}
            {course.link && (
              <a 
                href={course.link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors"
              >
                <ExternalLink size={14} /> Continue Learning
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>No courses yet. Click "Add New Course" to start!</p>
        </div>
      )}

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Add New Course</h2>
            <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Course Title (e.g. React Mastery)" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Platform (e.g. Udemy, YouTube)" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                value={newCourse.platform}
                onChange={(e) => setNewCourse({...newCourse, platform: e.target.value})}
                required
              />
              <input 
                type="url" 
                placeholder="Course Link (Optional)" 
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                value={newCourse.link}
                onChange={(e) => setNewCourse({...newCourse, link: e.target.value})}
              />
              <div className="flex gap-3 mt-2">
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
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;