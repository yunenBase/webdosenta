import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Typography } from '@mui/material';

// Daftarkan komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SleepDurationChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]); // Daftar tanggal yang tersedia
  const [selectedDate, setSelectedDate] = useState(''); // Tanggal yang dipilih

  // 1. useEffect ini hanya untuk mengambil daftar tanggal yang tersedia (satu kali)
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'duration'));
        const availableDates = querySnapshot.docs.map(doc => doc.id);
        
        availableDates.sort((a, b) => new Date(b) - new Date(a));
        
        setDates(availableDates);
        
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]); // Set tanggal terbaru sebagai default
        } else {
          setLoading(false);
        }
      } catch (e) {
        setError('Gagal mengambil daftar tanggal: ' + e.message);
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  // 2. useEffect ini berjalan HANYA ketika `selectedDate` berubah
  useEffect(() => {
    if (!selectedDate) return;

    const fetchDataForDate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Ambil HANYA SATU dokumen berdasarkan tanggal yang dipilih
        const docRef = doc(db, 'duration', selectedDate);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Jika tidak ada data untuk tanggal ini, kosongkan chart
          setChartData(null);
          setLoading(false);
          return;
        }
        
        // Logika pengelompokan durasi Anda (sudah benar)
        const durationGroups = {
          '<10 detik': 0,
          '10-20 detik': 0,
          '21-30 detik': 0,
          '31-40 detik': 0,
          '41-50 detik': 0,
          '>50 detik': 0
        };

        const data = docSnap.data();
        Object.values(data).forEach(session => {
          const duration = session.duration;

          if (duration < 10) durationGroups['<10 detik']++;
          else if (duration <= 20) durationGroups['10-20 detik']++;
          else if (duration <= 30) durationGroups['21-30 detik']++;
          else if (duration <= 40) durationGroups['31-40 detik']++;
          else if (duration <= 50) durationGroups['41-50 detik']++;
          else durationGroups['>50 detik']++;
        });
        
        setChartData({
          labels: Object.keys(durationGroups),
          datasets: [{
            label: 'Jumlah Sesi Tidur',
            data: Object.values(durationGroups),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        });

      } catch (e) {
        setError('Gagal mengambil data durasi: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForDate();
  }, [selectedDate]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Distribusi Durasi Tidur (${selectedDate})`,
        font: { size: 18 },
        color: '#FFF'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} sesi`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Sesi', color: '#CCC' },
        ticks: { stepSize: 1, color: '#CCC' }
      },
      x: {
        title: { display: true, text: 'Rentang Durasi', color: '#CCC' },
        ticks: { color: '#CCC' }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: 'auto', p: 3, backgroundColor: '#2d3748', borderRadius: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="date-select-label" sx={{color: '#A0AEC0'}}>Pilih Tanggal</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Pilih Tanggal"
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#A0AEC0' }, '.MuiSvgIcon-root': { color: 'white' } }}
        >
          {dates.map(date => (
            <MenuItem key={date} value={date}>{date}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Typography color="error" align="center">{error}</Typography>}
      
      {!loading && !error && chartData && (
        <Bar data={chartData} options={options} />
      )}

      {!loading && !error && !chartData && (
         <Typography align="center" sx={{ color: '#A0AEC0', mt: 4 }}>
           Tidak ada data durasi tidur untuk tanggal {selectedDate}.
         </Typography>
      )}
    </Box>
  );
};

export default SleepDurationChart;