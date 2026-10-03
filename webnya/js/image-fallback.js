// Fallback gambar bersama. Menggantikan atribut onerror inline di template JS.
// Pakai data-fallback-src="path" untuk mengganti gambar rusak dengan gambar lain,
// atau data-fallback-icon untuk menggantinya dengan ikon bola di kontainer induk.
// Event 'error' tidak bubbling, jadi didengarkan di fase capture.
document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallbackDone) return;
    img.dataset.fallbackDone = 'true';

    if (img.dataset.fallbackSrc) {
        img.src = img.dataset.fallbackSrc;
        return;
    }

    if (img.hasAttribute('data-fallback-icon') && img.parentElement) {
        const parent = img.parentElement;
        parent.classList.add('flex', 'items-center', 'justify-center');
        parent.innerHTML = '<i class="fa-solid fa-futbol text-[#15803D] text-2xl"></i>';
    }
}, true);
