var Office = {
  Storage: {
    PREFIX: 'office_',
    init: function() {
      if (!localStorage.getItem(this.PREFIX + 'initialized')) {
        var keys = ['employees','departments','approvals','attendance','reports','calendar','boards','documents','notifications','settings'];
        for (var i = 0; i < keys.length; i++) {
          if (OfficeData[keys[i]]) localStorage.setItem(this.PREFIX + keys[i], JSON.stringify(OfficeData[keys[i]]));
        }
        localStorage.setItem(this.PREFIX + 'initialized', '1');
      }
    },
    get: function(key) { try { return JSON.parse(localStorage.getItem(this.PREFIX + key)) || []; } catch(e) { return []; } },
    set: function(key, data) { localStorage.setItem(this.PREFIX + key, JSON.stringify(data)); },
    reset: function() {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) { if (keys[i].indexOf(this.PREFIX) === 0) localStorage.removeItem(keys[i]); }
      this.init();
    }
  },

  Auth: {
    login: function(username, password) {
      if (username === OfficeData.adminAccount.username && password === OfficeData.adminAccount.password) {
        var user = { name: OfficeData.adminAccount.name, role: OfficeData.adminAccount.role, department: OfficeData.adminAccount.department, username: username, email: OfficeData.adminAccount.email, phone: OfficeData.adminAccount.phone };
        sessionStorage.setItem('office_user', JSON.stringify(user));
        return { success: true, user: user };
      }
      var emps = Office.Storage.get('employees');
      for (var i = 0; i < emps.length; i++) {
        if (emps[i].email.split('@')[0] === username && password === 'pass1234') {
          var u = { name: emps[i].name, role: emps[i].position, department: emps[i].department, username: username, email: emps[i].email, phone: emps[i].phone, employeeId: emps[i].id };
          sessionStorage.setItem('office_user', JSON.stringify(u));
          return { success: true, user: u };
        }
      }
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    },
    logout: function() { sessionStorage.removeItem('office_user'); location.href = 'login.html'; },
    getCurrentUser: function() { try { return JSON.parse(sessionStorage.getItem('office_user')); } catch(e) { return null; } },
    isLoggedIn: function() { return !!this.getCurrentUser(); }
  },

  UI: {
    toggleSidebar: function() {
      var sb = document.getElementById('sidebar');
      var ov = document.getElementById('sidebarOverlay');
      if (sb) sb.classList.toggle('open');
      if (ov) ov.classList.toggle('active');
    },
    initSidebar: function() {
      var ov = document.getElementById('sidebarOverlay');
      if (ov) ov.addEventListener('click', function() { Office.UI.toggleSidebar(); });
      var page = location.pathname.split('/').pop() || 'index.html';
      var links = document.querySelectorAll('.sidebar-menu a');
      for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');
        if (href === page) { links[i].classList.add('active'); } else { links[i].classList.remove('active'); }
      }
      var user = Office.Auth.getCurrentUser();
      if (user) {
        var av = document.getElementById('userAvatar'); if (av) av.textContent = user.name.slice(-2);
        var un = document.getElementById('userName'); if (un) un.textContent = user.name;
        var ur = document.getElementById('userRole'); if (ur) ur.textContent = (user.department || '') + ' ' + (user.role || '');
      }
    },
    initClock: function() {
      var el = document.getElementById('headerClock');
      if (!el) return;
      function tick() { var n = new Date(); el.textContent = [n.getHours(),n.getMinutes(),n.getSeconds()].map(function(v){return String(v).padStart(2,'0')}).join(':'); }
      tick(); setInterval(tick, 1000);
    },
    initTabs: function() {
      var btns = document.querySelectorAll('.tab-btn');
      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var group = btn.closest('.tabs');
          group.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});
          btn.classList.add('active');
          var target = btn.getAttribute('data-tab');
          if (target) {
            var parent = btn.closest('.tabs').parentElement;
            parent.querySelectorAll('.tab-content').forEach(function(tc){tc.classList.remove('active')});
            var t = document.getElementById(target);
            if (t) t.classList.add('active');
          }
          if (typeof window.onTabChange === 'function') window.onTabChange(btn.textContent.trim(), btn.getAttribute('data-tab'));
        });
      });
    },
    showToast: function(msg, type) {
      var c = document.getElementById('toastContainer');
      if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
      var t = document.createElement('div'); t.className = 'toast ' + (type || 'info');
      t.innerHTML = '<i class="fas ' + (type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-circle':'fa-info-circle') + '"></i> ' + msg;
      c.appendChild(t);
      setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; setTimeout(function(){ t.remove(); }, 300); }, 3000);
    },
    showModal: function(id) { var m = document.getElementById(id); if (m) m.classList.add('active'); },
    closeModal: function(id) { var m = document.getElementById(id); if (m) m.classList.remove('active'); },
    toggleFullscreen: function() { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); },
    formatDate: function(d) { if (!d) return '-'; var dt = new Date(d); return dt.getFullYear() + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + String(dt.getDate()).padStart(2,'0'); },
    formatDateTime: function(d) { if (!d) return '-'; var dt = new Date(d); return this.formatDate(d) + ' ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0'); },
    formatNumber: function(n) { return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
    timeAgo: function(d) {
      if (!d) return '';
      var now = Date.now(), diff = now - new Date(d).getTime(), s = Math.floor(diff/1000);
      if (s < 60) return '방금 전'; if (s < 3600) return Math.floor(s/60) + '분 전';
      if (s < 86400) return Math.floor(s/3600) + '시간 전'; return Math.floor(s/86400) + '일 전';
    },
    genId: function() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
  },

  Approval: {
    getAll: function(status) {
      var data = Office.Storage.get('approvals');
      if (status) data = data.filter(function(a) { return a.status === status; });
      data.sort(function(a,b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      return data;
    },
    getById: function(id) { return Office.Storage.get('approvals').find(function(a){return a.id===id}); },
    create: function(d) {
      var all = Office.Storage.get('approvals');
      d.id = 'ap_' + Office.UI.genId();
      d.status = '대기';
      d.createdAt = new Date().toISOString();
      if (!d.approvalLine) d.approvalLine = [];
      all.unshift(d);
      Office.Storage.set('approvals', all);
      return d;
    },
    approve: function(id, comment) {
      var all = Office.Storage.get('approvals');
      var ap = all.find(function(a){return a.id===id});
      if (ap) { ap.status = '승인'; ap.comment = comment; ap.approvedAt = new Date().toISOString(); }
      Office.Storage.set('approvals', all);
    },
    reject: function(id, comment) {
      var all = Office.Storage.get('approvals');
      var ap = all.find(function(a){return a.id===id});
      if (ap) { ap.status = '반려'; ap.comment = comment; ap.rejectedAt = new Date().toISOString(); }
      Office.Storage.set('approvals', all);
    },
    saveDraft: function(d) {
      var all = Office.Storage.get('approvals');
      d.id = 'ap_' + Office.UI.genId();
      d.status = '임시저장';
      d.createdAt = new Date().toISOString();
      all.unshift(d);
      Office.Storage.set('approvals', all);
      return d;
    },
    getStats: function() {
      var all = Office.Storage.get('approvals');
      var s = { total: all.length, pending: 0, approved: 0, rejected: 0, draft: 0 };
      all.forEach(function(a) { if (a.status==='대기') s.pending++; else if (a.status==='승인') s.approved++; else if (a.status==='반려') s.rejected++; else if (a.status==='임시저장') s.draft++; });
      return s;
    }
  },

  Attendance: {
    clockIn: function() {
      var all = Office.Storage.get('attendance');
      var user = Office.Auth.getCurrentUser();
      var today = new Date().toISOString().split('T')[0];
      var now = new Date();
      var time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      var status = (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0)) ? '지각' : '정상';
      var rec = { id: 'att_' + Office.UI.genId(), employeeId: user.employeeId || 'emp1', employeeName: user.name, date: today, clockIn: time, clockOut: '', status: status, workHours: 0, overtime: 0, note: '' };
      all.unshift(rec);
      Office.Storage.set('attendance', all);
      return rec;
    },
    clockOut: function() {
      var all = Office.Storage.get('attendance');
      var user = Office.Auth.getCurrentUser();
      var today = new Date().toISOString().split('T')[0];
      var now = new Date();
      var time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      for (var i = 0; i < all.length; i++) {
        if (all[i].employeeName === user.name && all[i].date === today && all[i].clockIn && !all[i].clockOut) {
          all[i].clockOut = time;
          var inParts = all[i].clockIn.split(':'); var outParts = time.split(':');
          var hours = (parseInt(outParts[0]) + parseInt(outParts[1])/60) - (parseInt(inParts[0]) + parseInt(inParts[1])/60) - 1;
          all[i].workHours = Math.round(hours * 10) / 10;
          all[i].overtime = Math.max(0, Math.round((hours - 8) * 10) / 10);
          if (now.getHours() < 18) all[i].status = all[i].status === '지각' ? '지각' : '조퇴';
          Office.Storage.set('attendance', all);
          return all[i];
        }
      }
      return null;
    },
    getTodayRecord: function() {
      var user = Office.Auth.getCurrentUser(); if (!user) return null;
      var today = new Date().toISOString().split('T')[0];
      return Office.Storage.get('attendance').find(function(a) { return a.employeeName === user.name && a.date === today; });
    },
    getMonthlyRecords: function(year, month) {
      var user = Office.Auth.getCurrentUser(); if (!user) return [];
      var prefix = year + '-' + String(month).padStart(2, '0');
      return Office.Storage.get('attendance').filter(function(a) { return a.employeeName === user.name && a.date.indexOf(prefix) === 0; }).sort(function(a,b) { return b.date.localeCompare(a.date); });
    },
    getStats: function() {
      var now = new Date();
      var recs = this.getMonthlyRecords(now.getFullYear(), now.getMonth() + 1);
      var s = { workDays: 0, late: 0, earlyLeave: 0, absent: 0, totalHours: 0 };
      recs.forEach(function(r) {
        if (r.status === '정상' || r.status === '지각' || r.status === '조퇴') s.workDays++;
        if (r.status === '지각') s.late++;
        if (r.status === '조퇴') s.earlyLeave++;
        if (r.status === '결근') s.absent++;
        s.totalHours += (r.workHours || 0);
      });
      s.totalHours = Math.round(s.totalHours * 10) / 10;
      return s;
    }
  },

  Report: {
    getAll: function(type) {
      var data = Office.Storage.get('reports');
      if (type) data = data.filter(function(r) { return r.type === type; });
      data.sort(function(a,b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      return data;
    },
    getById: function(id) { return Office.Storage.get('reports').find(function(r){return r.id===id}); },
    create: function(d) {
      var all = Office.Storage.get('reports');
      d.id = 'rpt_' + Office.UI.genId();
      d.createdAt = new Date().toISOString();
      d.comments = 0;
      var user = Office.Auth.getCurrentUser();
      d.author = user ? user.name : ''; d.authorDept = user ? user.department : '';
      all.unshift(d);
      Office.Storage.set('reports', all);
      return d;
    }
  },

  Calendar: {
    getEvents: function(year, month) {
      var prefix = year + '-' + String(month).padStart(2, '0');
      return Office.Storage.get('calendar').filter(function(e) {
        return e.startDate.indexOf(prefix) === 0 || (e.endDate && e.endDate.indexOf(prefix) === 0) || (e.startDate < prefix + '-32' && e.endDate >= prefix + '-01');
      });
    },
    createEvent: function(d) {
      var all = Office.Storage.get('calendar');
      d.id = 'ev_' + Office.UI.genId();
      all.push(d);
      Office.Storage.set('calendar', all);
      return d;
    },
    deleteEvent: function(id) {
      var all = Office.Storage.get('calendar').filter(function(e){return e.id!==id});
      Office.Storage.set('calendar', all);
    },
    getUpcoming: function(count) {
      var today = new Date().toISOString().split('T')[0];
      return Office.Storage.get('calendar').filter(function(e){ return e.startDate >= today; }).sort(function(a,b){ return a.startDate.localeCompare(b.startDate); }).slice(0, count || 5);
    }
  },

  Board: {
    getPosts: function(category, page, pageSize) {
      var data = Office.Storage.get('boards');
      if (category) data = data.filter(function(b) { return b.category === category; });
      data.sort(function(a,b) { if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1; return new Date(b.createdAt) - new Date(a.createdAt); });
      page = page || 1; pageSize = pageSize || 10;
      var total = data.length;
      var start = (page - 1) * pageSize;
      return { data: data.slice(start, start + pageSize), total: total, page: page, totalPages: Math.ceil(total / pageSize) };
    },
    getPost: function(id) {
      var all = Office.Storage.get('boards');
      var post = all.find(function(b){return b.id===id});
      if (post) { post.views = (post.views || 0) + 1; Office.Storage.set('boards', all); }
      return post;
    },
    createPost: function(d) {
      var all = Office.Storage.get('boards');
      d.id = 'bd_' + Office.UI.genId();
      d.createdAt = new Date().toISOString();
      d.views = 0; d.comments = 0; d.attachments = 0;
      var user = Office.Auth.getCurrentUser();
      d.author = user ? user.name : ''; d.authorDept = user ? user.department : '';
      all.unshift(d);
      Office.Storage.set('boards', all);
      return d;
    },
    deletePost: function(id) {
      var all = Office.Storage.get('boards').filter(function(b){return b.id!==id});
      Office.Storage.set('boards', all);
    }
  },

  Document: {
    getAll: function(category) {
      var data = Office.Storage.get('documents');
      if (category) data = data.filter(function(d) { return d.category === category; });
      return data;
    },
    getById: function(id) { return Office.Storage.get('documents').find(function(d){return d.id===id}); },
    incrementDownload: function(id) {
      var all = Office.Storage.get('documents');
      var doc = all.find(function(d){return d.id===id});
      if (doc) { doc.downloads = (doc.downloads || 0) + 1; Office.Storage.set('documents', all); }
    },
    create: function(d) {
      var all = Office.Storage.get('documents');
      d.id = 'doc_' + Office.UI.genId();
      d.lastModified = new Date().toISOString().split('T')[0];
      d.downloads = 0;
      all.unshift(d);
      Office.Storage.set('documents', all);
      return d;
    }
  },

  Notification: {
    getAll: function() { return Office.Storage.get('notifications'); },
    getUnreadCount: function() { return this.getAll().filter(function(n){return !n.isRead}).length; },
    markRead: function(id) {
      var all = Office.Storage.get('notifications');
      var n = all.find(function(x){return x.id===id});
      if (n) { n.isRead = true; Office.Storage.set('notifications', all); }
    },
    markAllRead: function() {
      var all = Office.Storage.get('notifications');
      all.forEach(function(n){ n.isRead = true; });
      Office.Storage.set('notifications', all);
    }
  },

  init: function() {
    this.Storage.init();
    this.UI.initSidebar();
    this.UI.initClock();
    this.UI.initTabs();
    var page = location.pathname.split('/').pop() || 'index.html';
    if (page !== 'login.html' && !this.Auth.isLoggedIn()) {
      location.href = 'login.html';
      return;
    }
    var badge = document.getElementById('approvalBadge');
    if (badge) { var c = this.Approval.getStats().pending; badge.textContent = c; if (c === 0) badge.style.display = 'none'; }
    var notifDot = document.getElementById('notifDot');
    if (notifDot) { notifDot.style.display = this.Notification.getUnreadCount() > 0 ? 'block' : 'none'; }
  }
};
