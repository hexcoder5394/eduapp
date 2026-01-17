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
  getDoc,
  getDocs // <--- CRITICAL FIX: Added this import
} from "firebase/firestore";

// --- USER PROFILE OPERATIONS ---

export const createUserProfile = async (userId, userData) => {
  try {
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

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// --- COURSES OPERATIONS ---

export const addCourse = async (userId, courseData) => {
  try {
    await addDoc(collection(db, "courses"), {
      userId,
      title: courseData.title,
      platform: courseData.platform,
      link: courseData.link || '',
      status: "In Progress",
      progress: 0,
      totalHours: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    await deleteDoc(doc(db, "courses", courseId));
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};

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

export const addProject = async (userId, projectData) => {
  try {
    await addDoc(collection(db, "projects"), {
      userId,
      title: projectData.title,
      description: projectData.description || '',
      techStack: projectData.techStack,
      repoUrl: projectData.repoUrl || '',
      liveUrl: projectData.liveUrl || '',
      status: "Planning",
      progress: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

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

export const logStudySession = async (userId, sessionData) => {
  try {
    await addDoc(collection(db, "study_logs"), {
      userId,
      resourceId: sessionData.resourceId,
      resourceType: sessionData.resourceType,
      resourceTitle: sessionData.resourceTitle,
      duration: Number(sessionData.duration),
      notes: sessionData.notes || '',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging session:", error);
    throw error;
  }
};

// --- TASK OPERATIONS ---

export const addTask = async (userId, taskData) => {
  try {
    await addDoc(collection(db, "tasks"), {
      userId,
      title: taskData.title,
      linkedTitle: taskData.linkedTitle || '',
      isCompleted: false,
      scheduledAt: taskData.scheduledAt ? new Date(taskData.scheduledAt) : null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding task:", error);
  }
};

export const toggleTask = async (taskId, currentStatus) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { isCompleted: !currentStatus });
  } catch (error) {
    console.error("Error toggling task:", error);
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }
    await updateDoc(taskRef, updates);
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

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
      tags: resourceData.tags || [],
      type: resourceData.type || 'article',
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

// --- ONENOTE STYLE PAGE OPERATIONS ---

export const createNotePage = async (userId, courseId, title = "Untitled Page") => {
  try {
    const docRef = await addDoc(collection(db, "course_pages"), {
      userId,
      courseId,
      title,
      content: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating note page:", error);
    throw error;
  }
};

export const updateNotePage = async (pageId, updates) => {
  try {
    const pageRef = doc(db, "course_pages", pageId);
    await updateDoc(pageRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating note page:", error);
  }
};

export const deleteNotePage = async (pageId) => {
  try {
    await deleteDoc(doc(db, "course_pages", pageId));
  } catch (error) {
    console.error("Error deleting note page:", error);
  }
};

// --- FLASHCARD OPERATIONS (Fixed imports) ---

// 1. Create Flashcard
export const addFlashcard = async (userId, courseId, front, back) => {
  try {
    await addDoc(collection(db, "flashcards"), {
      userId,
      courseId,
      front,
      back,
      // Spaced Repetition Defaults (SM-2 Algorithm)
      interval: 0,      // Days until next review
      repetition: 0,    // Times successfully recalled
      easeFactor: 2.5,  // Difficulty multiplier
      dueDate: new Date(), // Due immediately
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding flashcard:", error);
    throw error;
  }
};

// 2. Get Cards Due for Review
export const getDueFlashcards = async (userId) => {
  try {
    const today = new Date();
    // Fetch all cards for user
    const q = query(collection(db, "flashcards"), where("userId", "==", userId));
    // NOW getDocs IS DEFINED!
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id }))
      .filter(card => !card.dueDate || card.dueDate.toDate() <= today); // Only return due cards
  } catch (error) {
    console.error("Error getting flashcards:", error);
    return [];
  }
};

// 3. Update Card after Review (The Algorithm)
export const updateFlashcardReview = async (cardId, quality) => {
  // quality: 0 (Forgot) to 5 (Perfect)
  try {
    const cardRef = doc(db, "flashcards", cardId);
    const cardSnap = await getDoc(cardRef);
    const card = cardSnap.data();

    let { interval, repetition, easeFactor } = card;

    // --- SM-2 ALGORITHM LOGIC ---
    if (quality >= 3) {
      if (repetition === 0) interval = 1;
      else if (repetition === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      
      repetition += 1;
      // Adjust ease factor based on performance
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
    } else {
      // Failed card
      repetition = 0;
      interval = 1; // Review again tomorrow
    }

    // Calculate new due date
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + interval);

    await updateDoc(cardRef, {
      interval,
      repetition,
      easeFactor,
      dueDate: newDueDate
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
  }
};