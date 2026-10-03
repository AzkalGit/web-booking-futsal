// Data bersama dari js/data-lapangan.js
let LAPANGAN = GarudaFields.getPublicFields();
const THUMBNAILS = window.GARUDA_ARENA_DATA.THUMBNAILS;
const ULASAN_LIST = window.GARUDA_ARENA_DATA.ULASAN_LIST;

// State Booking saat ini
let selectedDate = GarudaBooking.getLocalDateString();
let selectedStartHour = null; // e.g. 19
let selectedDurasi = 1;

// Inisialisasi Halaman
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Parse URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    const rawId = urlParams.get('id');

    // Kalau tidak ada lapangan yang dipilih dari daftar (tanpa ?id=),
    // otomatis tampilkan lapangan pertama. Jika ?id= ada tapi tidak valid,
    // tetap tampilkan halaman "Lapangan Tidak Ditemukan".
    let idParam;
    if (rawId === null || rawId.trim() === '') {
        idParam = LAPANGAN[0].id;
    } else {
        idParam = parseInt(rawId, 10);
        if (isNaN(idParam)) {
            showNotFound();
            return;
        }
    }

    LAPANGAN = GarudaFields.getPublicFields();
    const currentLapangan = LAPANGAN.find(l => l.id === idParam);
    if (!currentLapangan) {
        showNotFound();
        return;
    }

    // Tampilkan halaman detail dan set judul tab
    document.title = `${currentLapangan.nama} - Garuda Arena`;
    document.getElementById('breadcrumb-nama').textContent = currentLapangan.nama;

    // Render komponen
    renderGaleri(currentLapangan);
    renderHeaderInfo(currentLapangan);
    renderSpesifikasi(currentLapangan);
    renderFasilitas(currentLapangan);
    renderUlasan(currentLapangan);
    renderLapanganSerupa(currentLapangan);

    // Inisialisasi Booking Form
    initBookingForm(currentLapangan);
});

function showNotFound() {
    document.getElementById('detail-wrapper').classList.add('hidden');
    document.getElementById('mobile-sticky-bar').classList.add('hidden');
    document.getElementById('not-found-state').classList.remove('hidden');
}

/**
 * 1. renderGaleri
 */
