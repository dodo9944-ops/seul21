/* (주)세울엔지니어링 AI 챗봇 */
(function() {
  // 챗봇 HTML 삽입
  const chatHTML = `
  <div id="seul-chatbot">
    <button id="chat-toggle" aria-label="AI 상담">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div id="chat-window" class="chat-hidden">
      <div id="chat-header">
        <div id="chat-header-info">
          <div id="chat-status"></div>
          <span>세울 AI 상담</span>
        </div>
        <button id="chat-close">&times;</button>
      </div>
      <div id="chat-messages">
        <div class="chat-msg bot">
          <div class="chat-bubble">안녕하세요! (주)세울엔지니어링 AI 상담사입니다.<br>재개발·재건축 관련 궁금한 점을 물어보세요.</div>
        </div>
      </div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="질문을 입력하세요..." maxlength="500">
        <button id="chat-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', chatHTML);

  // 스타일 삽입
  const style = document.createElement('style');
  style.textContent = `
    #seul-chatbot { position:fixed; bottom:24px; right:24px; z-index:99999; font-family:'Noto Sans KR',sans-serif; }
    #chat-toggle {
      width:60px; height:60px; border-radius:50%; border:none;
      background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff;
      cursor:pointer; box-shadow:0 4px 20px rgba(37,99,235,0.4);
      display:flex; align-items:center; justify-content:center;
      transition:transform .2s, box-shadow .2s;
    }
    #chat-toggle:hover { transform:scale(1.1); box-shadow:0 6px 28px rgba(37,99,235,0.5); }
    #chat-window {
      position:absolute; bottom:76px; right:0;
      width:380px; max-height:520px; border-radius:16px;
      background:#fff; box-shadow:0 8px 40px rgba(0,0,0,0.15);
      display:flex; flex-direction:column; overflow:hidden;
      transition:opacity .3s, transform .3s;
    }
    #chat-window.chat-hidden { opacity:0; transform:translateY(20px); pointer-events:none; }
    #chat-header {
      background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff;
      padding:16px 20px; display:flex; align-items:center; justify-content:space-between;
    }
    #chat-header-info { display:flex; align-items:center; gap:10px; font-weight:600; font-size:15px; }
    #chat-status { width:10px; height:10px; background:#4ade80; border-radius:50%; }
    #chat-close { background:none; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1; }
    #chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; max-height:360px; }
    .chat-msg { display:flex; }
    .chat-msg.bot { justify-content:flex-start; }
    .chat-msg.user { justify-content:flex-end; }
    .chat-bubble {
      max-width:85%; padding:12px 16px; border-radius:16px;
      font-size:14px; line-height:1.6; word-break:keep-all;
    }
    .chat-msg.bot .chat-bubble { background:#f1f5f9; color:#1e293b; border-bottom-left-radius:4px; }
    .chat-msg.user .chat-bubble { background:#2563eb; color:#fff; border-bottom-right-radius:4px; }
    .chat-typing .chat-bubble::after {
      content:''; display:inline-block; width:4px; height:4px; background:#94a3b8;
      border-radius:50%; margin-left:4px;
      animation:typing .6s infinite alternate;
    }
    @keyframes typing { to { opacity:.3; } }
    #chat-input-area {
      padding:12px 16px; border-top:1px solid #e2e8f0;
      display:flex; gap:8px; align-items:center;
    }
    #chat-input {
      flex:1; border:1px solid #e2e8f0; border-radius:24px;
      padding:10px 16px; font-size:14px; outline:none;
      font-family:'Noto Sans KR',sans-serif;
    }
    #chat-input:focus { border-color:#2563eb; }
    #chat-send {
      width:40px; height:40px; border-radius:50%; border:none;
      background:#2563eb; color:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:background .2s;
    }
    #chat-send:hover { background:#1d4ed8; }
    #chat-send:disabled { background:#94a3b8; cursor:not-allowed; }
    @media(max-width:480px) {
      #chat-window { width:calc(100vw - 32px); right:-8px; bottom:70px; max-height:70vh; }
      #seul-chatbot { bottom:16px; right:16px; }
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

  toggle.addEventListener('click', () => win.classList.toggle('chat-hidden'));
  closeBtn.addEventListener('click', () => win.classList.add('chat-hidden'));

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
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

    const typing = addMessage('답변을 준비하고 있습니다...', 'bot');
    typing.classList.add('chat-typing');

    try {
      const res = await fetch('/api/chat', {
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
      addMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
})();
