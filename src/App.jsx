import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase'; // Sesuaikan path ke firebase.js Anda

// Impor halaman login dan layout dashboard baru Anda
import AuthPage from './components/AuthPage'; 
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener untuk memeriksa status login secara real-time
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // user akan null jika tidak login
      setLoading(false);
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  // Tampilkan pesan loading saat Firebase sedang memeriksa status login
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rute untuk halaman login */}
        <Route 
          path="/login" 
          element={!currentUser ? <AuthPage /> : <Navigate to="/" />} 
        />
        
        {/* Rute untuk semua halaman lain di dalam aplikasi */}
        <Route 
          path="/*" 
          element={currentUser ? <DashboardLayout /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;