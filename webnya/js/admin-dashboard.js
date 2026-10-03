(function () {
    const els = {
        today: document.getElementById('metric-today'),
        verify: document.getElementById('metric-verify'),
        income: document.getElementById('metric-income'),
        active: document.getElementById('metric-active'),
        chart: document.getElementById('booking-chart'),
        latest: document.getElementById('latest-bookings')
    };

    function currency(value) { return `Rp ${Number(value || 0).toLocaleString('id-ID')}`; }
    function localDate(value) { return value ? new Date(`${value}T00:00:00`) : null; }
    function dateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    function formatDate(value) {
        return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
            .format(localDate(value));
    }
    function statusBadge(status) {
        return `<span class="px-3 py-1 rounded-full text-xs font-semibold ${GarudaBooking.getStatusClasses(status)}">${status}</span>`;
    }
    function render() {
        const bookings = GarudaBooking.getBookings();
        const todayKey = GarudaBooking.getLocalDateString(new Date());
        const todayCount = bookings.filter((b) => b.tanggal === todayKey && b.status !== 'Dibatalkan').length;
        const verifyCount = bookings.filter((b) => b.status === 'Menunggu verifikasi').length;
        const income = bookings.filter((b) => ['Dikonfirmasi', 'Selesai'].includes(b.status)).reduce((sum, b) => sum + Number(b.total || 0), 0);
        els.today.textContent = todayCount;
        els.verify.textContent = verifyCount;
        els.income.textContent = currency(income);
        els.active.textContent = '8 dari 8';

        const end = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(end);
            d.setDate(end.getDate() - i);
            days.push(d);
        }
        const dayCounts = days.map((d) => bookings.filter((b) => b.tanggal === dateKey(d) && b.status !== 'Dibatalkan').length);
        const maxCount = Math.max(1, ...dayCounts);
        els.chart.innerHTML = days.map((d, idx) => {
            const height = Math.max(14, Math.round((dayCounts[idx] / maxCount) * 150));
            const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
            return `<div class="flex flex-col items-center gap-2 flex-1"><div class="text-xs text-[#6B7280]">${dayCounts[idx]}</div><div class="w-full max-w-[36px] rounded-t-lg bg-[#15803D]" data-bar-height="${height}"></div><span class="text-xs text-[#6B7280]">${label}</span></div>`;
        }).join('');
        els.chart.querySelectorAll('[data-bar-height]').forEach((bar) => {
            bar.style.height = `${bar.dataset.barHeight}px`;
        });

        const latest = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
        els.latest.innerHTML = latest.length ? latest.map((b) => `
            <tr class="border-t border-[#E5E7EB]">
                <td class="px-5 py-3.5"><span class="font-medium">${b.id}</span></td>
                <td class="px-5 py-3.5">${b.customerName || '-'}</td>
                <td class="px-5 py-3.5">${b.lapanganNama}</td>
                <td class="px-5 py-3.5">${formatDate(b.tanggal)}, ${b.jam}</td>
                <td class="px-5 py-3.5">${statusBadge(b.status)}</td>
            </tr>`).join('') : '<tr><td colspan="5" class="px-5 py-10 text-center text-sm text-[#6B7280]">Belum ada booking pada prototype ini.</td></tr>';
    }

    window.addEventListener('storage', (event) => { if (event.key === GarudaBooking.STORAGE_KEY) render(); });
    window.addEventListener('focus', render);
    render();
})();
