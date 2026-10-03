# Garuda Arena

Prototipe website booking lapangan futsal (tugas kuliah, Kelompok 6). Seluruhnya front-end statis: HTML, CSS, dan JavaScript tanpa backend dan tanpa build step.

## Menjalankan

Buka `webnya/index.html` langsung di browser, atau jalankan server statis dari folder `webnya/`:

```bash
cd webnya
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Butuh koneksi internet karena Tailwind CSS (CDN), Font Awesome, dan Google Fonts dimuat dari CDN.

## Halaman

| Peran | File |
| --- | --- |
| Pelanggan | `index.html`, `daftar-lapangan.html`, `detail-lapangan.html`, `pembayaran.html`, `riwayat-booking.html` |
| Admin | `admin-dashboard.html`, `admin-lapangan.html`, `admin-booking.html`, `admin-laporan.html` |

Alur utama: daftar lapangan → detail → pembayaran → riwayat booking. Admin menyetujui atau menolak booking dari `admin-booking.html`, dan status yang sama muncul di riwayat pelanggan.

## Struktur folder

```
webnya/
├── *.html            # satu file per halaman, tanpa style/script inline
├── css/              # garuda-shared.css (dipakai semua halaman) + CSS per halaman
├── js/               # satu file JS per halaman + modul bersama
│   ├── data-lapangan.js        # data awal lapangan
│   ├── field-storage.js        # baca/tulis data lapangan (localStorage)
│   ├── booking-storage.js      # baca/tulis data booking (localStorage)
│   ├── image-fallback.js       # gambar cadangan jika foto gagal dimuat
│   ├── admin-shell.js          # menu mobile panel admin
│   └── tailwind-config*.js     # konfigurasi Tailwind CDN
└── images/           # foto lapangan dan galeri
docs/
└── FIGMA-HANDOFF.md  # catatan impor ke Figma dan token desain
```

## Catatan prototipe

- Data booking dan lapangan disimpan di `localStorage` browser (`garudaArenaBookings`, `garudaArenaFields`, `garudaArenaCurrentUser`), jadi tidak dibagikan antar perangkat. Hapus data situs di browser untuk mengembalikan ke kondisi awal.
- Slot terisi hanya simulasi, bukan ketersediaan sebenarnya.
- Halaman admin tidak memakai login.
- Pastikan kamu punya hak pakai atas foto di `webnya/images/` sebelum repo dibuat publik.
