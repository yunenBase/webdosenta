import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Daftarkan komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SleepDurationChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([]); // Daftar tanggal dari Firestore
  const [selectedDate, setSelectedDate] = useState(''); // Tanggal yang dipilih

  useEffect(() => {
    const fetchDates = async () => {
      try {
        // Ambil semua dokumen di koleksi 'duration' untuk mendapatkan daftar tanggal
        const durationRef = collection(db, 'duration');
        const querySnapshot = await getDocs(durationRef);
        const availableDates = querySnapshot.docs.map(doc => doc.id);
        
        // Urutkan tanggal secara descending (terbaru ke terlama)
        availableDates.sort((a, b) => new Date(b) - new Date(a));
        
        setDates(availableDates);
        
        // Set tanggal terbaru sebagai default
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]);
        }
        setLoading(false);
      } catch (e) {
        setError('Gagal mengambil daftar tanggal dari Firestore: ' + e.message);
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  useEffect(() => {
    if (!selectedDate) return; // Jangan ambil data jika tanggal belum dipilih

    const fetchData = async () => {
      try {
        setLoading(true);
        const durationRef = collection(db, 'duration');
        const querySnapshot = await getDocs(durationRef);
        
        // Proses data untuk grafik
        const durationGroups = {
          '<10': [],
          '11-20': [],
          '21-30': [],
          '31-40': [],
          '41-50': [],
          '>50': []
        };

        querySnapshot.forEach((doc) => {
          if (doc.id === selectedDate) {
            const data = doc.data();
            Object.keys(data).forEach((id) => {
              const session = data[id];
              const duration = session.duration;

              // Kelompokkan ID berdasarkan durasi
              if (duration <= 10) {
                durationGroups['<10'].push(id);
              } else if (duration <= 20) {
                durationGroups['11-20'].push(id);
              } else if (duration <= 30) {
                durationGroups['21-30'].push(id);
              } else if (duration <= 40) {
                durationGroups['31-40'].push(id);
              } else if (duration <= 50) {
                durationGroups['41-50'].push(id);
              } else {
                durationGroups['>50'].push(id);
              }
            });
          }
        });

        // Hitung jumlah mahasiswa (ID unik) dalam setiap rentang
        const labels = Object.keys(durationGroups);
        const studentCounts = labels.map(label => durationGroups[label].length);

        // Siapkan data untuk Chart.js
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Jumlah Mahasiswa',
              data: studentCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.5)', // Hijau
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        });
        setLoading(false);
      } catch (e) {
        setError('Gagal mengambil data dari Firestore: ' + e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (dates.length === 0) {
    return <div>Tidak ada data durasi tidur yang tersedia.</div>;
  }

  if (!chartData || chartData.labels.every(label => chartData.datasets[0].data[chartData.labels.indexOf(label)] === 0)) {
    return (
      <div>
        <label htmlFor="date-select">Pilih Tanggal: </label>
        <select  id="date-select" value={selectedDate} onChange={handleDateChange}>
          {dates.map(date => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
        <div>Tidak ada data durasi tidur untuk tanggal {selectedDate}.</div>
      </div>
    );
  }

  // Opsi untuk grafik
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `Jumlah Mahasiswa Berdasarkan Rata-Rata Durasi Tidur (${selectedDate})`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah Mahasiswa'
        },
        ticks: {
          stepSize: 1 // Pastikan sumbu Y hanya menampilkan bilangan bulat
        }
      },
      x: {
        title: {
          display: true,
          text: 'Rata-Rata Durasi Tidur (detik)'
        }
      }
    }
  };

  return (
    <div>
      <label htmlFor="date-select">Pilih Tanggal: </label>
      <select
        id="date-select"
        value={selectedDate}
        onChange={handleDateChange}
        style={{ color: 'white', backgroundColor: 'black', border: '1px solid white' }}
      >
        {dates.map(date => (
          <option key={date} value={date} style={{ backgroundColor: 'black', color: 'white' }}>
            {date}
          </option>
        ))}
      </select>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SleepDurationChart;