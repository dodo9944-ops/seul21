// SEUL Engineering — main interactions
(() => {
  'use strict';

  // Mark active tab in bottom nav based on current path
  const path = location.pathname.toLowerCase();
  document.querySelectorAll('.mobile-nav__item').forEach((el) => {
    const href = (el.getAttribute('href') || '').toLowerCase();
    if (!href || href.startsWith('tel:')) return;
    if (path.endsWith(href) || (href === 'index.html' && (path.endsWith('/') || path.endsWith('/seul/')))) {
      document.querySelectorAll('.mobile-nav__item.is-active').forEach(a => a.classList.remove('is-active'));
      el.classList.add('is-active');
    }
  });

  // Shadow on scroll for top nav
  const nav = document.getElementById('topNav');
  if (nav) {
    const onScroll = () => nav.style.boxShadow = window.scrollY > 12 ? '0 8px 24px -12px rgba(0,0,0,0.4)' : 'none';
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Fade-in on intersection
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = 1;
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 }) : null;

  if (io) {
    document.querySelectorAll('.card, .feature, .section__head').forEach((el, i) => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity .6s ease ${i * 60}ms, transform .6s ease ${i * 60}ms`;
      io.observe(el);
    });
  }

  // Simple form guard (contact page)
  const form = document.querySelector('form.form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('문의가 접수되었습니다. 24시간 내 담당자가 연락드립니다.');
      form.reset();
    });
  }
})();
