/**
 * 세울 — Common JS
 * 헤더/푸터 주입, 검색, 드로어, 유틸리티
 */
const App = (() => {
  /* ── 경로 계산 ── */
  function basePath() {
    const p = location.pathname;
    if (p.includes('/pages/') || p.includes('/admin/')) return '..';
    return '.';
  }
  const B = basePath();

  /* ── 현재 네비게이션 활성 판단 ── */
  function navActive(href) {
    const cur = location.pathname;
    if (href.includes('index.html') && (cur.endsWith('/') || cur.endsWith('/index.html') || cur.endsWith('/redevelopment/'))) return true;
    return cur.includes(href.replace(B, ''));
  }

  /* ── 공통 헤더 HTML ── */
  function headerHTML() {
    const links = [
      { href: `${B}/pages/about.html`, label: '회사소개', icon: 'fa-solid fa-building-columns' },
      { href: `${B}/pages/vision.html`, label: '세울의 길', icon: 'fa-solid fa-road' },
      { href: `${B}/pages/services.html`, label: '사업분야', icon: 'fa-solid fa-diagram-project' },
      { href: `${B}/pages/portfolio.html`, label: '업무실적', icon: 'fa-solid fa-briefcase' },
      { href: `${B}/pages/library.html`, label: '자료실', icon: 'fa-solid fa-folder-open' },
      { href: `${B}/pages/community.html`, label: '커뮤니티', icon: 'fa-solid fa-comments' },
      { href: `${B}/pages/search.html`, label: '사업성 검토', icon: 'fa-solid fa-chart-line' },
      { href: `${B}/pages/contact.html`, label: '고객센터', icon: 'fa-solid fa-envelope' },
      { href: `${B}/intranet/index.html`, label: '인트라넷', icon: 'fa-solid fa-lock' },
    ];
    const moreLinks = [
      { href: `${B}/pages/notice.html`, label: '공지사항', icon: 'fa-solid fa-bullhorn' },
      { href: `${B}/pages/faq.html`, label: '자주 묻는 질문', icon: 'fa-solid fa-circle-question' },
    ];

    const isLoggedIn = DataService.isUserLoggedIn();
    const user = DataService.getCurrentUser();

    const utilRight = isLoggedIn
      ? `<a href="${B}/pages/mypage.html">${user.name}님</a><a href="#" id="logoutBtn">로그아웃</a>`
      : `<a href="${B}/pages/login.html">로그인</a><a href="${B}/pages/register.html">회원가입</a>`;

    return `
    <div class="header-wrap" id="headerWrap">
    <div class="util-bar"><div class="inner">
      <span class="util-left">(주)세울엔지니어링 · 도시정비 전문 엔지니어링</span>
      <a href="${B}/pages/notice.html">공지사항</a>
      ${utilRight}
    </div></div>
    <header class="header"><div class="inner">
      <a href="${B}/index.html" class="logo">
        <span class="logo-mark"><svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="104" height="104" rx="4" stroke="#1A1A1A" stroke-width="2" opacity="0.15"/><rect x="28" y="24" width="52" height="6" rx="1" fill="#1A1A1A"/><rect x="28" y="24" width="6" height="28" rx="1" fill="#1A1A1A"/><rect x="40" y="52" width="52" height="6" rx="1" fill="#1A1A1A" opacity="0.5"/><rect x="86" y="58" width="6" height="28" rx="1" fill="#1A1A1A"/><rect x="40" y="86" width="52" height="6" rx="1" fill="#1A1A1A"/><path d="M86 24 L92 18 L98 24" stroke="#1A1A1A" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/></svg></span>
        <span class="logo-text">
          <span class="logo-company">(주)세울엔지니어링</span>
          <span class="logo-sub">SEUL ENGINEERING</span>
        </span>
      </a>
      <nav class="gnb">
        ${links.map(l => `<a href="${l.href}"${navActive(l.href) ? ' class="active"' : ''}>${l.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="검색" id="openSearch"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
      <button class="menu-toggle" aria-label="메뉴" id="openDrawer"><i class="fa-solid fa-bars"></i></button>
    </div></header>
    </div>

    <div class="drawer-overlay" id="drawerOverlay"></div>
    <aside class="drawer" id="drawer">
      <div class="drawer-header">
        <span class="logo">
          <span class="logo-mark"><svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="104" height="104" rx="4" stroke="#1A1A1A" stroke-width="2" opacity="0.15"/><rect x="28" y="24" width="52" height="6" rx="1" fill="#1A1A1A"/><rect x="28" y="24" width="6" height="28" rx="1" fill="#1A1A1A"/><rect x="40" y="52" width="52" height="6" rx="1" fill="#1A1A1A" opacity="0.5"/><rect x="86" y="58" width="6" height="28" rx="1" fill="#1A1A1A"/><rect x="40" y="86" width="52" height="6" rx="1" fill="#1A1A1A"/></svg></span>
          <span class="logo-text">
            <span class="logo-company">(주)세울엔지니어링</span>
            <span class="logo-sub">SEUL ENGINEERING</span>
          </span>
        </span>
        <button class="drawer-close" id="drawerClose"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav class="drawer-nav">
        ${links.concat(moreLinks).map(l => `<a href="${l.href}"><i class="${l.icon}"></i> ${l.label}</a>`).join('')}
      </nav>
      <div class="drawer-footer">
        ${isLoggedIn
          ? `<a href="${B}/pages/mypage.html" class="btn btn-outline btn-md">마이페이지</a><a href="#" class="btn btn-primary btn-md" id="drawerLogout">로그아웃</a>`
          : `<a href="${B}/pages/login.html" class="btn btn-outline btn-md">로그인</a><a href="${B}/pages/register.html" class="btn btn-primary btn-md">회원가입</a>`}
      </div>
    </aside>

    <div class="search-overlay" id="searchOverlay">
      <button class="search-overlay-close" id="searchClose"><i class="fa-solid fa-xmark"></i></button>
      <div class="search-overlay-inner">
        <div class="search-big">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="searchField" placeholder="사업분야, 자료, 업무실적 검색" autocomplete="off">
        </div>
        <div class="search-keywords">
          <h4>인기 검색어</h4>
          <div class="tags">
            <a href="#">조합설립</a><a href="#">관리처분</a><a href="#">도시계획</a>
            <a href="#">사업성분석</a><a href="#">인허가</a><a href="#">자료실</a>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ── 공통 푸터 HTML ── */
  function footerHTML() {
    return `
    <footer class="footer"><div class="inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-mark"><svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="104" height="104" rx="4" stroke="#fff" stroke-width="2" opacity="0.15"/><rect x="28" y="24" width="52" height="6" rx="1" fill="#fff"/><rect x="28" y="24" width="6" height="28" rx="1" fill="#fff"/><rect x="40" y="52" width="52" height="6" rx="1" fill="#fff" opacity="0.5"/><rect x="86" y="58" width="6" height="28" rx="1" fill="#fff"/><rect x="40" y="86" width="52" height="6" rx="1" fill="#fff"/></svg></span>
            <span class="logo-text">
              <span class="logo-company">(주)세울엔지니어링</span>
              <span class="logo-sub">SEUL ENGINEERING</span>
            </span>
          </div>
          <p>재개발·재건축·소규모정비사업<br>정비사업전문관리업 등록 종합 엔지니어링 전문기업</p>
        </div>
        <div class="footer-col">
          <h5>회사</h5>
          <a href="${B}/pages/about.html">회사소개</a>
          <a href="${B}/pages/vision.html">세울의 길</a>
          <a href="${B}/pages/services.html">사업분야</a>
          <a href="${B}/pages/portfolio.html">업무실적</a>
        </div>
        <div class="footer-col">
          <h5>자료·정보</h5>
          <a href="${B}/pages/library.html">자료실</a>
          <a href="${B}/pages/community.html">커뮤니티</a>
          <a href="${B}/pages/notice.html">공지사항</a>
          <a href="${B}/pages/faq.html">자주 묻는 질문</a>
        </div>
        <div class="footer-col">
          <h5>문의·지원</h5>
          <a href="${B}/pages/search.html">사업성 검토</a>
          <a href="${B}/pages/contact.html">고객센터</a>
          <a href="${B}/intranet/index.html">인트라넷</a>
        </div>
        <div class="footer-col footer-contact">
          <h5>고객센터</h5>
          <span class="phone">010-2230-9210</span>
          <a href="mailto:dodo6666@naver.com" class="email-link"><i class="fa-solid fa-envelope" style="font-size:11px"></i> dodo6666@naver.com</a>
          <p>FAX 0504-340-9210<br>평일 09:00 – 18:00 (토·일·공휴일 휴무)</p>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copy">&copy; 2026 (주)세울엔지니어링. All rights reserved. &nbsp;|&nbsp; <a href="${B}/pages/privacy.html" style="color:rgba(255,255,255,.4);text-decoration:underline">개인정보 처리방침</a></div>
        <div class="footer-info">경기도 하남시 감일백제로 70, 204동 1104호 | 대표 Charles Lee</div>
        <div class="footer-social">
          <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="카카오톡"><i class="fa-solid fa-comment"></i></a>
          <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
        </div>
      </div>
    </div></footer>
    <button class="scroll-top" id="scrollTop" aria-label="맨 위로"><i class="fa-solid fa-chevron-up"></i></button>
    <div class="toast-container" id="toastContainer"></div>`;
  }

  /* ── 초기화 ── */
  function init() {
    // 헤더/푸터 주입
    const hdr = document.getElementById('site-header');
    const ftr = document.getElementById('site-footer');
    if (hdr) hdr.innerHTML = headerHTML();
    if (ftr) ftr.innerHTML = footerHTML();

    // 이벤트 바인딩
    bindEvents();
  }

  function lockScroll() {
    var scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarW + 'px';
  }
  function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  function bindEvents() {
    // Drawer
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const openBtn = document.getElementById('openDrawer');
    const closeBtn = document.getElementById('drawerClose');
    if (openBtn) openBtn.addEventListener('click', () => { drawer.classList.add('open'); overlay.classList.add('open'); lockScroll(); });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      unlockScroll();
    }

    // Search
    const searchOverlay = document.getElementById('searchOverlay');
    const searchField = document.getElementById('searchField');
    const openSearch = document.getElementById('openSearch');
    const closeSearch = document.getElementById('searchClose');
    if (openSearch) openSearch.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      lockScroll();
      setTimeout(() => searchField.focus(), 200);
    });
    if (closeSearch) closeSearch.addEventListener('click', () => {
      searchOverlay.classList.remove('open');
      unlockScroll();
      searchField.value = '';
    });

    // Search keywords
    document.querySelectorAll('.search-keywords .tags a').forEach(tag => {
      tag.addEventListener('click', e => {
        e.preventDefault();
        searchField.value = tag.textContent;
        searchField.focus();
      });
    });

    // Search submit
    if (searchField) searchField.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchField.value.trim()) {
        const q = searchField.value.trim();
        searchOverlay.classList.remove('open');
        unlockScroll();
        location.href = `${B}/pages/library.html?search=${encodeURIComponent(q)}`;
      }
    });

    // ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        if (searchOverlay) { searchOverlay.classList.remove('open'); unlockScroll(); }
      }
    });

    // Scroll top
    const scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // Scroll: 스크롤 탑 버튼만 (헤더 크기 변경 없음)
    if (scrollBtn) {
      window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', e => { e.preventDefault(); DataService.userLogout(); location.reload(); });
    const drawerLogout = document.getElementById('drawerLogout');
    if (drawerLogout) drawerLogout.addEventListener('click', e => { e.preventDefault(); DataService.userLogout(); location.reload(); });
  }

  /* ── Toast ── */
  function toast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
  }

  /* ── Pagination ── */
  function renderPagination(containerId, totalPages, currentPage, onPageChange) {
    const c = document.getElementById(containerId);
    if (!c || totalPages <= 1) { if (c) c.innerHTML = ''; return; }
    let html = '';
    html += `<button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
    c.innerHTML = html;
    c.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pg = parseInt(btn.dataset.page);
        if (pg >= 1 && pg <= totalPages) onPageChange(pg);
      });
    });
  }

  /* ── Confirm Modal ── */
  function confirm(title, message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay open';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header"><h3>${title}</h3><button class="modal-close" data-action="cancel"><i class="fa-solid fa-xmark"></i></button></div>
          <div class="modal-body"><p>${message}</p></div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" data-action="cancel">취소</button>
            <button class="btn btn-danger btn-sm" data-action="confirm">확인</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          resolve(btn.dataset.action === 'confirm');
          overlay.remove();
        });
      });
    });
  }

  /* ── URL params ── */
  function getParam(key) {
    return new URLSearchParams(location.search).get(key);
  }

  /* ── Format ── */
  function comma(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString();
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr.replace(' ', 'T'));
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return '방금 전';
    if (diff < 60) return diff + '분 전';
    if (diff < 1440) return Math.floor(diff / 60) + '시간 전';
    if (diff < 10080) return Math.floor(diff / 1440) + '일 전';
    return dateStr.slice(0, 10);
  }

  function stageColor(stage) {
    const map = {
      '정비구역지정': '--gray-500', '조합설립인가': '--orange',
      '사업시행인가': '--accent', '관리처분인가': '--blue',
      '착공': '--green', '입주예정': '--green', '준공': '--green'
    };
    return map[stage] || '--gray-500';
  }

  /* ── 공통 HTML head ── */
  function headTags(title, desc) {
    document.title = title + ' — 세울';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = desc || '대한민국 No.1 재개발·재건축 종합정보 플랫폼';
  }

  return { init, toast, renderPagination, confirm, getParam, comma, timeAgo, stageColor, headTags, basePath: () => B };
})();

/* DOM Ready */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (!location.pathname.includes('/admin/') && !location.pathname.includes('/intranet/')) {
    const b = App.basePath();
    const s = document.createElement('script');
    s.src = b + '/assets/js/chatbot.js';
    document.body.appendChild(s);
  }
});
