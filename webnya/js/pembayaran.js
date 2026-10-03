(function () {
    const params = new URLSearchParams(window.location.search);
    let lapanganId = Number(params.get('id'));
    const tanggal = params.get('tanggal');
    const jam = params.get('jam');
    const durasi = Number(params.get('durasi')) || 1;
    const existingId = params.get('booking');
    let lapangan = null;

    const els = {
        errorState: document.getElementById('error-state'),
        errorMessage: document.getElementById('error-message'),
        paymentContent: document.getElementById('payment-content'),
        countdownBadge: document.getElementById('countdown-badge'),
        countdownText: document.getElementById('countdown-text'),
        copyRekening: document.getElementById('copy-rekening'),
        proofFile: document.getElementById('proof-file'),
        proofPreview: document.getElementById('proof-preview'),
        proofName: document.getElementById('proof-name'),
        proofSize: document.getElementById('proof-size'),
        removeProof: document.getElementById('remove-proof'),
        proofError: document.getElementById('proof-error'),
        submitProof: document.getElementById('submit-proof'),
        submitWrap: document.getElementById('submit-wrap'),
        submittedState: document.getElementById('submitted-state'),
        summaryImage: document.getElementById('summary-image'),
        summaryLapangan: document.getElementById('summary-lapangan'),
        summaryTanggal: document.getElementById('summary-tanggal'),
        summaryJam: document.getElementById('summary-jam'),
        summaryDurasi: document.getElementById('summary-durasi'),
        summaryTarif: document.getElementById('summary-tarif'),
        summaryTotal: document.getElementById('summary-total'),
        paymentTotal: document.getElementById('payment-total'),
        bookingCode: document.getElementById('booking-code'),
        userName: document.getElementById('user-name'),
        userInitials: document.getElementById('user-initials')
    };

    let booking = null;
    let selectedFile = null;
    let countdownTimer = null;

    function showError(message) {
        els.paymentContent.classList.add('hidden');
        els.errorState.classList.remove('hidden');
        els.errorMessage.textContent = message;
    }

    function formatCurrency(value) {
        return `Rp ${Number(value).toLocaleString('id-ID')}`;
    }

    function formatDate(value) {
        const date = new Date(`${value}T00:00:00`);
        return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    }

    function formatSize(bytes) {
        return `(${Math.round(bytes / 1024)} KB)`;
    }

    function getEndHour(start, length) {
        return parseInt(String(start).slice(0, 2), 10) + length;
    }

    function syncUser() {
        const user = GarudaBooking.getCurrentUser();
        els.userName.textContent = user.nama || 'Fadel';
        els.userInitials.textContent = user.inisial || 'FA';
    }

    function setSubmittedUI() {
        els.proofSection = document.getElementById('proof-section');
        if (booking.status === 'Menunggu verifikasi') {
            els.submitWrap.classList.add('hidden');
            els.proofFile.disabled = true;
            els.submittedState.classList.remove('hidden');
            els.countdownBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 shrink-0';
            els.countdownBadge.innerHTML = '<i class="fa-solid fa-hourglass-half mr-1"></i>Menunggu verifikasi admin';
        } else if (booking.status === 'Dikonfirmasi' || booking.status === 'Selesai') {
            els.submitWrap.classList.add('hidden');
            els.proofFile.disabled = true;
            els.submittedState.classList.remove('hidden');
            els.submittedState.innerHTML = `<i class="fa-solid fa-circle-check mr-2"></i>Status booking: <strong>${booking.status}</strong>.`;
            els.countdownBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shrink-0';
            els.countdownBadge.textContent = booking.status;
        } else if (booking.status === 'Dibatalkan') {
            els.submitWrap.classList.add('hidden');
            els.proofFile.disabled = true;
            els.submittedState.classList.remove('hidden');
            els.submittedState.className = 'bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800';
            els.submittedState.innerHTML = '<i class="fa-solid fa-circle-xmark mr-2"></i>Booking ini sudah dibatalkan dan slot terbuka kembali.';
            els.countdownBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 shrink-0';
            els.countdownBadge.textContent = 'Dibatalkan';
        }
    }

    function updateCountdown() {
        if (!booking || booking.status !== 'Menunggu pembayaran') return;
        const remaining = Math.max(0, new Date(booking.expiresAt).getTime() - Date.now());
        const totalSeconds = Math.floor(remaining / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        els.countdownText.textContent = `${minutes}:${seconds}`;

        if (remaining <= 0) {
            booking = GarudaBooking.getBookings().find((item) => item.id === booking.id) || booking;
            clearInterval(countdownTimer);
            if (booking.status === 'Dibatalkan') {
                setSubmittedUI();
            }
        }
    }

    function loadBooking() {
        if (existingId) {
            booking = GarudaBooking.findBooking(existingId);
            if (!booking) {
                showError('Booking tidak ditemukan. Silakan pilih jadwal kembali.');
                return false;
            }
            lapanganId = Number(booking.lapanganId);
            lapangan = GarudaFields.findField(lapanganId);
            if (!lapangan) {
                showError('Data lapangan pada booking tidak ditemukan.');
                return false;
            }
        } else {
            lapangan = GarudaFields.findField(lapanganId);
            if (!lapangan) {
                showError('ID lapangan tidak valid.');
                return false;
            }
            if (!tanggal || !jam || !durasi) {
                showError('Parameter booking belum lengkap. Silakan kembali ke detail lapangan dan pilih jadwal.');
                return false;
            }

            const startHour = parseInt(String(jam).slice(0, 2), 10);
            if (lapangan.status !== 'Aktif') {
                showError(`Lapangan sedang ${String(lapangan.status || 'tidak tersedia').toLowerCase()} dan tidak dapat dibuat booking baru.`);
                return false;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(startHour) || startHour < 8 || startHour > 22 || durasi < 1 || getEndHour(jam, durasi) > 23) {
                showError('Tanggal, jam, atau durasi booking tidak valid.');
                return false;
            }

            if (GarudaBooking.hasBookingOverlap(lapangan.id, tanggal, jam, durasi)) {
                showError('Slot yang dipilih sudah memiliki booking aktif. Silakan pilih slot lain.');
                return false;
            }

            booking = GarudaBooking.createPendingBooking({ lapangan, tanggal, jam, durasi });
            if (!booking) {
                showError('Slot baru saja terisi. Silakan pilih jadwal lain.');
                return false;
            }

            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('booking', booking.id);
            window.history.replaceState({}, '', newUrl);
        }

        return true;
    }

    function renderBooking() {
        document.title = `Pembayaran ${booking.lapanganNama} - Garuda Arena`;
        els.summaryImage.src = lapangan.gambar;
        els.summaryImage.alt = booking.lapanganNama;
        els.summaryLapangan.textContent = booking.lapanganNama;
        els.summaryTanggal.textContent = formatDate(booking.tanggal);
        const endHour = getEndHour(booking.jam, Number(booking.durasi) || 1);
        els.summaryJam.textContent = `${booking.jam} – ${String(endHour).padStart(2, '0')}:00`;
        els.summaryDurasi.textContent = `${booking.durasi} jam`;
        els.summaryTarif.textContent = `${formatCurrency(booking.tarif)} / jam`;
        els.summaryTotal.textContent = formatCurrency(booking.total);
        els.paymentTotal.textContent = formatCurrency(booking.total);
        els.bookingCode.textContent = booking.id;
        setSubmittedUI();

        if (booking.status === 'Menunggu pembayaran') {
            updateCountdown();
            countdownTimer = setInterval(updateCountdown, 1000);
        }
    }

    function showProofError(message) {
        els.proofError.textContent = message;
        els.proofError.classList.remove('hidden');
    }

    function clearProofError() {
        els.proofError.classList.add('hidden');
        els.proofError.textContent = '';
    }

    els.copyRekening.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('123456789012');
            els.copyRekening.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Tersalin';
            setTimeout(() => { els.copyRekening.innerHTML = '<i class="fa-regular fa-copy mr-2"></i>Salin'; }, 1400);
        } catch (error) {
            showProofError('Nomor rekening: 1234 5678 9012');
        }
    });

    els.proofFile.addEventListener('change', () => {
        clearProofError();
        const file = els.proofFile.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            els.proofFile.value = '';
            showProofError('File harus berupa JPG atau PNG.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            els.proofFile.value = '';
            showProofError('Ukuran file maksimal 2 MB.');
            return;
        }
        selectedFile = file;
        els.proofName.textContent = file.name;
        els.proofSize.textContent = formatSize(file.size);
        els.proofPreview.classList.remove('hidden');
        els.submitProof.disabled = false;
    });

    els.removeProof.addEventListener('click', () => {
        selectedFile = null;
        els.proofFile.value = '';
        els.proofPreview.classList.add('hidden');
        els.submitProof.disabled = true;
        clearProofError();
    });

    els.submitProof.addEventListener('click', () => {
        clearProofError();
        if (!selectedFile || booking.status !== 'Menunggu pembayaran') return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                booking = GarudaBooking.updateBooking(booking.id, {
                    status: 'Menunggu verifikasi',
                    proofName: selectedFile.name,
                    proofSize: selectedFile.size,
                    proofType: selectedFile.type,
                    proofData: reader.result
                });
                clearInterval(countdownTimer);
                setSubmittedUI();
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('booking', booking.id);
                window.history.replaceState({}, '', nextUrl);
            } catch (error) {
                showProofError('Bukti gagal disimpan pada prototype browser ini. Coba file yang lebih kecil.');
            }
        };
        reader.onerror = () => showProofError('Bukti pembayaran gagal dibaca.');
        reader.readAsDataURL(selectedFile);
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

    syncUser();
    if (loadBooking()) renderBooking();
})();
