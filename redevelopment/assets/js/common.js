/**
 * 빛세움 — Common JS
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
      { href: `${B}/pages/vision.html`, label: '빛세움의 길', icon: 'fa-solid fa-road' },
      { href: `${B}/pages/services.html`, label: '사업분야', icon: 'fa-solid fa-diagram-project' },
      { href: `${B}/pages/portfolio.html`, label: '업무실적', icon: 'fa-solid fa-briefcase' },
      { href: `${B}/pages/library.html`, label: '자료실', icon: 'fa-solid fa-folder-open' },
      { href: `${B}/pages/contact.html`, label: '고객센터', icon: 'fa-solid fa-envelope' },
    ];
    const moreLinks = [
      { href: `${B}/pages/notice.html`, label: '공지사항', icon: 'fa-solid fa-bullhorn' },
      { href: `${B}/pages/faq.html`, label: '자주 묻는 질문', icon: 'fa-solid fa-circle-question' },
    ];

    const utilRight = `<a href="${B}/pages/feasibility.html">사업성 검토</a>`;

    return `
    <div class="header-wrap" id="headerWrap">
    <div class="util-bar"><div class="inner">
      <span class="util-left">(주)빛세움 · 도시정비 전문 엔지니어링그룹</span>
      ${utilRight}
      <a href="${B}/pages/gallery.html">갤러리</a>
      <div class="util-item-drop">
        <a href="${B}/pages/notice.html">공지사항</a>
        <div class="util-drop-menu">
          <a href="${B}/pages/notice.html">전체</a>
          <a href="${B}/pages/notice.html?cat=수주">수주</a>
          <a href="${B}/pages/notice.html?cat=외부">외부</a>
          <a href="${B}/pages/notice.html?cat=내부">내부</a>
          <a href="${B}/pages/notice.html?cat=기타">기타</a>
        </div>
      </div>
    </div></div>
    <header class="header"><div class="inner">
      <a href="${B}/index.html" class="logo">
        <span class="logo-mark"><img src="${B}/jpg/visseum_logo2.png" alt="(주)빛세움 VISSEUM" style="width:100%;height:100%;object-fit:contain"></span>
      </a>
      <nav class="gnb">
        ${links.map(l => `<a href="${l.href}"${l.target?' target="'+l.target+'"':''}${navActive(l.href)?' class="active"':''}>${l.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="검색" id="openSearch"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
      <button class="menu-toggle" aria-label="메뉴" id="openDrawer"><i class="fa-solid fa-bars"></i></button>
    </div></header>
    <nav class="mobile-tab-bar" id="mobileTabBar">
      <div class="tab-scroll" id="tabScroll">
        ${links.map(l => `<a href="${l.href}"${l.target?' target="'+l.target+'"':''} class="tab-item${navActive(l.href) ? ' active' : ''}">${l.label}</a>`).join('')}
      </div>
    </nav>
    </div>

    <div class="drawer-overlay" id="drawerOverlay"></div>
    <aside class="drawer" id="drawer">
      <div class="drawer-header">
        <span class="logo">
          <span class="logo-mark"><img src="${B}/jpg/visseum_logo.jpg" alt="빛세움 로고" style="width:100%;height:100%;object-fit:contain"></span>
          <span class="logo-text">
            <span class="logo-company">(주)빛세움</span>
            <span class="logo-sub">VISSEUM</span>
          </span>
        </span>
        <button class="drawer-close" id="drawerClose"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav class="drawer-nav" id="drawerNav">
        ${[
          { href:`${B}/pages/about.html`, label:'회사소개', icon:'fa-solid fa-building-columns', sub:[
            { href:`${B}/pages/about.html#ceo`, label:'CEO 인사말' },
            { href:`${B}/pages/about.html#history`, label:'회사연혁' },
            { href:`${B}/pages/about.html#organization`, label:'조직도' },
            { href:`${B}/pages/about.html#ci`, label:'CI 소개' },
          ]},
          { href:`${B}/pages/vision.html`, label:'빛세움의 길', icon:'fa-solid fa-road', sub:[
            { href:`${B}/pages/vision.html#philosophy`, label:'빛세움 철학' },
            { href:`${B}/pages/vision.html#principles`, label:'우리가 지키는 원칙' },
            { href:`${B}/pages/vision.html#method`, label:'빛세움의 방식' },
            { href:`${B}/pages/vision.html#visual`, label:'공간으로 증명하는 신뢰' },
          ]},
          { href:`${B}/pages/services.html`, label:'사업분야', icon:'fa-solid fa-diagram-project', sub:[
            { href:`${B}/pages/services.html`, label:'사업분야 전체' },
            { href:`${B}/pages/redevelopment-service.html`, label:'주택재개발 정비사업' },
            { href:`${B}/pages/reconstruction-service.html`, label:'주택재건축 정비사업' },
            { href:`${B}/pages/small-reconstruction-service.html`, label:'소규모 정비사업' },
          ]},
          { href:`${B}/pages/portfolio.html`, label:'업무실적', icon:'fa-solid fa-briefcase', sub:[
            { href:`${B}/pages/portfolio.html`, label:'수행실적 전체' },
            { href:`${B}/pages/portfolio.html?type=재개발`, label:'재개발 실적' },
            { href:`${B}/pages/portfolio.html?type=재건축`, label:'재건축 실적' },
            { href:`${B}/pages/portfolio.html?type=소규모정비`, label:'소규모정비 실적' },
          ]},
          { href:`${B}/pages/library.html`, label:'자료실', icon:'fa-solid fa-folder-open', sub:[
            { href:`${B}/pages/library.html?cat=주요뉴스`, label:'주요뉴스' },
            { href:`${B}/pages/library.html?cat=법령`, label:'관계법령' },
            { href:`${B}/pages/library.html?cat=서식가이드`, label:'서식·매뉴얼' },
            { href:`${B}/pages/gallery.html`, label:'갤러리' },
          ]},
          { href:`${B}/pages/contact.html`, label:'고객센터', icon:'fa-solid fa-envelope', sub:[
            { href:`${B}/pages/contact.html`, label:'문의하기' },
            { href:`${B}/pages/consultation.html`, label:'무료 상담 신청' },
            { href:`${B}/pages/notice.html`, label:'공지사항' },
            { href:`${B}/pages/faq.html`, label:'자주 묻는 질문' },
          ]},
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
          <div class="logo footer-logo-text-only">
            <span class="logo-text">
              <span class="logo-company">(주)빛세움</span>
              <span class="logo-sub">VISSEUM</span>
            </span>
          </div>
          <p>재개발·재건축·소규모정비사업<br>도시정비 종합 엔지니어링 전문그룹</p>
          <div class="footer-bottom-left" style="margin-top:23px;margin-bottom:0">
            <a href="${B}/pages/privacy.html" class="footer-privacy-link">개인정보 처리방침</a>
            <div class="footer-copy">&copy; 2026 (주)빛세움. All rights reserved.</div>
          </div>
        </div>
        <div class="footer-col">
          <h5>회사</h5>
          <a href="${B}/pages/about.html">회사소개</a>
          <a href="${B}/pages/vision.html">빛세움의 길</a>
          <a href="${B}/pages/services.html">사업분야</a>
          <a href="${B}/pages/portfolio.html">업무실적</a>
        </div>
        <div class="footer-col">
          <h5>자료·서비스</h5>
          <a href="${B}/pages/library.html?cat=주요뉴스">주요뉴스</a>
          <a href="${B}/pages/library.html">자료실</a>
          <a href="${B}/pages/feasibility.html">사업성 검토</a>
        </div>
        <div class="footer-col">
          <h5>문의·지원</h5>
          <a href="${B}/pages/contact.html">고객센터</a>
          <a href="${B}/pages/feasibility-check.html">사업타당성 분석</a>
          <a href="${B}/pages/faq.html">자주 묻는 질문</a>
        </div>
        <div class="footer-col footer-contact">
          <h5>고객센터</h5>
          <a href="tel:024787114" class="footer-phone" aria-label="빛세움 대표전화 02-478-7114로 전화하기">02-478-7114</a>
          <a href="mailto:visseum@visseum.co.kr" class="email-link"><i class="fa-solid fa-envelope" style="font-size:11px"></i> visseum@visseum.co.kr</a>
          <p>FAX 02-478-6114<br><span class="footer-address-link" id="footerAddressLink">서울특별시 강동구 성내로6길 50, 피스센터 5층</span></p>
        </div>
      </div>
    </div></footer>
    <div class="location-modal-overlay" id="locationModalOverlay">
      <div class="location-modal">
        <button class="location-modal-close" id="locationModalClose" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>
        <img src="${B}/jpg/visseum_location_map.png" alt="(주)빛세움 오시는 길 약도 — 서울특별시 강동구 성내로6길 50 피스센터 5층">
      </div>
    </div>
    <button class="scroll-top" id="scrollTop" aria-label="맨 위로"><i class="fa-solid fa-chevron-up"></i></button>
    <div class="toast-container" id="toastContainer"></div>
    <nav class="mobile-bottom-nav" id="mobileBottomNav">
      <div class="mobile-bottom-nav-inner">
        <a href="${B}/index.html" class="${navActive('index.html')?'active':''}">
          <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 14 15 14 15 21"/></svg>
          <span>홈</span>
        </a>
        <a href="${B}/pages/services.html#business" class="${navActive('services.html')?'active':''}">
          <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
          <span>그룹사</span>
        </a>
        <a href="${B}/pages/feasibility.html" class="${navActive('feasibility.html')?'active':''}">
          <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>사업성분석</span>
        </a>
        <a href="${B}/pages/gallery.html" class="${navActive('gallery.html')?'active':''}">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span>갤러리</span>
        </a>
        <a href="${B}/pages/contact.html" class="${navActive('contact.html')?'active':''}">
          <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
          <span>사업문의</span>
        </a>
      </div>
    </nav>`;
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

    /* ── 모바일: 가로 스크롤 강제 리셋 + 탭바 회사소개부터 표시 ── */
    if (window.innerWidth <= 1024) {
      window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }
    var tabScroll = document.getElementById('tabScroll');
    if (tabScroll && window.innerWidth <= 1024) {
      setTimeout(function() { tabScroll.scrollLeft = 0; }, 50);
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

    // Location modal (footer address)
    const locationModalOverlay = document.getElementById('locationModalOverlay');
    const footerAddressLink = document.getElementById('footerAddressLink');
    const locationModalClose = document.getElementById('locationModalClose');
    if (footerAddressLink) footerAddressLink.addEventListener('click', () => {
      locationModalOverlay.classList.add('open');
      lockScroll();
    });
    if (locationModalClose) locationModalClose.addEventListener('click', () => {
      locationModalOverlay.classList.remove('open');
      unlockScroll();
    });
    if (locationModalOverlay) locationModalOverlay.addEventListener('click', e => {
      if (e.target === locationModalOverlay) {
        locationModalOverlay.classList.remove('open');
        unlockScroll();
      }
    });

    // ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        if (searchOverlay) { searchOverlay.classList.remove('open'); unlockScroll(); }
        if (locationModalOverlay) { locationModalOverlay.classList.remove('open'); unlockScroll(); }
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

    /* ── 모바일 페이지 스와이프 네비게이션 ── */
    (function initPageSwipe() {
      if (!('ontouchstart' in window)) return;
      var gnbLinks = document.querySelectorAll('.gnb > a');
      if (!gnbLinks.length) return;
      var menuList = [];
      gnbLinks.forEach(function(a) {
        if (a.getAttribute('target') === '_blank') return;
        var h = a.getAttribute('href');
        if (!h || h.indexOf('intranet') !== -1) return;
        menuList.push(h);
      });
      if (menuList.length < 2) return;

      /* 현재 페이지 위치 판별 */
      var curPath = location.pathname;
      var isMain = (curPath === '/' || curPath.endsWith('/index.html') || curPath.endsWith('/redevelopment/'));
      var curIdx = -99;

      if (isMain) {
        curIdx = -1; /* 메인 = 회사소개(0) 직전 */
      } else {
        for (var mi = 0; mi < menuList.length; mi++) {
          var mp = menuList[mi];
          try { mp = new URL(mp, location.href).pathname; } catch(e) {}
          if (curPath === mp || curPath.endsWith(mp.replace('..', ''))) { curIdx = mi; break; }
        }
        if (curIdx === -99) {
          for (var mi2 = 0; mi2 < menuList.length; mi2++) {
            var fn = menuList[mi2].split('/').pop();
            if (fn && curPath.indexOf(fn) !== -1) { curIdx = mi2; break; }
          }
        }
        if (curIdx === -99) return;
      }

      var lastIdx = menuList.length - 1; /* 고객센터 */
      var ps = { x0: 0, y0: 0, active: false };
      var skipSel = 'input,textarea,select,button,a,iframe,.leaflet-container,.swiper-container,.swiper,.slider,.carousel,.process-bar,.tab-scroll';

      document.addEventListener('touchstart', function(e) {
        if (window.innerWidth > 1024) return;
        if (e.target.closest && e.target.closest(skipSel)) { ps.active = false; return; }
        if (drawer && drawer.classList.contains('open')) { ps.active = false; return; }
        var t = e.touches[0];
        if (t.clientX < 30 || t.clientX > window.innerWidth - 30) { ps.active = false; return; }
        ps.x0 = t.clientX; ps.y0 = t.clientY; ps.active = true;
      }, { passive: true });

      document.addEventListener('touchend', function(e) {
        if (!ps.active) return;
        ps.active = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - ps.x0;
        var dy = t.clientY - ps.y0;
        if (Math.abs(dx) < 60) return;
        if (Math.abs(dy) >= Math.abs(dx)) return;

        var newIdx;
        if (dx < 0) {
          /* 우→좌: 다음 메뉴 (메인→회사소개, 회사소개→빛세움의길, ...→고객센터) */
          newIdx = curIdx + 1;
        } else {
          /* 좌→우: 이전 메뉴 (빛세움의길→회사소개, ...) 메인에서는 이동 없음 */
          if (isMain) return;
          newIdx = curIdx - 1;
        }
        if (newIdx < 0 || newIdx > lastIdx) return;
        location.href = menuList[newIdx];
      }, { passive: true });
    })();
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
    document.title = title + ' — 빛세움';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = desc || '(주)빛세움 — 재개발·재건축·도시정비 전문 엔지니어링';
  }

  /* ── Hero Card Detail Modal (Premium) ── */
  const HD={
    '정비사업전문관리':{s:'Total Project Management',i:'fa-solid fa-shield-halved',k:[['수행실적','710건+'],['사업기간 단축','2.3년'],['만족도','98.5%']],d:'빛세움은 정비사업의 기획부터 준공·입주·조합 해산까지, 사업 전 생애주기를 단일 책임 체계로 관리하는 Total Project Management 역량을 보유하고 있습니다.',p:['기본계획 → 조합설립 → 사업시행 → 관리처분 → 시공 → 준공 전 단계 직접 수행','법률·행정·재무·기술 전문 인력의 통합 프로젝트팀 운영','행정 절차 지연 리스크를 선제적으로 차단하는 예방적 관리 체계','조합원 이익 극대화를 위한 맞춤형 전략 수립 및 실행']},
    '사업성 분석':{s:'Feasibility Analysis',i:'fa-solid fa-chart-line',k:[['분석 정확도','97.2%'],['수지분석 모델','자체 개발'],['비례율 개선','+8.5%p']],d:'정비사업의 성패는 초기 사업성 분석의 정밀도에서 결정됩니다. 빛세움은 독자 개발한 수지분석 모델을 통해 사업 타당성을 입체적으로 검증합니다.',p:['토지·건물 감정평가 교차 검증 및 비례율 최적화 시뮬레이션','공사비·용역비·금융비용 정밀 추정과 분양수입 시나리오 분석','조합원별 분담금 예측 — Best/Base/Worst Case 민감도 분석','투자 수익률(IRR), 손익분기점(BEP) 등 재무 지표 기반 의사결정 지원']},
    '인허가 대응':{s:'Permit & Approval Strategy',i:'fa-solid fa-file-signature',k:[['인가 승인률','99.1%'],['소요기간 단축','-40%'],['행정소송 방어','100%']],d:'정비사업 인허가는 단순한 서류 제출이 아닌 전략적 행정 협상입니다. 빛세움은 인가 요건을 선제적으로 충족시키는 전략적 접근으로, 업계 최고 수준의 인가 승인률을 달성하고 있습니다.',p:['정비구역 지정 → 조합설립 → 사업시행 → 관리처분 단계별 인가 전략 수립','행정기관 사전 협의 및 심의위원회 대응 전문 역량','인가 조건 미충족 리스크 사전 진단 및 보완 로드맵 제시','행정소송·집행정지 등 법적 리스크에 대한 선제적 방어 체계']},
    'CM / PM 관리':{s:'Construction & Project Management',i:'fa-solid fa-diagram-project',k:[['품질관리 항목','380개+'],['공사비 절감','평균 5.2%'],['공정 준수율','99.4%']],d:'빛세움의 CM/PM은 발주자(조합)의 입장에서 설계·시공·준공 전 과정의 품질(Q)·공정(T)·원가(C)를 통합 관리하는 전문 사업관리 서비스입니다.',p:['시공사 선정 평가 자문 — 정량·정성 종합 평가 모델 적용','설계 VE(가치공학) 검토를 통한 품질 향상 및 원가 절감','실시간 공정 모니터링 및 지연 리스크 조기 경보 시스템','준공 전 사전 하자 점검 및 입주 후 A/S 체계 구축 지원']},
    '절차의 정합성':{s:'Legal Compliance & Integrity',i:'fa-solid fa-scale-balanced',k:[['법령 검토 DB','2,400건+'],['법적 하자','0건'],['법률 자문','상시 연계']],d:'정비사업은 도시정비법, 주택법, 건축법 등 수십 개 법령이 교차하는 대한민국에서 가장 복잡한 행정 절차 중 하나입니다. 빛세움은 법적 정합성을 사업 안정성의 최우선 기준으로 삼습니다.',p:['모든 의사결정에 법적 근거를 명시하는 Evidence-Based 절차 수행','자체 법령 데이터베이스를 통한 실시간 법률 변경 사항 반영','대형 법무법인과의 상시 자문 체계를 통한 법률 리스크 원천 차단','총회 의결, 계약 체결 등 핵심 절차의 적법성 사전·사후 검증']},
    '이해관계 조율':{s:'Stakeholder Coordination',i:'fa-solid fa-handshake',k:[['동의율 확보','100%'],['분쟁 조정','150건+'],['총회 운영','450회+']],d:'정비사업에는 조합원, 시공사, 설계사, 감정평가사, 행정기관 등 수십 개의 이해관계자가 참여합니다. 빛세움은 각 주체의 이해관계를 데이터 기반으로 객관 분석하고, 최적의 합의점을 도출합니다.',p:['조합원·시공사·행정기관 간 3자 균형 자문 모델 운영','총회 안건 설계, 의결 구조 최적화, 위임장 관리 시스템','갈등 사안에 대한 중립적 조정안 제시 및 합의 도출','소수 반대 의견에 대한 법적·제도적 대응 방안 수립']},
    '단계별 추진':{s:'Phase-by-Phase Execution',i:'fa-solid fa-route',k:[['관리 단계','12단계'],['마일스톤','실시간 관리'],['지연 방지율','96%']],d:'빛세움은 정비사업의 전 과정을 12단계 로드맵으로 체계화하여, 각 단계의 핵심 과업·소요 기간·인가 요건을 명확히 관리합니다.',p:['기본계획 → 정비구역 → 추진위 → 조합설립 → 사업시행 → 관리처분 → 착공 → 분양 → 이주 → 철거 → 시공 → 준공','각 단계별 Gate Review — 진입 조건·완료 기준·리스크 체크리스트','실시간 공정 대시보드로 진행 현황 투명 공유','단계 간 병렬 추진 가능 구간 식별을 통한 사업기간 단축']},
    '책임지는 완결':{s:'End-to-End Accountability',i:'fa-solid fa-shield-halved',k:[['사업 완결률','100%'],['중도 이탈','0건'],['정산 완료','전 사업']],d:'빛세움은 사업을 시작하면 반드시 끝을 봅니다. 준공·입주 이후 조합 해산, 잔여 자산 처분, 최종 정산까지 — 사업의 완전한 종결을 책임지는 것이 빛세움의 약속입니다.',p:['준공 후 하자 점검 및 시공사 A/S 이행 감독','잔여 자산(상가·부대시설) 처분 전략 수립 및 실행','조합 회계 최종 정산 및 조합원별 정산금 배분 자문','조합 해산 총회 운영 및 법인 말소 등기까지 완결']},
    '인허가 자문':{s:'Permit Advisory Service',i:'fa-solid fa-stamp',k:[['심의 대응','320건+'],['심의 통과','평균 1.2회'],['기간 단축','평균 4개월']],d:'빛세움의 인허가 자문은 단순한 서류 대행이 아닌, 인가 전략의 설계부터 심의 대응, 조건 이행까지를 아우르는 종합 인허가 솔루션입니다.',p:['정비계획 변경, 건축심의, 환경·교통 영향평가 통합 대응','심의위원회 예상 질의 분석 및 선제적 답변 자료 준비','인가 조건부 승인 시 조건 이행 로드맵 즉시 수립','인가 취소·변경 리스크에 대한 법률적 방어 체계 구축']},
  };
  function heroDetail(t){
    var d=HD[t];if(!d)return;
    var ov=document.createElement('div');ov.className='modal-overlay open';ov.style.zIndex='99999';
    ov.innerHTML='<div style="background:#fff;border-radius:16px;width:92%;max-width:440px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.35);">'+
      '<div style="background:linear-gradient(135deg,#0A0F1C,#142644);padding:14px 20px 12px;position:relative;overflow:hidden;">'+
        '<div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(184,134,11,0.06);"></div>'+
        '<div style="position:absolute;bottom:-30px;right:40px;width:80px;height:80px;border-radius:50%;background:rgba(184,134,11,0.04);"></div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
          '<div style="width:34px;height:34px;border-radius:10px;background:rgba(184,134,11,0.12);border:1px solid rgba(184,134,11,0.2);display:flex;align-items:center;justify-content:center;"><i class="'+d.i+'" style="font-size:15px;color:#B8860B;"></i></div>'+
        '</div>'+
        '<h3 style="font-size:17px;font-weight:900;color:#fff;margin-bottom:2px;letter-spacing:-0.5px;">'+t+'</h3>'+
        '<p style="font-size:10px;font-weight:600;color:rgba(184,134,11,0.7);letter-spacing:1.5px;text-transform:uppercase;">'+d.s+'</p>'+
        '<div style="display:flex;gap:6px;margin-top:10px;">'+d.k.map(function(s){return'<div style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px 4px;text-align:center;"><div style="font-size:12px;font-weight:800;color:#B8860B;">'+s[1]+'</div><div style="font-size:8px;color:rgba(255,255,255,0.4);margin-top:1px;">'+s[0]+'</div></div>'}).join('')+'</div>'+
      '</div>'+
      '<div style="padding:20px 24px;overflow-y:auto;flex:1;">'+
        '<p style="font-size:13.5px;line-height:1.8;color:#444;margin-bottom:16px;">'+d.d+'</p>'+
        '<div style="background:#F8F8FA;border-radius:10px;padding:16px;">'+
          '<div style="font-size:10px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Core Competencies</div>'+
          d.p.map(function(x){return'<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;"><div style="width:5px;height:5px;border-radius:50%;background:#B8860B;flex-shrink:0;margin-top:6px;"></div><p style="font-size:12.5px;line-height:1.6;color:#555;margin:0;">'+x+'</p></div>'}).join('')+
        '</div>'+
      '</div>'+
      '<div style="padding:12px 24px 16px;border-top:1px solid #f0f0f0;">'+
        '<button data-action="close" style="width:100%;padding:12px;background:linear-gradient(135deg,#0A0F1C,#142644);color:#B8860B;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">닫기</button>'+
      '</div></div>';
    document.body.appendChild(ov);
    function closeModal(){ov.remove();var h=document.querySelector('.hero-cards-float,.uh-cards');if(h)h.scrollIntoView({behavior:'smooth',block:'center'})}
    ov.querySelectorAll('[data-action="close"]').forEach(function(b){b.addEventListener('click',closeModal)});
    ov.addEventListener('click',function(e){if(e.target===ov)closeModal()});
  }

  return { init, toast, renderPagination, confirm, getParam, comma, timeAgo, stageColor, headTags, heroDetail, basePath: () => B };
})();

