import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // 1. Import Router
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // We will create this next
import Courses from './pages/Courses'; 
import Projects from './pages/Projects'; 
import { AuthContextProvider } from './context/AuthContext';
import Profile from './pages/Profile';
import Vault from './pages/Vault';
import CourseDetail from './pages/CourseDetail';

function App() {
  return (
    // 2. Wrap everything in <Router>
    <Router>
      <AuthContextProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
          </Route>
        </Routes>
      </AuthContextProvider>
    </Router>
  );
}

export default App;