import React from 'react'
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom'

import Registerpage from './pages/Auth/Registerpage.jsx'
import Dashboardpage from './pages/Dashboard/Dashboardpage.jsx'
import Documentlistpage from './pages/Documents/Documentlistpage.jsx'
import DocumentDetailpage from './pages/Documents/DocumentDetailpage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import FlashcardListpage from './pages/Flashcards/FlashcardListpage.jsx'
import Flashcardpage from './pages/Flashcards/Flashcardpage.jsx'
import QuizTakepage from './pages/Quizzes/QuizTakepage.jsx'
import QuizResultpage from './pages/Quizzes/QuizResultpage.jsx'
import Profilepage from './pages/Profile/ProfilePage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.js'

function App() {
 const isAuthenticated = false; // Replace with actual authentication logic
 const loading = false; // Replace with actual loading state
  if(loading){
    return <div className="loading">Loading...</div>
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/register" />} />
        <Route path="/register" element={<Registerpage />} />
        {/* Protected Routes */}
       <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboardpage />} />
  <Route path="/documents" element={<Documentlistpage />} />
  <Route path="/documents/:id" element={<DocumentDetailpage />} />
  <Route path="/flashcards" element={<FlashcardListpage />} />
  <Route path="/documents/:id/flashcards" element={<Flashcardpage />} />
  <Route path="/quizzes/:id" element={<QuizTakepage />} />
  <Route path="/quizzes/:id/results" element={<QuizResultpage />} />
  <Route path="/profile" element={<Profilepage />} />
</Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  ) 
}

export default App
