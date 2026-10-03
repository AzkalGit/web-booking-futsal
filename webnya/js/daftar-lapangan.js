
let LAPANGAN = GarudaFields.getPublicFields();

// Fungsi renderCard dipisah agar modular dan mudah dipindah ke template Blade Laravel
function renderCard(item) {
    // Ubah format jenis lantai untuk badge
    let badgeText = "Interlock";
    if (item.jenis === "rumput") badgeText = "Rumput Sintetis";
    if (item.jenis === "vinyl") badgeText = "Vinyl";

    // Format ulasan rating dengan koma desimal
    const ratingFormatted = item.rating.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    // Format harga IDR
    const hargaFormatted = "Rp " + item.harga.toLocaleString('id-ID');

    // Fallback placeholder gambar jika gagal dimuat
    const fallbackImg = "images/2-venue-interlock.jpg";

    // Buat HTML fasilitas chips
    let fasilitasHtml = '';
    (item.fasilitas || []).forEach(f => {
        fasilitasHtml += `<span class="bg-primary-pale text-primary-dark text-xs font-medium px-2.5 py-1 rounded-lg">${f}</span>`;
    });

    // Status ketersediaan lapangan
    const availability = item.status === 'Perawatan'
        ? `<span class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg">Perawatan</span>`
        : `<span class="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg">Tersedia</span>`;

    // Aksi detail: lapangan aktif dapat dibuka, lapangan perawatan tidak dapat dibooking
    const detailAction = item.status === 'Aktif'
        ? `<a href="detail-lapangan.html?id=${encodeURIComponent(item.id)}" class="shrink-0 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                Lihat Detail <i class="fa-solid fa-arrow-right text-xs"></i>
           </a>`
        : `<button type="button" disabled class="shrink-0 inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-500 font-semibold text-sm px-4 py-2.5 rounded-xl cursor-not-allowed" aria-disabled="true">
                Tidak Tersedia
           </button>`;

    return `
        <div class="venue-card bg-surface rounded-2xl border border-line overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
                <!-- Foto & Badges Container -->
                <div class="relative w-full aspect-[4/3] bg-primary-pale overflow-hidden rounded-t-2xl">
                    <img src="${item.gambar}" alt="Lapangan ${item.nama}" loading="lazy" class="w-full h-full object-cover" data-fallback-src="${fallbackImg}">

                    <!-- Badge Jenis Lantai (Kiri Atas) -->
                    <div class="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                        ${badgeText}
                    </div>

                    <!-- Badge Rating (Kanan Bawah Foto) -->
                    <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                        <i class="fa-solid fa-star text-amber-400"></i>
                        <span>${ratingFormatted} (${item.ulasanCount} ulasan)</span>
                    </div>
                </div>

                <!-- Card Body -->
                <div class="p-5 space-y-3">
                    <!-- Lokasi -->
                    <div class="flex items-center gap-1.5 text-xs text-textSec font-medium">
                        <i class="fa-solid fa-location-dot text-primary"></i>
                        <span>${item.lokasi}</span>
                    </div>

                    <!-- Nama Lapangan -->
                    <h3 class="font-poppins font-bold text-lg text-textMain line-clamp-1">${item.nama}</h3>

                    <!-- Fasilitas Chips -->
                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                        ${fasilitasHtml}
                        ${availability}
                    </div>
                </div>
            </div>

            <!-- Card Footer / Bottom Bar -->
            <div class="px-5 pb-5 pt-3 border-t border-line flex items-center justify-between gap-3 mt-auto">
                <div>
                    <span class="block text-[11px] text-textSec uppercase tracking-wider font-semibold">Mulai dari</span>
                    <span class="font-poppins font-bold text-base text-primary">${hargaFormatted} <span class="text-xs font-normal text-textSec">/ jam</span></span>
                </div>
${detailAction}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // State filter
    let currentFloor = 'all';
    let currentPrice = 'all';
    let currentSort = 'recommended';
    const initialTypeFromUrl = new URLSearchParams(window.location.search).get('jenis');

    const floorChips = document.querySelectorAll('.filter-chip');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const venuesGrid = document.getElementById('venuesGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    const resetBtn = document.getElementById('resetBtn');
    const emptyResetBtn = document.getElementById('emptyResetBtn');

    window.addEventListener('storage', (event) => { if (event.key === GarudaFields.STORAGE_KEY) updateAndRender(); });
    window.addEventListener('focus', updateAndRender);

    // Fungsi utama filter & render
    function updateAndRender() {
        LAPANGAN = GarudaFields.getPublicFields();
        let filtered = [...LAPANGAN];

        // 1. Filter Jenis Lantai
        if (currentFloor !== 'all') {
            filtered = filtered.filter(item => item.jenis === currentFloor);
        }

        // 2. Filter Harga
        if (currentPrice === 'under150') {
            filtered = filtered.filter(item => item.harga < 150000);
        } else if (currentPrice === '150to200') {
            filtered = filtered.filter(item => item.harga >= 150000 && item.harga <= 200000);
        } else if (currentPrice === 'above200') {
            filtered = filtered.filter(item => item.harga > 200000);
        }

        // 3. Sorting
        if (currentSort === 'priceAsc') {
            filtered.sort((a, b) => a.harga - b.harga);
        } else if (currentSort === 'priceDesc') {
            filtered.sort((a, b) => b.harga - a.harga);
        } else if (currentSort === 'ratingDesc') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else {
            // Rekomendasi (default urutan ID)
            filtered.sort((a, b) => a.id - b.id);
        }

        // Update teks hasil
        resultCount.textContent = `Menampilkan ${filtered.length} dari ${LAPANGAN.length} lapangan`;

        // Render grid atau state kosong
        if (filtered.length === 0) {
            venuesGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            let htmlContent = '';
            filtered.forEach(item => {
                htmlContent += renderCard(item);
            });
            venuesGrid.innerHTML = htmlContent;
        }
    }

    // Event listener chip lantai
    floorChips.forEach(btn => {
        btn.addEventListener('click', () => {
            floorChips.forEach(b => {
                b.setAttribute('aria-pressed', 'false');
                b.className = "filter-chip px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-page text-textMain hover:bg-primary-pale border border-line";
            });
            btn.setAttribute('aria-pressed', 'true');
            btn.className = "filter-chip px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-primary text-white shadow-sm";

            currentFloor = btn.getAttribute('data-type');
            updateAndRender();
        });
    });

    // Event listener dropdown harga
    priceFilter.addEventListener('change', (e) => {
        currentPrice = e.target.value;
        updateAndRender();
    });

    // Event listener dropdown sort
    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateAndRender();
    });

    // Fungsi Reset
    function handleReset() {
        currentFloor = 'all';
        currentPrice = 'all';
        currentSort = 'recommended';

        // Reset chip UI
        floorChips.forEach(b => {
            const isAll = b.getAttribute('data-type') === 'all';
            b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
            if (isAll) {
                b.className = "filter-chip px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-primary text-white shadow-sm";
            } else {
                b.className = "filter-chip px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-page text-textMain hover:bg-primary-pale border border-line";
            }
        });

        // Reset select inputs
        priceFilter.value = 'all';
        sortFilter.value = 'recommended';

        updateAndRender();
    }

    resetBtn.addEventListener('click', handleReset);
    emptyResetBtn.addEventListener('click', handleReset);

    // Render awal saat load halaman
    if (['interlock', 'rumput', 'vinyl'].includes(initialTypeFromUrl)) {
        const initialChip = [...floorChips].find((chip) => chip.getAttribute('data-type') === initialTypeFromUrl);
        if (initialChip) initialChip.click();
        else updateAndRender();
    } else {
        updateAndRender();
    }
});
