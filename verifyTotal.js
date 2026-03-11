import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

// Inisialisasi aplikasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com' // <-- GANTI INI
});

const db = admin.firestore();

/**
 * Fungsi untuk mengambil data HARI INI dari koleksi 'sleep',
 * menjumlahkan semua 'sleep_count', dan menampilkannya di konsol.
 */
async function verifyTodaysSleepCount() {
  // 1. Dapatkan tanggal hari ini dalam format YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(today.getDate()).padStart(2, '0');
  const todayDocId = `${year}-${month}-${day}`; // Contoh: "2025-07-16"

  console.log(`Memulai skrip verifikasi untuk tanggal: ${todayDocId}...`);
  
  // 2. Ambil dokumen spesifik untuk hari ini
  const docRef = db.collection('sleep').doc(todayDocId);
  let totalSleepCount = 0;

  try {
    const docSnap = await docRef.get();

    // 3. Periksa apakah dokumen untuk hari ini ada
    if (!docSnap.exists) {
      console.log(`Tidak ada dokumen ditemukan untuk tanggal ${todayDocId}.`);
      return;
    }

    const dailyData = docSnap.data();
    
    // Iterasi melalui setiap entri di dalam dokumen hari ini
    Object.values(dailyData).forEach(entry => {
      if (entry && typeof entry.sleep_count === 'number') {
        totalSleepCount += entry.sleep_count;
      }
    });

    console.log('----------------------------------------------------');
    console.log(`✅ VERIFIKASI SELESAI`);
    console.log(`   Total 'sleep_count' untuk tanggal ${todayDocId} adalah: ${totalSleepCount}`);
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat menjalankan skrip:', error);
  }
}

// Jalankan fungsi verifikasi
verifyTodaysSleepCount();