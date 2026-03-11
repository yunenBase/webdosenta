import { Routes, Route, useLocation } from 'react-router-dom';
import TimeImageTable from './TimeImageTable';
import AnalyticsChart from './Analytics'; // Ganti nama file jika sesuai
import SleepDurationChart from './SleepDurationChart';
import SleepRowBarChart from './SleepRowBarChart';
import Sidebar from './Sidebar';
import { Box, Typography, Fade } from '@mui/material';

// Fungsi untuk mendapatkan judul halaman berdasarkan path
const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'Data Harian';
    case '/analytics':
      return 'Analisis Data Tidur';
    case '/durations':
      return 'Distribusi Durasi Tidur';
    case '/row':
      return 'Analisis Sebaran Baris';
    default:
      return 'Dashboard';
  }
};

const DashboardLayout = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#111827' }}>
      <Sidebar />

      {/* Area Konten Utama */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          marginLeft: '280px',
          width: 'calc(100% - 280px)'
        }}
      >
        {/* Header Konten */}
        <Box component="header">
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
            Sleep Monitoring
          </Typography>
          <Typography sx={{ color: '#9CA3AF' }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Wadah untuk komponen/halaman yang akan dirender */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#1F2937', // Warna sedikit lebih terang dari background utama
            borderRadius: 3,
            p: 3,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
          }}
        >
          <Fade in={true} timeout={500}>
            <div>
              <Routes>
                <Route path="/" element={<TimeImageTable />} />
                <Route path="/analytics" element={<AnalyticsChart />} />
                <Route path="/durations" element={<SleepDurationChart />} />
                <Route path="/row" element={<SleepRowBarChart />} />
              </Routes>
            </div>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;