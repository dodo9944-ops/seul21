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
      { href: `${B}/pages/location.html`, label: '재개발지도', icon: 'fa-solid fa-map-location-dot' },
      { href: `${B}/pages/feasibility.html`, label: '사업성 검토', icon: 'fa-solid fa-calculator' },
      { href: `${B}/pages/contact.html`, label: '고객센터', icon: 'fa-solid fa-envelope' },
      { href: `${B}/intranet/index.html`, label: '인트라넷', icon: 'fa-solid fa-lock' },
      { href: `${B}/pages/webhard.html`, label: '웹하드', icon: 'fa-solid fa-hard-drive', target: '_blank' },
    ];
    const moreLinks = [
      { href: `${B}/pages/notice.html`, label: '공지사항', icon: 'fa-solid fa-bullhorn' },
      { href: `${B}/pages/faq.html`, label: '자주 묻는 질문', icon: 'fa-solid fa-circle-question' },
    ];

    const isLoggedIn = DataService.isUserLoggedIn();
    const user = DataService.getCurrentUser();

    const utilRight = isLoggedIn
      ? `<a href="${B}/pages/mypage.html">${user.name}님</a><a href="#" id="logoutBtn">로그아웃</a>`
      : `<a href="${B}/pages/login.html">로그인</a><a href="${B}/pages/register.html">회원가입</a><a href="${B}/pages/webhard.html" target="_blank">웹하드</a>`;

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
        ${links.map(l => `<a href="${l.href}"${l.target?' target="'+l.target+'"':''}${navActive(l.href)?' class="active"':''}>${l.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="검색" id="openSearch"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
      <button class="menu-toggle" aria-label="메뉴" id="openDrawer"><i class="fa-solid fa-bars"></i></button>
    </div></header>
    </div>

    <nav class="mobile-tab-bar" id="mobileTabBar">
      <div class="tab-scroll" id="tabScroll">
        ${links.map(l => `<a href="${l.href}"${l.target?' target="'+l.target+'"':''} class="tab-item${navActive(l.href) ? ' active' : ''}">${l.label}</a>`).join('')}
      </div>
    </nav>

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
      <nav class="drawer-nav" id="drawerNav">
        ${[
          { href:`${B}/pages/about.html`, label:'회사소개', icon:'fa-solid fa-building-columns', sub:[
            { href:`${B}/pages/about.html`, label:'회사소개' },
            { href:`${B}/pages/vision.html`, label:'세울의 길' },
          ]},
          { href:`${B}/pages/services.html`, label:'사업분야', icon:'fa-solid fa-diagram-project', sub:[
            { href:`${B}/pages/services.html`, label:'사업분야 전체' },
            { href:`${B}/pages/redevelopment-service.html`, label:'주택재개발 정비사업' },
            { href:`${B}/pages/reconstruction-service.html`, label:'주택재건축 정비사업' },
            { href:`${B}/pages/small-reconstruction-service.html`, label:'소규모 정비사업' },
            { href:`${B}/pages/garoju-service.html`, label:'도심복합개발' },
            { href:`${B}/pages/urbanplanning-service.html`, label:'도시계획(엔지니어링)' },
            { href:`${B}/pages/pmcm-service.html`, label:'도시정비 PM/CM' },
          ]},
          { href:`${B}/pages/portfolio.html`, label:'업무실적', icon:'fa-solid fa-briefcase', sub:[
            { href:`${B}/pages/portfolio.html`, label:'수행실적 전체' },
            { href:`${B}/pages/portfolio.html?type=재개발`, label:'재개발 실적' },
            { href:`${B}/pages/portfolio.html?type=재건축`, label:'재건축 실적' },
            { href:`${B}/pages/portfolio.html?type=소규모정비`, label:'소규모정비 실적' },
          ]},
          { href:`${B}/pages/library.html`, label:'자료실', icon:'fa-solid fa-folder-open', sub:[
            { href:`${B}/pages/library.html`, label:'자료실 전체' },
            { href:`${B}/pages/library.html?cat=법령`, label:'법령·제도' },
            { href:`${B}/pages/library.html?cat=판례지침`, label:'고시·공고' },
            { href:`${B}/pages/library.html?cat=서식가이드`, label:'서식·매뉴얼' },
            { href:`${B}/pages/library.html?cat=주요뉴스`, label:'주요뉴스' },
          ]},
          { href:`${B}/pages/community.html`, label:'커뮤니티', icon:'fa-solid fa-comments', sub:[
            { href:`${B}/pages/community.html`, label:'커뮤니티' },
            { href:`${B}/pages/notice.html`, label:'공지사항' },
            { href:`${B}/pages/library.html?cat=주요뉴스`, label:'뉴스·자료' },
            { href:`${B}/pages/faq.html`, label:'자주 묻는 질문' },
          ]},
          { href:`${B}/pages/location.html`, label:'재개발지도', icon:'fa-solid fa-map-location-dot', sub:[
            { href:`${B}/pages/location.html`, label:'재개발지도' },
            { href:`${B}/pages/portfolio.html`, label:'사업구역 전체' },
          ]},
          { href:`${B}/pages/feasibility.html`, label:'사업성 검토', icon:'fa-solid fa-calculator', sub:[
            { href:`${B}/pages/feasibility.html`, label:'사업성 분석 도구' },
            { href:`${B}/pages/consultation.html`, label:'무료 상담 신청' },
            { href:`${B}/pages/contact.html`, label:'전문가 문의' },
          ]},
          { href:`${B}/pages/contact.html`, label:'고객센터', icon:'fa-solid fa-envelope', sub:[
            { href:`${B}/pages/contact.html`, label:'문의하기' },
            { href:`${B}/pages/consultation.html`, label:'무료 상담 신청' },
            { href:`${B}/pages/legal-guide.html`, label:'법령 안내' },
            { href:`${B}/pages/permit-support.html`, label:'인허가 지원' },
            { href:`${B}/pages/faq.html`, label:'자주 묻는 질문' },
          ]},
          { href:`${B}/intranet/index.html`, label:'인트라넷', icon:'fa-solid fa-lock', sub:[
            { href:`${B}/intranet/index.html`, label:'인트라넷 홈' },
            { href:`${B}/intranet/projects.html`, label:'프로젝트 관리' },
            { href:`${B}/intranet/documents.html`, label:'문서 관리' },
            { href:`${B}/intranet/calendar.html`, label:'일정 관리' },
            { href:`${B}/intranet/contacts.html`, label:'주소록' },
          ]},
          { href:`${B}/pages/webhard.html`, label:'웹하드', icon:'fa-solid fa-hard-drive', target:'_blank' },
        ].map(g => g.sub
          ? `<div class="drawer-group">
              <button class="drawer-group-btn" onclick="(function(btn){var g=btn.closest('.drawer-group');g.classList.toggle('open');})(this)">
                <i class="${g.icon} dg-icon"></i>${g.label}<i class="fa-solid fa-chevron-down dg-arrow"></i>
              </button>
              <div class="drawer-sub">${g.sub.map(s=>`<a href="${s.href}">${s.label}</a>`).join('')}</div>
            </div>`
          : `<div class="drawer-group">
              <a href="${g.href}"${g.target?' target="'+g.target+'"':''} class="drawer-group-btn solo"><i class="${g.icon} dg-icon"></i>${g.label}</a>
            </div>`
        ).join('')}
      </nav>
      <div class="drawer-footer">
        ${isLoggedIn
          ? `<a href="${B}/pages/mypage.html" class="btn btn-outline btn-md">마이페이지</a><a href="#" class="btn btn-primary btn-md" id="drawerLogout">로그아웃</a>`
          : `<a href="${B}/pages/login.html" class="btn btn-outline btn-md">로그인</a><a href="${B}/pages/register.html" class="btn btn-primary btn-md">회원가입</a><a href="${B}/pages/webhard.html" target="_blank" class="btn btn-outline btn-md">웹하드</a>`}
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
            <a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">조합설립</a><a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">관리처분</a><a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">도시계획</a>
            <a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">사업성분석</a><a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">인허가</a><a href="#" onclick="document.getElementById('searchField').value=this.textContent;return false;">자료실</a>
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
          <p>재개발·재건축·소규모정비사업<br>도시정비 종합 엔지니어링 전문기업</p>
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
          <a href="${B}/pages/feasibility.html">사업성 검토</a>
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
          <a href="http://pf.kakao.com/_uNndX" target="_blank" aria-label="카카오톡"><i class="fa-solid fa-comment"></i></a>
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
    if (openBtn) openBtn.addEventListener('click', function() { drawer.classList.add('open'); overlay.classList.add('open'); lockScroll(); });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    function openDrawer() {
      drawer.classList.add('open'); overlay.classList.add('open'); lockScroll();
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      unlockScroll();
    }

    /* ── 모바일 탭바: 활성 탭 자동 스크롤 ── */
    var tabScroll = document.getElementById('tabScroll');
    if (tabScroll) {
      var activeTab = tabScroll.querySelector('.tab-item.active');
      if (activeTab) {
        setTimeout(function() { activeTab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' }); }, 100);
      }
    }

    /* ── 우측 드로어 스와이프 열기/닫기 ── */
    if (drawer && overlay) {
      var sw = { x0:0, y0:0, cx:0, t0:0, mode:'' };
      document.addEventListener('touchstart', function(e) {
        if (window.innerWidth > 1024) return;
        if (e.target.closest && e.target.closest('.mobile-tab-bar')) return;
        var t = e.touches[0], isOpen = drawer.classList.contains('open');
        if (!isOpen && t.clientX < window.innerWidth - 30) return;
        sw.x0 = t.clientX; sw.y0 = t.clientY; sw.cx = t.clientX; sw.t0 = Date.now();
        sw.mode = isOpen ? 'pc' : 'po';
      }, { passive: true });
      document.addEventListener('touchmove', function(e) {
        if (!sw.mode || sw.mode === 'no') return;
        var t = e.touches[0], dx = t.clientX - sw.x0, dy = t.clientY - sw.y0;
        if (sw.mode === 'pc' || sw.mode === 'po') {
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          if (Math.abs(dy) > Math.abs(dx)) { sw.mode = 'no'; return; }
          if (sw.mode === 'pc' && dx > 0) sw.mode = 'close';
          else if (sw.mode === 'po' && dx < 0) sw.mode = 'open';
          else { sw.mode = 'no'; return; }
        }
        if (sw.mode === 'no') return;
        e.preventDefault(); sw.cx = t.clientX;
        var w = drawer.offsetWidth || 300;
        if (sw.mode === 'close') {
          var s = Math.max(0, Math.min(w, dx));
          drawer.style.transition = 'none'; overlay.style.transition = 'none';
          drawer.style.transform = 'translateX(' + s + 'px)';
          overlay.style.opacity = Math.max(0, 1 - s / w);
        } else {
          var p = Math.max(0, Math.min(w, -dx));
          drawer.style.transition = 'none'; overlay.style.transition = 'none';
          drawer.style.transform = 'translateX(' + (w - p) + 'px)';
          overlay.style.opacity = Math.max(0, p / w);
          overlay.style.pointerEvents = p > 10 ? 'auto' : 'none';
        }
      }, { passive: false });
      document.addEventListener('touchend', function() {
        if (!sw.mode || sw.mode === 'no' || sw.mode === 'pc' || sw.mode === 'po') { sw.mode = ''; return; }
        var dx = sw.cx - sw.x0, v = Math.abs(dx) / (Date.now() - sw.t0 || 1), m = sw.mode;
        drawer.style.transition = ''; overlay.style.transition = '';
        drawer.style.transform = ''; overlay.style.opacity = '';
        if (m === 'close' && (dx > 50 || v > 0.25)) closeDrawer();
        else if (m === 'open' && (-dx > 50 || v > 0.25)) openDrawer();
        else overlay.style.pointerEvents = '';
        sw.mode = '';
      }, { passive: true });
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
    meta.content = desc || '(주)세울엔지니어링 — 재개발·재건축·도시정비 전문 엔지니어링';
  }

  /* ── Hero Card Detail Modal ── */
  const HERO_DETAILS = {
    '정비사업전문관리': '세울엔지니어링은 도시정비법에 근거한 정비사업 전 과정을 직접 수행합니다. 기본계획 수립부터 정비구역 지정, 추진위원회 구성, 조합설립인가, 사업시행인가, 관리처분계획, 시공사 선정, 분양, 입주, 조합 해산까지 — 모든 단계를 전문 인력이 책임지고 관리합니다. 10년 이상의 현장 경험을 바탕으로 행정 절차의 지연을 최소화하고, 조합원의 이익을 극대화하는 맞춤형 전략을 수립합니다.',
    '사업성 분석': '정비사업의 성패는 초기 사업성 분석에서 결정됩니다. 세울엔지니어링은 토지·건물 감정평가, 비례율 산정, 분담금 시뮬레이션, 공사비·용역비 추정, 분양수입 예측까지 정밀한 수지분석을 제공합니다. 사업 타당성 검토를 통해 최적의 추진 전략을 도출하고, 조합원에게 투명한 사업 전망을 제시합니다.',
    '인허가 대응': '정비사업의 핵심 관문인 인허가 절차를 전략적으로 대응합니다. 정비구역 지정 신청, 조합설립인가, 사업시행인가, 관리처분인가 등 각 단계별 인가 요건을 사전 검토하고, 행정기관과의 협의를 주도합니다. 인가 조건 충족을 위한 서류 작성, 보완 대응, 심의 준비까지 원스톱으로 지원합니다.',
    'CM / PM 관리': '설계·시공·준공 전 과정의 품질(Quality), 공정(Time), 원가(Cost)를 통합 관리하는 전문 CM/PM 서비스를 제공합니다. 시공사 선정 자문, 설계 검토, 공사비 검증, 공정 관리, 하자 점검까지 발주자(조합) 입장에서 사업을 감독하고 관리합니다.',
    '절차의 정합성': '정비사업은 도시정비법, 주택법, 건축법 등 수십 개의 법령이 교차하는 복합 행정 절차입니다. 세울엔지니어링은 법적 근거에 기반한 정확한 절차 수행을 최우선으로 합니다. 인가 요건 사전 검토, 법률 자문 연계, 행정소송 리스크 예방까지 — 절차의 정합성이 사업의 안정성을 보장합니다.',
    '이해관계 조율': '정비사업에는 조합원, 시공사, 설계사, 행정기관, 감정평가사 등 다양한 이해관계자가 참여합니다. 세울엔지니어링은 각 주체 간의 이해관계를 객관적으로 분석하고, 합리적 합의점을 도출합니다. 동의율 확보, 총회 운영, 분쟁 조정 등 이해관계 조율 전문 역량을 갖추고 있습니다.',
    '단계별 추진': '기본계획 수립 → 정비구역 지정 → 추진위 구성 → 조합설립 → 사업시행 → 관리처분 → 시공 → 준공·입주까지 전 단계를 체계적 로드맵으로 관리합니다. 각 단계별 핵심 과업, 소요 기간, 필요 서류, 인가 요건을 명확히 제시하여 사업 지연을 방지합니다.',
    '책임지는 완결': '세울엔지니어링은 사업이 완료될 때까지 동행합니다. 중도 이탈이나 책임 전가 없이, 조합 해산·정산까지 마지막 단계를 함께합니다. 입주 후 하자 점검, 잔여 자산 처분, 청산 절차까지 사업의 완전한 종결을 책임집니다.',
    '인허가 자문': '도시정비법·건축법·주택법 등 관련 법령에 기반한 인허가 전략을 수립합니다. 정비계획 변경, 건축심의, 환경영향평가, 교통영향평가 등 각종 심의·인가 절차를 전문적으로 대응하고, 인가 조건 충족을 위한 실무를 총괄합니다.',
  };

  function heroDetail(title) {
    const desc = HERO_DETAILS[title];
    if (!desc) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '99999';
    overlay.innerHTML = `
      <div class="modal" style="max-width:440px;margin:20px;">
        <div class="modal-header" style="background:var(--brand-dark);border-radius:var(--radius) var(--radius) 0 0;">
          <h3 style="color:var(--gold);font-size:16px;">${title}</h3>
          <button class="modal-close" data-action="close" style="color:rgba(255,255,255,.6);background:none;border:none;font-size:20px;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body" style="padding:24px;font-size:14px;line-height:1.8;color:var(--gray-700);max-height:60vh;overflow-y:auto;">
          <p>${desc}</p>
        </div>
        <div class="modal-footer" style="padding:12px 24px;border-top:1px solid var(--gray-100);text-align:center;">
          <button class="btn btn-accent btn-sm" data-action="close" style="width:100%;"><i class="fa-solid fa-xmark"></i> 닫기</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.remove();
        const hero = document.querySelector('.hero-cards-float,.uh-cards');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.remove();
        const hero = document.querySelector('.hero-cards-float,.uh-cards');
        if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  return { init, toast, renderPagination, confirm, getParam, comma, timeAgo, stageColor, headTags, heroDetail, basePath: () => B };
})();

/* DOM Ready */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (!location.pathname.includes('/admin/') && !location.pathname.includes('/intranet/')) {
    const b = App.basePath();
    const s = document.createElement('script');
    s.src = b + '/assets/js/chatbot.js?v=20260408d';
    document.body.appendChild(s);

    /* 텍스트 복사 금지 + 이미지 다운로드 금지 */
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('selectstart', e => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); });
    document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
    document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
    document.querySelectorAll('img').forEach(i => { i.setAttribute('draggable', 'false'); i.style.pointerEvents = 'none'; });
    new MutationObserver(muts => { muts.forEach(m => m.addedNodes.forEach(n => { if (n.querySelectorAll) n.querySelectorAll('img').forEach(i => { i.setAttribute('draggable', 'false'); i.style.pointerEvents = 'none'; }); })); }).observe(document.body, { childList: true, subtree: true });
  }
});