/**
 * 주요뉴스 상세 모달 — 업무실적 상세 모달(.d-overlay/.d-modal/.d-hero-fb/.d-body/.d-sec 등)과
 * 동일한 DOM/CSS를 재사용해 downloads/news_*.html 문서를 팝업으로 표시한다.
 */
const NewsDetailModal = (() => {
  let ov = null, heroEl = null, bodyEl = null;

  function ensure() {
    if (ov) return;
    ov = document.createElement('div');
    ov.className = 'd-overlay';
    ov.innerHTML =
      '<div class="d-modal">' +
        '<div class="nd-hero"></div>' +
        '<button class="d-close" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="d-body nd-body"></div>' +
        '<div class="d-footer"><button type="button"><i class="fa-solid fa-xmark"></i> 닫기</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    heroEl = ov.querySelector('.nd-hero');
    bodyEl = ov.querySelector('.nd-body');
    ov.querySelectorAll('.d-close, .d-footer button').forEach(b => b.addEventListener('click', close));
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
  }

  function close() {
    if (!ov) return;
    ov.classList.remove('open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function open(url, meta) {
    ensure();
    meta = meta || {};
    heroEl.innerHTML =
      '<div class="d-hero-fb" data-t="news"><div class="d-title-area">' +
        '<div class="badges"><span class="d-newsbadge">' + esc(meta.category || '주요뉴스') + '</span></div>' +
        '<h2>' + esc(meta.title || '') + '</h2>' +
      '</div></div>';
    bodyEl.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin" style="font-size:22px"></i></div>';
    ov.scrollTop = 0;
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';

    fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.text(); })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const article = doc.querySelector('.dv-article');
        if (!article) throw new Error('no article');

        const badge = article.querySelector('.dv-category-badge');
        const title = article.querySelector('.dv-title');
        const source = article.querySelector('.dv-source');
        const date = article.querySelector('.dv-date');
        const phase = [source ? source.textContent : '', date ? date.textContent : ''].filter(Boolean).join(' · ');

        heroEl.innerHTML =
          '<div class="d-hero-fb" data-t="news"><div class="d-title-area">' +
            '<div class="badges"><span class="d-newsbadge">' + esc(badge ? badge.textContent : (meta.category || '주요뉴스')) + '</span></div>' +
            '<h2>' + (title ? title.innerHTML : esc(meta.title || '')) + '</h2>' +
            (phase ? '<div class="d-phase"><i class="fa-solid fa-newspaper"></i> ' + esc(phase) + '</div>' : '') +
          '</div></div>';

        const sections = article.querySelectorAll('.dv-section');
        let html2 = '';
        sections.forEach(sec => {
          const h2 = sec.querySelector('h2');
          const secTitle = h2 ? h2.textContent : '';
          const clone = sec.cloneNode(true);
          const h2c = clone.querySelector('h2');
          if (h2c) clone.removeChild(h2c);
          html2 += '<div class="d-sec"><div class="d-sec-title">' + esc(secTitle) + '</div><div class="d-desc">' + clone.innerHTML + '</div></div>';
        });
        bodyEl.innerHTML = html2 || '<div class="d-desc">내용을 불러올 수 없습니다.</div>';
        ov.scrollTop = 0;
      })
      .catch(() => { location.href = url; });
  }

  return { open, close };
})();
window.NewsDetailModal = NewsDetailModal;

