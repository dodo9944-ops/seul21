/**
 * 세울 인트라넷 — 공통 JS
 * 인증, 권한, 사이드바, 유틸리티
 */
const Intra = (() => {

  /* ── 샘플 계정 ── */
  const ACCOUNTS = [
    { id:'dodo6656', pw:'813700hb', name:'이창우', role:'admin', dept:'대표이사' },
  ];

  /* ── 권한 레벨 ── */
  const ROLES = { admin:3, staff:2, viewer:1 };

  /* ── 인증 ── */
  function login(id, pw) {
    const u = ACCOUNTS.find(a => a.id === id && a.pw === pw);
    if (!u) return false;
    sessionStorage.setItem('intra_user', JSON.stringify({ id:u.id, name:u.name, role:u.role, dept:u.dept }));
    return true;
  }

  function logout() {
    sessionStorage.removeItem('intra_user');
    location.href = 'login.html';
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem('intra_user')); } catch(e) { return null; }
  }

  function isLoggedIn() { return !!getUser(); }

  function requireAuth(minRole) {
    /* 인증 전 콘텐츠 완전 차단 — HTML 소스 노출 방지 */
    if (!isLoggedIn()) {
      document.documentElement.innerHTML = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>인트라넷</title></head><body></body></html>';
      location.replace('login.html');
      return false;
    }
    if (minRole && ROLES[getUser().role] < ROLES[minRole]) {
      document.documentElement.innerHTML = '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#888"><div style="text-align:center"><h2 style="margin-bottom:8px;color:#1A1A1A">접근 권한이 없습니다</h2><p>관리자에게 문의하세요.</p><a href="index.html" style="color:#C3A569;margin-top:16px;display:inline-block">대시보드로 돌아가기</a></div></div></body></html>';
      return false;
    }
    /* 인증 성공 시에만 콘텐츠 표시 */
    document.body.style.visibility = 'visible';
    return true;
  }

  /* ── 메뉴 정의 ── */
  const MENUS = [
    { group:'메인', items:[
      { href:'index.html', icon:'fa-solid fa-gauge-high', label:'대시보드', role:'viewer' },
    ]},
    { group:'업무', items:[
      { href:'notice.html', icon:'fa-solid fa-bullhorn', label:'공지사항', role:'viewer', badge:0 },
      { href:'documents.html', icon:'fa-solid fa-folder-tree', label:'문서자료실', role:'viewer' },
      { href:'calendar.html', icon:'fa-solid fa-calendar-days', label:'일정관리', role:'viewer' },
      { href:'projects.html', icon:'fa-solid fa-briefcase', label:'사업장 관리', role:'staff' },
    ]},
    { group:'조직', items:[
      { href:'contacts.html', icon:'fa-solid fa-address-book', label:'내부연락처', role:'viewer' },
    ]},
    { group:'AI 관리', items:[
      { href:'ai-manager.html', icon:'fa-solid fa-robot', label:'미경이 관리', role:'admin' },
    ]},
    { group:'관리', items:[
      { href:'admin.html', icon:'fa-solid fa-gear', label:'설정', role:'admin' },
      { href:'../admin/login.html', icon:'fa-solid fa-shield-halved', label:'홈페이지 제어판', role:'admin' },
    ]},
  ];

  /* ── 사이드바 HTML ── */
  function sidebarHTML() {
    const user = getUser();
    const userRole = user ? ROLES[user.role] : 0;
    const cur = location.pathname.split('/').pop();

    let nav = '';
    MENUS.forEach(g => {
      const vis = g.items.filter(m => ROLES[m.role] <= userRole);
      if (!vis.length) return;
      nav += `<div class="nav-group"><div class="nav-group-label">${g.group}</div>`;
      vis.forEach(m => {
        const active = cur === m.href ? ' active' : '';
        const badge = m.badge ? `<span class="nav-badge">${m.badge}</span>` : '';
        nav += `<a href="${m.href}" class="nav-item${active}"><i class="${m.icon}"></i> ${m.label}${badge}</a>`;
      });
      nav += '</div>';
    });

    return `
    <aside class="sidebar" id="intraSidebar">
      <div class="sidebar-logo">
        <svg viewBox="0 0 120 120" fill="none" width="32" height="32"><rect x="8" y="8" width="104" height="104" rx="4" stroke="#C3A569" stroke-width="2" opacity="0.3"/><rect x="28" y="24" width="52" height="6" rx="1" fill="#C3A569"/><rect x="28" y="24" width="6" height="28" rx="1" fill="#C3A569"/><rect x="40" y="52" width="52" height="6" rx="1" fill="#C3A569" opacity="0.6"/><rect x="86" y="58" width="6" height="28" rx="1" fill="#C3A569"/><rect x="40" y="86" width="52" height="6" rx="1" fill="#C3A569"/></svg>
        <div class="sidebar-logo-text">
          <div class="sidebar-logo-company">(주)세울엔지니어링</div>
          <div class="sidebar-logo-sub">INTRANET</div>
        </div>
      </div>
      <div class="sidebar-badge">INTERNAL USE ONLY</div>
      <nav class="sidebar-nav">${nav}</nav>
      <div class="sidebar-footer">
        <div class="avatar"><i class="fa-solid fa-user"></i></div>
        <div class="user-info">
          <div class="user-name">${user ? user.name : ''}</div>
          <div class="user-role">${user ? user.dept : ''}</div>
        </div>
        <button class="logout-btn" id="intraLogout" title="로그아웃"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    </aside>`;
  }

  /* ── 탑바 HTML ── */
  function topbarHTML(title) {
    const d = new Date();
    const days = ['일','월','화','수','목','금','토'];
    const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`;
    return `
    <header class="topbar">
      <button class="mobile-menu-btn" id="mobileMenuBtn"><i class="fa-solid fa-bars"></i></button>
      <div class="topbar-title">${title || '대시보드'}</div>
      <div class="topbar-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="검색...">
      </div>
      <div class="topbar-actions">
        <span class="topbar-date">${dateStr}</span>
        <button class="topbar-icon"><i class="fa-solid fa-bell"></i><span class="dot"></span></button>
        <a href="../index.html" class="topbar-icon" title="홈페이지"><i class="fa-solid fa-globe"></i></a>
      </div>
    </header>`;
  }

  /* ── 초기화 ── */
  function init(pageTitle, minRole) {
    if (!requireAuth(minRole)) return false;

    const sidebarEl = document.getElementById('intra-sidebar');
    const topbarEl = document.getElementById('intra-topbar');
    if (sidebarEl) sidebarEl.innerHTML = sidebarHTML();
    if (topbarEl) topbarEl.innerHTML = topbarHTML(pageTitle);

    // 로그아웃
    const logBtn = document.getElementById('intraLogout');
    if (logBtn) logBtn.addEventListener('click', logout);

    // 모바일 메뉴
    const mBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('intraSidebar');
    if (mBtn && sidebar) {
      mBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
      document.addEventListener('click', e => {
        if (!sidebar.contains(e.target) && !mBtn.contains(e.target)) sidebar.classList.remove('mobile-open');
      });
    }

    return true;
  }

  /* ── 유틸리티 ── */
  function formatDate(d) {
    if (!d) d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  return { login, logout, getUser, isLoggedIn, requireAuth, init, formatDate, ROLES };
})();
