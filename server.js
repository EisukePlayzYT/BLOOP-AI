const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const MODEL = "openai/gpt-oss-120b";

app.use(express.json());

// API route
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

// Frontend HTML Route
app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Bloop AI Studio - Intelligent Assistant</title>
  
  <!-- Mobile & Search Engine Optimization (SEO) -->
  <meta name="description" content="Bloop AI Studio - Fast, sleek, and intelligent conversation workspace.">
  <meta name="theme-color" content="#0d1117">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta property="og:title" content="Bloop AI Studio">
  <meta property="og:description" content="Intelligent thinking, coding, and brainstorming assistant.">
  <meta property="og:type" content="website">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    :root {
      --bg-main: #0b0e14;
      --bg-sidebar: #0f131c;
      --bg-card: #151a26;
      --bg-card-hover: #1b2232;
      --bg-input: #121722;
      --border-color: #1e2638;
      --border-glow: #38bdf844;
      --text-primary: #f1f5f9;
      --text-secondary: #8b99ad;
      --text-muted: #57657a;
      --accent-blue: #38bdf8;
      --accent-cyan: #22d3ee;
      --sidebar-width: 270px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: var(--bg-main);
      color: var(--text-primary);
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      position: relative;
    }

    /* Mobile Backdrop Overlay */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(3px);
      z-index: 25;
      display: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .sidebar-overlay.active {
      display: block;
      opacity: 1;
    }

    /* Sidebar */
    aside {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background-color: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border-color);
      z-index: 30;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    aside.collapsed {
      margin-left: calc(-1 * var(--sidebar-width));
    }

    .sidebar-header {
      padding: 1.1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.1rem;
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-text h1 {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .brand-text span {
      font-size: 0.68rem;
      color: var(--accent-blue);
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.15rem;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 8px;
      transition: color 0.15s, background-color 0.15s;
    }

    .toggle-btn:hover {
      color: var(--text-primary);
      background-color: var(--bg-card);
    }

    /* New Chat Button */
    .new-chat-btn {
      margin: 0.25rem 1rem 0.85rem;
      padding: 0.75rem 1rem;
      background-color: #172030;
      border: 1px solid var(--border-color);
      border-radius: 24px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .new-chat-btn:hover {
      background-color: #1e293d;
      border-color: #2f3d56;
    }

    .sidebar-section-title {
      padding: 0.6rem 1.25rem 0.35rem;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-section-title .count-badge {
      background-color: #1a2233;
      color: var(--text-secondary);
      padding: 1px 7px;
      border-radius: 12px;
      font-size: 0.7rem;
    }

    /* History List */
    .chat-history {
      flex: 1;
      overflow-y: auto;
      padding: 0.25rem 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 0.86rem;
      gap: 0.6rem;
      transition: all 0.15s;
    }

    .history-item i.item-icon {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .history-item span {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .history-item:hover, .history-item.active {
      background-color: #161e2c;
      color: var(--text-primary);
    }

    .history-item.active i.item-icon {
      color: var(--accent-blue);
    }

    .delete-chat-btn {
      opacity: 0;
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 3px 5px;
      border-radius: 4px;
      transition: opacity 0.15s;
    }

    .history-item:hover .delete-chat-btn {
      opacity: 1;
    }

    /* User Profile Footer */
    .user-profile {
      padding: 0.85rem 1.1rem;
      background-color: #0d1119;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .profile-names {
      display: flex;
      flex-direction: column;
    }

    .profile-names .name {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .status-line {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: #22c55e;
      font-weight: 500;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: #22c55e;
      border-radius: 50%;
    }

    .profile-tools {
      display: flex;
      gap: 0.3rem;
    }

    .profile-tools button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 5px;
      font-size: 0.9rem;
      transition: color 0.15s;
    }

    .profile-tools button:hover {
      color: var(--text-primary);
    }

    /* Main Area */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      position: relative;
      background-color: var(--bg-main);
    }

    /* Top Breadcrumb Bar */
    .top-bar {
      height: 54px;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .top-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
    }

    .breadcrumbs .brand-crumb {
      font-weight: 700;
      color: var(--text-primary);
    }

    .breadcrumbs .crumb-sep {
      color: var(--text-muted);
    }

    .breadcrumbs .title-crumb {
      color: var(--text-secondary);
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .top-right {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .model-badge {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--accent-blue);
      background: #131d2b;
      border: 1px solid #1e314a;
      padding: 0.32rem 0.85rem;
      border-radius: 20px;
      letter-spacing: -0.2px;
    }

    .top-icon-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: color 0.15s;
    }

    .top-icon-btn:hover {
      color: #ef4444;
    }

    /* Chat Viewport */
    .messages-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1rem 7.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .messages-container {
      width: 100%;
      max-width: 760px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Center Hero State (from screenshot) */
    .empty-state {
      margin-top: 5vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.25rem;
      width: 100%;
    }

    .hero-badge-icon {
      width: 54px;
      height: 54px;
      background: linear-gradient(135deg, #1b263b, #152238);
      border: 1px solid #233552;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-blue);
      font-size: 1.45rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .hero-title {
      font-size: 2.1rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      color: var(--text-secondary);
      font-size: 0.96rem;
      max-width: 480px;
      line-height: 1.5;
    }

    /* Suggestion Prompt Cards */
    .prompt-cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
      width: 100%;
      max-width: 680px;
      margin-top: 1rem;
    }

    .prompt-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 1rem 1.15rem;
      text-align: left;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .prompt-card:hover {
      background-color: var(--bg-card-hover);
      border-color: #2b3952;
      transform: translateY(-2px);
    }

    .prompt-card-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .prompt-card-desc {
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    /* Message Rows */
    .message-row {
      display: flex;
      width: 100%;
      gap: 1rem;
      animation: fadeIn 0.3s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .bubble {
      padding: 0.85rem 1.25rem;
      border-radius: 18px;
      font-size: 0.94rem;
      line-height: 1.6;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .user .bubble {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      max-width: 78%;
      border-bottom-right-radius: 4px;
    }

    .assistant .bubble {
      background: transparent;
      color: var(--text-primary);
      max-width: 100%;
      padding-left: 0;
    }

    .typing-cursor::after {
      content: "▎";
      color: var(--accent-blue);
      animation: blink 0.8s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .error-bubble {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      color: #f87171;
    }

    /* Neon Pill Input Bar */
    .input-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.25rem;
      background: linear-gradient(180deg, rgba(11, 14, 20, 0) 0%, var(--bg-main) 45%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .input-box {
      width: 100%;
      max-width: 740px;
      background-color: var(--bg-input);
      border: 1.5px solid #1f364d;
      border-radius: 36px;
      padding: 0.55rem 0.85rem 0.55rem 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.03);
      transition: all 0.2s;
    }

    .input-box:focus-within {
      border-color: #38bdf8;
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.25);
    }

    .input-box textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 0.95rem;
      resize: none;
      max-height: 120px;
      line-height: 1.4;
      padding: 0.45rem 0;
    }

    .input-box textarea::placeholder {
      color: #5d6f88;
    }

    .send-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      background: #192a3e;
      border: 1px solid #284463;
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.15s;
    }

    .send-btn:hover:not(:disabled) {
      background: var(--accent-blue);
      color: #0b0e14;
    }

    .send-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .footnote {
      margin-top: 0.55rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
    }

    /* Responsive / Mobile SEO adjustments */
    @media (max-width: 768px) {
      aside {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        margin-left: 0 !important;
      }

      aside.mobile-open {
        transform: translateX(0);
      }

      .prompt-cards-grid {
        grid-template-columns: 1fr;
      }

      .hero-title {
        font-size: 1.8rem;
      }

      .messages-viewport {
        padding-bottom: 8.5rem;
      }

      .input-wrapper {
        padding: 0.85rem;
      }
    }
  </style>
</head>
<body>

  <!-- Backdrop overlay for mobile drawer -->
  <div class="sidebar-overlay" id="sidebarOverlay"></div>

  <!-- Left Sidebar -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <div class="brand-wrap">
        <div class="brand-icon">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <div class="brand-text">
          <h1>Bloop</h1>
          <span>AI STUDIO</span>
        </div>
      </div>
      <button class="toggle-btn" id="closeSidebarBtn" title="Close sidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>

    <button class="new-chat-btn" id="newChatBtn">
      <i class="fa-solid fa-plus"></i>
      <span>New conversation</span>
    </button>

    <div class="sidebar-section-title">
      <span>Recent</span>
      <span class="count-badge" id="chatCount">0</span>
    </div>

    <div class="chat-history" id="chatHistoryList"></div>

    <div class="user-profile">
      <div class="profile-info">
        <div class="avatar">G</div>
        <div class="profile-names">
          <span class="name">Guest</span>
          <div class="status-line">
            <div class="status-dot"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
      <div class="profile-tools">
        <button title="Settings"><i class="fa-solid fa-user-gear"></i></button>
        <button id="clearAllBtn" title="Clear all chats"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
      </div>
    </div>
  </aside>

  <!-- Main View Area -->
  <main>
    <div class="top-bar">
      <div class="top-left">
        <button class="toggle-btn" id="openSidebarBtn" title="Toggle Sidebar">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="breadcrumbs">
          <span class="brand-crumb">Bloop</span>
          <span class="crumb-sep">/</span>
          <span class="title-crumb" id="breadcrumbTitle">New conversation</span>
        </div>
      </div>
      <div class="top-right">
        <div class="model-badge">Bloop 2.0 Ultra</div>
        <button class="top-icon-btn" id="deleteCurrentBtn" title="Delete current conversation">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>

    <div class="messages-viewport" id="viewport">
      <div class="messages-container" id="messagesContainer">
        
        <!-- Empty State Hero matching screenshot -->
        <div class="empty-state" id="emptyState">
          <div class="hero-badge-icon">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h2 class="hero-title">Hello, Guest</h2>
          <p class="hero-subtitle">How can Bloop assist your thinking, coding, or brainstorming today?</p>

          <div class="prompt-cards-grid">
            <div class="prompt-card" onclick="sendPrompt('Explain quantum computing in simple everyday analogies.')">
              <span class="prompt-card-title">Explore ideas</span>
              <span class="prompt-card-desc">Explain quantum computing in simple everyday analogies.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Generate a Python function to debounce high-frequency events.')">
              <span class="prompt-card-title">Write clean code</span>
              <span class="prompt-card-desc">Generate a Python function to debounce high-frequency events.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Write a cinematic sci-fi intro set on an underwater station.')">
              <span class="prompt-card-title">Creative story</span>
              <span class="prompt-card-desc">Write a cinematic sci-fi intro set on an underwater station.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Who are you and what makes Bloop special?')">
              <span class="prompt-card-title">Ask anything</span>
              <span class="prompt-card-desc">Who are you and what makes Bloop special?</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Floating Input Form -->
    <div class="input-wrapper">
      <div class="input-box">
        <textarea id="promptInput" rows="1" placeholder="Message Bloop..."></textarea>
        <button id="sendBtn" class="send-btn" disabled>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </div>
      <div class="footnote">Bloop may produce inaccurate information. Always verify critical facts.</div>
    </div>
  </main>

  <script>
    // State management
    let chats = JSON.parse(localStorage.getItem("bloop_chats")) || [];
    let currentChatId = null;

    // Elements
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const openSidebarBtn = document.getElementById("openSidebarBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const messagesContainer = document.getElementById("messagesContainer");
    const emptyState = document.getElementById("emptyState");
    const promptInput = document.getElementById("promptInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatHistoryList = document.getElementById("chatHistoryList");
    const chatCount = document.getElementById("chatCount");
    const newChatBtn = document.getElementById("newChatBtn");
    const breadcrumbTitle = document.getElementById("breadcrumbTitle");
    const deleteCurrentBtn = document.getElementById("deleteCurrentBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const viewport = document.getElementById("viewport");

    // Toggle Sidebar Functionality (Desktop & Mobile)
    function toggleSidebar() {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar.classList.toggle("mobile-open");
        sidebarOverlay.classList.toggle("active");
      } else {
        sidebar.classList.toggle("collapsed");
      }
    }

    openSidebarBtn.addEventListener("click", toggleSidebar);
    closeSidebarBtn.addEventListener("click", toggleSidebar);
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      sidebarOverlay.classList.remove("active");
    });

    // Auto-resize input
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

    function sendPrompt(text) {
      promptInput.value = text;
      sendBtn.disabled = false;
      handleSend();
    }

    function createNewChat() {
      currentChatId = Date.now().toString();
      chats.unshift({ id: currentChatId, title: "New conversation", messages: [] });
      saveChats();
      renderChatHistory();
      renderActiveChat();
    }

    function saveChats() {
      localStorage.setItem("bloop_chats", JSON.stringify(chats));
      chatCount.textContent = chats.length;
    }

    function renderChatHistory() {
      chatHistoryList.innerHTML = "";
      chatCount.textContent = chats.length;

      chats.forEach(chat => {
        const item = document.createElement("div");
        item.className = "history-item " + (chat.id === currentChatId ? 'active' : '');
        
        const icon = document.createElement("i");
        icon.className = "fa-regular fa-message item-icon";
        item.appendChild(icon);

        const titleSpan = document.createElement("span");
        titleSpan.textContent = chat.title;
        item.appendChild(titleSpan);

        const delBtn = document.createElement("button");
        delBtn.className = "delete-chat-btn";
        delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          deleteChat(chat.id);
        };
        item.appendChild(delBtn);

        item.onclick = () => {
          currentChatId = chat.id;
          renderChatHistory();
          renderActiveChat();
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("mobile-open");
            sidebarOverlay.classList.remove("active");
          }
        };

        chatHistoryList.appendChild(item);
      });
    }

    function deleteChat(id) {
      chats = chats.filter(c => c.id !== id);
      if (currentChatId === id) {
        currentChatId = chats.length ? chats[0].id : null;
      }
      saveChats();
      renderChatHistory();
      renderActiveChat();
    }

    deleteCurrentBtn.onclick = () => {
      if (currentChatId) deleteChat(currentChatId);
    };

    clearAllBtn.onclick = () => {
      if (confirm("Delete all conversations?")) {
        chats = [];
        saveChats();
        createNewChat();
      }
    };

    function renderActiveChat() {
      messagesContainer.innerHTML = "";
      const currentChat = chats.find(c => c.id === currentChatId);

      if (!currentChat || currentChat.messages.length === 0) {
        breadcrumbTitle.textContent = "New conversation";
        messagesContainer.appendChild(emptyState);
        emptyState.style.display = "flex";
        return;
      }

      emptyState.style.display = "none";
      breadcrumbTitle.textContent = currentChat.title;
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

    function scrollBottom() {
      viewport.scrollTop = viewport.scrollHeight;
    }

    async function handleSend() {
      const text = promptInput.value.trim();
      if (!text) return;

      if (!currentChatId) createNewChat();
      const activeChat = chats.find(c => c.id === currentChatId);

      if (activeChat.messages.length === 0) {
        activeChat.title = text.length > 25 ? text.slice(0, 25) + "..." : text;
        breadcrumbTitle.textContent = activeChat.title;
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

    // Start
    if (chats.length > 0) {
      currentChatId = chats[0].id;
      renderChatHistory();
      renderActiveChat();
    } else {
      createNewChat();
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Bloop running on port ${PORT}`);
});