/**
 * 공지사항 상세 모달 — 업무실적/주요뉴스 상세 모달과 동일한 DOM/CSS를 재사용한다.
 * 공지 데이터는 MOCK.notices에 이미 로드돼 있으므로 fetch 없이 즉시 렌더링한다.
 */
const NoticeDetailModal = (() => {
  let ov = null, heroEl = null, bodyEl = null;

  function ensure() {
    if (ov) return;
    ov = document.createElement('div');
    ov.className = 'd-overlay';
    ov.innerHTML =
      '<div class="d-modal">' +
        '<div class="nd-hero"></div>' +
        '<button class="d-close" aria-label="닫기"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="d-body nd-body"></div>' +
        '<div class="d-footer"><button type="button"><i class="fa-solid fa-xmark"></i> 닫기</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    heroEl = ov.querySelector('.nd-hero');
    bodyEl = ov.querySelector('.nd-body');
    ov.querySelectorAll('.d-close, .d-footer button').forEach(b => b.addEventListener('click', close));
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
  }

  function close() {
    if (!ov) return;
    ov.classList.remove('open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function open(notice) {
    ensure();
    const important = notice.important ? '<span class="badge badge-important" style="margin-left:6px">중요</span>' : '';
    heroEl.innerHTML =
      '<div class="d-hero-fb" data-t="news"><div class="d-title-area">' +
        '<div class="badges"><span class="d-newsbadge">' + esc(notice.category || '공지사항') + '</span>' + important + '</div>' +
        '<h2>' + esc(notice.title || '') + '</h2>' +
        '<div class="d-phase"><i class="fa-solid fa-calendar"></i> ' + esc(notice.date || '') + '</div>' +
      '</div></div>';
    bodyEl.innerHTML = '<div class="d-sec"><div class="notice-detail-content">' + (notice.content || '') + '</div></div>';
    ov.scrollTop = 0;
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';
  }

  return { open, close };
})();
window.NoticeDetailModal = NoticeDetailModal;

/* DOM Ready */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (!location.pathname.includes('/admin/') && !location.pathname.includes('/intranet/')) {
    /* 텍스트 복사 금지 + 이미지 다운로드 금지 — 임시 해제 (2026-04-19) */
    // document.addEventListener('copy', e => e.preventDefault());
    // document.addEventListener('selectstart', e => { if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); });
    // document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
    // document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
    document.querySelectorAll('img').forEach(i => { i.setAttribute('draggable', 'false'); i.style.pointerEvents = 'none'; });
    new MutationObserver(muts => { muts.forEach(m => m.addedNodes.forEach(n => { if (n.querySelectorAll) n.querySelectorAll('img').forEach(i => { i.setAttribute('draggable', 'false'); i.style.pointerEvents = 'none'; }); })); }).observe(document.body, { childList: true, subtree: true });
  }
});
