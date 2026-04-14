/**
 * 세울 — Data Service Layer
 * localStorage + mock-data 기반. 향후 실 API 전환 시 이 파일만 교체.
 */
const DataService = (() => {
  const LS_PREFIX = 'rdc_';

  /* ── helpers ── */
  function _key(name) { return LS_PREFIX + name; }

  function _load(name) {
    const raw = localStorage.getItem(_key(name));
    if (raw) return JSON.parse(raw);
    if (typeof MOCK !== 'undefined' && MOCK[name]) {
      _save(name, MOCK[name]);
      return JSON.parse(JSON.stringify(MOCK[name]));
    }
    return null;
  }

  function _save(name, data) {
    localStorage.setItem(_key(name), JSON.stringify(data));
  }

  function _genId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ── generic CRUD ── */
  function getAll(collection) { return _load(collection) || []; }

  function getById(collection, id) {
    return (getAll(collection)).find(item => item.id === id) || null;
  }

  function create(collection, item) {
    const list = getAll(collection);
    if (!item.id) item.id = _genId(collection[0]);
    if (!item.createdAt) item.createdAt = new Date().toISOString().slice(0, 10);
    list.unshift(item);
    _save(collection, list);
    return item;
  }

  function update(collection, id, changes) {
    const list = getAll(collection);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return null;
    Object.assign(list[idx], changes);
    _save(collection, list);
    return list[idx];
  }

  function remove(collection, id) {
    let list = getAll(collection);
    list = list.filter(item => item.id !== id);
    _save(collection, list);
  }

  /* ── query helpers ── */
  function query(collection, { filter, sort, page, pageSize, search, searchFields } = {}) {
    let list = getAll(collection);

    // search
    if (search && searchFields) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        searchFields.some(f => (item[f] || '').toString().toLowerCase().includes(q))
      );
    }

    // filter
    if (filter) {
      Object.entries(filter).forEach(([key, val]) => {
        if (val === '' || val === null || val === undefined || val === '전체') return;
        list = list.filter(item => {
          if (Array.isArray(val)) return val.includes(item[key]);
          return item[key] == val;
        });
      });
    }

    const total = list.length;

    // sort
    if (sort) {
      const [field, dir] = sort.split(':');
      list.sort((a, b) => {
        let va = a[field], vb = b[field];
        if (typeof va === 'number' && typeof vb === 'number') return dir === 'desc' ? vb - va : va - vb;
        va = (va || '').toString(); vb = (vb || '').toString();
        return dir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
      });
    }

    // pagination
    const ps = pageSize || 10;
    const pg = page || 1;
    const totalPages = Math.ceil(total / ps);
    const paged = list.slice((pg - 1) * ps, pg * ps);

    return { data: paged, total, page: pg, pageSize: ps, totalPages };
  }

  /* ── settings (single object) ── */
  function getSettings() { return _load('settings') || {}; }
  function updateSettings(changes) {
    const s = getSettings();
    Object.assign(s, changes);
    _save('settings', s);
    return s;
  }

  /* ── favorites ── */
  function getFavorites(type) {
    return JSON.parse(localStorage.getItem(_key('fav_' + type)) || '[]');
  }
  function toggleFavorite(type, id) {
    let favs = getFavorites(type);
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    localStorage.setItem(_key('fav_' + type), JSON.stringify(favs));
    return favs;
  }
  function isFavorite(type, id) {
    return getFavorites(type).includes(id);
  }

  /* ── auth (simple mock) ── */

  /* 로그인 상태유지: localStorage에도 저장하여 브라우저 재시작 후에도 유지 */
  function _getAuth(key) {
    var s = sessionStorage.getItem(key);
    if (s) return s;
    var l = localStorage.getItem(key);
    if (l) { sessionStorage.setItem(key, l); return l; }
    return null;
  }
  function _setAuth(key, data, remember) {
    var json = JSON.stringify(data);
    sessionStorage.setItem(key, json);
    if (remember) localStorage.setItem(key, json);
  }
  function _clearAuth(key) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }

  function adminLogin(username, password, remember) {
    const acc = (MOCK && MOCK.adminAccount) || _load('adminAccount');
    if (acc && acc.username === username && acc.password === password) {
      _setAuth('rdc_admin', { loggedIn: true, name: acc.name }, remember);
      return true;
    }
    return false;
  }
  function isAdminLoggedIn() {
    const s = _getAuth('rdc_admin');
    if (!s) return false;
    try { return JSON.parse(s).loggedIn; } catch(e) { return false; }
  }
  function getAdminName() {
    const s = _getAuth('rdc_admin');
    if (!s) return '';
    try { return JSON.parse(s).name || ''; } catch(e) { return ''; }
  }
  function adminLogout() { _clearAuth('rdc_admin'); }

  function userLogin(email, password, remember) {
    const members = getAll('members');
    const user = members.find(m => m.email === email);
    if (user) {
      var data = { loggedIn: true, id: user.id, name: user.name, email: user.email, grade: user.grade || '일반' };
      _setAuth('seul_user', data, remember);
      return user;
    }
    return null;
  }
  function setUserSession(userData, remember) {
    _setAuth('seul_user', userData, remember);
  }
  function isUserLoggedIn() {
    const s = _getAuth('seul_user');
    if (!s) return false;
    try { return !!JSON.parse(s).name; } catch(e) { return false; }
  }
  function getCurrentUser() {
    const s = _getAuth('seul_user');
    if (!s) return null;
    try {
      const u = JSON.parse(s);
      return { loggedIn: true, id: u.id, name: u.name, email: u.email || '', grade: u.grade || '일반' };
    } catch(e) { return null; }
  }
  function userLogout() { _clearAuth('seul_user'); }

  /* ── reset ── */
  function resetAll() {
    Object.keys(localStorage).forEach(k => { if (k.startsWith(LS_PREFIX)) localStorage.removeItem(k); });
    localStorage.removeItem('seul_user');
    sessionStorage.clear();
  }

  /* ── stats for admin dashboard ── */
  function getDashboardStats() {
    return {
      totalAreas: getAll('areas').length,
      totalListings: getAll('listings').length,
      totalMembers: getAll('members').length,
      totalInquiries: getAll('inquiries').length,
      pendingInquiries: getAll('inquiries').filter(q => q.status === '접수').length,
      totalNews: getAll('news').length,
      totalPosts: getAll('community').length,
      totalColumns: getAll('columns').length
    };
  }

  return {
    getAll, getById, create, update, remove, query,
    getSettings, updateSettings,
    getFavorites, toggleFavorite, isFavorite,
    adminLogin, isAdminLoggedIn, getAdminName, adminLogout,
    userLogin, setUserSession, isUserLoggedIn, getCurrentUser, userLogout,
    resetAll, getDashboardStats, _genId
  };
})();

if (typeof window !== 'undefined') window.DataService = DataService;

/* ── Admin Page Guard: 편집 중 이탈 방지 ── */
(function() {
  if (typeof window === 'undefined') return;
  var _dirty = false;

  window.AdminGuard = {
    markDirty: function() { _dirty = true; },
    markClean: function() { _dirty = false; },
    isDirty: function() { return _dirty; },
    /* 폼 입력 감시 자동 등록 */
    watchForm: function(formOrSelector) {
      var el = typeof formOrSelector === 'string' ? document.querySelector(formOrSelector) : formOrSelector;
      if (!el) return;
      el.addEventListener('input', function() { _dirty = true; });
      el.addEventListener('change', function() { _dirty = true; });
    }
  };

  /* beforeunload — 편집 중 탭 닫기/새로고침/뒤로가기 방지 */
  window.addEventListener('beforeunload', function(e) {
    if (_dirty) { e.preventDefault(); e.returnValue = ''; }
  });
})();
