(function () {
    const body = document.getElementById('field-table-body');
    const empty = document.getElementById('field-empty');
    const search = document.getElementById('field-search');
    const typeFilter = document.getElementById('field-type-filter');
    const statusFilter = document.getElementById('field-status-filter');
    const modal = document.getElementById('field-modal');
    const form = document.getElementById('field-form');
    const toast = document.getElementById('field-toast');
    let currentEditId = null;
    let toastTimer = null;

    const fieldEls = {
        id: document.getElementById('field-id'),
        name: document.getElementById('field-name'),
        type: document.getElementById('field-type'),
        price: document.getElementById('field-price'),
        rating: document.getElementById('field-rating'),
        reviews: document.getElementById('field-reviews'),
        location: document.getElementById('field-location'),
        size: document.getElementById('field-size'),
        capacity: document.getElementById('field-capacity'),
        status: document.getElementById('field-status'),
        image: document.getElementById('field-image'),
        facilities: document.getElementById('field-facilities'),
        description: document.getElementById('field-description')
    };

    function esc(value) {
        return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
    }

    function currency(value) { return `Rp ${Number(value || 0).toLocaleString('id-ID')} / jam`; }
    function statusClass(status) {
        if (status === 'Aktif') return 'bg-green-100 text-green-800';
        if (status === 'Perawatan') return 'bg-amber-100 text-amber-800';
        return 'bg-red-100 text-red-700';
    }
    function typeLabel(type) { return { interlock: 'Interlock', rumput: 'Rumput Sintetis', vinyl: 'Vinyl Pro' }[type] || type; }

    function filtered() {
        const needle = search.value.trim().toLowerCase();
        return GarudaFields.getFields().filter((field) => {
            const matchesSearch = !needle || `${field.nama} ${field.lokasi}`.toLowerCase().includes(needle);
            const matchesType = typeFilter.value === 'all' || field.jenis === typeFilter.value;
            const matchesStatus = statusFilter.value === 'all' || field.status === statusFilter.value;
            return matchesSearch && matchesType && matchesStatus;
        });
    }

    function render() {
        const fields = GarudaFields.getFields();
        const shown = filtered();
        document.getElementById('field-subtitle').textContent = `${fields.length} lapangan terdaftar. Ubah data atau status ketersediaannya.`;
        document.getElementById('stat-total').textContent = fields.length;
        document.getElementById('stat-active').textContent = fields.filter((f) => f.status === 'Aktif').length;
        document.getElementById('stat-other').textContent = fields.filter((f) => f.status !== 'Aktif').length;
        body.innerHTML = shown.map((field) => `
            <tr class="border-t border-[#E5E7EB] hover:bg-[#FAFAFA]">
                <td class="px-5 py-3.5"><div class="flex items-center gap-3"><img src="${esc(field.gambar)}" alt="" class="w-12 h-10 rounded-lg object-cover bg-[#DCFCE7]" data-fallback-src="images/2-venue-interlock.jpg"><div><div class="font-semibold">${esc(field.nama)}</div><div class="text-xs text-[#6B7280]">ID ${esc(field.id)}</div></div></div></td>
                <td class="px-5 py-3.5">${esc(typeLabel(field.jenis))}</td>
                <td class="px-5 py-3.5 font-medium">${currency(field.harga)}</td>
                <td class="px-5 py-3.5"><i class="fa-solid fa-star text-[#F59E0B] mr-1"></i>${Number(field.rating || 0).toLocaleString('id-ID',{minimumFractionDigits:1})} (${esc(field.ulasanCount)})</td>
                <td class="px-5 py-3.5">${esc(field.lokasi)}</td>
                <td class="px-5 py-3.5"><span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass(field.status)}">${esc(field.status)}</span></td>
                <td class="px-5 py-3.5"><div class="flex flex-wrap gap-2">
                    <button type="button" data-action="edit" data-id="${esc(field.id)}" class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E7EB] hover:bg-gray-50">Ubah</button>
                    <button type="button" data-action="toggle" data-id="${esc(field.id)}" class="px-3 py-1.5 rounded-lg text-xs font-semibold ${field.status === 'Nonaktif' ? 'bg-[#15803D] text-white' : 'border border-red-300 text-red-600 hover:bg-red-50'}">${field.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}</button>
                </div></td>
            </tr>`).join('');
        empty.classList.toggle('hidden', shown.length > 0);
    }

    function showToast(message) {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.remove('hidden');
        toastTimer = setTimeout(() => toast.classList.add('hidden'), 2400);
    }

    function openModal(field = null) {
        currentEditId = field ? Number(field.id) : null;
        document.getElementById('field-modal-title').textContent = field ? 'Ubah Lapangan' : 'Tambah Lapangan';
        fieldEls.id.value = field?.id ?? '';
        fieldEls.name.value = field?.nama ?? '';
        fieldEls.type.value = field?.jenis ?? 'interlock';
        fieldEls.price.value = field?.harga ?? 150000;
        fieldEls.rating.value = field?.rating ?? 4.5;
        fieldEls.reviews.value = field?.ulasanCount ?? 0;
        fieldEls.location.value = field?.lokasi ?? '';
        fieldEls.size.value = field?.ukuran ?? '';
        fieldEls.capacity.value = field?.kapasitas ?? '';
        fieldEls.status.value = field?.status ?? 'Aktif';
        fieldEls.image.value = field?.gambar ?? 'images/2-venue-interlock.jpg';
        fieldEls.facilities.value = Array.isArray(field?.fasilitas) ? field.fasilitas.join(', ') : '';
        fieldEls.description.value = field?.deskripsi ?? '';
        modal.classList.remove('hidden');
        fieldEls.name.focus();
    }

    function closeModal() { modal.classList.add('hidden'); form.reset(); currentEditId = null; }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const jenis = fieldEls.type.value;
        const data = {
            nama: fieldEls.name.value.trim(), jenis, jenisLabel: typeLabel(jenis), harga: Number(fieldEls.price.value),
            rating: Number(fieldEls.rating.value || 0), ulasanCount: Number(fieldEls.reviews.value || 0),
            lokasi: fieldEls.location.value.trim(), ukuran: fieldEls.size.value.trim(), kapasitas: fieldEls.capacity.value.trim(),
            status: fieldEls.status.value, gambar: fieldEls.image.value.trim(),
            fasilitas: fieldEls.facilities.value.split(',').map((item) => item.trim()).filter(Boolean),
            deskripsi: fieldEls.description.value.trim()
        };
        const isEditing = Boolean(currentEditId);
        if (isEditing) GarudaFields.updateField(currentEditId, data);
        else GarudaFields.createField(data);
        closeModal();
        render();
        showToast(isEditing ? 'Data lapangan diperbarui.' : 'Lapangan baru ditambahkan.');
    });

    body.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = Number(button.dataset.id);
        const field = GarudaFields.findField(id);
        if (!field) return;
        if (button.dataset.action === 'edit') openModal(field);
        if (button.dataset.action === 'toggle') {
            const next = field.status === 'Nonaktif' ? 'Aktif' : 'Nonaktif';
            GarudaFields.setStatus(id, next);
            render();
            showToast(`${field.nama} sekarang ${next.toLowerCase()}.`);
        }
    });

    [search, typeFilter, statusFilter].forEach((input) => input.addEventListener(input === search ? 'input' : 'change', render));
    document.getElementById('add-field-btn').addEventListener('click', () => openModal());
    document.getElementById('field-modal-close').addEventListener('click', closeModal);
    document.getElementById('field-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
    window.addEventListener('storage', (event) => { if (event.key === GarudaFields.STORAGE_KEY) render(); });
    window.addEventListener('focus', render);
    render();
})();
