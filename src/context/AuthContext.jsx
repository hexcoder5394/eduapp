// src/context/AuthContext.jsx
import { useContext, createContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Import these
import { auth, db } from '../lib/firebase'; // Import db

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... keep emailSignUp, emailSignIn, googleSignIn, logOut, sendVerification as they are ...
  const emailSignUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const emailSignIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logOut = () => {
    return signOut(auth);
  };
  
  const sendVerification = () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // IF LOGGED IN: Listen to the 'users' collection for profile data
        const userDocRef = doc(db, "users", currentUser.uid);
        
        // Real-time listener for profile changes
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Merge Auth data with Firestore Data
            setUser({ ...currentUser, ...docSnap.data() });
          } else {
            // Fallback if no firestore doc exists yet
            setUser(currentUser);
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        // IF LOGGED OUT
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn, emailSignUp, emailSignIn, logOut, sendVerification, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};