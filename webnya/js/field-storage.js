// Penyimpanan lapangan simulasi untuk prototype frontend.
// Data awal berasal dari js/data-lapangan.js; perubahan admin disimpan di localStorage.
(function () {
    const STORAGE_KEY = 'garudaArenaFields';
    const VERSION_KEY = 'garudaArenaFieldsVersion';

    function clone(data) {
        return JSON.parse(JSON.stringify(data || []));
    }

    function readStored() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Gagal membaca data lapangan:', error);
            return null;
        }
    }

    function writeStored(fields) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    }

    function seed() {
        const base = clone(window.GARUDA_ARENA_DATA.LAPANGAN).map((field) => ({
            status: 'Aktif',
            ...field
        }));
        const stored = readStored();
        const currentVersion = String(window.GARUDA_ARENA_DATA.DATA_VERSION || 1);
        let storedVersion = null;
        try { storedVersion = localStorage.getItem(VERSION_KEY); } catch (error) { /* abaikan */ }

        // Data awal berubah (versi beda) atau belum ada data: pakai data awal terbaru.
        // Catatan: perubahan lapangan dari panel admin ikut ter-reset saat versi dinaikkan.
        if (!Array.isArray(stored) || !stored.length || storedVersion !== currentVersion) {
            writeStored(base);
            try { localStorage.setItem(VERSION_KEY, currentVersion); } catch (error) { /* abaikan */ }
            return base;
        }
        return stored;
    }

    function getFields() {
        const fields = seed();
        return clone(fields).sort((a, b) => Number(a.id) - Number(b.id));
    }

    function getPublicFields() {
        return getFields().filter((field) => field.status !== 'Nonaktif');
    }

    function findField(id) {
        return getFields().find((field) => Number(field.id) === Number(id)) || null;
    }

    function saveFields(fields) {
        const next = clone(fields).sort((a, b) => Number(a.id) - Number(b.id));
        writeStored(next);
        return next;
    }

    function upsertField(field) {
        const fields = getFields();
        const normalized = {
            ...field,
            id: Number(field.id),
            harga: Number(field.harga) || 0,
            rating: Number(field.rating) || 0,
            ulasanCount: Number(field.ulasanCount) || 0,
            fasilitas: Array.isArray(field.fasilitas) ? field.fasilitas : [],
            status: field.status || 'Aktif'
        };
        const index = fields.findIndex((item) => Number(item.id) === normalized.id);
        if (index === -1) fields.push(normalized);
        else fields[index] = { ...fields[index], ...normalized };
        saveFields(fields);
        return normalized;
    }

    function createField(field) {
        const fields = getFields();
        const maxId = fields.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
        const created = {
            id: maxId + 1,
            nama: field.nama,
            jenis: field.jenis,
            jenisLabel: field.jenisLabel,
            harga: Number(field.harga) || 0,
            rating: Number(field.rating) || 0,
            ulasanCount: Number(field.ulasanCount) || 0,
            lokasi: field.lokasi,
            deskripsi: field.deskripsi,
            ukuran: field.ukuran,
            kapasitas: field.kapasitas,
            fasilitas: Array.isArray(field.fasilitas) ? field.fasilitas : [],
            gambar: field.gambar,
            status: field.status || 'Aktif'
        };
        fields.push(created);
        saveFields(fields);
        return created;
    }

    function updateField(id, changes) {
        const fields = getFields();
        const index = fields.findIndex((item) => Number(item.id) === Number(id));
        if (index === -1) return null;
        fields[index] = {
            ...fields[index],
            ...changes,
            id: Number(id),
            harga: Number(changes.harga ?? fields[index].harga) || 0,
            rating: Number(changes.rating ?? fields[index].rating) || 0,
            ulasanCount: Number(changes.ulasanCount ?? fields[index].ulasanCount) || 0,
            fasilitas: Array.isArray(changes.fasilitas) ? changes.fasilitas : fields[index].fasilitas,
            status: changes.status || fields[index].status
        };
        saveFields(fields);
        return fields[index];
    }

    function setStatus(id, status) {
        return updateField(id, { status });
    }

    window.GarudaFields = {
        STORAGE_KEY,
        getFields,
        getPublicFields,
        findField,
        saveFields,
        upsertField,
        createField,
        updateField,
        setStatus
    };
})();