function renderGaleri(lapangan) {
    const mainImg = document.getElementById('main-image');
    const thumbContainer = document.getElementById('thumbnail-container');

    // Foto 1 = gambar utama lapangan, sisanya fasilitas
    const images = [lapangan.gambar, ...THUMBNAILS.map(t => t.url)];
    const alts = [lapangan.nama, ...THUMBNAILS.map(t => t.alt)];

    // Set gambar utama dari asset lokal. Fallback mencegah area gambar menjadi kosong
    // jika salah satu asset gagal dimuat.
    setImageWithFallback(mainImg, images[0], alts[0]);

    thumbContainer.innerHTML = '';
    images.forEach((imgUrl, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-full aspect-[16/10] rounded-xl overflow-hidden border-2 transition ${idx === 0 ? 'border-[#15803D] ring-2 ring-[#DCFCE7]' : 'border-transparent hover:border-[#15803D]'}`;
        btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
        const thumbImg = document.createElement('img');
        thumbImg.src = imgUrl;
        thumbImg.alt = alts[idx];
        thumbImg.className = 'w-full h-full object-cover';
        thumbImg.addEventListener('error', () => {
            thumbImg.remove();
            btn.classList.add('flex', 'items-center', 'justify-center', 'bg-[#DCFCE7]');
            btn.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-image text-[#15803D]" aria-hidden="true"></i>');
        }, { once: true });
        btn.appendChild(thumbImg);

        btn.addEventListener('click', () => {
            setImageWithFallback(mainImg, imgUrl, alts[idx]);
            // update active border
            Array.from(thumbContainer.children).forEach((b, i) => {
                b.className = `w-full aspect-[16/10] rounded-xl overflow-hidden border-2 transition ${i === idx ? 'border-[#15803D] ring-2 ring-[#DCFCE7]' : 'border-transparent hover:border-[#15803D]'}`;
                b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
            });
        });

        thumbContainer.appendChild(btn);
    });
}

function setImageWithFallback(img, src, alt) {
    img.alt = alt;
    img.onerror = () => {
        img.onerror = null;
        img.src = 'images/1-hero-lapangan-senja.jpg';
        img.alt = `${alt} - gambar cadangan`;
    };
    img.src = src;
}

function renderHeaderInfo(lapangan) {
    document.getElementById('detail-badge').textContent = lapangan.jenisLabel;
    document.getElementById('detail-rating').textContent = lapangan.rating.toLocaleString('id-ID', { minimumFractionDigits: 1 });
    document.getElementById('detail-ulasan-count').textContent = `(${lapangan.ulasanCount} ulasan)`;
    document.getElementById('detail-nama').textContent = lapangan.nama;
    document.getElementById('detail-lokasi').textContent = lapangan.lokasi;
    document.getElementById('detail-deskripsi').textContent = lapangan.deskripsi;

    document.getElementById('summary-rating-num').textContent = `${lapangan.rating.toLocaleString('id-ID', { minimumFractionDigits: 1 })} / 5.0`;
    document.getElementById('summary-ulasan-text').textContent = `Berdasarkan ${lapangan.ulasanCount} ulasan`;
    document.getElementById('summary-lapangan-nama').textContent = lapangan.nama;
    document.getElementById('booking-harga-text').textContent = `Rp ${lapangan.harga.toLocaleString('id-ID')}`;
}

/**
 * 2. renderSpesifikasi
 */
function renderSpesifikasi(lapangan) {
    const container = document.getElementById('spesifikasi-container');
    const specs = [
        { icon: 'fa-chess-board', label: 'Jenis Lantai', value: lapangan.jenisLabel },
        { icon: 'fa-ruler-combined', label: 'Ukuran', value: lapangan.ukuran },
        { icon: 'fa-users', label: 'Kapasitas', value: lapangan.kapasitas },
        { icon: 'fa-clock', label: 'Jam Operasional', value: '08:00 – 23:00' }
    ];

    container.innerHTML = specs.map(s => `
        <div class="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] flex flex-col items-center text-center space-y-2">
            <div class="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center text-lg">
                <i class="fa-solid ${s.icon}"></i>
            </div>
            <div>
                <div class="text-xs text-[#6B7280] font-medium">${s.label}</div>
                <div class="font-poppins font-bold text-sm text-[#111827] mt-0.5">${s.value}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 3. Fasilitas
 */
function renderFasilitas(lapangan) {
    const container = document.getElementById('fasilitas-container');
    container.innerHTML = lapangan.fasilitas.map(f => `
        <span class="inline-flex items-center space-x-2 bg-[#DCFCE7] text-[#14532D] px-3.5 py-2 rounded-xl text-sm font-semibold">
            <i class="fa-solid fa-check text-[#15803D]"></i>
            <span>${f}</span>
        </span>
    `).join('');
}

/**
 * 4. Ulasan
 */
function renderUlasan(lapangan) {
    const container = document.getElementById('ulasan-container');
    container.innerHTML = ULASAN_LIST.map(u => {
        const initial = u.nama.charAt(0);
        const stars = Array(5).fill(0).map((_, i) => `<i class="fa-solid fa-star ${i < u.rating ? 'text-[#F59E0B]' : 'text-[#E5E7EB]'}"></i>`).join('');
        return `
            <div class="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-[#15803D] text-white font-poppins font-bold flex items-center justify-center text-sm shadow-sm">
                            ${initial}
                        </div>
                        <div>
                            <h4 class="font-poppins font-bold text-sm text-[#111827]">${u.nama}</h4>
                            <span class="text-xs text-[#6B7280]">${u.tanggal}</span>
                        </div>
                    </div>
                    <div class="flex space-x-1 text-xs">
                        ${stars}
                    </div>
                </div>
                <p class="text-sm text-[#6B7280] pl-13 leading-relaxed">
                    "${u.isi}"
                </p>
            </div>
        `;
    }).join('');
}

/**
 * 5. Lapangan Serupa
 */
function renderLapanganSerupa(lapangan) {
    const container = document.getElementById('serupa-container');

    // Cari dari jenis lantai yang sama selain lapangan ini
    let serupa = LAPANGAN.filter(l => l.jenis === lapangan.jenis && l.id !== lapangan.id);

    // Jika kurang dari 3, lengkapi dari jenis lain
    if (serupa.length < 3) {
        const lain = LAPANGAN.filter(l => l.jenis !== lapangan.jenis && l.id !== lapangan.id);
        serupa = [...serupa, ...lain].slice(0, 3);
    } else {
        serupa = serupa.slice(0, 3);
    }

    container.innerHTML = serupa.map(s => `
        <a href="detail-lapangan.html?id=${s.id}" class="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition group flex flex-col">
            <div class="h-36 bg-[#DCFCE7] relative overflow-hidden">
                <img src="${s.gambar}" alt="${s.nama}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" data-fallback-icon>
                <span class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#14532D] font-semibold text-xs px-2.5 py-1 rounded-lg">
                    ${s.jenisLabel}
                </span>
            </div>
            <div class="p-4 flex flex-col flex-grow justify-between space-y-2">
                <div>
                    <h3 class="font-poppins font-bold text-base text-[#111827] group-hover:text-[#15803D] transition">${s.nama}</h3>
                    <p class="text-xs text-[#6B7280] truncate"><i class="fa-solid fa-location-dot mr-1 text-[#15803D]"></i>${s.lokasi}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                    <span class="font-poppins font-bold text-sm text-[#15803D]">Rp ${s.harga.toLocaleString('id-ID')} <span class="text-xs text-[#6B7280] font-normal">/jam</span></span>
                    <span class="text-xs font-semibold text-[#15803D] group-hover:underline">Detail &rarr;</span>
                </div>
            </div>
        </a>
    `).join('');
}

/**
 * 6. FUNGSI SLOT & BOOKING LOGIC
 */

// Hash sederhana untuk slot terisi deterministik (~30%)
function isSlotTaken(id, tanggal, jam) {
    const str = `${id}-${tanggal}-${jam}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    // Jadikan positif dan modulus 100. Ini simulasi ketersediaan, bukan data sungguhan.
    const mod = Math.abs(hash) % 100;
    const simulatedTaken = mod < 30; // ~30% terisi

    // Booking yang sudah dibuat melalui prototype juga mengunci slot.
    const booked = window.GarudaBooking && GarudaBooking.hasBookingOverlap(
        id,
        tanggal,
        `${String(jam).padStart(2, '0')}:00`,
        1
    );

    return simulatedTaken || booked;
}

function initBookingForm(lapangan) {
    const bookingDisabled = lapangan.status !== 'Aktif';
    const maintenanceNotice = document.getElementById('slot-error-msg');
    if (bookingDisabled && maintenanceNotice) {
        showError(`Lapangan sedang ${lapangan.status.toLowerCase()} dan belum dapat dipesan.`);
    }
    const dateInput = document.getElementById('tanggal-input');
    const todayStr = GarudaBooking.getLocalDateString();

    dateInput.min = todayStr;
    dateInput.value = selectedDate;

    dateInput.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        selectedStartHour = null; // reset pilihan jam saat tanggal berubah
        renderSlots(lapangan);
        updateSummary(lapangan);
    });

    // Durasi buttons
    const durasiBtns = document.querySelectorAll('.durasi-btn');
    durasiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            durasiBtns.forEach(b => {
                b.classList.remove('bg-[#15803D]', 'text-white', 'border-[#15803D]');
                b.classList.add('bg-[#F9FAFB]', 'text-[#111827]', 'border-[#E5E7EB]');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('bg-[#15803D]', 'text-white', 'border-[#15803D]');
            btn.classList.remove('bg-[#F9FAFB]', 'text-[#111827]', 'border-[#E5E7EB]');
            btn.setAttribute('aria-pressed', 'true');

            selectedDurasi = parseInt(btn.getAttribute('data-durasi'));

            // Validasi ulang slot terpilih dengan durasi baru
            if (selectedStartHour !== null) {
                if (!validasiDurasi(lapangan.id, selectedDate, selectedStartHour, selectedDurasi)) {
                    selectedStartHour = null; // reset jika tidak valid
                }
            }
            renderSlots(lapangan);
            updateSummary(lapangan);
        });
    });

    renderSlots(lapangan);
    updateSummary(lapangan);
}

function renderSlots(lapangan) {
    const slotGrid = document.getElementById('slot-grid');
    slotGrid.innerHTML = '';

    const now = new Date();
    const isToday = (selectedDate === GarudaBooking.getLocalDateString(now));
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Jam operasional 08:00 sampai 22:00 (jam terakhir 22:00 - 23:00)
    for (let hour = 8; hour <= 22; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        const nextHourStr = String(hour + 1).padStart(2, '0');
        const label = `${hourStr}:00 – ${nextHourStr}:00`;

        // Cek apakah sudah lewat (jika hari ini)
        let isPast = false;
        if (isToday) {
            if (hour < currentHour || (hour === currentHour && currentMinute > 0)) {
                isPast = true;
            }
        }

            const taken = isPast || lapangan.status !== 'Aktif' || isSlotTaken(lapangan.id, selectedDate, hourStr);
        const isSelected = (selectedStartHour === hour);

        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

        if (taken) {
            slotBtn.className = 'py-2 px-1 text-xs font-medium rounded-xl bg-[#E5E7EB] text-[#6B7280] line-through cursor-not-allowed';
            slotBtn.disabled = true;
        } else if (isSelected) {
            slotBtn.className = 'py-2 px-1 text-xs font-semibold rounded-xl bg-[#15803D] text-white shadow-sm ring-2 ring-[#15803D]';
        } else {
            slotBtn.className = 'py-2 px-1 text-xs font-semibold rounded-xl bg-[#DCFCE7] border border-[#15803D] text-[#14532D] hover:bg-[#15803D] hover:text-white transition shadow-sm';
            slotBtn.addEventListener('click', () => {
                selectedStartHour = hour;
                // Validasi durasi
                if (!validasiDurasi(lapangan.id, selectedDate, selectedStartHour, selectedDurasi)) {
                    // Jika durasi bertabrakan
                    showError("Durasi ini bertabrakan dengan slot yang sudah terisi atau melewati jam 23:00");
                    selectedStartHour = null;
                } else {
                    hideError();
                }
                renderSlots(lapangan);
                updateSummary(lapangan);
            });
        }

        slotBtn.textContent = `${hourStr}:00`;
        slotGrid.appendChild(slotBtn);
    }

    // Jika ada slot terpilih, tandai juga slot yang tercakup oleh durasi
    if (selectedStartHour !== null) {
        // validasi ulang visual
        if (!validasiDurasi(lapangan.id, selectedDate, selectedStartHour, selectedDurasi)) {
            selectedStartHour = null;
            renderSlots(lapangan);
        }
    }
}

function validasiDurasi(id, tanggal, startHour, durasi) {
    const lapangan = GarudaFields.findField(id);
    if (!lapangan || lapangan.status !== 'Aktif') return false;
    const now = new Date();
    const isToday = (tanggal === GarudaBooking.getLocalDateString(now));
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let i = 0; i < durasi; i++) {
        const targetHour = startHour + i;
        // Melewati jam 23:00 (selesai max jam 23:00)
        if (targetHour > 22) return false;

        const hourStr = String(targetHour).padStart(2, '0');

        // Cek lewat waktu hari ini
        if (isToday) {
            if (targetHour < currentHour || (targetHour === currentHour && currentMinute > 0)) {
                return false;
            }
        }

        // Cek apakah slot terisi
        if (isSlotTaken(id, tanggal, hourStr)) {
            return false;
        }
    }
    return true;
}

function showError(msg) {
    const errBox = document.getElementById('slot-error-msg');
    const errText = document.getElementById('error-text-content');
    errText.textContent = msg;
    errBox.classList.remove('hidden');
}

function hideError() {
    const errBox = document.getElementById('slot-error-msg');
    errBox.classList.add('hidden');
}

function updateSummary(lapangan) {
    const summaryTanggal = document.getElementById('summary-tanggal-text');
    const summaryJam = document.getElementById('summary-jam-text');
    const summaryDurasi = document.getElementById('summary-durasi-text');
    const summaryTotal = document.getElementById('summary-total-text');
    const mobileTotalPrice = document.getElementById('mobile-total-price');
    const btnBookingAction = document.getElementById('btn-booking-action');
    const mobileBtnBooking = document.getElementById('mobile-btn-booking');

    // Format Tanggal dengan Intl.DateTimeFormat 'id-ID' (Contoh: Sabtu, 3 Oktober 2026)
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    summaryTanggal.textContent = formatter.format(dateObj);

    summaryDurasi.textContent = `${selectedDurasi} Jam`;

    if (selectedStartHour !== null && lapangan.status === 'Aktif') {
        const startStr = String(selectedStartHour).padStart(2, '0') + ':00';
        const endHour = selectedStartHour + selectedDurasi;
        const endStr = String(endHour).padStart(2, '0') + ':00';
        summaryJam.textContent = `${startStr} – ${endStr}`;

        const total = lapangan.harga * selectedDurasi;
        const formattedTotal = `Rp ${total.toLocaleString('id-ID')}`;
        summaryTotal.textContent = formattedTotal;
        mobileTotalPrice.textContent = formattedTotal;

        // Aktifkan tombol booking
        const bookingUrl = `pembayaran.html?id=${lapangan.id}&tanggal=${selectedDate}&jam=${String(selectedStartHour).padStart(2, '0')}:00&durasi=${selectedDurasi}`;

        if (lapangan.status === 'Aktif') {
            btnBookingAction.href = bookingUrl;
            btnBookingAction.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            mobileBtnBooking.href = bookingUrl;
            mobileBtnBooking.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        } else {
            btnBookingAction.href = '#';
            mobileBtnBooking.href = '#';
            btnBookingAction.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            mobileBtnBooking.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        }
    } else {
        summaryJam.textContent = '-';
        summaryTotal.textContent = 'Rp 0';
        mobileTotalPrice.textContent = 'Rp 0';

        // Nonaktifkan tombol booking
        btnBookingAction.href = '#';
        btnBookingAction.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');

        mobileBtnBooking.href = '#';
        mobileBtnBooking.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    }
}
