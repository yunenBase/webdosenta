import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // <-- 1. Impor plugin zoom
import { Select, MenuItem, FormControl, InputLabel, CircularProgress, Box, Typography } from '@mui/material';

// 2. Daftarkan komponen dan plugin baru
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const formatTime = (unixTimestamp) => {
  if (!unixTimestamp) return '00:00';
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Efek untuk mengambil daftar tanggal yang tersedia (hanya sekali)
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sleep'));
        const availableDates = querySnapshot.docs.map(doc => doc.id).sort().reverse();
        setDates(availableDates);
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]);
        }
      } catch (e) {
        setError('Gagal memuat daftar tanggal. ');
        console.error(e);
      }
    };
    fetchDates();
  }, []);

  // Efek untuk mengambil data chart saat tanggal dipilih (lebih efisien)
  useEffect(() => {
    if (!selectedDate) {
      setLoading(false);
      return;
    };

    const fetchDataForDate = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'sleep', selectedDate);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setChartData(null); // Kosongkan data jika dokumen tidak ada
          return;
        }

        const dailyData = docSnap.data();
        const processedData = Object.values(dailyData)
          .sort((a, b) => a.unix_timestamp - b.unix_timestamp);

        const labels = processedData.map(entry => formatTime(entry.unix_timestamp));
        const data = processedData.map(entry => entry.sleep_count);

        setChartData({ labels, datasets: [{ data }] });
      } catch (e) {
        setError('Gagal memuat data chart.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDataForDate();
  }, [selectedDate]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#a0aec0' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          color: '#a0aec0',
          callback: value => Number.isInteger(value) ? value : null
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Jumlah Mahasiswa Tertidur pada ${selectedDate}`,
        color: '#ffffff',
        font: { size: 18 }
      },
      // 3. Konfigurasi plugin zoom dan pan
      zoom: {
        pan: {
          enabled: true,
          mode: 'x', // Hanya geser di sumbu X
          threshold: 5,
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        }
      }
    }
  };

  const chartDatasets = {
    labels: chartData?.labels || [],
    datasets: [{
      label: 'Jumlah Mahasiswa',
      data: chartData?.datasets[0]?.data || [],
      fill: true,
      // 4. Tampilan visual yang lebih indah
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(128, 90, 213, 0.5)");
        gradient.addColorStop(1, "rgba(128, 90, 213, 0)");
        return gradient;
      },
      borderColor: '#805ad5', // Warna ungu
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#805ad5',
      pointHoverBackgroundColor: '#805ad5',
      pointHoverBorderColor: '#ffffff',
      tension: 0.3
    }]
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: '900px', margin: 'auto', p: 3, backgroundColor: '#2d3748', borderRadius: 2 }}>
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="date-select-label" sx={{color: '#A0AEC0'}}>Pilih Tanggal</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Pilih Tanggal"
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#A0AEC0' }, '.MuiSvgIcon-root': { color: 'white' } }}
        >
          {dates.map(date => <MenuItem key={date} value={date}>{date}</MenuItem>)}
        </Select>
      </FormControl>

      <Box sx={{ height: '400px', position: 'relative' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>}
        {error && <Typography color="error" align="center">{error}</Typography>}
        {!loading && !error && chartData && (
          <Line data={chartDatasets} options={options} />
        )}
        {!loading && !error && !chartData && (
           <Typography align="center" sx={{ color: '#A0AEC0', mt: 4 }}>
             Tidak ada data untuk tanggal {selectedDate}.
           </Typography>
        )}
      </Box>
    </Box>
  );
}