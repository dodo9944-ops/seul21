/* ============================================================
   세울엔지니어링 AI 상담 챗봇
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
          <div id="chat-logo">S</div>
          <div id="chat-header-text">
            <span id="chat-title">세울 AI 상담</span>
            <span id="chat-subtitle">정비사업 전문 상담</span>
          </div>
        </div>
        <button id="chat-close" aria-label="닫기">&times;</button>
      </div>
      <div id="chat-messages">
        <div class="chat-msg bot">
          <div class="chat-avatar">S</div>
          <div class="chat-bubble">안녕하세요, <strong>(주)세울엔지니어링</strong> AI 상담사입니다.<br>재개발·재건축 관련 궁금한 점을 편하게 물어보세요.</div>
        </div>
      </div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="궁금한 점을 입력하세요..." maxlength="500">
        <button id="chat-send" aria-label="전송">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="chat-footer">Powered by Claude AI · (주)세울엔지니어링</div>
    </div>
    <button id="chat-toggle" aria-label="AI 상담">
      <div id="chat-toggle-icon">
        <svg id="chat-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <svg id="chat-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:none">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
      <div id="chat-toggle-badge">AI</div>
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
      width:64px; height:64px; border-radius:50%; border:none;
      background: linear-gradient(145deg, #0A0F1C 0%, #142644 50%, #1a3055 100%);
      color:#C3A569; cursor:pointer;
      box-shadow: 0 4px 24px rgba(10,15,28,0.5), 0 0 0 3px rgba(195,165,105,0.15);
      display:flex; align-items:center; justify-content:center;
      position:relative; transition: all .3s ease;
    }
    #chat-toggle:hover {
      transform:scale(1.08);
      box-shadow: 0 6px 32px rgba(10,15,28,0.6), 0 0 0 4px rgba(195,165,105,0.25);
    }
    #chat-toggle-badge {
      position:absolute; top:-2px; right:-2px;
      background:#C3A569; color:#0A0F1C;
      font-size:10px; font-weight:800; padding:2px 6px;
      border-radius:10px; letter-spacing:0.5px;
    }
    #chat-toggle.active #chat-icon-open { display:none; }
    #chat-toggle.active #chat-icon-close { display:block; }
    #chat-toggle.active #chat-toggle-badge { display:none; }

    /* ── 채팅 윈도우 ── */
    #chat-window {
      position:absolute; bottom:80px; right:0;
      width:400px; height:560px; border-radius:20px;
      background:#fff;
      box-shadow: 0 12px 48px rgba(10,15,28,0.2), 0 0 0 1px rgba(10,15,28,0.06);
      display:flex; flex-direction:column; overflow:hidden;
      transition: opacity .35s ease, transform .35s ease;
    }
    #chat-window.chat-hidden {
      opacity:0; transform:translateY(16px) scale(0.97);
      pointer-events:none;
    }

    /* ── 헤더 ── */
    #chat-header {
      background: linear-gradient(135deg, #0A0F1C 0%, #142644 100%);
      padding:20px 20px 16px; display:flex; align-items:center; justify-content:space-between;
      border-bottom:2px solid rgba(195,165,105,0.3);
    }
    #chat-header-left { display:flex; align-items:center; gap:12px; }
    #chat-logo {
      width:40px; height:40px; border-radius:12px;
      background: linear-gradient(135deg, #C3A569, #D4B87A);
      color:#0A0F1C; font-size:18px; font-weight:900;
      display:flex; align-items:center; justify-content:center;
      letter-spacing:-1px;
    }
    #chat-header-text { display:flex; flex-direction:column; }
    #chat-title { color:#fff; font-size:15px; font-weight:700; }
    #chat-subtitle { color:rgba(195,165,105,0.8); font-size:11px; font-weight:500; margin-top:1px; }
    #chat-close {
      background:none; border:none; color:rgba(255,255,255,0.5);
      font-size:28px; cursor:pointer; line-height:1; padding:0 4px;
      transition:color .2s;
    }
    #chat-close:hover { color:#fff; }

    /* ── 메시지 영역 ── */
    #chat-messages {
      flex:1; overflow-y:auto; padding:20px 16px;
      display:flex; flex-direction:column; gap:16px;
      background:#f8f9fb;
    }
    #chat-messages::-webkit-scrollbar { width:4px; }
    #chat-messages::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }

    .chat-msg { display:flex; gap:8px; align-items:flex-start; }
    .chat-msg.bot { justify-content:flex-start; }
    .chat-msg.user { justify-content:flex-end; }
    .chat-avatar {
      width:32px; height:32px; border-radius:10px; flex-shrink:0;
      background:linear-gradient(135deg,#0A0F1C,#142644);
      color:#C3A569; font-size:13px; font-weight:800;
      display:flex; align-items:center; justify-content:center;
    }
    .chat-msg.user .chat-avatar { display:none; }

    .chat-bubble {
      max-width:80%; padding:12px 16px; font-size:13.5px; line-height:1.7;
      word-break:keep-all;
    }
    .chat-msg.bot .chat-bubble {
      background:#fff; color:#1A1A1A;
      border-radius:4px 16px 16px 16px;
      box-shadow:0 1px 4px rgba(0,0,0,0.06);
      border:1px solid #e5e7eb;
    }
    .chat-msg.user .chat-bubble {
      background: linear-gradient(135deg, #0A0F1C, #142644);
      color:#fff; border-radius:16px 4px 16px 16px;
    }

    .chat-typing .chat-bubble {
      color:#888;
    }
    .chat-typing .dot-loader { display:inline-flex; gap:4px; margin-left:4px; }
    .chat-typing .dot-loader span {
      width:5px; height:5px; background:#C3A569; border-radius:50%;
      animation:dotPulse .8s infinite ease-in-out;
    }
    .chat-typing .dot-loader span:nth-child(2) { animation-delay:.15s; }
    .chat-typing .dot-loader span:nth-child(3) { animation-delay:.3s; }
    @keyframes dotPulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }

    /* ── 입력 영역 ── */
    #chat-input-area {
      padding:12px 16px; background:#fff;
      border-top:1px solid #e5e7eb;
      display:flex; gap:8px; align-items:center;
    }
    #chat-input {
      flex:1; border:1.5px solid #e5e7eb; border-radius:12px;
      padding:11px 16px; font-size:13.5px; outline:none;
      font-family:'Noto Sans KR',sans-serif;
      background:#f8f9fb; transition:border-color .2s, background .2s;
    }
    #chat-input:focus { border-color:#C3A569; background:#fff; }
    #chat-input::placeholder { color:#aaa; }
    #chat-send {
      width:42px; height:42px; border-radius:12px; border:none;
      background:linear-gradient(135deg,#0A0F1C,#142644);
      color:#C3A569; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s;
    }
    #chat-send:hover { background:linear-gradient(135deg,#142644,#1a3055); }
    #chat-send:disabled { opacity:.4; cursor:not-allowed; }

    /* ── 푸터 ── */
    #chat-footer {
      padding:8px 16px; text-align:center;
      font-size:10px; color:#aaa; background:#fff;
      border-top:1px solid #f0f0f0;
    }

    /* ── 모바일 ── */
    @media(max-width:480px) {
      #seul-chatbot { bottom:16px; right:16px; }
      #chat-toggle { width:56px; height:56px; }
      #chat-window {
        width:calc(100vw - 32px); height:calc(100vh - 120px);
        right:-8px; bottom:72px; border-radius:16px;
      }
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
      div.innerHTML = `<div class="chat-avatar">S</div><div class="chat-bubble">${text}</div>`;
    } else {
      div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.innerHTML = `<div class="chat-avatar">S</div><div class="chat-bubble">답변 준비 중 <span class="dot-loader"><span></span><span></span><span></span></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
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

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) sendMessage(); });
})();
