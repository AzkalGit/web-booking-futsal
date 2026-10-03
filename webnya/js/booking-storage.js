// Penyimpanan booking simulasi untuk prototype frontend.
// Backend Laravel dapat menggantikan helper ini saat implementasi produksi.
(function () {
    const STORAGE_KEY = 'garudaArenaBookings';
    const USER_KEY = 'garudaArenaCurrentUser';

    function readBookings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.warn('Gagal membaca data booking:', error);
            return [];
        }
    }

    function writeBookings(bookings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : { nama: 'Fadel', inisial: 'FA' };
        } catch (error) {
            return { nama: 'Fadel', inisial: 'FA' };
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function generateBookingCode() {
        const stamp = new Date();
        const dd = String(stamp.getDate()).padStart(2, '0');
        const mm = String(stamp.getMonth() + 1).padStart(2, '0');
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        return `GA-${dd}${mm}-${suffix}`;
    }

    function isOverlappingHour(startHourA, durationA, startHourB, durationB) {
        const endA = startHourA + durationA;
        const endB = startHourB + durationB;
        return startHourA < endB && startHourB < endA;
    }

    function cleanupExpiredBookings() {
        const now = Date.now();
        const bookings = readBookings();
        let changed = false;

        const cleaned = bookings.map((booking) => {
            // Booking yang belum dibayar batal otomatis setelah 1 jam.
            if (
                booking.status === 'Menunggu pembayaran' &&
                booking.expiresAt &&
                new Date(booking.expiresAt).getTime() <= now
            ) {
                changed = true;
                return { ...booking, status: 'Dibatalkan', cancelledReason: 'Waktu pembayaran habis' };
            }

            // Setelah jam bermain selesai, status berubah menjadi Selesai.
            const startHour = parseInt(String(booking.jam).slice(0, 2), 10);
            const endAt = new Date(`${booking.tanggal}T${String(startHour + (Number(booking.durasi) || 1)).padStart(2, '0')}:00:00`);
            if (
                booking.status !== 'Dibatalkan' &&
                booking.status !== 'Menunggu pembayaran' &&
                !Number.isNaN(startHour) &&
                endAt.getTime() <= now
            ) {
                changed = true;
                return { ...booking, status: 'Selesai' };
            }

            return booking;
        });

        if (changed) writeBookings(cleaned);
        return cleaned;
    }

    function getBookings() {
        return cleanupExpiredBookings();
    }

    function saveBooking(booking) {
        const bookings = getBookings();
        bookings.push(booking);
        writeBookings(bookings);
        return booking;
    }

    function updateBooking(id, changes) {
        const bookings = getBookings();
        const index = bookings.findIndex((booking) => booking.id === id);
        if (index === -1) return null;

        bookings[index] = { ...bookings[index], ...changes, updatedAt: new Date().toISOString() };
        writeBookings(bookings);
        return bookings[index];
    }

    function findBooking(id) {
        return getBookings().find((booking) => booking.id === id) || null;
    }

    function hasBookingOverlap(lapanganId, tanggal, jam, durasi, ignoreBookingId = null) {
        const startHour = parseInt(String(jam).slice(0, 2), 10);
        if (Number.isNaN(startHour)) return false;

        return getBookings().some((booking) => {
            if (booking.id === ignoreBookingId) return false;
            if (booking.status === 'Dibatalkan') return false;
            if (Number(booking.lapanganId) !== Number(lapanganId)) return false;
            if (booking.tanggal !== tanggal) return false;

            const bookingStart = parseInt(String(booking.jam).slice(0, 2), 10);
            if (Number.isNaN(bookingStart)) return false;

            return isOverlappingHour(startHour, durasi, bookingStart, Number(booking.durasi) || 1);
        });
    }

    function createPendingBooking({ lapangan, tanggal, jam, durasi }) {
        if (!lapangan || lapangan.status !== 'Aktif') return null;
        if (hasBookingOverlap(lapangan.id, tanggal, jam, durasi)) {
            return null;
        }

        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
        const user = getCurrentUser();

        return saveBooking({
            id: generateBookingCode(),
            lapanganId: lapangan.id,
            lapanganNama: lapangan.nama,
            tanggal,
            jam,
            durasi,
            tarif: lapangan.harga,
            total: lapangan.harga * durasi,
            status: 'Menunggu pembayaran',
            customerName: user.nama || 'Fadel',
            customerInitials: user.inisial || 'FA',
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            proofName: null,
            proofSize: null,
            proofData: null
        });
    }

    function getStatusClasses(status) {
        const styles = {
            'Menunggu pembayaran': 'bg-amber-100 text-amber-800',
            'Menunggu verifikasi': 'bg-orange-100 text-orange-800',
            'Dikonfirmasi': 'bg-green-100 text-green-800',
            'Dibatalkan': 'bg-red-100 text-red-700',
            'Selesai': 'bg-blue-100 text-blue-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    }

    window.GarudaBooking = {
        STORAGE_KEY,
        getLocalDateString,
        getCurrentUser,
        setCurrentUser,
        getBookings,
        saveBooking,
        updateBooking,
        findBooking,
        hasBookingOverlap,
        createPendingBooking,
        getStatusClasses
    };
})();
