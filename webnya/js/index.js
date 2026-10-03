// Set default date for date inputs to today
document.addEventListener('DOMContentLoaded', () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const searchDateInput = document.getElementById('search-date');
    const bookDateInput = document.getElementById('book-date');
    if (searchDateInput) { searchDateInput.value = today; searchDateInput.min = today; }
    if (bookDateInput) { bookDateInput.value = today; bookDateInput.min = today; }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-controls', 'mobile-menu');
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
}

// Filter Venues Function
function filterVenues(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-green-700', 'text-white', 'shadow-md', 'shadow-green-500/20');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });
    const activeBtn = document.getElementById(`filter-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'text-gray-600');
        activeBtn.classList.add('bg-green-700', 'text-white', 'shadow-md', 'shadow-green-500/20');
    }

    const cards = document.querySelectorAll('.venue-card');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Booking Modal State & Logic
let currentSelectedVenue = '';
let currentVenuePrice = 0;

function openBookingModal(venueName, price) {
    currentSelectedVenue = venueName;
    currentVenuePrice = price;

    document.getElementById('modal-venue-title').innerText = venueName;
    document.getElementById('modal-venue-price').innerText = `Tarif: Rp ${price.toLocaleString('id-ID')} / jam`;
    calculateTotal();

    const modal = document.getElementById('booking-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    const content = document.getElementById('modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

function calculateTotal() {
    const duration = parseInt(document.getElementById('book-duration').value) || 1;
    const total = currentVenuePrice * duration;
    document.getElementById('modal-total-price').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function submitBooking(event) {
    event.preventDefault();
    const name = document.getElementById('book-name').value;
    const phone = document.getElementById('book-phone').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const duration = document.getElementById('book-duration').value;

    closeBookingModal();

    document.getElementById('success-desc').innerText = `Terima kasih ${name}. Booking ${currentSelectedVenue} untuk tanggal ${date} jam ${time} (${duration} jam) berhasil dicatat. Silakan lakukan pembayaran.`;
    const successModal = document.getElementById('success-modal');
    successModal.classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

function handleQuickSearch(event) {
    event.preventDefault();
    const venue = document.getElementById('search-venue').value;

    filterVenues('all');
    if (venue !== 'all') {
        document.querySelectorAll('.venue-card').forEach(card => {
            if (card.getAttribute('data-name') !== venue) card.style.display = 'none';
        });
    }
    document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
}

// Video Modal
function openVideoModal() {
    document.getElementById('video-modal').classList.remove('hidden');
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.add('hidden');
}

function toggleSearchModal() {
    document.getElementById('venues').scrollIntoView({ behavior: 'smooth' });
}


// Event wiring: menggantikan atribut onclick/onsubmit/onchange yang dulu ada di index.html.
document.addEventListener('DOMContentLoaded', () => {
    const clickActions = {
        'open-video': () => openVideoModal(),
        'close-video': () => closeVideoModal(),
        'close-booking': () => closeBookingModal(),
        'close-success': () => closeSuccessModal()
    };

    document.addEventListener('click', (event) => {
        const filterBtn = event.target.closest('[data-filter]');
        if (filterBtn) {
            filterVenues(filterBtn.dataset.filter);
            return;
        }

        const trigger = event.target.closest('[data-action]');
        if (!trigger) return;

        if (trigger.dataset.action === 'open-booking') {
            openBookingModal(trigger.dataset.venue, Number(trigger.dataset.price));
            return;
        }
        const handler = clickActions[trigger.dataset.action];
        if (handler) handler();
    });

    const quickSearchForm = document.getElementById('quick-search-form');
    if (quickSearchForm) quickSearchForm.addEventListener('submit', handleQuickSearch);

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.addEventListener('submit', submitBooking);

    const durationSelect = document.getElementById('book-duration');
    if (durationSelect) durationSelect.addEventListener('change', calculateTotal);
});


// Active navbar section using Intersection Observer.
// The active item follows the section currently passing through the viewport's focus area.
document.addEventListener('DOMContentLoaded', () => {
    const sectionIds = ['home', 'venues', 'features', 'gallery', 'contact'];
    const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const desktopLinks = [...document.querySelectorAll('[data-nav-target]')]
        .filter(link => !link.id.startsWith('mobile-'));
    const mobileLinks = [...document.querySelectorAll('[data-nav-target]')]
        .filter(link => link.id.startsWith('mobile-'));

    if (!sections.length || !desktopLinks.length) return;

    const setActiveNav = (activeId) => {
        desktopLinks.forEach(link => {
            const active = link.dataset.navTarget === activeId;
            link.classList.toggle('text-green-700', active);
            link.classList.toggle('font-semibold', active);
            link.classList.toggle('text-gray-600', !active);
        });

        mobileLinks.forEach(link => {
            const active = link.dataset.navTarget === activeId;
            link.classList.toggle('text-green-700', active);
            link.classList.toggle('bg-green-50', active);
            link.classList.toggle('text-gray-600', !active);
        });
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (!visible.length) return;

        // Prefer the section with the largest visible portion in the focus area.
        const current = visible.reduce((best, entry) =>
            entry.intersectionRatio > best.intersectionRatio ? entry : best
        );

        setActiveNav(current.target.id);
    }, {
        root: null,
        // The middle 20% of the viewport acts as the navigation focus area.
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(section => observer.observe(section));

    // If the page opens with a hash, immediately reflect that target in the navbar.
    const initialId = window.location.hash.replace('#', '');
    if (sectionIds.includes(initialId)) setActiveNav(initialId);
});
