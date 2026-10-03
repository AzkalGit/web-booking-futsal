(function () {
    const tbody = document.getElementById('report-table-body');
    const totalBookings = document.getElementById('report-total-bookings');
    const totalHours = document.getElementById('report-total-hours');
    const totalRevenue = document.getElementById('report-total-revenue');
    const monthLabel = document.getElementById('report-period');

    function currency(value) { return `Rp ${Number(value || 0).toLocaleString('id-ID')}`; }
    function render() {
        const now = new Date();
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
        const bookings = GarudaBooking.getBookings().filter((b) => ['Dikonfirmasi', 'Selesai'].includes(b.status) && String(b.tanggal || '').startsWith(monthPrefix));
        const grouped = new Map();
        bookings.forEach((b) => {
            const key = Number(b.lapanganId);
            const row = grouped.get(key) || { count: 0, hours: 0, revenue: 0 };
            row.count += 1;
            row.hours += Number(b.durasi || 0);
            row.revenue += Number(b.total || 0);
            grouped.set(key, row);
        });

        const fields = GarudaFields.getFields();
        tbody.innerHTML = fields.map((lapangan) => {
            const row = grouped.get(lapangan.id) || { count: 0, hours: 0, revenue: 0 };
            return `<tr class="border-t border-[#E5E7EB]"><td class="px-5 py-3.5"><span class="font-semibold">${lapangan.nama}</span></td><td class="px-5 py-3.5">${lapangan.jenisLabel}</td><td class="px-5 py-3.5">${row.count}</td><td class="px-5 py-3.5">${row.hours} jam</td><td class="px-5 py-3.5">${currency(lapangan.harga)}</td><td class="px-5 py-3.5"><span class="font-semibold text-[#15803D]">${currency(row.revenue)}</span></td></tr>`;
        }).join('');

        totalBookings.textContent = bookings.length;
        totalHours.textContent = `${bookings.reduce((sum, b) => sum + Number(b.durasi || 0), 0)} jam`;
        totalRevenue.textContent = currency(bookings.reduce((sum, b) => sum + Number(b.total || 0), 0));
        monthLabel.textContent = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
    }

    const exportBtn = document.getElementById('export-report');
    exportBtn.addEventListener('click', () => {
        const rows = [...document.querySelectorAll('#report-table-body tr')].map((tr) => [...tr.children].map((td) => td.innerText.replace(/\n/g, ' ').trim()));
        const csv = [['Lapangan', 'Jenis', 'Jumlah booking', 'Jam terpakai', 'Tarif / jam', 'Pendapatan'], ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'laporan-garuda-arena.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    window.addEventListener('storage', (event) => { if (event.key === GarudaBooking.STORAGE_KEY || event.key === GarudaFields.STORAGE_KEY) render(); });
    window.addEventListener('focus', render);
    render();
})();
