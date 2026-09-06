/* ══════════════════════════════════════════════════════════
   Flipbook — ㈜빛세움 디지털 지명원 PDF Flipbook Viewer
   PDF.js(렌더링) + page-flip(St.PageFlip, 페이지 넘김 애니메이션)
   지연 로딩: 현재 페이지 주변만 우선 렌더링, 나머지는 필요 시점에 렌더링
   ══════════════════════════════════════════════════════════ */
(function (global) {
    'use strict';

    // Worker는 브라우저 정책상 동일 출처 스크립트만 생성 가능 → pdf.js 본체·Worker는 자체 호스팅
    // (CDN에서 직접 new Worker()로 생성 시 cross-origin 오류로 렌더링이 무한 대기하는 문제 확인·수정됨)
    function basePath() {
        var p = location.pathname;
        if (p.indexOf('/pages/') !== -1 || p.indexOf('/admin/') !== -1) return '..';
        return '.';
    }
    var B = basePath();
    var PDFJS_LIB_URL = B + '/assets/vendor/pdfjs/pdf.min.js';
    var PDFJS_WORKER_URL = B + '/assets/vendor/pdfjs/pdf.worker.min.js';
    var PDFJS_CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/';
    var PDFJS_FONT_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/';
    var PAGEFLIP_LIB_URL = B + '/assets/vendor/page-flip.browser.js';

    var _loadPromise = null;
    function loadDeps() {
        if (_loadPromise) return _loadPromise;
        function loadScript(src) {
            return new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = src; s.async = true;
                s.onload = resolve; s.onerror = reject;
                document.head.appendChild(s);
            });
        }
        var p1 = (global.pdfjsLib) ? Promise.resolve() : loadScript(PDFJS_LIB_URL);
        var p2 = (global.St && global.St.PageFlip) ? Promise.resolve() : loadScript(PAGEFLIP_LIB_URL);
        _loadPromise = Promise.all([p1, p2]).then(function () {
            global.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        });
        return _loadPromise;
    }

    var RENDER_SCALE = 2;      // 본문 페이지 렌더링 배율 (고해상도)
    var THUMB_SCALE = 0.28;    // 썸네일 렌더링 배율
    var PRELOAD_RADIUS = 2;    // 현재 페이지 기준 앞뒤 우선 로딩 범위

    function FlipbookInstance(opts) {
        this.pdfUrl = opts.pdfUrl;
        this.title = opts.title || '디지털 지명원';
        this.subtitle = opts.subtitle || 'DIGITAL COMPANY PROFILE';
        this.pdfDoc = null;
        this.pageFlip = null;
        this.numPages = 0;
        this.rendered = {};       // pageNum -> true
        this.rendering = {};      // pageNum -> Promise
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.el = null;
        this.thumbsBuilt = false;
        this._pinch = null;
        this._pan = null;
    }

    FlipbookInstance.prototype._buildDom = function () {
        var self = this;
        var overlay = document.createElement('div');
        overlay.className = 'fb-overlay';
        overlay.innerHTML =
            '<div class="fb-topbar">' +
            '  <div class="fb-brand">' +
            '    <div class="fb-brand-icon"><i class="fa-solid fa-book-open"></i></div>' +
            '    <div>' +
            '      <div class="fb-brand-title">' + self.title + '</div>' +
            '      <div class="fb-brand-sub">' + self.subtitle + '</div>' +
            '    </div>' +
            '  </div>' +
            '  <div class="fb-tools">' +
            '    <button class="fb-btn" data-act="prev" title="이전 페이지"><i class="fa-solid fa-chevron-left"></i></button>' +
            '    <div class="fb-pageindicator"><span id="fbCur">1</span> <span>/ <span id="fbTotal">-</span></span></div>' +
            '    <button class="fb-btn" data-act="next" title="다음 페이지"><i class="fa-solid fa-chevron-right"></i></button>' +
            '    <div class="fb-sep"></div>' +
            '    <button class="fb-btn" data-act="zoomout" title="축소"><i class="fa-solid fa-magnifying-glass-minus"></i></button>' +
            '    <button class="fb-btn" data-act="zoomin" title="확대"><i class="fa-solid fa-magnifying-glass-plus"></i></button>' +
            '    <button class="fb-btn" data-act="thumbs" title="목차(썸네일)"><i class="fa-solid fa-table-cells-large"></i></button>' +
            '    <button class="fb-btn" data-act="fullscreen" title="전체화면"><i class="fa-solid fa-expand"></i></button>' +
            '    <button class="fb-btn" data-act="download" title="PDF 다운로드"><i class="fa-solid fa-download"></i></button>' +
            '    <div class="fb-sep"></div>' +
            '  </div>' +
            '  <button class="fb-close" data-act="close" title="닫기(ESC)"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>' +
            '<div class="fb-stage" id="fbStage">' +
            '  <div class="fb-initloading" id="fbInitLoading">' +
            '    <div class="fb-spin-lg"></div>' +
            '    <div class="fb-title-lg">지명원을 준비하고 있습니다</div>' +
            '    <p>잠시만 기다려 주세요…</p>' +
            '  </div>' +
            '  <div class="fb-zoomwrap" id="fbZoomWrap"><div id="fb-book"></div></div>' +
            '  <div class="fb-thumbs" id="fbThumbs">' +
            '    <div class="fb-thumbs-head"><span>전체 목차</span><button class="fb-btn" data-act="thumbs" style="width:28px;height:28px;font-size:12px"><i class="fa-solid fa-xmark"></i></button></div>' +
            '    <div class="fb-thumbs-body" id="fbThumbsBody"></div>' +
            '  </div>' +
            '  <div class="fb-hint" id="fbHint">페이지를 클릭하거나 드래그해서 넘겨보세요 · ESC로 닫기</div>' +
            '</div>';
        document.body.appendChild(overlay);
        this.el = overlay;
        this._bindUI();
        requestAnimationFrame(function () { overlay.classList.add('fb-show'); });
        setTimeout(function () {
            var h = self.el.querySelector('#fbHint');
            if (h) h.classList.add('fb-hide');
        }, 4500);
    };

    FlipbookInstance.prototype._bindUI = function () {
        var self = this;
        this.el.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'close') self.close();
            else if (act === 'next') self.pageFlip && self.pageFlip.flipNext();
            else if (act === 'prev') self.pageFlip && self.pageFlip.flipPrev();
            else if (act === 'zoomin') self.setZoom(self.zoom + 0.25);
            else if (act === 'zoomout') self.setZoom(self.zoom - 0.25);
            else if (act === 'fullscreen') self.toggleFullscreen();
            else if (act === 'thumbs') self.toggleThumbs();
            else if (act === 'download') self.download();
        });
        this._escHandler = function (e) { if (e.key === 'Escape') self.close(); };
        document.addEventListener('keydown', this._escHandler);

        // 두 손가락 핀치줌 (모바일)
        var stage = this.el.querySelector('#fbStage');
        stage.addEventListener('touchstart', function (e) {
            if (e.touches.length === 2) {
                self._pinch = { d0: self._touchDist(e), z0: self.zoom };
            }
        }, { passive: true });
        stage.addEventListener('touchmove', function (e) {
            if (e.touches.length === 2 && self._pinch) {
                var d = self._touchDist(e);
                var ratio = d / self._pinch.d0;
                self.setZoom(self._pinch.z0 * ratio, true);
            }
        }, { passive: true });
        stage.addEventListener('touchend', function (e) {
            if (e.touches.length < 2) self._pinch = null;
        }, { passive: true });

        // 확대된 상태에서 한 손가락/마우스로 드래그하여 상하좌우 이동(팬)
        // zoom이 1(기본)일 때는 그대로 두어 책장넘기기(PageFlip) 드래그가 정상 동작하도록 하고,
        // zoom > 1일 때만 이 핸들러가 먼저 가로채(capture) 페이지 넘김과 충돌하지 않게 함
        function panStart(clientX, clientY, e) {
            if (self.zoom <= 1) return false;
            self._pan = { x0: clientX, y0: clientY, px0: self.panX, py0: self.panY };
            var wrap = self.el.querySelector('#fbZoomWrap');
            wrap.classList.add('fb-grabbing');
            if (e && e.stopPropagation) e.stopPropagation();
            return true;
        }
        function panMove(clientX, clientY) {
            if (!self._pan) return;
            var dx = clientX - self._pan.x0;
            var dy = clientY - self._pan.y0;
            self.panX = self._pan.px0 + dx;
            self.panY = self._pan.py0 + dy;
            self._clampPan();
            self._applyTransform();
        }
        function panEnd() {
            if (!self._pan) return;
            self._pan = null;
            var wrap = self.el.querySelector('#fbZoomWrap');
            if (wrap) wrap.classList.remove('fb-grabbing');
        }
        stage.addEventListener('mousedown', function (e) {
            if (panStart(e.clientX, e.clientY, e)) e.preventDefault();
        }, true);
        document.addEventListener('mousemove', function (e) { panMove(e.clientX, e.clientY); });
        document.addEventListener('mouseup', panEnd);
        stage.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) panStart(e.touches[0].clientX, e.touches[0].clientY, e);
        }, { capture: true, passive: true });
        stage.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1 && self._pan) panMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        stage.addEventListener('touchend', panEnd, { passive: true });
    };

    FlipbookInstance.prototype._touchDist = function (e) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    FlipbookInstance.prototype._applyTransform = function () {
        var wrap = this.el.querySelector('#fbZoomWrap');
        if (wrap) wrap.style.transform = 'translate(' + this.panX + 'px, ' + this.panY + 'px) scale(' + this.zoom + ')';
    };

    FlipbookInstance.prototype._clampPan = function () {
        var wrap = this.el.querySelector('#fbZoomWrap');
        var stage = this.el.querySelector('#fbStage');
        if (!wrap || !stage) return;
        var maxX = Math.max(0, (wrap.offsetWidth * this.zoom - stage.clientWidth) / 2);
        var maxY = Math.max(0, (wrap.offsetHeight * this.zoom - stage.clientHeight) / 2);
        this.panX = Math.max(-maxX, Math.min(maxX, this.panX));
        this.panY = Math.max(-maxY, Math.min(maxY, this.panY));
    };

    FlipbookInstance.prototype.setZoom = function (z, silent) {
        z = Math.max(1, Math.min(3.75, z));
        this.zoom = z;
        if (z <= 1) { this.panX = 0; this.panY = 0; }
        this._clampPan();
        this._applyTransform();
        var wrap = this.el.querySelector('#fbZoomWrap');
        if (wrap) wrap.classList.toggle('fb-zoomed', z > 1);
        var zin = this.el.querySelector('[data-act="zoomin"]');
        var zout = this.el.querySelector('[data-act="zoomout"]');
        if (zin) zin.disabled = z >= 3.75;
        if (zout) zout.disabled = z <= 1;
    };

    FlipbookInstance.prototype.toggleFullscreen = function () {
        if (!document.fullscreenElement) {
            (this.el.requestFullscreen || this.el.webkitRequestFullscreen || function () {}).call(this.el);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
        }
    };

    FlipbookInstance.prototype.toggleThumbs = function () {
        var panel = this.el.querySelector('#fbThumbs');
        var open = panel.classList.toggle('fb-open');
        if (open && !this.thumbsBuilt) this._buildThumbs();
    };

    FlipbookInstance.prototype.download = function () {
        var self = this;
        var btn = this.el.querySelector('[data-act="download"] i');
        var origClass = btn.className;
        btn.className = 'fa-solid fa-spinner fa-spin';
        fetch(this.pdfUrl).then(function (r) { return r.blob(); }).then(function (blob) {
            var blobUrl = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = blobUrl;
            a.download = '빛세움_지명원.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 4000);
            btn.className = origClass;
        }).catch(function () {
            btn.className = origClass;
            global.App && global.App.toast && global.App.toast('다운로드에 실패했습니다. 다시 시도해 주세요.');
        });
    };

    FlipbookInstance.prototype._updateIndicator = function (idx) {
        var cur = this.el.querySelector('#fbCur');
        if (cur) cur.textContent = String(idx + 1);
        var prevBtn = this.el.querySelector('[data-act="prev"]');
        var nextBtn = this.el.querySelector('[data-act="next"]');
        if (prevBtn) prevBtn.disabled = idx <= 0;
        if (nextBtn) nextBtn.disabled = idx >= this.numPages - 1;
        var thumbs = this.el.querySelectorAll('.fb-thumb');
        thumbs.forEach(function (t) {
            t.classList.toggle('fb-thumb-active', parseInt(t.getAttribute('data-page'), 10) - 1 === idx);
        });
    };

    FlipbookInstance.prototype._preloadAround = function (idx) {
        var from = Math.max(1, idx + 1 - PRELOAD_RADIUS);
        var to = Math.min(this.numPages, idx + 1 + PRELOAD_RADIUS);
        for (var p = from; p <= to; p++) this._renderPage(p);
    };

    FlipbookInstance.prototype._renderPage = function (pageNum) {
        var self = this;
        if (this.rendered[pageNum] || this.rendering[pageNum]) return this.rendering[pageNum] || Promise.resolve();
        var container = this.el.querySelector('.fb-page[data-page="' + pageNum + '"]');
        if (!container) return Promise.resolve();
        var task = this.pdfDoc.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: RENDER_SCALE });
            var canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            var ctx = canvas.getContext('2d');
            return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                var inner = container.querySelector('.fb-page-inner');
                inner.innerHTML = '';
                inner.appendChild(canvas);
                self.rendered[pageNum] = true;
                delete self.rendering[pageNum];
            });
        }).catch(function () { delete self.rendering[pageNum]; });
        this.rendering[pageNum] = task;
        return task;
    };

    FlipbookInstance.prototype._buildThumbs = function () {
        var self = this;
        this.thumbsBuilt = true;
        var body = this.el.querySelector('#fbThumbsBody');
        var frag = document.createDocumentFragment();
        var els = [];
        for (var i = 1; i <= this.numPages; i++) {
            var d = document.createElement('div');
            d.className = 'fb-thumb';
            d.setAttribute('data-page', i);
            d.innerHTML = '<div class="fb-thumb-spin"></div><span class="fb-thumb-num">' + i + '</span>';
            d.addEventListener('click', (function (pageNum) {
                return function () {
                    self.pageFlip.turnToPage(pageNum - 1);
                    self._renderPage(pageNum);
                };
            })(i));
            frag.appendChild(d);
            els.push(d);
        }
        body.appendChild(frag);
        // 저해상도 썸네일 순차 렌더링(메인 스레드 블로킹 최소화)
        var idx = 0;
        function renderNext() {
            if (idx >= els.length) return;
            var pageNum = idx + 1;
            var target = els[idx];
            idx++;
            self.pdfDoc.getPage(pageNum).then(function (page) {
                var viewport = page.getViewport({ scale: THUMB_SCALE });
                var canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                var ctx = canvas.getContext('2d');
                return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                    var spin = target.querySelector('.fb-thumb-spin');
                    if (spin) spin.remove();
                    target.insertBefore(canvas, target.firstChild);
                });
            }).finally(function () {
                (global.requestIdleCallback || function (cb) { setTimeout(cb, 30); })(renderNext);
            });
        }
        renderNext();
    };

    FlipbookInstance.prototype._init = function () {
        var self = this;
        loadDeps().then(function () {
            return global.pdfjsLib.getDocument({
                url: self.pdfUrl,
                cMapUrl: PDFJS_CMAP_URL,
                cMapPacked: true,
                standardFontDataUrl: PDFJS_FONT_URL
            }).promise;
        }).then(function (pdf) {
            self.pdfDoc = pdf;
            self.numPages = pdf.numPages;
            self.el.querySelector('#fbTotal').textContent = String(self.numPages);
            return pdf.getPage(1).then(function (page) {
                var vp = page.getViewport({ scale: 1 });
                return { w: vp.width, h: vp.height };
            });
        }).then(function (dim) {
            self._buildBook(dim);
            var loading = self.el.querySelector('#fbInitLoading');
            if (loading) loading.remove();
        }).catch(function (err) {
            console.error('[Flipbook] 로드 실패', err);
            var loading = self.el.querySelector('#fbInitLoading');
            if (loading) {
                loading.innerHTML = '<div class="fb-title-lg" style="color:#ff8a8a"><i class="fa-solid fa-triangle-exclamation"></i> 지명원을 불러오지 못했습니다</div><p>잠시 후 다시 시도해 주세요</p>';
            }
        });
    };

    FlipbookInstance.prototype._buildBook = function (dim) {
        var self = this;
        var bookEl = this.el.querySelector('#fb-book');
        var baseHeight = 640;
        var baseWidth = Math.max(1, Math.round(baseHeight * (dim.w / dim.h)));

        for (var i = 1; i <= this.numPages; i++) {
            var page = document.createElement('div');
            page.className = 'fb-page' + (i === 1 || i === this.numPages ? ' fb-cover' : '');
            page.setAttribute('data-page', i);
            page.innerHTML = '<div class="fb-page-inner"><div class="fb-page-loading"><div class="fb-spin"></div><span>' + i + ' / ' + this.numPages + '</span></div></div>';
            bookEl.appendChild(page);
        }

        this.pageFlip = new global.St.PageFlip(bookEl, {
            width: baseWidth,
            height: baseHeight,
            size: 'stretch',
            minWidth: 240,
            maxWidth: 1400,
            minHeight: 320,
            maxHeight: 1900,
            maxShadowOpacity: 0.45,
            showCover: true,
            usePortrait: true,
            mobileScrollSupport: false,
            useMouseEvents: true,
            flippingTime: 650,
            autoSize: true
        });
        this.pageFlip.loadFromHTML(bookEl.querySelectorAll('.fb-page'));

        this.pageFlip.on('flip', function (e) {
            self._updateIndicator(e.data);
            self._preloadAround(e.data);
        });

        this._updateIndicator(0);
        this._preloadAround(0);
    };

    FlipbookInstance.prototype.close = function (skipHistory) {
        var self = this;
        document.removeEventListener('keydown', this._escHandler);
        if (this._popHandler) window.removeEventListener('popstate', this._popHandler);
        if (document.fullscreenElement) { (document.exitFullscreen || function () {}).call(document); }
        this.el.classList.remove('fb-show');
        document.body.style.overflow = '';
        // 뒤로가기로 닫힌 게 아니라 닫기 버튼/ESC로 닫은 경우, 열 때 추가했던 히스토리 항목을 되돌려
        // 사용자가 페이지를 한 번 더 뒤로가기 눌러야 이전 화면으로 나가는 상황을 방지
        if (!skipHistory && this._historyPushed && history.state && history.state.flipbookOpen) {
            history.back();
        }
        setTimeout(function () {
            if (self.pageFlip && self.pageFlip.destroy) { try { self.pageFlip.destroy(); } catch (e) {} }
            if (self.el && self.el.parentNode) self.el.parentNode.removeChild(self.el);
        }, 260);
    };

    var Flipbook = {
        open: function (opts) {
            opts = opts || {};
            if (!opts.pdfUrl) { console.error('[Flipbook] pdfUrl이 필요합니다'); return; }
            document.body.style.overflow = 'hidden';
            var inst = new FlipbookInstance(opts);
            inst._buildDom();
            inst._init();
            // 지명원이 열려있는 동안 모바일 뒤로가기(제스처/버튼)를 누르면
            // 곧바로 홈페이지 등 이전 화면으로 나가지 않고, 먼저 지명원만 닫히도록 처리
            history.pushState({ flipbookOpen: true }, '', location.href);
            inst._historyPushed = true;
            inst._popHandler = function () {
                inst.close(true);
            };
            window.addEventListener('popstate', inst._popHandler);
            return inst;
        }
    };

    global.Flipbook = Flipbook;
})(window);
