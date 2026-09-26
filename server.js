const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Put your Groq API Key here (or set it in your host environment variables)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const MODEL = "openai/gpt-oss-120b";

app.use(express.json());

// 1. Backend Chat Route (Keeps the API key secret)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are Bloop, a custom AI assistant. Your name is strictly Bloop. Never refer to yourself as ChatGPT, OpenAI, or an assistant trained by OpenAI. If asked who you are, what your name is, or who created you, always state that you are Bloop."
          },
          ...(messages || [])
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message || 'Server error' } });
  }
});

// 2. Frontend HTML Route (Serves the Bloop UI)
app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bloop</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --bg-main: #13171f;
      --bg-sidebar: #1b202c;
      --bg-card: #222938;
      --bg-hover: #2d3748;
      --border-color: #2e384d;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --accent-blue: #38bdf8;
      --accent-gradient: linear-gradient(135deg, #38bdf8, #818cf8);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg-main); color: var(--text-primary); display: flex; height: 100vh; overflow: hidden; }
    aside { width: 260px; background-color: var(--bg-sidebar); display: flex; flex-direction: column; border-right: 1px solid var(--border-color); z-index: 20; }
    .sidebar-header { padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; font-size: 1.2rem; }
    .brand-sparkle { background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.35rem; }
    .new-chat-btn { margin: 0 1rem 1rem 1rem; padding: 0.75rem 1rem; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 28px; color: var(--text-primary); display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .new-chat-btn:hover { background-color: var(--bg-hover); border-color: #475569; }
    .sidebar-section-title { padding: 0.5rem 1.25rem 0.25rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); font-weight: 600; }
    .chat-history { flex: 1; overflow-y: auto; padding: 0 0.5rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .history-item { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.8rem; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.88rem; transition: all 0.15s; }
    .history-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 175px; }
    .history-item:hover, .history-item.active { background-color: var(--bg-hover); color: var(--text-primary); }
    .delete-chat-btn { opacity: 0; background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 4px; }
    .history-item:hover .delete-chat-btn { opacity: 1; }
    .user-profile { padding: 0.85rem 1.25rem; background-color: var(--bg-sidebar); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; }
    .profile-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #0f172a; }
    .profile-names { display: flex; flex-direction: column; font-size: 0.82rem; }
    .profile-names .name { font-weight: 600; color: var(--text-primary); }
    .profile-names .tier { color: var(--text-secondary); font-size: 0.75rem; }
    main { flex: 1; display: flex; flex-direction: column; position: relative; background-color: var(--bg-main); }
    .top-bar { height: 56px; padding: 0 1.5rem; display: flex; align-items: center; justify-content: flex-end; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    .model-badge { font-size: 0.82rem; font-weight: 600; color: var(--accent-blue); background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); padding: 0.35rem 0.85rem; border-radius: 20px; display: flex; align-items: center; gap: 0.45rem; }
    .messages-viewport { flex: 1; overflow-y: auto; padding: 2rem 1rem 7rem; display: flex; flex-direction: column; align-items: center; }
    .messages-container { width: 100%; max-width: 780px; display: flex; flex-direction: column; gap: 1.5rem; }
    .empty-state { margin-top: 15vh; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state h2 { font-size: 2.2rem; font-weight: 600; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .message-row { display: flex; width: 100%; gap: 1rem; animation: fadeIn 0.3s ease forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .message-row.user { justify-content: flex-end; }
    .bubble { padding: 0.85rem 1.25rem; border-radius: 18px; font-size: 0.95rem; line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
    .user .bubble { background-color: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); max-width: 75%; border-bottom-right-radius: 4px; }
    .assistant .bubble { background: transparent; color: var(--text-primary); max-width: 100%; padding-left: 0; }
    .typing-cursor::after { content: "▎"; color: var(--accent-blue); animation: blink 0.8s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .error-bubble { background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #f87171; }
    .input-wrapper { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem; background: linear-gradient(180deg, rgba(19, 23, 31, 0) 0%, var(--bg-main) 40%); display: flex; flex-direction: column; align-items: center; }
    .input-box { width: 100%; max-width: 780px; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 32px; padding: 0.6rem 1rem 0.6rem 1.4rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35); transition: all 0.2s; }
    .input-box:focus-within { border-color: #475569; box-shadow: 0 8px 32px rgba(56, 189, 248, 0.08); }
    .input-box textarea { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.95rem; resize: none; max-height: 120px; line-height: 1.4; padding: 0.4rem 0; }
    .send-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--accent-gradient); color: #0f172a; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
    .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .footnote { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); }
  </style>
</head>
<body>
  <aside>
    <div class="sidebar-header">
      <div class="brand">
        <i class="fa-solid fa-wand-magic-sparkles brand-sparkle"></i>
        <span>Bloop</span>
      </div>
    </div>
    <button class="new-chat-btn" id="newChatBtn">
      <i class="fa-solid fa-plus"></i>
      <span>New chat</span>
    </button>
    <div class="sidebar-section-title">Recent Chats</div>
    <div class="chat-history" id="chatHistoryList"></div>
    <div class="user-profile">
      <div class="profile-info">
        <div class="avatar">B</div>
        <div class="profile-names">
          <span class="name">User</span>
          <span class="tier">Bloop Pro</span>
        </div>
      </div>
    </div>
  </aside>

  <main>
    <div class="top-bar">
      <div class="model-badge">
        <i class="fa-solid fa-sparkles"></i>
        <span>Bloop 2.0 Ultra</span>
      </div>
    </div>
    <div class="messages-viewport" id="viewport">
      <div class="messages-container" id="messagesContainer">
        <div class="empty-state" id="emptyState">
          <h2>How can I help you today?</h2>
        </div>
      </div>
    </div>
    <div class="input-wrapper">
      <div class="input-box">
        <textarea id="promptInput" rows="1" placeholder="Ask Bloop..."></textarea>
        <button id="sendBtn" class="send-btn" disabled>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>
      <div class="footnote">Bloop can make mistakes. Verify critical facts.</div>
    </div>
  </main>

  <script>
    let chats = JSON.parse(localStorage.getItem("bloop_chats")) || [];
    let currentChatId = null;

    const messagesContainer = document.getElementById("messagesContainer");
    const emptyState = document.getElementById("emptyState");
    const promptInput = document.getElementById("promptInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatHistoryList = document.getElementById("chatHistoryList");
    const newChatBtn = document.getElementById("newChatBtn");
    const viewport = document.getElementById("viewport");

    promptInput.addEventListener("input", () => {
      promptInput.style.height = "auto";
      promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + "px";
      sendBtn.disabled = !promptInput.value.trim();
    });

    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (promptInput.value.trim()) handleSend();
      }
    });

    sendBtn.addEventListener("click", handleSend);

    function createNewChat() {
      currentChatId = Date.now().toString();
      chats.unshift({ id: currentChatId, title: "New chat", messages: [] });
      saveChats();
      renderChatHistory();
      renderActiveChat();
    }

    function saveChats() { localStorage.setItem("bloop_chats", JSON.stringify(chats)); }

    function renderChatHistory() {
      chatHistoryList.innerHTML = "";
      chats.forEach(chat => {
        const item = document.createElement("div");
        item.className = "history-item " + (chat.id === currentChatId ? 'active' : '');
        const titleSpan = document.createElement("span");
        titleSpan.textContent = chat.title;
        item.appendChild(titleSpan);

        const delBtn = document.createElement("button");
        delBtn.className = "delete-chat-btn";
        delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        delBtn.onclick = (e) => { e.stopPropagation(); deleteChat(chat.id); };
        item.appendChild(delBtn);

        item.onclick = () => { currentChatId = chat.id; renderChatHistory(); renderActiveChat(); };
        chatHistoryList.appendChild(item);
      });
    }

    function deleteChat(id) {
      chats = chats.filter(c => c.id !== id);
      currentChatId = chats.length ? chats[0].id : null;
      saveChats();
      renderChatHistory();
      renderActiveChat();
    }

    function renderActiveChat() {
      messagesContainer.innerHTML = "";
      const currentChat = chats.find(c => c.id === currentChatId);
      if (!currentChat || currentChat.messages.length === 0) {
        messagesContainer.appendChild(emptyState);
        emptyState.style.display = "flex";
        return;
      }
      emptyState.style.display = "none";
      currentChat.messages.forEach(msg => appendBubble(msg.role, msg.content));
      scrollBottom();
    }

    function appendBubble(role, content, isError = false) {
      const row = document.createElement("div");
      row.className = "message-row " + role;
      const bubble = document.createElement("div");
      bubble.className = "bubble " + (isError ? 'error-bubble' : '');
      bubble.textContent = content;
      row.appendChild(bubble);
      messagesContainer.appendChild(row);
      scrollBottom();
      return bubble;
    }

    async function streamText(element, fullText) {
      element.textContent = "";
      element.classList.add("typing-cursor");
      const words = fullText.split(/(\\s+)/);
      for (let i = 0; i < words.length; i++) {
        element.textContent += words[i];
        scrollBottom();
        await new Promise(r => setTimeout(r, 18));
      }
      element.classList.remove("typing-cursor");
    }

    function scrollBottom() { viewport.scrollTop = viewport.scrollHeight; }

    async function handleSend() {
      const text = promptInput.value.trim();
      if (!text) return;
      if (!currentChatId) createNewChat();

      const activeChat = chats.find(c => c.id === currentChatId);
      if (activeChat.messages.length === 0) {
        activeChat.title = text.slice(0, 26);
        emptyState.style.display = "none";
        renderChatHistory();
      }

      activeChat.messages.push({ role: "user", content: text });
      appendBubble("user", text);
      promptInput.value = "";
      promptInput.style.height = "auto";
      sendBtn.disabled = true;

      const assistantBubble = appendBubble("assistant", "Thinking...");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: activeChat.messages })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Status " + response.status);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        await streamText(assistantBubble, reply);
        activeChat.messages.push({ role: "assistant", content: reply });
        saveChats();
      } catch (err) {
        assistantBubble.classList.remove("typing-cursor");
        assistantBubble.classList.add("error-bubble");
        assistantBubble.textContent = "Error: " + err.message;
      } finally {
        sendBtn.disabled = false;
        promptInput.focus();
        scrollBottom();
      }
    }

    newChatBtn.onclick = createNewChat;
    if (chats.length > 0) { currentChatId = chats[0].id; renderChatHistory(); renderActiveChat(); }
    else { createNewChat(); }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Bloop running on port ${PORT}`);
});
