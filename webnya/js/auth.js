(function () {
    // Prototipe: akun disimpan di localStorage (tanpa backend), password TIDAK aman.
    const USERS_KEY = 'garudaArenaUsers';
    const mode = document.body.dataset.authMode;
    const form = document.getElementById('auth-form');
    const errorBox = document.getElementById('auth-error');

    function readUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch (e) { return []; }
    }
    function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.add('show');
    }

    function nameFromEmail(email) {
        const raw = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
        const nama = raw.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Pengguna';
        const inisial = nama.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
        return { nama, inisial };
    }

    function loginAs(user) {
        GarudaBooking.setCurrentUser({ email: user.email, nama: user.nama, inisial: user.inisial });
        window.location.href = 'index.html';
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        errorBox.classList.remove('show');

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        if (!/^\S+@\S+\.\S+$/.test(email)) return showError('Format email belum benar.');
        if (password.length < 6) return showError('Password minimal 6 karakter.');

        const users = readUsers();
        const existing = users.find((u) => u.email === email);

        if (mode === 'register') {
            if (existing) return showError('Email sudah terdaftar. Silakan masuk.');
            const profile = nameFromEmail(email);
            const user = { email, password, nama: profile.nama, inisial: profile.inisial };
            users.push(user);
            writeUsers(users);
            loginAs(user);
        } else {
            if (!existing || existing.password !== password) return showError('Email atau password salah.');
            loginAs(existing);
        }
    });

    document.querySelectorAll('[data-social]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            showError('Login dengan akun sosial belum tersedia di prototipe ini.');
        });
    });
})();
