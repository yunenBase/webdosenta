// src/components/AuthPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase'; // PASTIKAN ANDA EKSPOR 'db' DARI firebase.js
import { doc, setDoc } from 'firebase/firestore'; // Import fungsi Firestore
import './AuthPage.css';

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // State baru untuk NIP dan Username
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function untuk membuat email sintetis
  const createSyntheticEmail = (nip) => `${nip}@gmail.com`; // Ganti your-domain.com!

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setNip('');
    setUsername('');
    setPassword('');
  };

  // Di dalam file: src/components/AuthPage.jsx

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const syntheticEmail = createSyntheticEmail(nip);

    try {
      if (isLoginView) {
        // --- PROSES LOGIN ---
        await signInWithEmailAndPassword(auth, syntheticEmail, password);
        console.log('User signed in successfully!');
      } else {
        // --- PROSES REGISTRASI ---
        if (username.trim() === '') {
            setError('Username tidak boleh kosong.');
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          nip: nip,
          username: username,
          email: syntheticEmail
        });

        console.log('User created and data saved to Firestore!');
      }
      navigate('/');
    } catch (err) {
      // --- BLOK ERROR YANG DIPERBAIKI ---
      console.error('Authentication error:', err.code); // Lihat kode error di konsol
      switch (err.code) {
        case 'auth/user-not-found':
          setError('NIP tidak terdaftar.');
          break;
        case 'auth/wrong-password':
          setError('Password yang Anda masukkan salah.');
          break;
        case 'auth/email-already-in-use':
          setError('NIP ini sudah pernah didaftarkan. Silakan login.');
          break;
        case 'auth/weak-password':
          setError('Password terlalu lemah. Gunakan minimal 6 karakter.');
          break;
        case 'auth/invalid-email':
          setError('Format NIP tidak valid, mohon periksa kembali.');
          break;
        default:
          setError('Terjadi kesalahan. Silakan coba beberapa saat lagi.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // --- Tampilan JSX Diperbarui ---
  return (
    <div className="auth-container">
      <div className="auth-box">
        <form onSubmit={handleAuthAction}>
          <h2>{isLoginView ? 'Login Dosen' : 'Registrasi Akun'}</h2>
          
          <div className="input-group">
            <input
              type="text" // Ganti jadi text
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="NIP (Nomor Induk Pegawai)"
              required
              disabled={loading}
            />
          </div>

          {/* Hanya tampilkan input Username di view Registrasi */}
          {!isLoginView && (
            <div className="input-group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Memproses...' : (isLoginView ? 'Sign In' : 'Sign Up')}
          </button>

          {/* <p className="toggle-text">
            {isLoginView ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <span onClick={toggleView} className="toggle-link">
              {isLoginView ? ' Sign Up' : ' Sign In'}
            </span>
          </p> */}
        </form>
      </div>
    </div>
  );
}

export default AuthPage;