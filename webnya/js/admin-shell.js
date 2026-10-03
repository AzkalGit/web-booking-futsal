
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('admin-mobile-menu-btn');
  const menu = document.getElementById('admin-mobile-menu');
  const close = document.getElementById('admin-mobile-close');
  const backdrop = document.getElementById('admin-mobile-backdrop');
  if (!trigger || !menu) return;

  const currentPage = window.location.pathname.split('/').pop() || 'admin-dashboard.html';
  menu.querySelectorAll('a').forEach(link => {
    const active = link.getAttribute('href') === currentPage;
    if (active) {
      link.classList.add('bg-green-700', 'text-white');
      link.classList.remove('text-green-100/90');
      link.setAttribute('aria-current', 'page');
    }
  });

  const setOpen = (open) => {
    menu.classList.toggle('hidden', !open);
    menu.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('overflow-hidden', open);
  };

  trigger.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
  [close, backdrop].filter(Boolean).forEach(el => el.addEventListener('click', () => setOpen(false)));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
});
