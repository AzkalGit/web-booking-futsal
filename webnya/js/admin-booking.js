(function () {
    const bookingTableBody = document.getElementById('booking-table-body');
    const emptyState = document.getElementById('booking-empty');
    const searchInput = document.getElementById('booking-search');
    const countAll = document.getElementById('count-all');
    const countPayment = document.getElementById('count-payment');
    const countVerify = document.getElementById('count-verify');
    const countConfirmed = document.getElementById('count-confirmed');
    const countDone = document.getElementById('count-done');
    const countCancelled = document.getElementById('count-cancelled');
    const modal = document.getElementById('booking-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    let currentFilter = 'Semua';
    let currentSearch = '';

    const filters = [
        ['filter-all', 'Semua'],
        ['filter-payment', 'Menunggu pembayaran'],
        ['filter-verify', 'Menunggu verifikasi'],
        ['filter-confirmed', 'Dikonfirmasi'],
        ['filter-done', 'Selesai'],
        ['filter-cancelled', 'Dibatalkan']
    ];

    function formatCurrency(value) {
        return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    }

    function formatDate(value) {
        if (!value) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(`${value}T00:00:00`));
    }

    function endHour(booking) {
        return parseInt(String(booking.jam).slice(0, 2), 10) + Number(booking.durasi || 1);
    }

    function statusBadge(status) {
        return `<span class="px-3 py-1 rounded-full text-xs font-semibold ${GarudaBooking.getStatusClasses(status)}">${status}</span>`;
    }

    function filteredBookings() {
        const bookings = GarudaBooking.getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const needle = currentSearch.trim().toLowerCase();
        return bookings.filter((booking) => {
            const statusMatch = currentFilter === 'Semua' || booking.status === currentFilter;
            const searchMatch = !needle || [booking.id, booking.customerName, booking.lapanganNama]
                .some((value) => String(value || '').toLowerCase().includes(needle));
            return statusMatch && searchMatch;
        });
    }

    function updateCounts(bookings) {
        const all = bookings.length;
        const count = (status) => bookings.filter((item) => item.status === status).length;
        countAll.textContent = all;
        countPayment.textContent = count('Menunggu pembayaran');
        countVerify.textContent = count('Menunggu verifikasi');
        countConfirmed.textContent = count('Dikonfirmasi');
        countDone.textContent = count('Selesai');
        countCancelled.textContent = count('Dibatalkan');
    }

    function render() {
        const allBookings = GarudaBooking.getBookings();
        updateCounts(allBookings);
        const bookings = filteredBookings();
        bookingTableBody.innerHTML = '';
        emptyState.classList.toggle('hidden', bookings.length > 0);

        bookings.forEach((booking) => {
            const canVerify = booking.status === 'Menunggu verifikasi';
            const canCancel = !['Dibatalkan', 'Selesai'].includes(booking.status);
            const proofButton = booking.proofData
                ? `<button type="button" data-action="proof" data-id="${booking.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E7EB] text-[#111827] hover:bg-gray-50">Lihat bukti</button>`
                : `<button type="button" data-action="detail" data-id="${booking.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E7EB] text-[#111827] hover:bg-gray-50">Detail</button>`;
            const verifyButton = canVerify
                ? `<button type="button" data-action="confirm" data-id="${booking.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#15803D] text-white hover:bg-green-800">Terima</button>`
                : '';
            const cancelButton = canCancel
                ? `<button type="button" data-action="cancel" data-id="${booking.id}" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50">Batalkan</button>`
                : '';

            const row = document.createElement('tr');
            row.className = 'border-t border-[#E5E7EB]';
            row.innerHTML = `
                <td class="px-5 py-3.5"><span class="font-medium">${booking.id}</span></td>
                <td class="px-5 py-3.5"><div class="font-medium">${booking.customerName || 'Pelanggan'}</div><div class="text-xs text-[#6B7280]">${booking.createdAt ? new Date(booking.createdAt).toLocaleString('id-ID') : '-'}</div></td>
                <td class="px-5 py-3.5">${booking.lapanganNama}</td>
                <td class="px-5 py-3.5">${formatDate(booking.tanggal)}<br><span class="text-xs text-[#6B7280]">${booking.jam}–${String(endHour(booking)).padStart(2, '0')}:00</span></td>
                <td class="px-5 py-3.5">${formatCurrency(booking.total)}</td>
                <td class="px-5 py-3.5">${statusBadge(booking.status)}</td>
                <td class="px-5 py-3.5"><div class="flex flex-wrap gap-2">${proofButton}${verifyButton}${cancelButton}</div></td>`;
            bookingTableBody.appendChild(row);
        });
    }

    function setActiveFilter() {
        filters.forEach(([id, status]) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const active = currentFilter === status;
            btn.className = active
                ? 'px-4 py-2 rounded-full text-sm font-semibold bg-[#15803D] text-white shrink-0'
                : 'px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[#E5E7EB] text-[#6B7280] shrink-0';
        });
    }

    function openModal(booking, mode) {
        if (!booking) return;
        modal.classList.remove('hidden');
        modalTitle.textContent = mode === 'proof' ? 'Bukti Pembayaran' : `Detail ${booking.id}`;
        const proof = booking.proofData
            ? `<div class="rounded-xl overflow-hidden border border-[#E5E7EB] bg-gray-50"><img src="${booking.proofData}" alt="Bukti transfer ${booking.id}" class="w-full max-h-[55vh] object-contain"></div>`
            : '<div class="rounded-xl border border-dashed border-[#D1D5DB] p-8 text-center text-sm text-[#6B7280]">Belum ada bukti transfer yang diunggah.</div>';
        modalBody.innerHTML = `
            <div class="grid grid-cols-2 gap-4 text-sm mb-5">
                <div><div class="text-xs text-[#6B7280]">Pelanggan</div><div class="font-semibold mt-1">${booking.customerName || '-'}</div></div>
                <div><div class="text-xs text-[#6B7280]">Status</div><div class="mt-1">${statusBadge(booking.status)}</div></div>
                <div><div class="text-xs text-[#6B7280]">Lapangan</div><div class="font-semibold mt-1">${booking.lapanganNama}</div></div>
                <div><div class="text-xs text-[#6B7280]">Jadwal</div><div class="font-semibold mt-1">${formatDate(booking.tanggal)}, ${booking.jam}–${String(endHour(booking)).padStart(2, '0')}:00</div></div>
                <div><div class="text-xs text-[#6B7280]">Total</div><div class="font-semibold mt-1 text-[#15803D]">${formatCurrency(booking.total)}</div></div>
                <div><div class="text-xs text-[#6B7280]">File bukti</div><div class="font-semibold mt-1">${booking.proofName || '-'}</div></div>
            </div>${proof}`;
    }

    function closeModal() {
        modal.classList.add('hidden');
        modalBody.innerHTML = '';
    }

    bookingTableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;
        const booking = GarudaBooking.findBooking(id);
        if (!booking) return;

        if (action === 'proof' || action === 'detail') {
            openModal(booking, action);
            return;
        }
        if (action === 'confirm') {
            if (booking.status !== 'Menunggu verifikasi') return;
            GarudaBooking.updateBooking(id, { status: 'Dikonfirmasi', verifiedAt: new Date().toISOString(), verifiedBy: 'Admin' });
            render();
            return;
        }
        if (action === 'cancel') {
            if (['Dibatalkan', 'Selesai'].includes(booking.status)) return;
            const reason = booking.status === 'Menunggu pembayaran' ? 'Dibatalkan admin sebelum pembayaran' : 'Bukti pembayaran ditolak admin';
            GarudaBooking.updateBooking(id, { status: 'Dibatalkan', cancelledReason: reason, cancelledAt: new Date().toISOString(), cancelledBy: 'Admin' });
            render();
        }
    });

    filters.forEach(([id, status]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            currentFilter = status;
            setActiveFilter();
            render();
        });
    });

    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value;
        render();
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });

    window.addEventListener('storage', (event) => {
        if (event.key === GarudaBooking.STORAGE_KEY) render();
    });
    window.addEventListener('focus', render);

    setActiveFilter();
    render();
})();

// Tombol "Muat ulang": paksa render ulang dengan memicu event focus.
const refreshBookingBtn = document.getElementById('refresh-booking');
if (refreshBookingBtn) {
    refreshBookingBtn.addEventListener('click', () => window.dispatchEvent(new Event('focus')));
}
