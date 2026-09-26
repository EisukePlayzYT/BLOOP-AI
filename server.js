const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Uses Vercel environment variable or fallback key
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const MODEL = "openai/gpt-oss-120b";

app.use(express.json({ limit: '50mb' }));

// Backend API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(401).json({
        error: { message: "GROQ_API_KEY is missing. Please set it in Vercel Environment Variables." }
      });
    }

    const { messages } = req.body;

    const sanitizedMessages = (messages || []).map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : (m.text || '')
    }));

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
            content: "You are Bloop, a custom AI assistant. Your name is strictly Bloop. Never refer to yourself as ChatGPT, OpenAI, or an assistant trained by OpenAI. If asked who you are, what your name is, or who created you, always state that you are Bloop. If the user attaches an image or video reference, acknowledge their referenced file thoughtfully."
          },
          ...sanitizedMessages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: { message: data.error?.message || `Groq API Error (${response.status})` }
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message || 'Internal server error' } });
  }
});

// Frontend HTML Route
app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content">
  <title>Bloop AI Studio</title>
  
  <meta name="description" content="Bloop AI Studio - Fast, sleek, and intelligent conversation workspace.">
  <meta name="theme-color" content="#0b0e14">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="format-detection" content="telephone=no">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    :root {
      --bg-main: #0b0e14;
      --bg-sidebar: #0f131c;
      --bg-card: #151a26;
      --bg-card-hover: #1b2232;
      --bg-input: #121722;
      --border-color: #1e2638;
      --text-primary: #f1f5f9;
      --text-secondary: #8b99ad;
      --text-muted: #57657a;
      --accent-blue: #38bdf8;
      --sidebar-width: 270px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    html, body {
      width: 100%;
      height: 100dvh;
      min-height: 100dvh;
      overflow: hidden;
      background-color: var(--bg-main);
      color: var(--text-primary);
    }

    body {
      display: flex;
      position: relative;
    }

    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 40;
      display: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .sidebar-overlay.active {
      display: block;
      opacity: 1;
    }

    aside {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100%;
      background-color: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border-color);
      z-index: 50;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    aside.desktop-collapsed {
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
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

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

    .chat-history {
      flex: 1;
      overflow-y: auto;
      padding: 0.25rem 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      -webkit-overflow-scrolling: touch;
    }

    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.7rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 0.86rem;
      gap: 0.6rem;
    }

    .history-item span {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .history-item.active {
      background-color: #161e2c;
      color: var(--text-primary);
    }

    .delete-chat-btn {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

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

    .profile-names .name {
      font-size: 0.84rem;
      font-weight: 600;
    }

    .status-line {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: #22c55e;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: #22c55e;
      border-radius: 50%;
    }

    .profile-tools button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px;
      font-size: 0.95rem;
      cursor: pointer;
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100dvh;
      overflow: hidden;
      position: relative;
      background-color: var(--bg-main);
    }

    .top-bar {
      height: 54px;
      min-height: 54px;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      z-index: 10;
    }

    .top-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
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
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .top-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .model-badge {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--accent-blue);
      background: #131d2b;
      border: 1px solid #1e314a;
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
    }

    .top-icon-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.95rem;
      padding: 6px;
      cursor: pointer;
    }

    .messages-viewport {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1rem 8rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-overflow-scrolling: touch;
    }

    .messages-container {
      width: 100%;
      max-width: 760px;
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
    }

    .empty-state {
      margin-top: 3vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.1rem;
      width: 100%;
    }

    .hero-badge-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #1b263b, #152238);
      border: 1px solid #233552;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-blue);
      font-size: 1.35rem;
    }

    .hero-title {
      font-size: 2.1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      color: var(--text-secondary);
      font-size: 0.94rem;
      max-width: 480px;
      line-height: 1.5;
    }

    .prompt-cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      width: 100%;
      max-width: 680px;
      margin-top: 0.5rem;
    }

    .prompt-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      text-align: left;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      transition: background-color 0.15s;
    }

    .prompt-card-title {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .prompt-card-desc {
      font-size: 0.77rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .message-row {
      display: flex;
      width: 100%;
      gap: 1rem;
      animation: fadeIn 0.25s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-row.user {
      justify-content: flex-end;
    }

    .bubble {
      padding: 0.8rem 1.15rem;
      border-radius: 18px;
      font-size: 0.93rem;
      line-height: 1.6;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .user .bubble {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      max-width: 82%;
      border-bottom-right-radius: 4px;
    }

    .assistant .bubble {
      background: transparent;
      color: var(--text-primary);
      max-width: 100%;
      padding-left: 0;
    }

    .attachment-preview-chat {
      max-width: 100%;
      max-height: 220px;
      border-radius: 10px;
      margin-bottom: 0.5rem;
      border: 1px solid var(--border-color);
      display: block;
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

    .input-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.75rem 1rem 1rem;
      background: linear-gradient(180deg, rgba(11, 14, 20, 0) 0%, var(--bg-main) 45%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 20;
    }

    .attachment-strip {
      width: 100%;
      max-width: 740px;
      display: none;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.45rem;
      padding: 0 0.5rem;
    }

    .attachment-badge {
      position: relative;
      display: inline-flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
      color: var(--text-primary);
      gap: 0.5rem;
    }

    .attachment-badge img, .attachment-badge video {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 6px;
    }

    .remove-attachment-btn {
      background: #ef4444;
      border: none;
      color: white;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-box {
      width: 100%;
      max-width: 740px;
      background-color: var(--bg-input);
      border: 1.5px solid #1f364d;
      border-radius: 36px;
      padding: 0.45rem 0.65rem 0.45rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .input-box:focus-within {
      border-color: #38bdf8;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
    }

    .attach-btn {
      width: 34px;
      height: 34px;
      min-width: 34px;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: color 0.15s;
    }

    .attach-btn:hover {
      color: var(--accent-blue);
    }

    .input-box textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 16px;
      resize: none;
      max-height: 110px;
      line-height: 1.4;
      padding: 0.4rem 0;
    }

    .input-box textarea::placeholder {
      color: #5d6f88;
    }

    .send-btn {
      width: 36px;
      height: 36px;
      min-width: 36px;
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

    .send-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .send-btn.stop-state {
      background: #7f1d1d;
      border-color: #ef4444;
      color: #ffffff;
      opacity: 1 !important;
      cursor: pointer !important;
    }

    .footnote {
      margin-top: 0.45rem;
      font-size: 0.72rem;
      color: var(--text-muted);
      text-align: center;
    }

    body.is-mobile aside {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      margin-left: 0 !important;
      box-shadow: 6px 0 25px rgba(0, 0, 0, 0.6);
    }

    body.is-mobile aside.mobile-open {
      transform: translateX(0);
    }

    body.is-mobile .prompt-cards-grid {
      grid-template-columns: 1fr;
    }

    body.is-mobile .hero-title {
      font-size: 1.7rem;
    }

    body.is-mobile .hero-subtitle {
      font-size: 0.88rem;
      padding: 0 1rem;
    }

    body.is-mobile .messages-viewport {
      padding-bottom: 7.5rem;
    }

    body.is-mobile .delete-chat-btn {
      opacity: 1;
    }

    body.is-mobile .input-wrapper {
      padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px));
    }
  </style>
</head>
<body>

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
      <button class="toggle-btn" id="closeSidebarBtn" aria-label="Close sidebar">
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
        <button id="clearAllBtn" title="Clear all chats"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    </div>
  </aside>

  <!-- Main View Area -->
  <main>
    <div class="top-bar">
      <div class="top-left">
        <button class="toggle-btn" id="openSidebarBtn" aria-label="Toggle Sidebar">
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
        <button class="top-icon-btn" id="deleteCurrentBtn" aria-label="Delete conversation">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>

    <div class="messages-viewport" id="viewport">
      <div class="messages-container" id="messagesContainer">
        
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

    <!-- Hidden File Input for Image & Video -->
    <input type="file" id="mediaFileInput" accept="image/*,video/*" style="display: none;" />

    <!-- Bottom Input with Upload Preview & Pause/Send Control -->
    <div class="input-wrapper">
      <div class="attachment-strip" id="attachmentStrip">
        <div class="attachment-badge">
          <div id="attachmentPreviewSlot"></div>
          <span id="attachmentNameSlot">attachment</span>
          <button class="remove-attachment-btn" id="removeAttachmentBtn" type="button">&times;</button>
        </div>
      </div>

      <div class="input-box">
        <button class="attach-btn" id="triggerUploadBtn" type="button" title="Attach image or video reference">
          <i class="fa-solid fa-paperclip"></i>
        </button>
        <textarea id="promptInput" rows="1" placeholder="Message Bloop..."></textarea>
        <button id="sendBtn" class="send-btn" disabled aria-label="Send or stop">
          <i class="fa-solid fa-arrow-up" id="sendBtnIcon"></i>
        </button>
      </div>
      <div class="footnote">Bloop may produce inaccurate information. Always verify critical facts.</div>
    </div>
  </main>

  <script>
    function detectDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isSmallScreen = window.innerWidth <= 820;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

      if (isMobileUA || (isTouch && isSmallScreen)) {
        document.body.classList.add("is-mobile");
        document.body.classList.remove("is-desktop");
      } else {
        document.body.classList.add("is-desktop");
        document.body.classList.remove("is-mobile");
      }
    }
    detectDevice();
    window.addEventListener("resize", detectDevice);
    window.addEventListener("orientationchange", detectDevice);

    let chats = JSON.parse(localStorage.getItem("bloop_chats")) || [];
    let currentChatId = null;
    let isGenerating = false;
    let currentAbortController = null;
    let pendingMedia = null;

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const openSidebarBtn = document.getElementById("openSidebarBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const messagesContainer = document.getElementById("messagesContainer");
    const emptyState = document.getElementById("emptyState");
    const promptInput = document.getElementById("promptInput");
    const sendBtn = document.getElementById("sendBtn");
    const sendBtnIcon = document.getElementById("sendBtnIcon");
    const chatHistoryList = document.getElementById("chatHistoryList");
    const chatCount = document.getElementById("chatCount");
    const newChatBtn = document.getElementById("newChatBtn");
    const breadcrumbTitle = document.getElementById("breadcrumbTitle");
    const deleteCurrentBtn = document.getElementById("deleteCurrentBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const viewport = document.getElementById("viewport");

    const mediaFileInput = document.getElementById("mediaFileInput");
    const triggerUploadBtn = document.getElementById("triggerUploadBtn");
    const attachmentStrip = document.getElementById("attachmentStrip");
    const attachmentPreviewSlot = document.getElementById("attachmentPreviewSlot");
    const attachmentNameSlot = document.getElementById("attachmentNameSlot");
    const removeAttachmentBtn = document.getElementById("removeAttachmentBtn");

    function toggleSidebar() {
      if (document.body.classList.contains("is-mobile")) {
        sidebar.classList.toggle("mobile-open");
        sidebarOverlay.classList.toggle("active");
      } else {
        sidebar.classList.toggle("desktop-collapsed");
      }
    }

    function closeMobileSidebar() {
      if (document.body.classList.contains("is-mobile")) {
        sidebar.classList.remove("mobile-open");
        sidebarOverlay.classList.remove("active");
      }
    }

    openSidebarBtn.addEventListener("click", toggleSidebar);
    closeSidebarBtn.addEventListener("click", toggleSidebar);
    sidebarOverlay.addEventListener("click", closeMobileSidebar);

    triggerUploadBtn.addEventListener("click", () => mediaFileInput.click());

    mediaFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        alert("Please select an image or video file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        pendingMedia = {
          type: isVideo ? "video" : "image",
          dataUrl: loadEvent.target.result,
          name: file.name
        };

        attachmentPreviewSlot.innerHTML = isVideo 
          ? \`<video src="\${pendingMedia.dataUrl}"></video>\`
          : \`<img src="\${pendingMedia.dataUrl}" alt="Preview" />\`;
        
        attachmentNameSlot.textContent = file.name.length > 18 ? file.name.slice(0, 18) + '...' : file.name;
        attachmentStrip.style.display = "flex";
        sendBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    });

    removeAttachmentBtn.addEventListener("click", () => {
      pendingMedia = null;
      mediaFileInput.value = "";
      attachmentStrip.style.display = "none";
      updateSendButtonState();
    });

    function updateSendButtonState() {
      if (isGenerating) return;
      const hasText = Boolean(promptInput.value.trim());
      const hasMedia = Boolean(pendingMedia);
      sendBtn.disabled = !(hasText || hasMedia);
    }

    promptInput.addEventListener("input", () => {
      promptInput.style.height = "auto";
      promptInput.style.height = Math.min(promptInput.scrollHeight, 110) + "px";
      updateSendButtonState();
    });

    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && (promptInput.value.trim() || pendingMedia)) {
          handleSend();
        }
      }
    });

    function setGeneratingState(generating) {
      isGenerating = generating;
      if (generating) {
        sendBtn.disabled = false;
        sendBtn.classList.add("stop-state");
        sendBtnIcon.className = "fa-solid fa-square";
        promptInput.disabled = true;
      } else {
        sendBtn.classList.remove("stop-state");
        sendBtnIcon.className = "fa-solid fa-arrow-up";
        promptInput.disabled = false;
        updateSendButtonState();
      }
    }

    sendBtn.addEventListener("click", () => {
      if (isGenerating) {
        if (currentAbortController) {
          currentAbortController.abort();
        }
      } else {
        handleSend();
      }
    });

    function sendPrompt(text) {
      promptInput.value = text;
      updateSendButtonState();
      handleSend();
    }

    function createNewChat() {
      currentChatId = Date.now().toString();
      chats.unshift({ id: currentChatId, title: "New conversation", messages: [] });
      saveChats();
      renderChatHistory();
      renderActiveChat();
      closeMobileSidebar();
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
        icon.className = "fa-regular fa-message";
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
          closeMobileSidebar();
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
      currentChat.messages.forEach(msg => appendBubble(msg.role, msg.content, false, msg.media));
      scrollBottom();
    }

    function appendBubble(role, content, isError = false, media = null) {
      const row = document.createElement("div");
      row.className = "message-row " + role;
      const bubble = document.createElement("div");
      bubble.className = "bubble " + (isError ? 'error-bubble' : '');

      if (media && media.dataUrl) {
        if (media.type === 'video') {
          const vid = document.createElement("video");
          vid.src = media.dataUrl;
          vid.controls = true;
          vid.className = "attachment-preview-chat";
          bubble.appendChild(vid);
        } else {
          const img = document.createElement("img");
          img.src = media.dataUrl;
          img.className = "attachment-preview-chat";
          bubble.appendChild(img);
        }
      }

      const textSpan = document.createElement("span");
      textSpan.className = "bubble-text";
      textSpan.textContent = content;
      bubble.appendChild(textSpan);

      row.appendChild(bubble);
      messagesContainer.appendChild(row);
      scrollBottom();
      return textSpan;
    }

    async function streamText(element, fullText, signal) {
      element.textContent = "";
      element.classList.add("typing-cursor");
      const words = fullText.split(/(\\s+)/);

      for (let i = 0; i < words.length; i++) {
        if (signal && signal.aborted) {
          break;
        }
        element.textContent += words[i];
        scrollBottom();
        await new Promise(r => setTimeout(r, 16));
      }
      element.classList.remove("typing-cursor");
    }

    function scrollBottom() {
      viewport.scrollTop = viewport.scrollHeight;
    }

    async function handleSend() {
      const text = promptInput.value.trim();
      const mediaToSend = pendingMedia;

      if (!text && !mediaToSend) return;

      if (!currentChatId) createNewChat();
      const activeChat = chats.find(c => c.id === currentChatId);

      const displayPrompt = text || (mediaToSend ? \`[Attached \${mediaToSend.type}: \${mediaToSend.name}]\` : "");

      if (activeChat.messages.length === 0) {
        activeChat.title = displayPrompt.length > 25 ? displayPrompt.slice(0, 25) + "..." : displayPrompt;
        breadcrumbTitle.textContent = activeChat.title;
        emptyState.style.display = "none";
        renderChatHistory();
      }

      const userMessageObj = { 
        role: "user", 
        content: text, 
        media: mediaToSend 
      };
      activeChat.messages.push(userMessageObj);
      appendBubble("user", text, false, mediaToSend);

      promptInput.value = "";
      promptInput.style.height = "auto";
      pendingMedia = null;
      mediaFileInput.value = "";
      attachmentStrip.style.display = "none";

      currentAbortController = new AbortController();
      setGeneratingState(true);

      const assistantTextElement = appendBubble("assistant", "Thinking...");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: activeChat.messages.map(m => ({
              role: m.role,
              content: m.content + (m.media ? \` (Reference file: \${m.media.name})\` : "")
            }))
          }),
          signal: currentAbortController.signal
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error?.message || \`Request failed (\${response.status})\`);
        }

        const reply = data.choices[0].message.content;

        await streamText(assistantTextElement, reply, currentAbortController.signal);
        
        activeChat.messages.push({ role: "assistant", content: assistantTextElement.textContent });
        saveChats();

      } catch (err) {
        assistantTextElement.classList.remove("typing-cursor");
        if (err.name === 'AbortError') {
          assistantTextElement.textContent += " [Paused]";
          activeChat.messages.push({ role: "assistant", content: assistantTextElement.textContent });
          saveChats();
        } else {
          assistantTextElement.parentElement.classList.add("error-bubble");
          assistantTextElement.textContent = "Error: " + err.message;
        }
      } finally {
        setGeneratingState(false);
        currentAbortController = null;
        promptInput.focus();
        scrollBottom();
      }
    }

    newChatBtn.onclick = createNewChat;

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
