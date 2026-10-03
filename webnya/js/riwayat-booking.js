(function () {
    const bookingsList = document.getElementById('booking-list');
    const refreshHistory = document.getElementById('refresh-history');
    const emptyState = document.getElementById('empty-state');
    const user = GarudaBooking.getCurrentUser();
    document.getElementById('user-name').textContent = user.nama || 'Fadel';
    document.getElementById('user-initials').textContent = user.inisial || 'FA';

    let currentFilter = 'Semua';

    function formatCurrency(value) { return `Rp ${Number(value).toLocaleString('id-ID')}`; }
    function formatDate(value) { return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)); }
    function endHour(booking) { return parseInt(String(booking.jam).slice(0, 2), 10) + Number(booking.durasi || 1); }

    function render() {
        const bookings = GarudaBooking.getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const filtered = currentFilter === 'Semua' ? bookings : bookings.filter((booking) => booking.status === currentFilter);

        bookingsList.innerHTML = '';
        emptyState.classList.toggle('hidden', filtered.length > 0);

        if (!filtered.length) return;

        filtered.forEach((booking) => {
            const lapangan = GarudaFields.findField(booking.lapanganId);
            const wrapper = document.createElement('article');
            wrapper.className = 'bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 flex flex-col lg:flex-row lg:items-center gap-5';
            wrapper.innerHTML = `
                <img src="${lapangan ? lapangan.gambar : 'images/2-venue-interlock.jpg'}" alt="${booking.lapanganNama}" class="w-full lg:w-28 h-24 object-cover rounded-xl bg-[#DCFCE7] shrink-0">
                <div class="flex-grow min-w-0 space-y-1">
                    <div class="flex flex-wrap items-center gap-3"><h3 class="font-poppins font-bold text-base">${booking.lapanganNama}</h3><span class="px-3 py-1 rounded-full text-xs font-semibold ${GarudaBooking.getStatusClasses(booking.status)}">${booking.status}</span></div>
                    <div class="text-sm text-[#6B7280]"><i class="fa-regular fa-calendar mr-1.5"></i>${formatDate(booking.tanggal)} <span class="mx-2">•</span><i class="fa-regular fa-clock mr-1.5"></i>${booking.jam}–${String(endHour(booking)).padStart(2, '0')}:00</div>
                    <div class="text-xs text-[#6B7280]">Kode ${booking.id}</div>
                </div>
                <div class="lg:text-right space-y-2 lg:min-w-[180px]"><div class="font-poppins font-extrabold text-[#15803D]">${formatCurrency(booking.total)}</div>
                    ${booking.status === 'Menunggu pembayaran' ? `<a href="pembayaran.html?booking=${encodeURIComponent(booking.id)}" class="inline-flex justify-center w-full lg:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-[#15803D] text-white hover:bg-green-800">Bayar sekarang</a>` : `<a href="pembayaran.html?booking=${encodeURIComponent(booking.id)}" class="inline-flex justify-center w-full lg:w-auto px-4 py-2 rounded-lg text-xs font-semibold border border-[#E5E7EB] text-[#111827] hover:bg-gray-50">Lihat detail</a>`}
                </div>`;
            const image = wrapper.querySelector('img');
            image.addEventListener('error', () => { image.src = 'images/2-venue-interlock.jpg'; }, { once: true });
            bookingsList.appendChild(wrapper);
        });
    }

    refreshHistory.addEventListener('click', render);

    document.querySelectorAll('.filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach((btn) => {
                btn.className = 'filter-btn shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[#E5E7EB] text-[#6B7280]';
            });
            button.className = 'filter-btn shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-[#15803D] text-white';
            render();
        });
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('hidden') === false;
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    window.addEventListener('storage', (event) => {
        if (event.key === GarudaBooking.STORAGE_KEY) render();
    });
    window.addEventListener('focus', render);

    render();
})();
