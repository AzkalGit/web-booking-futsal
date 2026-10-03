// Sumber data tunggal untuk seluruh halaman Garuda Arena.
// Data ini masih berupa data simulasi untuk prototipe tugas kuliah.
window.GARUDA_ARENA_DATA = {
    LAPANGAN: [
        {
            id: 1,
            nama: "Garuda Arena VIP",
            jenis: "interlock",
            jenisLabel: "Interlock",
            harga: 180000,
            rating: 4.6,
            ulasanCount: 16,
            lokasi: "Arena Utama Lantai 1",
            deskripsi: "Lapangan interlock premium di lantai utama dengan pencahayaan LED profesional dan sirkulasi udara optimal. Sangat nyaman untuk pertandingan kompetitif maupun latihan rutin tim Anda.",
            ukuran: "25 x 15 m",
            kapasitas: "10 pemain",
            fasilitas: ["Free Wi-Fi", "Shower Air Panas", "AC Central", "Locker Room", "Parkir Luas"],
            gambar: "images/2-venue-interlock.jpg",
            status: "Aktif"
        },
        {
            id: 2,
            nama: "Merdeka Arena",
            jenis: "rumput",
            jenisLabel: "Rumput Sintetis",
            harga: 150000,
            rating: 4.7,
            ulasanCount: 18,
            lokasi: "Arena Outdoor Covered",
            deskripsi: "Arena rumput sintetis berkualitas tinggi dengan atap pelindung semi-outdoor yang sejuk. Menghadirkan sensasi lapangan terbuka tanpa terhalang cuaca panas atau hujan.",
            ukuran: "40 x 20 m",
            kapasitas: "14 pemain",
            fasilitas: ["Parkir Luas", "Kantin & Cafe", "Musala", "Pencahayaan Malam"],
            gambar: "images/3-venue-rumput.jpg",
            status: "Aktif"
        },
        {
            id: 3,
            nama: "Champions Court",
            jenis: "vinyl",
            jenisLabel: "Vinyl Pro",
            harga: 200000,
            rating: 4.8,
            ulasanCount: 14,
            lokasi: "Arena Indoor Lantai 2",
            deskripsi: "Lapangan lantai vinyl kelas profesional di lantai 2 indoor ber-AC dengan fasilitas lengkap. Dilengkapi tribun penonton dan papan skor digital untuk turnamen bergengsi.",
            ukuran: "38 x 20 m",
            kapasitas: "14 pemain",
            fasilitas: ["Locker Room", "Live Streaming Ready", "Tribun Penonton", "Papan Skor", "AC Central"],
            gambar: "images/4-venue-vinyl.jpg",
            status: "Aktif"
        },
        {
            id: 4,
            nama: "Rencong Arena",
            jenis: "interlock",
            jenisLabel: "Interlock",
            harga: 140000,
            rating: 4.5,
            ulasanCount: 11,
            lokasi: "Gedung B Lantai 1",
            deskripsi: "Lapangan interlock ekonomis namun tetap berkualitas tinggi di Gedung B. Pilihan favorit komunitas untuk sparing santai dengan permukaan yang sangat kesat dan aman.",
            ukuran: "25 x 15 m",
            kapasitas: "10 pemain",
            fasilitas: ["Free Wi-Fi", "Parkir Luas", "Kantin & Cafe"],
            gambar: "images/2-venue-interlock.jpg",
            status: "Aktif"
        },
        {
            id: 5,
            nama: "Seulawah Court",
            jenis: "rumput",
            jenisLabel: "Rumput Sintetis",
            harga: 130000,
            rating: 4.6,
            ulasanCount: 9,
            lokasi: "Zona Outdoor Timur",
            deskripsi: "Lapangan rumput sintetis outdoor di sisi timur kompleks dengan angin sepoi-sepoi alami. Sangat cocok untuk sesi latihan sore hari bersama rekan-rekan komunitas.",
            ukuran: "30 x 18 m",
            kapasitas: "12 pemain",
            fasilitas: ["Kantin & Cafe", "Musala", "Parkir Luas"],
            gambar: "images/3-venue-rumput.jpg",
            status: "Aktif"
        },
        {
            id: 6,
            nama: "Lampuuk Turf",
            jenis: "rumput",
            jenisLabel: "Rumput Sintetis",
            harga: 160000,
            rating: 4.7,
            ulasanCount: 13,
            lokasi: "Zona Outdoor Barat",
            deskripsi: "Lapangan rumput sintetis standar luas di Zona Barat dengan lampu sorot terang di malam hari. Dilengkapi fasilitas shower air panas dan kantin luas di dekat area lapangan.",
            ukuran: "40 x 20 m",
            kapasitas: "14 pemain",
            fasilitas: ["Parkir Luas", "Shower Air Panas", "Pencahayaan Malam", "Kantin & Cafe"],
            gambar: "images/3-venue-rumput.jpg",
            status: "Perawatan"
        },
        {
            id: 7,
            nama: "Peunayong Arena",
            jenis: "vinyl",
            jenisLabel: "Vinyl Pro",
            harga: 220000,
            rating: 4.9,
            ulasanCount: 10,
            lokasi: "Arena Indoor Lantai 3",
            deskripsi: "Arena vinyl eksklusif di lantai 3 dengan standar premium dan fasilitas siaran langsung. Menawarkan kenyamanan maksimal bagi pemain profesional maupun korporat.",
            ukuran: "40 x 22 m",
            kapasitas: "14 pemain",
            fasilitas: ["Tribun Penonton", "Locker Room", "Papan Skor", "AC Central", "Live Streaming Ready"],
            gambar: "images/4-venue-vinyl.jpg",
            status: "Aktif"
        },
        {
            id: 8,
            nama: "Krueng Arena",
            jenis: "interlock",
            jenisLabel: "Interlock",
            harga: 120000,
            rating: 4.4,
            ulasanCount: 7,
            lokasi: "Gedung C Lantai 1",
            deskripsi: "Lapangan interlock ramah di kantong dengan kualitas permukaan standar turnamen. Menjadi andalan para pelajar dan mahasiswa untuk menyalurkan hobi futsal mereka.",
            ukuran: "25 x 15 m",
            kapasitas: "10 pemain",
            fasilitas: ["Free Wi-Fi", "Musala", "Parkir Luas"],
            gambar: "images/2-venue-interlock.jpg",
            status: "Aktif"
        }
    ],

    THUMBNAILS: [
        { url: "images/5-galeri-kantin.jpg", alt: "Kantin dan area santai" },
        { url: "images/6-galeri-ruang-ganti.jpg", alt: "Ruang ganti dan loker" },
        { url: "images/7-galeri-pertandingan.jpg", alt: "Pertandingan futsal" }
    ],

    ULASAN_LIST: [
        { nama: "Rizky Ramadhan", tanggal: "28 Sep 2026", rating: 5, isi: "Permukaan lantai sangat kesat dan bersih, tidak licin sama sekali. Pencahayaan malam hari juga sangat terang dan nyaman." },
        { nama: "Aulia Rahma", tanggal: "24 Sep 2026", rating: 5, isi: "Fasilitas ruang ganti dan shower air panasnya berfungsi sangat baik. Pelayanan staf ramah dan area parkirnya sangat luas." },
        { nama: "Teuku Fajar", tanggal: "20 Sep 2026", rating: 4, isi: "Tempatnya strategis, sirkulasi udara di dalam arena bagus jadi tidak terlalu gerah saat bermain penuh satu jam." }
    ]
};
