import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc
} from "firebase/firestore";

// --- USER PROFILE OPERATIONS ---

// 1. Create User Profile (Called on Sign Up)
export const createUserProfile = async (userId, userData) => {
  try {
    // We use setDoc to specify the ID (userId) exactly
    await setDoc(doc(db, "users", userId), {
      firstName: userData.firstName,
      lastName: userData.lastName,
      age: userData.age,
      profession: userData.profession,
      email: userData.email,
      photoUrl: userData.photoUrl || '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// 2. Update User Profile (FIXED: Supports Upsert)
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    
    // CRITICAL FIX: Use setDoc with { merge: true } instead of updateDoc
    // This ensures the profile is created if it was missing for older users.
    await setDoc(userRef, updates, { merge: true });
    
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// --- COURSES OPERATIONS ---

// 1. Add a New Course
export const addCourse = async (userId, courseData) => {
  try {
    await addDoc(collection(db, "courses"), {
      userId,
      title: courseData.title,
      platform: courseData.platform, // e.g., Udemy, YouTube
      link: courseData.link || '',
      status: "In Progress", // Default status
      progress: 0,
      totalHours: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

// 2. Delete a Course
export const deleteCourse = async (courseId) => {
  try {
    await deleteDoc(doc(db, "courses", courseId));
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};

// 3. Update Course Progress
export const updateCourseProgress = async (courseId, newProgress) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      progress: newProgress,
      status: newProgress === 100 ? "Completed" : "In Progress"
    });
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

// --- PROJECTS OPERATIONS ---

// 1. Add a New Project
export const addProject = async (userId, projectData) => {
  try {
    await addDoc(collection(db, "projects"), {
      userId,
      title: projectData.title,
      description: projectData.description || '',
      techStack: projectData.techStack, // Store as a string or array
      repoUrl: projectData.repoUrl || '',
      liveUrl: projectData.liveUrl || '',
      status: "Planning", // Default: Planning, Building, Polishing, Done
      progress: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// 2. Delete a Project
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

// 3. Update Project Status/Progress
export const updateProjectStatus = async (projectId, newStatus) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      status: newStatus
    });
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

// --- STUDY SESSION OPERATIONS ---

// 1. Log a Study Session
export const logStudySession = async (userId, sessionData) => {
  try {
    // 1. Add the log entry
    await addDoc(collection(db, "study_logs"), {
      userId,
      resourceId: sessionData.resourceId, // ID of the Course or Project
      resourceType: sessionData.resourceType, // 'course' or 'project'
      resourceTitle: sessionData.resourceTitle, // Snapshot of title for easier display
      duration: Number(sessionData.duration), // In minutes
      notes: sessionData.notes || '',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging session:", error);
    throw error;
  }
};

// --- TASK OPERATIONS ---

// 1. Add Task (Updated with Schedule)
export const addTask = async (userId, taskData) => {
  try {
    await addDoc(collection(db, "tasks"), {
      userId,
      title: taskData.title,
      linkedTitle: taskData.linkedTitle || '',
      isCompleted: false,
      scheduledAt: taskData.scheduledAt ? new Date(taskData.scheduledAt) : null, // Store as Timestamp
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

// 2. Toggle Task Completion
export const toggleTask = async (taskId, currentStatus) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { isCompleted: !currentStatus });
  } catch (error) {
    console.error("Error toggling task:", error);
  }
};

// 3. Edit Task (NEW)
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    // If updating date, ensure it's a Date object
    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }
    await updateDoc(taskRef, updates);
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

// 4. Delete Task
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

// --- RESOURCE VAULT OPERATIONS ---

export const addVaultResource = async (userId, resourceData) => {
  try {
    await addDoc(collection(db, "vault_resources"), {
      userId,
      title: resourceData.title,
      url: resourceData.url,
      tags: resourceData.tags || [], // Array of strings e.g. ['azure', 'react']
      type: resourceData.type || 'article', // article, video, tool
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding vault resource:", error);
    throw error;
  }
};

export const deleteVaultResource = async (resourceId) => {
  try {
    await deleteDoc(doc(db, "vault_resources", resourceId));
  } catch (error) {
    console.error("Error deleting vault resource:", error);
  }
};

// --- COURSE NOTES OPERATIONS ---

// Save or Update a Note for a specific course
export const saveCourseNote = async (userId, courseId, content) => {
  try {
    // We use a specific ID format: "userId_courseId" so one user has one note per course
    const noteId = `${userId}_${courseId}`;
    await setDoc(doc(db, "course_notes", noteId), {
      userId,
      courseId,
      content: content,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving course note:", error);
    throw error;
  }
};