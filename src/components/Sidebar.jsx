import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase'; // Pastikan path ini benar

// Impor Ikon dari Material-UI
import HomeIcon from '@mui/icons-material/Home';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, CircularProgress } from '@mui/material';


export default function Sidebar() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. useEffect untuk mengambil data pengguna saat status login berubah
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Jika ada pengguna yang login, ambil datanya dari Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        } else {
          console.log("Tidak ada data pengguna di Firestore.");
        }
      } else {
        // Tidak ada pengguna yang login
        setUsername('');
      }
      setLoading(false);
    });

    // Membersihkan listener saat komponen dilepas
    return () => unsubscribe();
  }, []);


  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Sign out error', error));
  };
  
  // Daftar menu untuk navigasi yang lebih rapi
  const menuItems = [
    { text: 'Data Harian', icon: <HomeIcon />, path: '/' },
    { text: 'Lihat Analytic', icon: <LeaderboardIcon />, path: '/analytics' },
    { text: 'Durasi Tidur', icon: <AccessAlarmIcon />, path: '/durations' },
    // { text: 'Sebaran Baris', icon: <ViewColumnIcon />, path: '/row' },
  ];

  return (
    // Menggunakan komponen Box dari MUI untuk layout utama
    <Box
      sx={{
        width: 280,
        height: '100vh',
        bgcolor: '#1A202C', // Warna abu-abu gelap yang konsisten
        color: '#A0AEC0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed', // <-- TAMBAHKAN BARIS INI
        left: 0,
        top: 0,
        zIndex: 10
      }}
    >
      {/* --- Bagian Header/Profil --- */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AccountCircleIcon sx={{ fontSize: 40, color: '#718096' }}/>
        <Box>
          <Typography variant="body2">Selamat Datang,</Typography>
          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={16} color="inherit" /> : username || 'Pengguna'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: '#2D3748' }} />

      {/* --- Bagian Navigasi Menu --- */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavLink to={item.path} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              {({ isActive }) => (
                <ListItemButton sx={{
                  py: 1.5, px: 3,
                  bgcolor: isActive ? 'rgba(128, 90, 213, 0.2)' : 'transparent', // Warna ungu untuk link aktif
                  borderLeft: isActive ? '4px solid #805AD5' : '4px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}>
                  <ListItemIcon sx={{ color: isActive ? '#B794F4' : '#718096' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ color: isActive ? 'white' : '#A0AEC0' }} />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ bgcolor: '#2D3748' }} />
      
      {/* --- Bagian Logout --- */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
            onClick={handleSignOut}
            sx={{
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(229, 62, 62, 0.2)' }
            }}
        >
            <ListItemIcon sx={{ color: '#718096' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );
}