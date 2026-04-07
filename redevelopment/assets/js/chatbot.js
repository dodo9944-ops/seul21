/* ============================================================
   세울엔지니어링 스마트 AI 비서
   — 비서1 일반상담 (Claude) + 비서2 전문가 (Gemma4)
   — 다크네이비 + 골드 프리미엄 디자인
   — 전문가 모드 실시간 스트리밍 지원
   — common.js에서 자동 로드, 모든 페이지 적용
   ============================================================ */
(function() {
  const B = location.pathname.includes('/pages/') || location.pathname.includes('/admin/') ? '..' : '.';

  // 현재 모드: 'general' | 'expert'
  let currentMode = 'general';
  // 각 모드별 메시지 히스토리 HTML
  const messageHistory = { general: '', expert: '' };

  const chatHTML = `
  <div id="seul-chatbot">
    <div id="chat-window" class="chat-hidden">
      <div id="chat-header">
        <div id="chat-header-left">
          <div id="chat-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div id="chat-header-text">
            <span id="chat-title">세울 AI 비서</span>
            <span id="chat-subtitle">정비사업 전문 24시 상담</span>
          </div>
        </div>
        <button id="chat-close" aria-label="닫기">&times;</button>
      </div>
      <div id="chat-tabs">
        <button class="chat-tab active" data-mode="general">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          AI 상담
        </button>
        <button class="chat-tab" data-mode="expert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          AI 전문가
        </button>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-quick">
        <button class="chat-quick-btn" data-q="정비사업 절차가 궁금해요">정비사업 절차</button>
        <button class="chat-quick-btn" data-q="사업성 검토를 받고 싶어요">사업성 검토</button>
        <button class="chat-quick-btn" data-q="상담 문의하기">상담 문의</button>
      </div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="궁금한 점을 입력하세요..." maxlength="500">
        <button id="chat-send" aria-label="전송">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="chat-footer">© (주)세울엔지니어링 · 스마트 AI 비서 시스템</div>
    </div>
    <button id="chat-toggle" aria-label="상담하기">
      <div id="chat-toggle-inner">
        <svg id="chat-icon-open" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <svg id="chat-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:none">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <span id="chat-toggle-label">AI 비서</span>
    </button>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const style = document.createElement('style');
  style.textContent = `
    #seul-chatbot {
      position:fixed; bottom:28px; right:28px; z-index:99999;
      font-family:'Noto Sans KR',-apple-system,sans-serif;
    }

    /* == 토글 버튼 == */
    #chat-toggle {
      width:auto; height:52px; border-radius:26px; border:none;
      background: linear-gradient(145deg, #0A0F1C, #1a3055);
      color:#C3A569; cursor:pointer; padding:0 20px 0 16px;
      box-shadow: 0 4px 20px rgba(10,15,28,0.45), inset 0 1px 0 rgba(195,165,105,0.15);
      display:flex; align-items:center; gap:8px;
      transition: all .3s ease;
    }
    #chat-toggle:hover {
      transform:translateY(-2px);
      box-shadow: 0 8px 32px rgba(10,15,28,0.55), inset 0 1px 0 rgba(195,165,105,0.2);
    }
    #chat-toggle-inner { display:flex; align-items:center; }
    #chat-toggle-label {
      font-size:13px; font-weight:700; letter-spacing:0.3px;
      color:#C3A569;
    }
    #chat-toggle.active { border-radius:50%; width:52px; padding:0; justify-content:center; }
    #chat-toggle.active #chat-icon-open { display:none; }
    #chat-toggle.active #chat-icon-close { display:block; }
    #chat-toggle.active #chat-toggle-label { display:none; }

    /* == 채팅 윈도우 == */
    #chat-window {
      position:absolute; bottom:68px; right:0;
      width:420px; height:620px; border-radius:20px;
      background:#fff;
      box-shadow: 0 16px 56px rgba(10,15,28,0.22), 0 0 0 1px rgba(10,15,28,0.05);
      display:flex; flex-direction:column; overflow:hidden;
      transition: opacity .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1);
    }
    #chat-window.chat-hidden {
      opacity:0; transform:translateY(12px) scale(0.96);
      pointer-events:none;
    }

    /* == 헤더 == */
    #chat-header {
      background: linear-gradient(135deg, #0A0F1C 0%, #142644 100%);
      padding:16px 20px 12px; display:flex; align-items:center; justify-content:space-between;
    }
    #chat-header-left { display:flex; align-items:center; gap:12px; }
    #chat-logo {
      width:38px; height:38px; border-radius:10px;
      background: linear-gradient(135deg, #C3A569, #D4B87A);
      color:#0A0F1C;
      display:flex; align-items:center; justify-content:center;
    }
    #chat-header-text { display:flex; flex-direction:column; }
    #chat-title { color:#fff; font-size:14px; font-weight:700; }
    #chat-subtitle { color:rgba(195,165,105,0.7); font-size:11px; font-weight:400; margin-top:2px; }
    #chat-close {
      background:rgba(255,255,255,0.08); border:none; color:rgba(255,255,255,0.5);
      width:32px; height:32px; border-radius:8px;
      font-size:20px; cursor:pointer; line-height:1;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    #chat-close:hover { background:rgba(255,255,255,0.15); color:#fff; }

    /* == 탭 바 == */
    #chat-tabs {
      display:flex; background:linear-gradient(135deg, #0d1529 0%, #162a4a 100%);
      padding:0 16px 12px; gap:6px;
    }
    .chat-tab {
      flex:1; padding:9px 12px; border:1.5px solid rgba(195,165,105,0.15);
      border-radius:10px; background:rgba(255,255,255,0.04);
      color:rgba(255,255,255,0.45); font-size:12.5px; font-weight:600;
      cursor:pointer; transition:all .25s ease;
      display:flex; align-items:center; justify-content:center; gap:6px;
      font-family:'Noto Sans KR',sans-serif;
    }
    .chat-tab:hover {
      background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7);
      border-color:rgba(195,165,105,0.25);
    }
    .chat-tab.active {
      background:linear-gradient(135deg, rgba(195,165,105,0.15), rgba(195,165,105,0.08));
      color:#C3A569; border-color:rgba(195,165,105,0.5);
      box-shadow: 0 2px 8px rgba(195,165,105,0.15);
    }
    .chat-tab[data-mode="expert"].active {
      background:linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.06));
      color:#10B981; border-color:rgba(16,185,129,0.5);
      box-shadow: 0 2px 8px rgba(16,185,129,0.15);
    }
    .chat-tab[data-mode="expert"].offline {
      opacity:0.5; position:relative;
    }
    .chat-tab[data-mode="expert"].offline::after {
      content:''; width:6px; height:6px; border-radius:50%;
      background:#ef4444; position:absolute; top:6px; right:6px;
    }
    .chat-tab[data-mode="expert"].online::after {
      content:''; width:6px; height:6px; border-radius:50%;
      background:#10B981; position:absolute; top:6px; right:6px;
      box-shadow:0 0 6px rgba(16,185,129,0.5);
    }

    /* == 오프라인 안내 == */
    .expert-offline-notice {
      text-align:center; padding:30px 20px;
    }
    .expert-offline-notice .offline-icon {
      width:56px; height:56px; margin:0 auto 16px; border-radius:50%;
      background:linear-gradient(135deg, #f3f4f6, #e5e7eb);
      display:flex; align-items:center; justify-content:center;
      color:#9ca3af; font-size:24px;
    }
    .expert-offline-notice h4 {
      margin:0 0 8px; font-size:14px; color:#374151; font-weight:700;
    }
    .expert-offline-notice p {
      margin:0 0 16px; font-size:12.5px; color:#6b7280; line-height:1.6;
    }
    .expert-offline-notice .switch-btn {
      display:inline-block; padding:8px 20px; border-radius:20px;
      background:linear-gradient(135deg, #0A0F1C, #1a3055);
      color:#C3A569; font-size:12px; font-weight:600; border:none;
      cursor:pointer; font-family:'Noto Sans KR',sans-serif;
      transition:all .2s;
    }
    .expert-offline-notice .switch-btn:hover { transform:translateY(-1px); opacity:0.9; }

    /* == 메시지 영역 == */
    #chat-messages {
      flex:1; overflow-y:auto; padding:20px 16px;
      display:flex; flex-direction:column; gap:16px;
      background:linear-gradient(180deg, #f8f9fb 0%, #fff 100%);
    }
    #chat-messages::-webkit-scrollbar { width:3px; }
    #chat-messages::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:3px; }

    .chat-msg { display:flex; gap:10px; align-items:flex-start; }
    .chat-msg.bot { justify-content:flex-start; }
    .chat-msg.user { justify-content:flex-end; }
    .chat-avatar {
      width:34px; height:34px; border-radius:50%; flex-shrink:0;
      background:linear-gradient(135deg,#0A0F1C,#1a3055);
      color:#C3A569; font-size:13px; font-weight:800;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 2px 8px rgba(10,15,28,0.15);
    }
    .chat-avatar.expert-avatar {
      background:linear-gradient(135deg,#065F46,#10B981);
      color:#fff;
    }
    .chat-msg.user .chat-avatar { display:none; }
    .chat-content { display:flex; flex-direction:column; gap:3px; max-width:82%; }
    .chat-name { font-size:11px; color:#888; font-weight:500; padding-left:2px; }
    .chat-name.expert-name { color:#10B981; }
    .chat-msg.user .chat-content { align-items:flex-end; }

    .chat-bubble {
      padding:12px 16px; font-size:13.5px; line-height:1.7;
      word-break:keep-all;
    }
    .chat-msg.bot .chat-bubble {
      background:#fff; color:#1A1A1A;
      border-radius:2px 16px 16px 16px;
      border:1px solid #ebedf0;
    }
    .chat-msg.bot.expert .chat-bubble {
      border-color:rgba(16,185,129,0.2);
      background:linear-gradient(135deg, #f0fdf9, #fff);
    }
    .chat-msg.user .chat-bubble {
      background:linear-gradient(135deg, #0A0F1C, #1a3055);
      color:#f0f0f0; border-radius:16px 2px 16px 16px;
    }

    .chat-typing .chat-bubble { color:#999; }
    .chat-typing .dot-loader { display:inline-flex; gap:5px; margin-left:4px; vertical-align:middle; }
    .chat-typing .dot-loader span {
      width:6px; height:6px; background:#C3A569; border-radius:50%;
      animation:dotPulse .9s infinite ease-in-out;
    }
    .chat-typing.expert .dot-loader span { background:#10B981; }
    .chat-typing .dot-loader span:nth-child(2) { animation-delay:.2s; }
    .chat-typing .dot-loader span:nth-child(3) { animation-delay:.4s; }
    @keyframes dotPulse { 0%,80%,100%{opacity:.25;transform:scale(.7)} 40%{opacity:1;transform:scale(1.1)} }

    /* == 스트리밍 커서 == */
    .streaming-cursor::after {
      content:''; display:inline-block;
      width:2px; height:14px; background:#10B981;
      margin-left:2px; vertical-align:text-bottom;
      animation: cursorBlink 0.8s infinite;
    }
    @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* == 전문가 배지 == */
    .expert-badge {
      display:inline-flex; align-items:center; gap:3px;
      background:linear-gradient(135deg, #065F46, #10B981);
      color:#fff; font-size:9px; font-weight:700;
      padding:2px 7px; border-radius:6px;
      margin-left:6px; letter-spacing:0.3px;
    }

    /* == 빠른 질문 == */
    #chat-quick {
      padding:8px 16px 4px; background:#fff;
      display:flex; gap:6px; flex-wrap:wrap;
      border-top:1px solid #f0f0f0;
    }
    .chat-quick-btn {
      padding:6px 14px; border-radius:20px;
      border:1px solid #e0e0e0; background:#fafafa;
      font-size:12px; color:#555; cursor:pointer;
      font-family:'Noto Sans KR',sans-serif;
      transition:all .2s;
    }
    .chat-quick-btn:hover {
      border-color:#C3A569; color:#0A0F1C; background:#fdf8ef;
    }
    .chat-quick-btn.expert-quick:hover {
      border-color:#10B981; color:#065F46; background:#f0fdf9;
    }

    /* == 입력 영역 == */
    #chat-input-area {
      padding:12px 16px; background:#fff;
      border-top:1px solid #ebedf0;
      display:flex; gap:8px; align-items:center;
    }
    #chat-input {
      flex:1; border:1.5px solid #e5e7eb; border-radius:24px;
      padding:11px 18px; font-size:13.5px; outline:none;
      font-family:'Noto Sans KR',sans-serif;
      background:#f8f9fb; transition:all .2s;
    }
    #chat-input:focus { border-color:#C3A569; background:#fff; box-shadow:0 0 0 3px rgba(195,165,105,0.1); }
    #chat-input.expert-focus:focus { border-color:#10B981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
    #chat-input::placeholder { color:#bbb; }
    #chat-send {
      width:42px; height:42px; border-radius:50%; border:none;
      background:linear-gradient(135deg,#0A0F1C,#1a3055);
      color:#C3A569; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    #chat-send.expert-send {
      background:linear-gradient(135deg,#065F46,#10B981);
      color:#fff;
    }
    #chat-send:hover { transform:scale(1.05); }
    #chat-send:disabled { opacity:.35; cursor:not-allowed; transform:none; }

    /* == 푸터 == */
    #chat-footer {
      padding:8px 16px; text-align:center;
      font-size:10px; color:#bbb; background:#fafafa;
      border-top:1px solid #f0f0f0; letter-spacing:-0.2px;
    }

    /* == 모바일 == */
    @media(max-width:480px) {
      #seul-chatbot { bottom:16px; right:16px; }
      #chat-toggle { height:48px; padding:0 16px 0 14px; }
      #chat-toggle.active { width:48px; }
      #chat-window {
        width:calc(100vw - 32px); height:calc(100vh - 100px);
        right:-8px; bottom:64px; border-radius:16px;
      }
    }
  `;
  document.head.appendChild(style);

  // DOM 요소
  const toggle = document.getElementById('chat-toggle');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  const quickArea = document.getElementById('chat-quick');
  const tabs = document.querySelectorAll('.chat-tab');
  const headerTitle = document.getElementById('chat-title');
  const headerSub = document.getElementById('chat-subtitle');

  // 초기 인사 메시지
  const greetings = {
    general: `<div class="chat-msg bot">
      <div class="chat-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg></div>
      <div class="chat-content">
        <div class="chat-name">세울 상담사</div>
        <div class="chat-bubble">안녕하세요, <strong>(주)세울엔지니어링</strong>입니다.<br>재개발·재건축 관련 궁금한 점을 편하게 물어보세요.</div>
      </div>
    </div>`,
    expert: `<div class="chat-msg bot expert">
      <div class="chat-avatar expert-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
      <div class="chat-content">
        <div class="chat-name expert-name">세울 전문가<span class="expert-badge">Gemma4</span></div>
        <div class="chat-bubble">안녕하세요, <strong>세울 AI 전문가</strong>입니다.<br>정비사업 법규·절차·사업성 분석 등<br><strong>전문가 수준의 심층 상담</strong>을 제공합니다.<br>어떤 사안이 궁금하신가요?</div>
      </div>
    </div>`
  };

  const quickButtons = {
    general: [
      { text: '정비사업 절차', q: '정비사업 절차가 궁금해요' },
      { text: '사업성 검토', q: '사업성 검토를 받고 싶어요' },
      { text: '상담 문의', q: '상담 문의하기' }
    ],
    expert: [
      { text: '조합설립 요건', q: '재개발 조합설립 동의율과 절차를 상세히 알려주세요' },
      { text: '비례율 분석', q: '비례율 산정 방식과 사업성 판단 기준을 전문적으로 분석해주세요' },
      { text: '관리처분 쟁점', q: '관리처분인가 단계의 주요 법적 쟁점과 대응방안을 알려주세요' },
      { text: '최신 정책 동향', q: '신속통합기획과 공공재개발 등 최신 정비사업 정책을 분석해주세요' }
    ]
  };

  // 전문가 온라인 상태
  let expertOnline = false;
  const expertTab = document.querySelector('.chat-tab[data-mode="expert"]');

  const offlineGreeting = `<div class="expert-offline-notice">
    <div class="offline-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
    <h4>AI 전문가 오프라인</h4>
    <p>전문가 AI 서버가 현재 꺼져 있습니다.<br>서버가 가동되면 자동으로 활성화됩니다.</p>
    <button class="switch-btn" onclick="document.querySelector('.chat-tab[data-mode=general]').click()">AI 상담으로 전환</button>
  </div>`;

  async function checkExpertStatus() {
    try {
      const res = await fetch(B + '/api/chat-expert-status', { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      expertOnline = data.online;
    } catch (e) {
      expertOnline = false;
    }
    expertTab.classList.toggle('online', expertOnline);
    expertTab.classList.toggle('offline', !expertOnline);
    // 현재 전문가 탭이고 상태가 바뀌었으면 메시지 업데이트
    if (currentMode === 'expert' && !expertOnline) {
      messageHistory.expert = offlineGreeting;
      messages.innerHTML = offlineGreeting;
    }
    if (currentMode === 'expert' && expertOnline && messages.querySelector('.expert-offline-notice')) {
      messageHistory.expert = greetings.expert;
      messages.innerHTML = greetings.expert;
    }
  }

  // 초기 메시지 세팅
  messageHistory.general = greetings.general;
  messageHistory.expert = greetings.expert;
  messages.innerHTML = messageHistory.general;

  // 상태 체크: 즉시 1회 + 30초마다
  checkExpertStatus();
  setInterval(checkExpertStatus, 30000);

  // 탭 전환
  function switchMode(mode) {
    if (mode === currentMode) return;

    // 현재 대화 저장
    messageHistory[currentMode] = messages.innerHTML;

    currentMode = mode;

    // 탭 활성화
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

    // 전문가 오프라인이면 오프라인 화면
    if (mode === 'expert' && !expertOnline) {
      messages.innerHTML = offlineGreeting;
      input.disabled = true;
      sendBtn.disabled = true;
    } else {
      messages.innerHTML = messageHistory[mode];
      input.disabled = false;
      sendBtn.disabled = false;
    }
    messages.scrollTop = messages.scrollHeight;

    // 헤더 변경
    if (mode === 'expert') {
      headerTitle.textContent = '세울 AI 전문가';
      headerSub.textContent = expertOnline ? 'Gemma4 기반 전문가 분석' : '서버 오프라인';
      input.classList.add('expert-focus');
      sendBtn.classList.add('expert-send');
      input.placeholder = '전문 상담 내용을 입력하세요...';
    } else {
      headerTitle.textContent = '세울 AI 비서';
      headerSub.textContent = '정비사업 전문 24시 상담';
      input.classList.remove('expert-focus');
      sendBtn.classList.remove('expert-send');
      input.placeholder = '궁금한 점을 입력하세요...';
      input.disabled = false;
      sendBtn.disabled = false;
    }

    // 빠른질문 교체
    updateQuickButtons(mode);
    if (quickArea) quickArea.style.display = (mode === 'expert' && !expertOnline) ? 'none' : 'flex';

    if (!input.disabled) input.focus();
  }

  function updateQuickButtons(mode) {
    const btns = quickButtons[mode];
    quickArea.innerHTML = btns.map(b =>
      `<button class="chat-quick-btn ${mode === 'expert' ? 'expert-quick' : ''}" data-q="${b.q}">${b.text}</button>`
    ).join('');
    quickArea.querySelectorAll('.chat-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.dataset.q));
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  // 토글
  toggle.addEventListener('click', () => {
    win.classList.toggle('chat-hidden');
    toggle.classList.toggle('active');
    if (!win.classList.contains('chat-hidden')) input.focus();
  });
  closeBtn.addEventListener('click', () => {
    win.classList.add('chat-hidden');
    toggle.classList.remove('active');
  });

  // 메시지 추가
  function addMessage(text, sender) {
    const div = document.createElement('div');
    const isExpert = currentMode === 'expert';
    div.className = `chat-msg ${sender}${isExpert && sender === 'bot' ? ' expert' : ''}`;

    if (sender === 'bot') {
      const avatarCls = isExpert ? 'chat-avatar expert-avatar' : 'chat-avatar';
      const nameCls = isExpert ? 'chat-name expert-name' : 'chat-name';
      const botName = isExpert ? '세울 전문가<span class="expert-badge">Gemma4</span>' : '세울 상담사';
      const icon = isExpert
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>';
      div.innerHTML = `<div class="${avatarCls}">${icon}</div><div class="chat-content"><div class="${nameCls}">${botName}</div><div class="chat-bubble">${text}</div></div>`;
    } else {
      div.innerHTML = `<div class="chat-content"><div class="chat-bubble">${text}</div></div>`;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // 스트리밍용 빈 메시지 생성
  function addStreamingMessage() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot expert';
    div.innerHTML = `
      <div class="chat-avatar expert-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
      <div class="chat-content">
        <div class="chat-name expert-name">세울 전문가<span class="expert-badge">Gemma4</span></div>
        <div class="chat-bubble streaming-cursor"></div>
      </div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div.querySelector('.chat-bubble');
  }

  function addTyping() {
    const div = document.createElement('div');
    const isExpert = currentMode === 'expert';
    div.className = `chat-msg bot chat-typing${isExpert ? ' expert' : ''}`;
    const avatarCls = isExpert ? 'chat-avatar expert-avatar' : 'chat-avatar';
    const nameCls = isExpert ? 'chat-name expert-name' : 'chat-name';
    const botName = isExpert ? '세울 전문가' : '세울 상담사';
    const icon = isExpert
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>';
    div.innerHTML = `<div class="${avatarCls}">${icon}</div><div class="chat-content"><div class="${nameCls}">${botName}</div><div class="chat-bubble">답변 준비 중 <span class="dot-loader"><span></span><span></span><span></span></span></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // 일반 상담 (Claude)
  async function sendGeneralMessage(text) {
    const typing = addTyping();
    try {
      const res = await fetch(B + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      typing.remove();
      addMessage(data.reply ? data.reply.replace(/\n/g, '<br>') : '죄송합니다. 잠시 후 다시 시도해주세요.', 'bot');
    } catch (e) {
      typing.remove();
      addMessage('네트워크 오류가 발생했습니다.<br>잠시 후 다시 시도해주세요.', 'bot');
    }
  }

  // 전문가 상담 (Gemma4 스트리밍)
  async function sendExpertMessage(text) {
    const typing = addTyping();
    try {
      const res = await fetch(B + '/api/chat-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      // 비스트리밍 에러 응답 처리
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        typing.remove();
        addMessage(data.error || '전문가 서버에 연결할 수 없습니다.', 'bot');
        return;
      }

      // 스트리밍 시작 — 타이핑 제거, 스트리밍 버블 생성
      typing.remove();
      const bubble = addStreamingMessage();
      let fullText = '';

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            if (json.text) {
              fullText += json.text;
              bubble.innerHTML = formatText(fullText);
              messages.scrollTop = messages.scrollHeight;
            }
            if (json.error) {
              fullText += '\n\n[오류: ' + json.error + ']';
              bubble.innerHTML = formatText(fullText);
            }
          } catch (e) { /* skip */ }
        }
      }

      // 스트리밍 완료 — 커서 제거
      bubble.classList.remove('streaming-cursor');
      bubble.innerHTML = formatText(fullText || '응답을 받지 못했습니다.');
    } catch (e) {
      typing.remove();
      addMessage('AI 전문가 서버에 연결할 수 없습니다.<br>서버 상태를 확인해주세요.', 'bot');
    }
  }

  // 텍스트 포맷팅 (마크다운 간이 변환)
  function formatText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<strong style="font-size:14px;display:block;margin:8px 0 4px">$1</strong>')
      .replace(/^## (.+)$/gm, '<strong style="font-size:15px;display:block;margin:10px 0 4px;color:#0A0F1C">$1</strong>')
      .replace(/^- (.+)$/gm, '<span style="display:block;padding-left:12px">· $1</span>')
      .replace(/^\d+\. (.+)$/gm, function(match, p1, offset, str) {
        const num = match.match(/^(\d+)/)[1];
        return '<span style="display:block;padding-left:12px">' + num + '. ' + p1 + '</span>';
      })
      .replace(/\n/g, '<br>');
  }

  // 메시지 전송 통합
  async function sendMessage(text) {
    if (!text) text = input.value.trim();
    if (!text) return;
    input.value = '';

    if (quickArea) quickArea.style.display = 'none';
    addMessage(text, 'user');
    sendBtn.disabled = true;

    if (currentMode === 'expert') {
      await sendExpertMessage(text);
    } else {
      await sendGeneralMessage(text);
    }

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) sendMessage(); });

  // 초기 빠른질문 이벤트
  document.querySelectorAll('.chat-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
})();
