import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Function to convert Unix timestamp (seconds) to HH:MM
const formatTime = (unixTimestamp) => {
  if (!unixTimestamp || isNaN(unixTimestamp)) {
    console.warn('Invalid unix_timestamp:', unixTimestamp);
    return '00:00';
  }
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function SleepGraph() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [allData, setAllData] = useState([]); // Store all fetched data
  const [selectedDate, setSelectedDate] = useState(''); // Selected date from dropdown
  const [availableDates, setAvailableDates] = useState([]); // List of unique dates

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sleep'));
        const allFetchedData = [];
        const dates = new Set(); // To store unique dates
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          const date = doc.id; // Use document ID as the date
          dates.add(date);
          Object.keys(docData).forEach(key => {
            if (key !== 'id') {
              const entry = docData[key];
              allFetchedData.push({
                sleep_count: entry.sleep_count || 0,
                unix_timestamp: entry.unix_timestamp,
                date: date, // Add date to each entry
              });
            }
          });
        });
        setAllData(allFetchedData);
        const sortedDates = Array.from(dates).sort().reverse(); // Sort dates in descending order
        setAvailableDates(sortedDates);
        if (sortedDates.length > 0) {
          setSelectedDate(sortedDates[0]); // Set the latest date as default
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      }
    };
    fetchData();
  }, []);

  // Update chart data when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setChartData({ labels: [], datasets: [] });
      return;
    }

    // Filter data for the selected date
    const filteredData = allData.filter(entry => entry.date === selectedDate);

    // Sort by unix_timestamp to ensure chronological order
    filteredData.sort((a, b) => a.unix_timestamp - b.unix_timestamp);

    // Prepare data for the chart
    const labels = filteredData.map(entry => formatTime(entry.unix_timestamp));
    const data = filteredData.map(entry => entry.sleep_count);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Number of Sleeping Students',
          data: data,
          borderColor: '#3b82f6', // Blue color for the line
          backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue fill
          fill: true,
          tension: 0.3, // Smooth the line
        },
      ],
    });
  }, [selectedDate, allData]);

  // Handle date selection
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Sleep Count on ${selectedDate || 'Select a Date'}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (HH:MM)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Sleeping Students',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Ensures steps are in integers
          callback: function(value) {
            return Number.isInteger(value) ? value : null; // Only show integer values
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
        <InputLabel id="date-select-label" sx={{ color: 'black' }}>
          Select Date
        </InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Select Date"
          onChange={handleDateChange}
          sx={{
            backgroundColor: '#1a202c',
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'black',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'black',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'black',
            },
            '.MuiSvgIcon-root': {
              color: 'black',
            },
          }}
        >
          <MenuItem value="">
            <em>Select a Date</em>
          </MenuItem>
          {availableDates.map((date) => (
            <MenuItem key={date} value={date} sx={{ color: 'black' }}>
              {date}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {chartData.labels.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>
          {selectedDate ? 'No data available for this date' : 'Please select a date to view the graph'}
        </p>
      )}
    </div>
  );
}