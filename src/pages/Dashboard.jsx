// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { logStudySession } from '../lib/db'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import StatCard from '../components/dashboard/StatCard';
import LogSessionModal from '../components/dashboard/LogSessionModal';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import PomodoroTimer from '../components/dashboard/PomodoroTimer';
import ExamCountdown from '../components/dashboard/ExamCountdown';
import TaskQueue from '../components/dashboard/TaskQueue';
import ScheduledTasks from '../components/dashboard/ScheduledTasks';
import GreetingCard from '../components/dashboard/GreetingCard'; // <--- NEW IMPORT
import { Clock, BookOpen, Trophy, Flame, ExternalLink, PlayCircle, Loader2 } from 'lucide-react'; 
import { isSameDay } from 'date-fns';

const Dashboard = () => {
  const { user, loading: authLoading } = UserAuth(); 
  
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalData, setLogModalData] = useState(null);

  // --- CENTRAL TIMER STATE ---
  const [timer, setTimer] = useState({
    isActive: false,
    timeLeft: 25 * 60, 
    totalTime: 25 * 60, 
    activeResourceId: null, 
    activeResourceTitle: null,
    activeResourceType: null,
  });

  // --- FETCH DATA ---
  useEffect(() => {
    // Strict Guard: If no UID, don't even try to listen
    if (authLoading || !user?.uid) return;

    // 1. Courses Listener
    const qCourses = query(collection(db, "courses"), where("userId", "==", user.uid));
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // 2. Projects Listener
    const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubProjects = onSnapshot(qProjects, (snap) => {
      setProjects(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // 3. Logs Listener
    const qLogs = query(collection(db, "study_logs"), where("userId", "==", user.uid), orderBy("timestamp", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      setLogs(snap.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().timestamp?.toDate() || new Date() })));
    });

    return () => { unsubCourses(); unsubProjects(); unsubLogs(); };
  }, [user?.uid, authLoading]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (timer.isActive && timer.timeLeft > 0) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (timer.isActive && timer.timeLeft === 0) {
      clearInterval(interval);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.timeLeft]);

  const startFocusSession = (sessionData) => {
    setTimer({
      isActive: true,
      timeLeft: sessionData.duration * 60,
      totalTime: sessionData.duration * 60,
      activeResourceId: sessionData.id,
      activeResourceTitle: sessionData.title,
      activeResourceType: sessionData.type
    });
  };

  const handleTimerComplete = async () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log(e));
    
    if (timer.activeResourceId) {
      try {
        await logStudySession(user.uid, {
          resourceId: timer.activeResourceId,
          resourceType: timer.activeResourceType,
          resourceTitle: timer.activeResourceTitle,
          duration: timer.totalTime / 60,
          notes: 'Completed Focus Session'
        });
      } catch (error) {
        console.error("Auto-log failed", error);
      }
    }
    setTimer(prev => ({ ...prev, isActive: false, activeResourceId: null }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- CALCULATE STATS ---
  const totalMinutes = logs.reduce((acc, log) => acc + log.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedCourses = courses.filter(c => c.progress === 100).length;
  const completedProjects = projects.filter(p => p.status === 'Done' || p.status === 'Maintained').length;

  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    const today = new Date();
    const uniqueDates = [...new Set(logs.map(log => log.date.toDateString()))];
    return logs.some(log => isSameDay(log.date, today)) ? uniqueDates.length : uniqueDates.length; 
  };

  const getResourceHours = (id) => {
    const mins = logs.filter(l => l.resourceId === id).reduce((acc, curr) => acc + curr.duration, 0);
    return (mins / 60).toFixed(1);
  };

  // 3. SHOW LOADER IF AUTH IS NOT READY
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* 1. HERO SECTION */}
      {/* UPDATED GRID: xl:grid-cols-5 allows 5 items in one row on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        
        {/* NEW: Greeting Card (Top Left) */}
        <div className="col-span-1 h-full min-h-[160px]">
          <GreetingCard />
        </div>

        {/* Existing: Stats Column 1 */}
        <div className="flex flex-col gap-4">
           <StatCard title="Total Study Hours" value={totalHours} icon={Clock} color="text-blue-500 bg-blue-500" />
           <StatCard title="Current Streak" value={`${calculateStreak()} Days`} icon={Flame} color="text-rose-500 bg-rose-500" />
        </div>

        {/* Existing: Stats Column 2 */}
        <div className="flex flex-col gap-4">
           <StatCard title="Completed Courses" value={completedCourses} icon={BookOpen} color="text-emerald-500 bg-emerald-500" />
           <StatCard title="Completed Projects" value={completedProjects} icon={Trophy} color="text-amber-500 bg-amber-500" />
        </div>

        {/* Existing: Pomodoro Timer */}
        <div className="lg:col-span-1 h-full min-h-[160px]">
          <PomodoroTimer 
             timeLeft={timer.timeLeft}
             totalTime={timer.totalTime}
             isActive={timer.isActive}
             activeSessionTitle={timer.activeResourceTitle}
             onToggle={() => setTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
             onReset={() => setTimer(prev => ({ ...prev, isActive: false, timeLeft: prev.totalTime, activeResourceId: null }))}
          />
        </div>

        {/* Existing: Exam Countdown */}
        <div className="lg:col-span-1 h-full min-h-[160px]">
          <ExamCountdown />
        </div>
      </div>

      {/* 2. HEATMAP */}
      <div>
        <ActivityHeatmap logs={logs} />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* ACTIVE PROJECTS */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Active Projects</h2>
              <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">Manage</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.filter(p => p.status !== 'Done').map((project) => {
                const hoursSpent = getResourceHours(project.id);
                const goalHours = 20; 
                const timeProgress = Math.min((hoursSpent / goalHours) * 100, 100);
                const isTimerActive = timer.activeResourceId === project.id;

                return (
                  <div key={project.id} className={`rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    isTimerActive ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-950 border-slate-800/50 hover:border-indigo-500/30'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-200 truncate pr-2">{project.title}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          {project.status}
                        </span>
                      </div>
                      
                      {isTimerActive ? (
                        <div className="my-4 flex flex-col items-center justify-center py-2 bg-slate-900/50 rounded-lg animate-pulse">
                          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Focus Mode</span>
                          <span className="text-3xl font-mono font-bold text-white">{formatTime(timer.timeLeft)}</span>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>{hoursSpent} hrs logged</span>
                            <span>Goal: {goalHours}h</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${timeProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => { setLogModalData({ type: 'project', id: project.id }); setIsLogModalOpen(true); }}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
                          isTimerActive ? 'bg-indigo-600 text-white cursor-default' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                        }`}
                        disabled={isTimerActive}
                      >
                         {isTimerActive ? <><Clock size={14}/> Running...</> : <><PlayCircle size={14} /> Log Time</>}
                      </button>
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white">
                          <ExternalLink size={14}/>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE COURSES */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Active Courses</h2>
              <Link to="/courses" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>
            
            <div className="space-y-4">
              {courses.filter(c => c.progress < 100).slice(0, 3).map(course => {
                const hoursSpent = getResourceHours(course.id);
                const isTimerActive = timer.activeResourceId === course.id;

                return (
                  <div key={course.id} className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                    isTimerActive ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-950 border-slate-800/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium text-slate-200 truncate pr-2">{course.title}</h4>
                          {!isTimerActive && <span className="text-xs font-mono text-slate-500">{course.progress}%</span>}
                        </div>
                        
                        {isTimerActive ? (
                          <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg animate-pulse">
                             <span className="text-xs text-indigo-300 font-bold">● Live Session</span>
                             <span className="text-lg font-mono font-bold text-white">{formatTime(timer.timeLeft)}</span>
                          </div>
                        ) : (
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-800/50">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {hoursSpent} hrs invested
                      </span>

                      <button 
                        onClick={() => { setLogModalData({ type: 'course', id: course.id }); setIsLogModalOpen(true); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isTimerActive ? 'bg-indigo-600 text-white cursor-default' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                        }`}
                        disabled={isTimerActive}
                      >
                        {isTimerActive ? <><Clock size={14}/> Running...</> : <><PlayCircle size={14} /> Log Time</>}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {courses.filter(c => c.progress < 100).length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No active courses.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <ScheduledTasks />
          <div className="h-[400px]">
            <TaskQueue />
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex-1">
            <h2 className="mb-4 text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Recent Logs
            </h2>
            <ul className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <li key={log.id} className="flex gap-3 items-center text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  <div className="flex-1 truncate text-slate-300">{log.resourceTitle}</div>
                  <div className="text-slate-500 text-xs whitespace-nowrap">{log.duration}m</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <LogSessionModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        initialData={logModalData}
        onStartTimer={startFocusSession}
      />
    </div>
  );
};

export default Dashboard;