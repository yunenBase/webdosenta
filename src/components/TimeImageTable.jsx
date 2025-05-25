import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

// Function to convert Unix timestamp (seconds) to HH:MM:SS in WIB (UTC+7)
const formatTime = (unixTimestamp) => {
  if (!unixTimestamp || isNaN(unixTimestamp)) {
    console.warn('Invalid unix_timestamp:', unixTimestamp);
    return '00:00:00';
  }
  const date = new Date(unixTimestamp * 1000);
  date.setUTCHours(date.getUTCHours() + 7);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outline: 'none',
  maxWidth: '90%',
  maxHeight: '90%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

// Function to determine row based on relative y-coordinate
const getRowNumber = (y1_rel) => {
  if (y1_rel < 0.25) return 1;
  if (y1_rel < 0.5) return 2;
  if (y1_rel < 0.75) return 3;
  return 4;
};

export default function TimeImageTable() {
  const [rows, setRows] = useState([]);
  const [allData, setAllData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState('image');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sleep'));
        const allFetchedData = [];
        const dates = new Set();
        querySnapshot.forEach(doc => {
          const docData = doc.data();
          const date = doc.id;
          dates.add(date);
          Object.keys(docData).forEach(key => {
            if (key !== 'id') {
              const entry = docData[key];
              allFetchedData.push({
                id: key,
                time: formatTime(entry.unix_timestamp),
                image: entry.url_image,
                date: date,
                coords_rel: entry.coords_rel || {},
                total_duration: entry.total_duration || 0,
                camera_id: entry.camera_id || 0,
              });
            }
          });
        });
        setAllData(allFetchedData);
        setAvailableDates(Array.from(dates));

        const groupedData = allFetchedData.reduce((acc, entry) => {
          const { time, camera_id, image, coords_rel, total_duration } = entry;
          if (!acc[time]) {
            acc[time] = { time, camera1: null, camera2: null, coords_rel, total_duration };
          }
          if (camera_id === 1) {
            acc[time].camera1 = { image, coords_rel, total_duration };
          } else if (camera_id === 2) {
            acc[time].camera2 = { image, coords_rel, total_duration };
          }
          return acc;
        }, {});

        const processedRows = Object.values(groupedData);

        if (availableDates.length > 0) {
          const sortedDates = Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
          setSelectedDate(sortedDates[0]);
          const filteredRows = processedRows.filter(row => 
            allFetchedData.some(data => data.time === row.time && data.date === sortedDates[0])
          );
          setRows(filteredRows);
        } else {
          setRows(processedRows);
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    if (date) {
      const filteredRows = allData.reduce((acc, entry) => {
        if (entry.date !== date) return acc;
        const { time, camera_id, image, coords_rel, total_duration } = entry;
        if (!acc[time]) {
          acc[time] = { time, camera1: null, camera2: null, coords_rel, total_duration };
        }
        if (camera_id === 1) {
          acc[time].camera1 = { image, coords_rel, total_duration };
        } else if (camera_id === 2) {
          acc[time].camera2 = { image, coords_rel, total_duration };
        }
        return acc;
      }, {});
      setRows(Object.values(filteredRows));
    } else {
      const groupedData = allData.reduce((acc, entry) => {
        const { time, camera_id, image, coords_rel, total_duration } = entry;
        if (!acc[time]) {
          acc[time] = { time, camera1: null, camera2: null, coords_rel, total_duration };
        }
        if (camera_id === 1) {
          acc[time].camera1 = { image, coords_rel, total_duration };
        } else if (camera_id === 2) {
          acc[time].camera2 = { image, coords_rel, total_duration };
        }
        return acc;
      }, {});
      setRows(Object.values(groupedData));
    }
  };

  const handleImageClick = (imageUrl, rowData) => {
    setSelectedImage(imageUrl);
    setSelectedRowData(rowData);
    setSelectedSlide('image');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage('');
    setSelectedRowData(null);
    setSelectedSlide('image');
  };

  const switchSlide = (slide) => {
    setSelectedSlide(slide);
  };

  const getRowStatus = () => {
    if (!selectedRowData || !selectedRowData.coords_rel || !selectedRowData.coords_rel.y1) return [false, false, false, false];
    const status = [false, false, false, false];
    const rowNum = getRowNumber(selectedRowData.coords_rel.y1);
    if (selectedRowData.total_duration > 0) {
      status[rowNum - 1] = true;
    }
    return status;
  };

  return (
    <>
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
            <MenuItem key={date} value={date} sx={{ color: 'black' }}>
              {date}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1a202c', color: '#ffffff' }}>
        <Table sx={{ minWidth: 300, borderCollapse: 'separate', borderSpacing: '0 15px' }} aria-label="time image table" align="center">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#ffffff', borderBottom: 'none', width: '20%' }}>Time</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: 'none', width: '40%' }}>Camera 1</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: 'none', width: '40%' }}>Camera 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.time}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, color: '#ffffff', backgroundColor: '#2d3748', borderRadius: '8px' }}
                >
                  <TableCell component="th" scope="row" sx={{ color: '#ffffff', padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {row.time}
                  </TableCell>
                  <TableCell sx={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {row.camera1 ? (
                      <img
                        src={row.camera1.image}
                        alt="camera 1"
                        style={{ width: '200px', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleImageClick(row.camera1.image, row.camera1)}
                        onError={(e) => console.log('Image load error:', e)}
                      />
                    ) : (
                      <span style={{ color: '#ffffff', display: 'block', textAlign: 'center' }}>No Image</span>
                    )}
                  </TableCell>
                  <TableCell sx={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                    {row.camera2 ? (
                      <img
                        src={row.camera2.image}
                        alt="camera 2"
                        style={{ width: '200px', height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleImageClick(row.camera2.image, row.camera2)}
                        onError={(e) => console.log('Image load error:', e)}
                      />
                    ) : (
                      <span style={{ color: '#ffffff', display: 'block', textAlign: 'center' }}>No Image</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: '#ffffff' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <Button variant="contained" onClick={() => switchSlide('image')} disabled={selectedSlide === 'image'}>
              Image
            </Button>
            <Button variant="contained" onClick={() => switchSlide('visualization')} disabled={selectedSlide === 'visualization'}>
              Visualization
            </Button>
          </div>
          {selectedSlide === 'image' && (
            <img
              src={selectedImage}
              alt="Selected sleep data"
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
          {selectedSlide === 'visualization' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {getRowStatus().map((isSleeping, index) => (
                <div
                  key={index}
                  style={{
                    width: '300px',
                    height: '50px',
                    backgroundColor: isSleeping ? 'red' : 'green',
                    margin: '5px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  Baris {index + 1} - {isSleeping ? 'Tertidur' : 'Tidak Tertidur'}
                </div>
              ))}
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
}