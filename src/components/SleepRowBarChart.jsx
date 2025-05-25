import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to determine row based on relative y-coordinate
const getRowNumber = (y1_rel) => {
  if (y1_rel < 0.25) return 1;
  if (y1_rel < 0.5) return 2;
  if (y1_rel < 0.75) return 3;
  return 4;
};

const SleepRowBarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(''); // Selected date from dropdown
  const [availableDates, setAvailableDates] = useState([]); // List of unique dates

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sleep'));
        const dates = new Set();
        querySnapshot.forEach(doc => {
          dates.add(doc.id);
        });
        const sortedDates = Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]); // Default to the latest date
        }
        setLoading(false);
      } catch (e) {
        setError('Gagal mengambil daftar tanggal: ' + e.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'sleep'));
        const rowCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

        querySnapshot.forEach(doc => {
          if (doc.id === selectedDate) {
            const docData = doc.data();
            Object.values(docData).forEach(entry => {
              if (entry.coords_rel && entry.coords_rel.y1 && entry.total_duration > 0) {
                const rowNum = getRowNumber(entry.coords_rel.y1);
                rowCounts[rowNum] = (rowCounts[rowNum] || 0) + 1;
              }
            });
          }
        });

        setChartData({
          labels: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4'],
          datasets: [{
            label: 'Jumlah Deteksi Tidur',
            data: [rowCounts[1], rowCounts[2], rowCounts[3], rowCounts[4]],
            backgroundColor: 'rgba(255, 99, 132, 0.5)', // Merah muda
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        });
        setLoading(false);
      } catch (e) {
        setError('Gagal mengambil data untuk chart: ' + e.message);
        setLoading(false);
      }
    };
    fetchChartData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData || chartData.datasets[0].data.every(count => count === 0)) {
    return (
      <div>
        <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
          <InputLabel id="date-select-label" sx={{ color: 'black' }}>Select Date</InputLabel>
          <Select
            labelId="date-select-label"
            value={selectedDate}
            label="Select Date"
            onChange={handleDateChange}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
              '.MuiSvgIcon-root': { color: 'black' },
            }}
          >
            <MenuItem value="">
              <em>All Dates</em>
            </MenuItem>
            {availableDates.map((date) => (
              <MenuItem key={date} value={date} sx={{ color: 'black' }}>{date}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <div>Tidak ada deteksi tidur untuk tanggal {selectedDate}.</div>
      </div>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Baris Paling Banyak Terdeteksi Tertidur (${selectedDate})`,
        color: '#ffffff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Jumlah Deteksi', color: '#ffffff' },
        ticks: { color: '#ffffff', stepSize: 1 }
      },
      x: {
        title: { display: true, text: 'Baris Kursi', color: '#ffffff' },
        ticks: { color: '#ffffff' }
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#1a202c', padding: '20px', borderRadius: '8px' }}>
      <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
        <InputLabel id="date-select-label" sx={{ color: 'black' }}>Select Date</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Select Date"
          onChange={handleDateChange}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
            '.MuiSvgIcon-root': { color: 'black' },
          }}
        >
          <MenuItem value="">
            <em>All Dates</em>
          </MenuItem>
          {availableDates.map((date) => (
            <MenuItem key={date} value={date} sx={{ color: 'black' }}>{date}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SleepRowBarChart;