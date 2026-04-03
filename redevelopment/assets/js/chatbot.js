/* ============================================================
   세울엔지니어링 스마트 상담 챗봇
   — 다크네이비 + 골드 프리미엄 디자인
   — common.js에서 자동 로드, 모든 페이지 적용
   ============================================================ */
(function() {
  const B = location.pathname.includes('/pages/') || location.pathname.includes('/admin/') ? '..' : '.';

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
            <span id="chat-title">세울 스마트 상담</span>
            <span id="chat-subtitle">정비사업 전문 24시 상담</span>
          </div>
        </div>
        <button id="chat-close" aria-label="닫기">&times;</button>
      </div>
      <div id="chat-messages">
        <div class="chat-msg bot">
          <div class="chat-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          </div>
          <div class="chat-content">
            <div class="chat-name">세울 상담사</div>
            <div class="chat-bubble">안녕하세요, <strong>(주)세울엔지니어링</strong>입니다.<br>재개발·재건축 관련 궁금한 점을 편하게 물어보세요.</div>
          </div>
        </div>
      </div>
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
      <div id="chat-footer">© (주)세울엔지니어링 · 스마트 상담 시스템</div>
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
      <span id="chat-toggle-label">상담</span>
    </button>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const style = document.createElement('style');
  style.textContent = `
    #seul-chatbot {
      position:fixed; bottom:28px; right:28px; z-index:99999;
      font-family:'Noto Sans KR',-apple-system,sans-serif;
    }

    /* ── 토글 버튼 ── */
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

    /* ── 채팅 윈도우 ── */
    #chat-window {
      position:absolute; bottom:68px; right:0;
      width:400px; height:580px; border-radius:20px;
      background:#fff;
      box-shadow: 0 16px 56px rgba(10,15,28,0.22), 0 0 0 1px rgba(10,15,28,0.05);
      display:flex; flex-direction:column; overflow:hidden;
      transition: opacity .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1);
    }
    #chat-window.chat-hidden {
      opacity:0; transform:translateY(12px) scale(0.96);
      pointer-events:none;
    }

    /* ── 헤더 ── */
    #chat-header {
      background: linear-gradient(135deg, #0A0F1C 0%, #142644 100%);
      padding:18px 20px; display:flex; align-items:center; justify-content:space-between;
      position:relative;
    }
    #chat-header::after {
      content:''; position:absolute; bottom:0; left:20px; right:20px;
      height:1px; background:linear-gradient(90deg, transparent, rgba(195,165,105,0.4), transparent);
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

    /* ── 메시지 영역 ── */
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
    .chat-msg.user .chat-avatar { display:none; }
    .chat-content { display:flex; flex-direction:column; gap:3px; max-width:82%; }
    .chat-name { font-size:11px; color:#888; font-weight:500; padding-left:2px; }
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
    .chat-typing .dot-loader span:nth-child(2) { animation-delay:.2s; }
    .chat-typing .dot-loader span:nth-child(3) { animation-delay:.4s; }
    @keyframes dotPulse { 0%,80%,100%{opacity:.25;transform:scale(.7)} 40%{opacity:1;transform:scale(1.1)} }

    /* ── 빠른 질문 ── */
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

    /* ── 입력 영역 ── */
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
    #chat-input::placeholder { color:#bbb; }
    #chat-send {
      width:42px; height:42px; border-radius:50%; border:none;
      background:linear-gradient(135deg,#0A0F1C,#1a3055);
      color:#C3A569; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    #chat-send:hover { background:linear-gradient(135deg,#142644,#1e3a5f); transform:scale(1.05); }
    #chat-send:disabled { opacity:.35; cursor:not-allowed; transform:none; }

    /* ── 푸터 ── */
    #chat-footer {
      padding:8px 16px; text-align:center;
      font-size:10px; color:#bbb; background:#fafafa;
      border-top:1px solid #f0f0f0; letter-spacing:-0.2px;
    }

    /* ── 모바일 ── */
    @media(max-width:480px) {
      #seul-chatbot { bottom:16px; right:16px; }
      #chat-toggle { height:48px; padding:0 16px 0 14px; }
      #chat-toggle.active { width:48px; }
      #chat-window {
        width:calc(100vw - 32px); height:calc(100vh - 100px);
        right:-8px; bottom:64px; border-radius:16px;
      }
      #chat-quick { display:none; }
    }
  `;
  document.head.appendChild(style);

  // 동작
  const toggle = document.getElementById('chat-toggle');
  const win = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');
  const quickArea = document.getElementById('chat-quick');

  toggle.addEventListener('click', () => {
    win.classList.toggle('chat-hidden');
    toggle.classList.toggle('active');
    if (!win.classList.contains('chat-hidden')) input.focus();
  });
  closeBtn.addEventListener('click', () => {
    win.classList.add('chat-hidden');
    toggle.classList.remove('active');
  });

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    if (sender === 'bot') {
      div.innerHTML = `<div class="chat-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg></div><div class="chat-content"><div class="chat-name">세울 상담사</div><div class="chat-bubble">${text}</div></div>`;
    } else {
      div.innerHTML = `<div class="chat-content"><div class="chat-bubble">${text}</div></div>`;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.innerHTML = `<div class="chat-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg></div><div class="chat-content"><div class="chat-name">세울 상담사</div><div class="chat-bubble">답변 준비 중 <span class="dot-loader"><span></span><span></span><span></span></span></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessage(text) {
    if (!text) text = input.value.trim();
    if (!text) return;
    input.value = '';

    // 빠른 질문 숨기기
    if (quickArea) quickArea.style.display = 'none';

    addMessage(text, 'user');
    sendBtn.disabled = true;

    const typing = addTyping();

    try {
      const res = await fetch(B + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      typing.remove();

      if (data.reply) {
        addMessage(data.reply.replace(/\n/g, '<br>'), 'bot');
      } else {
        addMessage('죄송합니다. 잠시 후 다시 시도해주세요.', 'bot');
      }
    } catch (e) {
      typing.remove();
      addMessage('네트워크 오류가 발생했습니다.<br>잠시 후 다시 시도해주세요.', 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) sendMessage(); });

  // 빠른 질문 버튼
  document.querySelectorAll('.chat-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
})();
