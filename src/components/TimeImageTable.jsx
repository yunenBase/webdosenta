import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Modal, Box, Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';
import ImageIcon from '@mui/icons-material/ImageNotSupported';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Fungsi formatTime tidak berubah
const formatTime = (unixTimestamp) => {
  if (!unixTimestamp) return '00:00:00';
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Style untuk Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#2d3748', // Latar belakang gelap
  color: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  width: 'auto',
  maxWidth: '90vw',
};

const getRowNumber = (y1_rel) => {
  if (y1_rel < 0.25) return 1;
  if (y1_rel < 0.5) return 2;
  if (y1_rel < 0.75) return 3;
  return 4;
};

export default function TimeImageTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null); // Menyimpan image url dan data lainnya
  const [modalView, setModalView] = useState('image');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  // 1. Ambil daftar tanggal sekali saja
  useEffect(() => {
    const fetchDates = async () => {
      const querySnapshot = await getDocs(collection(db, 'sleep'));
      const dates = querySnapshot.docs.map(doc => doc.id).sort((a, b) => new Date(b) - new Date(a));
      setAvailableDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      } else {
        setLoading(false);
      }
    };
    fetchDates().catch(console.error);
  }, []);

  // 2. Ambil data spesifik saat tanggal berubah (LEBIH EFISIEN)
  useEffect(() => {
    if (!selectedDate) return;

    const fetchDataForDate = async () => {
      setLoading(true);
      const docRef = doc(db, 'sleep', selectedDate);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dailyData = docSnap.data();
        const groupedData = Object.values(dailyData).reduce((acc, entry) => {
          const time = formatTime(entry.unix_timestamp);
          if (!acc[time]) {
            acc[time] = { time, camera1: null, camera2: null };
          }
          const cameraData = {
            image: entry.url_image,
            coords_rel: entry.coords_rel || {},
            total_duration: entry.total_duration || 0,
          };
          if (entry.camera_id === 1) acc[time].camera1 = cameraData;
          else if (entry.camera_id === 2) acc[time].camera2 = cameraData;
          return acc;
        }, {});
        setRows(Object.values(groupedData).sort((a, b) => a.time.localeCompare(b.time)));
      } else {
        setRows([]); // Kosongkan data jika tidak ada dokumen
      }
      setLoading(false);
    };

    fetchDataForDate().catch(console.error);
  }, [selectedDate]);

  const handleImageClick = (cameraData) => {
    setSelectedImageData(cameraData);
    setModalView('image');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const getRowStatus = () => {
    if (!selectedImageData?.coords_rel?.y1) return [false, false, false, false];
    const status = [false, false, false, false];
    const rowNum = getRowNumber(selectedImageData.coords_rel.y1);
    if (selectedImageData.total_duration > 0) {
      status[rowNum - 1] = true;
    }
    return status;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', margin: 'auto', p: 3, backgroundColor: '#2d3748', borderRadius: 2 }}>
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="date-select-label" sx={{color: '#A0AEC0'}}>Pilih Tanggal</InputLabel>
        <Select
          labelId="date-select-label"
          value={selectedDate}
          label="Pilih Tanggal"
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#A0AEC0' }, '.MuiSvgIcon-root': { color: 'white' } }}
        >
          {availableDates.map(date => <MenuItem key={date} value={date}>{date}</MenuItem>)}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
        <Table aria-label="time image table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#CBD5E0', borderColor: '#4A5568' }}>Waktu</TableCell>
              <TableCell align="center" sx={{ color: '#CBD5E0', borderColor: '#4A5568' }}>Kamera 1</TableCell>
              <TableCell align="center" sx={{ color: '#CBD5E0', borderColor: '#4A5568' }}>Kamera 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.time} sx={{ '&:hover': { backgroundColor: '#4A5568' } }}>
                  <TableCell component="th" scope="row" sx={{ color: 'white', borderColor: '#4A5568' }}>{row.time}</TableCell>
                  {[row.camera1, row.camera2].map((camera, index) => (
                    <TableCell key={index} align="center" sx={{ borderColor: '#4A5568', p: 1 }}>
                      {camera ? (
                        <Box component="img" src={camera.image} alt={`camera ${index + 1}`}
                          sx={{ width: 150, height: 150, objectFit: 'cover', cursor: 'pointer', borderRadius: 1 }}
                          onClick={() => handleImageClick(camera)}
                        />
                      ) : (
                        <Box sx={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1A202C', borderRadius: 1 }}>
                          <ImageIcon sx={{ color: '#718096' }} />
                        </Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} align="center" sx={{ color: '#A0AEC0', borderColor: '#4A5568' }}>Tidak ada data untuk tanggal ini.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <ToggleButtonGroup value={modalView} exclusive onChange={(e, newView) => newView && setModalView(newView)} sx={{ mb: 2 }}>
            <ToggleButton value="image" sx={{ color: 'white' }}>Gambar</ToggleButton>
            <ToggleButton value="visualization" sx={{ color: 'white' }}>Visualisasi</ToggleButton>
          </ToggleButtonGroup>
          {modalView === 'image' ? (
            <img src={selectedImageData?.image} alt="Selected" style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain' }} />
          ) : (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {getRowStatus().map((isSleeping, index) => (
                <Box key={index} sx={{
                  width: 300, p: 2, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2,
                  bgcolor: isSleeping ? '#742A2A' : '#2A433A', // Warna merah & hijau tua
                  border: `1px solid ${isSleeping ? '#F56565' : '#68D391'}`
                }}>
                  {isSleeping ? <BedtimeIcon sx={{ color: '#F56565' }} /> : <CheckCircleIcon sx={{ color: '#68D391' }} />}
                  <Typography>Baris {index + 1} - {isSleeping ? 'Tertidur' : 'Tidak Tertidur'}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}