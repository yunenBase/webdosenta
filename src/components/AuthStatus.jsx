import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Sesuaikan path ke firebase.js

function AuthStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <p>Selamat datang, {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <p>Belum login</p>
      )}
    </div>
  );
}

export default AuthStatus;