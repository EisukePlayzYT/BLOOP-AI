const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Read API key from environment variable or fallback
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const MODEL = "openai/gpt-oss-120b";

app.use(express.json({ limit: '50mb' }));

// ----------------------------------------------------
// 1. BACKEND CHAT API
// ----------------------------------------------------
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

// ----------------------------------------------------
// 2. ROUTE: /studio or /editor -> BLOOP CANVAS STUDIO MAX
// ----------------------------------------------------
app.get(['/studio', '/editor'], (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bloop Canvas Studio Max - 100 Elements & 15 Templates</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --bg-dark: #07090e;
      --bg-panel: #0e131d;
      --bg-card: #151b29;
      --border: #1e273a;
      --text: #f1f5f9;
      --text-muted: #8b99ad;
      --accent: #38bdf8;
      --accent-hover: #7dd3fc;
      --danger: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg-dark); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; user-select: none; }

    header {
      height: 54px;
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      z-index: 30;
    }

    .brand { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; font-size: 1.15rem; }
    .brand i { color: var(--accent); }
    .brand span { font-size: 0.68rem; color: var(--accent); letter-spacing: 1.5px; margin-left: 4px; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 6px; border-radius: 4px; font-weight: 700; }

    .top-actions { display: flex; gap: 0.6rem; align-items: center; }
    .btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      transition: all 0.15s;
      text-decoration: none;
    }
    .btn:hover { background: #1c2436; border-color: #2b3952; }
    .btn-accent { background: var(--accent); color: #07090e; border: none; }
    .btn-accent:hover { background: var(--accent-hover); }

    .app-workspace { flex: 1; display: flex; overflow: hidden; position: relative; }

    .sidebar {
      width: 390px;
      min-width: 390px;
      background: var(--bg-panel);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 20;
    }

    .sidebar-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: #090d14;
    }

    .tab-btn {
      flex: 1;
      padding: 0.85rem 0;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s;
    }

    .tab-btn.active {
      color: var(--accent);
      border-bottom: 2px solid var(--accent);
      background: var(--bg-panel);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .tab-pane { display: none; flex-direction: column; gap: 0.9rem; }
    .tab-pane.active { display: flex; }

    .template-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      transition: all 0.2s;
    }
    .template-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .template-preview {
      height: 80px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
      text-align: center;
      padding: 0 0.5rem;
    }
    .template-card strong { font-size: 0.82rem; }
    .template-card span { font-size: 0.7rem; color: var(--text-muted); }

    .category-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-bottom: 0.35rem;
    }

    .category-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.35rem;
    }

    .element-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.4rem;
    }

    .tool-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.6rem 0.65rem;
      border-radius: 8px;
      font-size: 0.74rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      transition: all 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tool-btn:hover { background: #1c2538; border-color: var(--accent); color: var(--accent); }
    .tool-btn.wide { grid-column: span 2; }

    .canvas-viewport {
      flex: 1;
      background: radial-gradient(circle at center, #131a28 0%, #06080c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: auto;
    }

    .canvas-container {
      position: relative;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      border: 1px solid var(--border);
      background: #000;
    }

    canvas { display: block; }

    .inspector-pane {
      width: 320px;
      min-width: 320px;
      background: var(--bg-panel);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 1.1rem;
      gap: 1.1rem;
      z-index: 20;
    }

    .panel-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .panel-title {
      font-size: 0.76rem;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .control-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .control-row label {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      font-weight: 600;
    }

    .control-row input, .control-row select {
      background: var(--bg-dark);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.45rem 0.65rem;
      color: var(--text);
      font-size: 0.82rem;
      outline: none;
    }

    .control-row input[type="range"] { accent-color: var(--accent); padding: 0; cursor: pointer; }
    .color-picker-wrap { display: flex; gap: 0.5rem; align-items: center; }
    .color-picker-wrap input[type="color"] { width: 44px; height: 32px; border: none; cursor: pointer; background: transparent; padding: 0; }

    .layer-action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.45rem;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <i class="fa-solid fa-wand-magic-sparkles"></i>
      Bloop Canvas <span>100 ELEMENTS & 15 TEMPLATES</span>
    </div>
    <div class="top-actions">
      <a href="/" class="btn"><i class="fa-solid fa-comment-dots"></i> Back to Chat</a>
      <button class="btn" id="clearCanvasBtn"><i class="fa-solid fa-trash-can"></i> Clear All</button>
      <button class="btn btn-accent" id="exportBtn"><i class="fa-solid fa-download"></i> Export 1080p</button>
    </div>
  </header>

  <div class="app-workspace">
    
    <div class="sidebar">
      <div class="sidebar-tabs">
        <button class="tab-btn active" onclick="switchTab('elements')"><i class="fa-solid fa-shapes"></i> 100 Elements</button>
        <button class="tab-btn" onclick="switchTab('templates')"><i class="fa-solid fa-table-cells-large"></i> 15 Templates</button>
        <button class="tab-btn" onclick="switchTab('canvas-opt')"><i class="fa-solid fa-sliders"></i> Canvas</button>
      </div>

      <div class="sidebar-content">
        
        <div class="tab-pane active" id="tab-elements">

          <label class="tool-btn wide" for="imageUpload" style="border: 1px dashed var(--accent);">
            <i class="fa-solid fa-upload"></i> Upload Custom Picture / Photo
            <input type="file" id="imageUpload" accept="image/*" style="display: none;">
          </label>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-font"></i> 1. Typography & Titles (1–10)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addText('BOLD IMPACT', 88, true)"><i class="fa-solid fa-heading"></i> 1. Bold Headline</button>
              <button class="tool-btn" onclick="addText('Subtitle Tagline', 40, false)"><i class="fa-solid fa-align-left"></i> 2. Subtitle</button>
              <button class="tool-btn" onclick="addText('NEON GLOW', 74, true, '#38bdf8', 35)"><i class="fa-solid fa-bolt"></i> 3. Neon Title</button>
              <button class="tool-btn" onclick="addText('SYSTEM GLITCH', 68, true, '#f43f5e', 20)"><i class="fa-solid fa-wave-square"></i> 4. Glitch Title</button>
              <button class="tool-btn" onclick="addText('100% CODED BY ME', 34, true, '#4ade80')"><i class="fa-solid fa-code"></i> 5. Code Stamp</button>
              <button class="tool-btn" onclick="addShape('badge', '#3b82f6', 'TAG LABEL')"><i class="fa-solid fa-tag"></i> 6. Impact Tag</button>
              <button class="tool-btn" onclick="addText('#1', 120, true, '#facc15', 30)"><i class="fa-solid fa-award"></i> 7. Rank #1 Badge</button>
              <button class="tool-btn" onclick="addText('OFFICIAL', 28, true, '#94a3b8')"><i class="fa-solid fa-stamp"></i> 8. Stamped Text</button>
              <button class="tool-btn" onclick="addText('VS', 110, true, '#ef4444', 30)"><i class="fa-solid fa-bolt"></i> 9. Versus Text</button>
              <button class="tool-btn" onclick="addText('$100,000', 95, true, '#22c55e', 35)"><i class="fa-solid fa-dollar-sign"></i> 10. Cash Value</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-user-secret"></i> 2. Mystery Kid & Creator (11–20)</span>
            <div class="element-grid">
              <button class="tool-btn wide" onclick="addMysteryKidSilhouette()"><i class="fa-solid fa-user-secret"></i> 11. 12yo Kid Silhouette</button>
              <button class="tool-btn wide" onclick="addCensorBar('12 YEARS OLD KID')"><i class="fa-solid fa-eye-slash"></i> 12. Censor Eye-Bar</button>
              <button class="tool-btn" onclick="addNeonEmblem('?')"><i class="fa-solid fa-question"></i> 13. Glowing '?'</button>
              <button class="tool-btn" onclick="addNeonEmblem('⚡')"><i class="fa-solid fa-bolt-lightning"></i> 14. Lightning</button>
              <button class="tool-btn" onclick="addAuraGlow()"><i class="fa-solid fa-sun"></i> 15. Backglow Aura</button>
              <button class="tool-btn" onclick="addCustomVector('eye')"><i class="fa-solid fa-eye"></i> 16. Secret Eye</button>
              <button class="tool-btn" onclick="addShape('badge', '#1e293b', 'DETECTIVE')"><i class="fa-solid fa-id-badge"></i> 17. Agent Badge</button>
              <button class="tool-btn" onclick="addCustomVector('fingerprint')"><i class="fa-solid fa-fingerprint"></i> 18. Fingerprint</button>
              <button class="tool-btn" onclick="addShape('badge', '#0f172a', 'IDENTITY: HIDDEN')"><i class="fa-solid fa-mask"></i> 19. Identity Pill</button>
              <button class="tool-btn" onclick="addText('ANONYMOUS', 36, true, '#64748b')"><i class="fa-solid fa-user-ninja"></i> 20. Anonymous Tag</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-brands fa-youtube"></i> 3. Clickbait & Reactions (21–30)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addShape('arrow')"><i class="fa-solid fa-arrow-pointer"></i> 21. Viral Arrow</button>
              <button class="tool-btn" onclick="addCustomVector('curved-arrow')"><i class="fa-solid fa-arrow-turn-up"></i> 22. Curved Arrow</button>
              <button class="tool-btn" onclick="addShape('badge', '#ef4444', 'DO NOT TRY!')"><i class="fa-solid fa-triangle-exclamation"></i> 23. Warning Tag</button>
              <button class="tool-btn" onclick="addShape('cross')"><i class="fa-solid fa-xmark"></i> 24. Red 'X'</button>
              <button class="tool-btn" onclick="addShape('check')"><i class="fa-solid fa-check"></i> 25. Green Check</button>
              <button class="tool-btn" onclick="addText('😱', 100, false)"><i class="fa-regular fa-face-surprise"></i> 26. Shock Emoji</button>
              <button class="tool-btn" onclick="addText('🔥', 100, false)"><i class="fa-solid fa-fire"></i> 27. Fire Emoji</button>
              <button class="tool-btn" onclick="addShape('badge', '#22c55e', '100% VERIFIED')"><i class="fa-solid fa-circle-check"></i> 28. Verified Pill</button>
              <button class="tool-btn" onclick="addText('EXPOSED', 72, true, '#ef4444', 25)"><i class="fa-solid fa-bullhorn"></i> 29. Exposed Tag</button>
              <button class="tool-btn" onclick="addShape('badge', '#e11d48', 'WAIT FOR END')"><i class="fa-solid fa-clock"></i> 30. Watch End Tag</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-wand-magic-sparkles"></i> 4. Bloop AI Mockups (31–40)</span>
            <div class="element-grid">
              <button class="tool-btn wide" onclick="addBloopUserBubble()"><i class="fa-regular fa-message"></i> 31. User Question Bubble</button>
              <button class="tool-btn wide" onclick="addBloopResponseBubble()"><i class="fa-solid fa-robot"></i> 32. AI Response Bubble</button>
              <button class="tool-btn wide" onclick="addBloopPillBar()"><i class="fa-solid fa-terminal"></i> 33. Glowing Input Bar</button>
              <button class="tool-btn" onclick="addBloopBadge()"><i class="fa-solid fa-sparkles"></i> 34. Ultra Badge</button>
              <button class="tool-btn" onclick="addOnlineStatus()"><i class="fa-solid fa-circle-dot"></i> 35. Online Dot</button>
              <button class="tool-btn" onclick="addShape('rect', '#0e131d')"><i class="fa-solid fa-window-maximize"></i> 36. Sidebar Box</button>
              <button class="tool-btn" onclick="addText('✦ Bloop', 42, true, '#38bdf8')"><i class="fa-solid fa-wand-magic"></i> 37. Brand Sparkle</button>
              <button class="tool-btn" onclick="addShape('badge', '#131d2b', 'PRO ACTIVE')"><i class="fa-solid fa-shield"></i> 38. Status Badge</button>
              <button class="tool-btn" onclick="addShape('badge', '#0284c7', 'API CONNECTED')"><i class="fa-solid fa-network-wired"></i> 39. API Status</button>
              <button class="tool-btn" onclick="addText('Model: GPT-OSS-120B', 24, false, '#8b99ad')"><i class="fa-solid fa-brain"></i> 40. Model Label</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-gamepad"></i> 5. Gaming & Minecraft (41–50)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addCustomVector('heart-pixel')"><i class="fa-solid fa-heart"></i> 41. Pixel Heart</button>
              <button class="tool-btn" onclick="addCustomVector('shield')"><i class="fa-solid fa-shield-halved"></i> 42. Shield Emblem</button>
              <button class="tool-btn" onclick="addCustomVector('sword')"><i class="fa-solid fa-gavel"></i> 43. Sword Slash</button>
              <button class="tool-btn" onclick="addText('👑', 90, false)"><i class="fa-solid fa-crown"></i> 44. Golden Crown</button>
              <button class="tool-btn" onclick="addShape('badge', '#eab308', 'LVL 100')"><i class="fa-solid fa-trophy"></i> 45. Level 100 Tag</button>
              <button class="tool-btn" onclick="addCustomVector('xp-bar')"><i class="fa-solid fa-bars-progress"></i> 46. XP Progress Bar</button>
              <button class="tool-btn" onclick="addText('★ ★ ★ ★ ★', 40, true, '#facc15')"><i class="fa-solid fa-star"></i> 47. 5-Star Row</button>
              <button class="tool-btn" onclick="addText('☠ HARDCORE', 48, true, '#ef4444')"><i class="fa-solid fa-skull"></i> 48. Hardcore Skull</button>
              <button class="tool-btn" onclick="addShape('badge', '#a855f7', 'MYTHIC DROP')"><i class="fa-solid fa-gem"></i> 49. Mythic Tag</button>
              <button class="tool-btn" onclick="addShape('badge', '#10b981', 'WIN STREAK: 50')"><i class="fa-solid fa-fire-flame-curved"></i> 50. Streak Badge</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-microchip"></i> 6. Social & Tech HUD (51–60)</span>
            <div class="element-grid">
              <button class="tool-btn wide" onclick="addCyberBrackets()"><i class="fa-solid fa-brackets-curly"></i> 51. HUD Corner Brackets</button>
              <button class="tool-btn" onclick="addCustomVector('crosshair')"><i class="fa-solid fa-crosshairs"></i> 52. Scope Reticle</button>
              <button class="tool-btn" onclick="addShape('badge', '#ef4444', 'SUBSCRIBE')"><i class="fa-solid fa-bell"></i> 53. Subscribe Btn</button>
              <button class="tool-btn" onclick="addCustomVector('play')"><i class="fa-solid fa-circle-play"></i> 54. Play Icon</button>
              <button class="tool-btn" onclick="addCustomVector('bell')"><i class="fa-solid fa-bell"></i> 55. Alert Bell</button>
              <button class="tool-btn" onclick="addCustomVector('like')"><i class="fa-solid fa-thumbs-up"></i> 56. Thumbs Up</button>
              <button class="tool-btn" onclick="addCustomVector('heart')"><i class="fa-solid fa-heart"></i> 57. Glowing Heart</button>
              <button class="tool-btn" onclick="addCustomVector('comment')"><i class="fa-solid fa-comment-dots"></i> 58. Chat Cloud</button>
              <button class="tool-btn" onclick="addCustomVector('share')"><i class="fa-solid fa-share-nodes"></i> 59. Share Node</button>
              <button class="tool-btn" onclick="addShape('badge', '#6366f1', 'FOLLOW')"><i class="fa-solid fa-user-plus"></i> 60. Follow Pill</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-shapes"></i> 7. Shapes & Layouts (61–70)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addShape('rect')"><i class="fa-regular fa-square"></i> 61. Backdrop Box</button>
              <button class="tool-btn" onclick="addBorderFrame()"><i class="fa-regular fa-square-full"></i> 62. Neon Border</button>
              <button class="tool-btn" onclick="addShape('circle')"><i class="fa-regular fa-circle"></i> 63. Spotlight Circle</button>
              <button class="tool-btn" onclick="addCustomVector('triangle')"><i class="fa-solid fa-play" style="transform: rotate(-90deg);"></i> 64. Hazard Triangle</button>
              <button class="tool-btn" onclick="addCustomVector('diamond')"><i class="fa-solid fa-diamond"></i> 65. Diamond Marker</button>
              <button class="tool-btn" onclick="addCustomVector('hexagon')"><i class="fa-brands fa-hive"></i> 66. Hexagon Tech</button>
              <button class="tool-btn" onclick="addShape('badge', '#38bdf8', 'PILL BADGE')"><i class="fa-solid fa-capsules"></i> 67. Rounded Pill</button>
              <button class="tool-btn" onclick="addCustomVector('divider')"><i class="fa-solid fa-arrows-split-up-and-left"></i> 68. Split Divider</button>
              <button class="tool-btn" onclick="addCustomVector('parallelogram')"><i class="fa-solid fa-vector-square"></i> 69. Slanted Box</button>
              <button class="tool-btn" onclick="addShape('badge', '#0f172a', 'CONTAINER')"><i class="fa-solid fa-box-archive"></i> 70. Glass Card</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-wand-magic"></i> 8. VFX & Overlays (71–80)</span>
            <div class="element-grid">
              <button class="tool-btn wide" onclick="addSpeedLines()"><i class="fa-solid fa-burst"></i> 71. Comic Speed Burst</button>
              <button class="tool-btn" onclick="addCustomVector('sunburst')"><i class="fa-solid fa-sun"></i> 72. Radial Rays</button>
              <button class="tool-btn" onclick="addCustomVector('grid')"><i class="fa-solid fa-border-all"></i> 73. Matrix Grid</button>
              <button class="tool-btn" onclick="addCustomVector('scanlines')"><i class="fa-solid fa-bars"></i> 74. CRT Scanlines</button>
              <button class="tool-btn" onclick="addCustomVector('corner-glow')"><i class="fa-solid fa-lightbulb"></i> 75. Corner Flare</button>
              <button class="tool-btn" onclick="addText('✨', 80, false)"><i class="fa-solid fa-star-of-life"></i> 76. Sparkles</button>
              <button class="tool-btn" onclick="addCustomVector('sparkle-cluster')"><i class="fa-solid fa-wand-magic-sparkles"></i> 77. Starlight FX</button>
              <button class="tool-btn" onclick="addShape('badge', '#facc15', 'POW!')"><i class="fa-solid fa-explosion"></i> 78. POW Splash</button>
              <button class="tool-btn" onclick="addCustomVector('particles')"><i class="fa-solid fa-snowflake"></i> 79. Dust Particles</button>
              <button class="tool-btn" onclick="addCustomVector('glitch-box')"><i class="fa-solid fa-barcode"></i> 80. Glitch Artifact</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-icons"></i> 9. Emojis & Stickers (81–90)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addText('💰', 90, false)"><i class="fa-solid fa-money-bill-wave"></i> 81. Cash Bag</button>
              <button class="tool-btn" onclick="addText('🤯', 90, false)"><i class="fa-regular fa-face-grin-stars"></i> 82. Mindblown</button>
              <button class="tool-btn" onclick="addText('👀', 90, false)"><i class="fa-solid fa-eyes"></i> 83. Peeking Eyes</button>
              <button class="tool-btn" onclick="addText('🚀', 90, false)"><i class="fa-solid fa-rocket"></i> 84. Rocket Ship</button>
              <button class="tool-btn" onclick="addText('💯', 90, false)"><i class="fa-solid fa-check-double"></i> 85. 100 Score</button>
              <button class="tool-btn" onclick="addText('🏆', 90, false)"><i class="fa-solid fa-trophy"></i> 86. Gold Trophy</button>
              <button class="tool-btn" onclick="addText('🚫', 90, false)"><i class="fa-solid fa-ban"></i> 87. Forbidden</button>
              <button class="tool-btn" onclick="addText('👻', 90, false)"><i class="fa-solid fa-ghost"></i> 88. Ghost</button>
              <button class="tool-btn" onclick="addText('💀', 90, false)"><i class="fa-solid fa-skull-crossbones"></i> 89. Skull Emoji</button>
              <button class="tool-btn" onclick="addText('⚡', 90, false)"><i class="fa-solid fa-bolt"></i> 90. Zap Icon</button>
            </div>
          </div>

          <div class="category-group">
            <span class="category-title"><i class="fa-solid fa-certificate"></i> 10. Badges & Stamps (91–100)</span>
            <div class="element-grid">
              <button class="tool-btn" onclick="addShape('badge', '#b91c1c', 'TOP SECRET')"><i class="fa-solid fa-stamp"></i> 91. TOP SECRET</button>
              <button class="tool-btn" onclick="addShape('badge', '#334155', 'CONFIDENTIAL')"><i class="fa-solid fa-file-shield"></i> 92. CONFIDENTIAL</button>
              <button class="tool-btn" onclick="addShape('badge', '#7c3aed', 'IMPOSSIBLE')"><i class="fa-solid fa-bolt"></i> 93. IMPOSSIBLE</button>
              <button class="tool-btn" onclick="addShape('badge', '#0284c7', 'NEW!')"><i class="fa-solid fa-bell"></i> 94. NEW Badge</button>
              <button class="tool-btn" onclick="addShape('badge', '#dc2626', 'BANNED')"><i class="fa-solid fa-ban"></i> 95. BANNED Stamp</button>
              <button class="tool-btn" onclick="addShape('badge', '#ef4444', '● LIVE')"><i class="fa-solid fa-broadcast-tower"></i> 96. LIVE Tag</button>
              <button class="tool-btn" onclick="addShape('badge', '#16a34a', 'SALE -50%')"><i class="fa-solid fa-percent"></i> 97. Sale Ribbon</button>
              <button class="tool-btn" onclick="addShape('badge', '#d97706', '5-STAR')"><i class="fa-solid fa-star"></i> 98. Star Rating</button>
              <button class="tool-btn" onclick="addShape('badge', '#ea580c', 'WORLD RECORD')"><i class="fa-solid fa-stopwatch"></i> 99. Record Badge</button>
              <button class="tool-btn" onclick="addShape('badge', '#4338ca', 'FINAL CHAPTER')"><i class="fa-solid fa-bookmark"></i> 100. Chapter Tag</button>
            </div>
          </div>

        </div>

        <div class="tab-pane" id="tab-templates">
          
          <div class="template-card" onclick="loadTemplate('bloop-prodigy')">
            <div class="template-preview" style="background: linear-gradient(135deg, #090e18, #162438); color: #38bdf8;">
              ✦ 12yo AI Prodigy (Bloop UI + Kid)
            </div>
            <strong>1. The 12-Year-Old AI Creator</strong>
            <span>Split Bloop UI, hoodie kid silhouette, censor eye bar & glowing '?'</span>
          </div>

          <div class="template-card" onclick="loadTemplate('mrbeast-shock')">
            <div class="template-preview" style="background: linear-gradient(135deg, #450a0a, #7f1d1d); color: #facc15;">
              🔥 100% IMPOSSIBLE REACTION
            </div>
            <strong>2. High-Impact Shock & Reaction</strong>
            <span>Angled 3D yellow text, viral red pointers, and warning badges</span>
          </div>

          <div class="template-card" onclick="loadTemplate('cyber-hacker')">
            <div class="template-preview" style="background: linear-gradient(135deg, #051610, #0a2e20); color: #4ade80;">
              ⚡ SYSTEM BREACH / HACKER
            </div>
            <strong>3. Cyberpunk Neural Terminal</strong>
            <span>HUD brackets, terminal green code strings, and cyan aura glows</span>
          </div>

          <div class="template-card" onclick="loadTemplate('before-after')">
            <div class="template-preview" style="background: linear-gradient(90deg, #3b0707 50%, #063118 50%); color: #ffffff;">
              NOOB vs PRO (SPLIT-SCREEN)
            </div>
            <strong>4. Before vs After Faceoff</strong>
            <span>Diagonal split bar, failure red 'X' vs green verified victory</span>
          </div>

          <div class="template-card" onclick="loadTemplate('hardcore-gaming')">
            <div class="template-preview" style="background: linear-gradient(135deg, #110c1f, #2e1065); color: #f59e0b;">
              🎮 100 DAYS HARDCORE
            </div>
            <strong>5. Minecraft / Roblox Epic Solo</strong>
            <span>Embossed gold titles, survival banners, and dark obsidian backdrops</span>
          </div>

          <div class="template-card" onclick="loadTemplate('true-crime')">
            <div class="template-preview" style="background: linear-gradient(135deg, #0f0f12, #211c1d); color: #ef4444;">
              📁 CONFIDENTIAL EVIDENCE
            </div>
            <strong>6. Dark Mystery / Unsolved Doc</strong>
            <span>Red string lines, classified badges, and censored photograph frames</span>
          </div>

          <div class="template-card" onclick="loadTemplate('startup-launch')">
            <div class="template-preview" style="background: linear-gradient(135deg, #0f172a, #1e1b4b); color: #a855f7;">
              🚀 #1 AI APP ON PRODUCT HUNT
            </div>
            <strong>7. Modern SaaS Launch Showcase</strong>
            <span>Glassmorphism cards, glowing metrics, and gradient feature badges</span>
          </div>

          <div class="template-card" onclick="loadTemplate('speed-burst')">
            <div class="template-preview" style="background: radial-gradient(circle, #f97316 10%, #431407 80%); color: #ffffff;">
              ⚡ COMIC SPEED BURST REVEAL
            </div>
            <strong>8. Anime Action Speed Burst</strong>
            <span>High-energy radial speed lines and heavy slanted impact typography</span>
          </div>

          <div class="template-card" onclick="loadTemplate('hardware-review')">
            <div class="template-preview" style="background: linear-gradient(135deg, #0f172a, #0284c7); color: #38bdf8;">
              📱 ULTIMATE FLAGSHIP TEARDOWN
            </div>
            <strong>9. Tech Review & Hardware Teardown</strong>
            <span>Device mockups, rating stars, and specs breakdown bars</span>
          </div>

          <div class="template-card" onclick="loadTemplate('gta-heist')">
            <div class="template-preview" style="background: linear-gradient(135deg, #78350f, #b45309); color: #fde047;">
              💰 GTA 6 / $10,000,000 HEIST
            </div>
            <strong>10. Street Heist Action Banner</strong>
            <span>Angled dollar piles, wanted stars, and caution tape styling</span>
          </div>

          <div class="template-card" onclick="loadTemplate('podcast-studio')">
            <div class="template-preview" style="background: linear-gradient(90deg, #18181b 50%, #27272a 50%); color: #e4e4e7;">
              🎙️ PODCAST EPISODE #42
            </div>
            <strong>11. Studio Interview Split-Screen</strong>
            <span>Dual creator frames, audio waveform badges, and episode tags</span>
          </div>

          <div class="template-card" onclick="loadTemplate('esports-final')">
            <div class="template-preview" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: #c084fc;">
              🏆 GRAND FINALS CHAMPIONSHIP
            </div>
            <strong>12. Pro Esports Tournament Final</strong>
            <span>Trophy emblems, neon stadium lighting, and match clash badges</span>
          </div>

          <div class="template-card" onclick="loadTemplate('crypto-bull')">
            <div class="template-preview" style="background: linear-gradient(135deg, #022c22, #065f46); color: #34d399;">
              📈 1000X BULL RUN BREAKOUT
            </div>
            <strong>13. Crypto & Trading Bullish Chart</strong>
            <span>Candlestick graphs, rocket boosts, and profit targets</span>
          </div>

          <div class="template-card" onclick="loadTemplate('horror-paranormal')">
            <div class="template-preview" style="background: linear-gradient(135deg, #030712, #111827); color: #94a3b8;">
              👻 3:00 AM PARANORMAL CAUGHT
            </div>
            <strong>14. Midnight Paranormal Investigation</strong>
            <span>Night-vision green tint, REC blinking dot, and ghost silhouette</span>
          </div>

          <div class="template-card" onclick="loadTemplate('fitness-transform')">
            <div class="template-preview" style="background: linear-gradient(135deg, #1c1917, #44403c); color: #ea580c;">
              💪 90 DAYS BODY TRANSFORMATION
            </div>
            <strong>15. Fitness Transformation & Gym</strong>
            <span>Weight plates, streak badges, and high-contrast progress lines</span>
          </div>

        </div>

        <div class="tab-pane" id="tab-canvas-opt">
          <div class="control-row">
            <label>Canvas Resolution</label>
            <select id="canvasSizeSelect" onchange="changeCanvasPreset(this.value)">
              <option value="1920x1080">16:9 YouTube Thumbnail (1920x1080)</option>
              <option value="1080x1080">1:1 Square Post (1080x1080)</option>
              <option value="1080x1920">9:16 Shorts / TikTok (1080x1920)</option>
            </select>
          </div>
          <div class="control-row">
            <label>Background Color</label>
            <div class="color-picker-wrap">
              <input type="color" id="canvasBgColor" value="#07090e" oninput="updateCanvasBg(this.value)">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Solid Color</span>
            </div>
          </div>
          <div class="control-row">
            <label>Dark Edge Vignette <span id="vignetteVal">40%</span></label>
            <input type="range" id="vignetteRange" min="0" max="90" value="40" oninput="render()">
          </div>
        </div>

      </div>
    </div>

    <div class="canvas-viewport" id="viewport">
      <div class="canvas-container" id="canvasContainer">
        <canvas id="mainCanvas" width="1920" height="1080"></canvas>
      </div>
    </div>

    <div class="inspector-pane">
      <div class="panel-section" id="noSelectionMsg">
        <span style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Click any item on the canvas to drag, scale, rotate, or edit properties.</span>
      </div>

      <div class="panel-section" id="selectionControls" style="display: none;">
        <div class="panel-title">
          <span>Transform & Scale</span>
          <i class="fa-solid fa-vector-square"></i>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <div class="control-row">
            <label>Width</label>
            <input type="number" id="propWidth" oninput="updateSelectedNum('width', this.value)">
          </div>
          <div class="control-row">
            <label>Height</label>
            <input type="number" id="propHeight" oninput="updateSelectedNum('height', this.value)">
          </div>
        </div>

        <div class="control-row">
          <label>Rotation Angle</label>
          <input type="range" id="propRotation" min="-180" max="180" value="0" oninput="updateSelected('rotation', (this.value * Math.PI) / 180)">
        </div>

        <div class="control-row" id="textInputRow">
          <label>Text Content</label>
          <input type="text" id="propText" oninput="updateSelected('text', this.value)">
        </div>
        <div class="control-row" id="fontSizeRow">
          <label>Font Size</label>
          <input type="range" id="propFontSize" min="16" max="220" oninput="updateSelected('fontSize', parseInt(this.value))">
        </div>

        <div class="control-row" id="fillColorRow">
          <label>Fill Color</label>
          <div class="color-picker-wrap">
            <input type="color" id="propColor" oninput="updateSelected('fill', this.value)">
            <span id="fillColorHex" style="font-size: 0.8rem; color: var(--text-muted);">#ffffff</span>
          </div>
        </div>

        <div class="control-row">
          <label>Neon Outer Glow</label>
          <div class="color-picker-wrap">
            <input type="color" id="propGlowColor" value="#38bdf8" oninput="updateSelected('glowColor', this.value)">
            <input type="range" id="propGlowBlur" min="0" max="60" value="0" oninput="updateSelected('glowBlur', parseInt(this.value))">
          </div>
        </div>

        <div class="control-row">
          <label>Opacity</label>
          <input type="range" id="propOpacity" min="10" max="100" value="100" oninput="updateSelected('opacity', this.value / 100)">
        </div>

        <div class="panel-title" style="margin-top: 0.4rem;">Layer Order</div>
        <div class="layer-action-grid">
          <button class="btn" onclick="moveLayer('forward')"><i class="fa-solid fa-arrow-up"></i> Forward</button>
          <button class="btn" onclick="moveLayer('backward')"><i class="fa-solid fa-arrow-down"></i> Backward</button>
          <button class="btn" onclick="duplicateSelected()"><i class="fa-solid fa-copy"></i> Duplicate</button>
          <button class="btn" style="color: var(--danger);" onclick="deleteSelected()"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </div>
    </div>

  </div>

  <script>
    const canvas = document.getElementById("mainCanvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById("canvasContainer");

    let canvasWidth = 1920;
    let canvasHeight = 1080;
    let canvasBg = "#07090e";

    let layers = [];
    let selectedLayer = null;

    let isDragging = false;
    let isTransforming = false;
    let currentHandle = null;
    let startX = 0, startY = 0;
    let initialLayerState = null;

    const HANDLE_RADIUS = 7;

    function fitCanvasView() {
      const parent = document.getElementById("viewport");
      const scale = Math.min((parent.clientWidth - 80) / canvasWidth, (parent.clientHeight - 80) / canvasHeight, 1);
      canvas.style.width = (canvasWidth * scale) + "px";
      canvas.style.height = (canvasHeight * scale) + "px";
    }
    window.addEventListener("resize", fitCanvasView);

    function render() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      layers.forEach(layer => {
        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(layer.rotation || 0);
        ctx.translate(-cx, -cy);

        if (layer.glowBlur > 0) {
          ctx.shadowColor = layer.glowColor || '#38bdf8';
          ctx.shadowBlur = layer.glowBlur;
        }

        const x = layer.x;
        const y = layer.y;
        const w = layer.width;
        const h = layer.height;

        if (layer.type === 'text') {
          ctx.fillStyle = layer.fill;
          ctx.font = \`\${layer.bold ? '900' : '600'} \${layer.fontSize}px -apple-system, BlinkMacSystemFont, Impact, sans-serif\`;
          ctx.textBaseline = 'top';
          ctx.fillText(layer.text, x, y);
          const metrics = ctx.measureText(layer.text);
          layer.width = Math.max(metrics.width, 20);
          layer.height = layer.fontSize * 1.15;

        } else if (layer.type === 'image' && layer.img.complete) {
          ctx.drawImage(layer.img, x, y, w, h);

        } else if (layer.type === 'rect') {
          ctx.fillStyle = layer.fill;
          ctx.fillRect(x, y, w, h);
          if (layer.stroke) {
            ctx.strokeStyle = layer.stroke;
            ctx.lineWidth = layer.strokeWidth || 3;
            ctx.strokeRect(x, y, w, h);
          }

        } else if (layer.type === 'circle') {
          ctx.fillStyle = layer.fill;
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          ctx.fill();

        } else if (layer.type === 'badge') {
          ctx.fillStyle = layer.fill;
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 14);
          ctx.fill();
          if (layer.stroke) {
            ctx.strokeStyle = layer.stroke;
            ctx.lineWidth = layer.strokeWidth || 3;
            ctx.stroke();
          }

        } else if (layer.type === 'silhouette') {
          drawKidSilhouette(layer);

        } else if (layer.type === 'arrow') {
          drawViralArrow(layer);

        } else if (layer.type === 'cross') {
          ctx.strokeStyle = layer.stroke || '#ef4444';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 10);
          ctx.lineTo(x + w - 10, y + h - 10);
          ctx.moveTo(x + w - 10, y + 10);
          ctx.lineTo(x + 10, y + h - 10);
          ctx.stroke();

        } else if (layer.type === 'check') {
          ctx.strokeStyle = layer.stroke || '#22c55e';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x + 10, y + h * 0.5);
          ctx.lineTo(x + w * 0.38, y + h - 12);
          ctx.lineTo(x + w - 10, y + 12);
          ctx.stroke();

        } else if (layer.type === 'pill-input') {
          ctx.fillStyle = layer.fill || '#121722';
          ctx.strokeStyle = layer.stroke || '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, h / 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#5d6f88';
          ctx.font = '20px sans-serif';
          ctx.textBaseline = 'middle';
          ctx.fillText("Message Bloop...", x + 30, y + h / 2);

        } else if (layer.type === 'hud-bracket') {
          ctx.strokeStyle = layer.stroke || '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x + 40, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + h);
          ctx.lineTo(x + 40, y + h);
          ctx.moveTo(x + w - 40, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + w - 40, y + h);
          ctx.stroke();

        } else if (layer.type === 'border-frame') {
          ctx.strokeStyle = layer.stroke || '#38bdf8';
          ctx.lineWidth = 6;
          ctx.strokeRect(x, y, w, h);

        } else if (layer.type === 'speed-lines') {
          drawSpeedLines(layer);

        } else if (layer.type === 'custom-vector') {
          drawCustomVectorGraphics(layer);
        }

        ctx.restore();
      });

      const vignetteVal = parseInt(document.getElementById("vignetteRange").value);
      document.getElementById("vignetteVal").textContent = vignetteVal + "%";
      if (vignetteVal > 0) {
        ctx.save();
        const rad = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, canvasWidth*0.25, canvasWidth/2, canvasHeight/2, canvasWidth*0.68);
        rad.addColorStop(0, "rgba(0,0,0,0)");
        rad.addColorStop(1, \`rgba(0,0,0,\${vignetteVal/100})\`);
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }

      if (selectedLayer) {
        drawBoundingHandles(selectedLayer);
      }
    }

    function drawKidSilhouette(layer) {
      const x = layer.x;
      const y = layer.y;
      const w = layer.width;
      const h = layer.height;

      ctx.fillStyle = layer.fill || "#090d14";
      ctx.strokeStyle = layer.stroke || "#38bdf8";
      ctx.lineWidth = layer.strokeWidth || 5;

      ctx.beginPath();
      ctx.moveTo(x + w * 0.05, y + h);
      ctx.lineTo(x + w * 0.18, y + h * 0.45);
      ctx.lineTo(x + w * 0.35, y + h * 0.28);
      ctx.lineTo(x + w * 0.65, y + h * 0.28);
      ctx.lineTo(x + w * 0.82, y + h * 0.45);
      ctx.lineTo(x + w * 0.95, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.18, w * 0.26, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#141c2a";
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.2, w * 0.17, h * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawViralArrow(layer) {
      const x = layer.x;
      const y = layer.y;
      const w = layer.width;
      const h = layer.height;

      ctx.fillStyle = layer.fill || '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.35);
      ctx.lineTo(x + w * 0.55, y + h * 0.35);
      ctx.lineTo(x + w * 0.55, y);
      ctx.lineTo(x + w, y + h * 0.5);
      ctx.lineTo(x + w * 0.55, y + h);
      ctx.lineTo(x + w * 0.55, y + h * 0.65);
      ctx.lineTo(x, y + h * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function drawSpeedLines(layer) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const r = Math.max(layer.width, layer.height) / 2;
      ctx.strokeStyle = layer.stroke || 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 4;

      for (let a = 0; a < Math.PI * 2; a += 0.14) {
        ctx.beginPath();
        const startDist = r * 0.45;
        const x1 = cx + Math.cos(a) * startDist;
        const y1 = cy + Math.sin(a) * startDist;
        const x2 = cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    function drawCustomVectorGraphics(layer) {
      const x = layer.x;
      const y = layer.y;
      const w = layer.width;
      const h = layer.height;
      const sub = layer.subType;

      ctx.fillStyle = layer.fill || '#38bdf8';
      ctx.strokeStyle = layer.stroke || '#38bdf8';
      ctx.lineWidth = layer.strokeWidth || 3;

      if (sub === 'curved-arrow') {
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.moveTo(x + 10, y + h - 10);
        ctx.quadraticCurveTo(x + w * 0.2, y + 10, x + w - 30, y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = layer.stroke || '#ef4444';
        ctx.moveTo(x + w, y + 30);
        ctx.lineTo(x + w - 45, y);
        ctx.lineTo(x + w - 35, y + 55);
        ctx.closePath();
        ctx.fill();

      } else if (sub === 'eye') {
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h / 2);
        ctx.quadraticCurveTo(x + w / 2, y, x + w - 10, y + h / 2);
        ctx.quadraticCurveTo(x + w / 2, y + h, x + 10, y + h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, h * 0.22, 0, Math.PI * 2);
        ctx.fill();

      } else if (sub === 'fingerprint') {
        for (let r = 12; r <= Math.min(w, h) / 2 - 8; r += 12) {
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, r, Math.PI * 0.2, Math.PI * 1.8);
          ctx.stroke();
        }

      } else if (sub === 'heart-pixel') {
        ctx.fillStyle = layer.fill || '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.bezierCurveTo(x, y + h * 0.7, x, y, x + w * 0.35, y);
        ctx.bezierCurveTo(x + w * 0.5, y, x + w / 2, y + h * 0.3, x + w / 2, y + h * 0.3);
        ctx.bezierCurveTo(x + w / 2, y + h * 0.3, x + w * 0.5, y, x + w * 0.65, y);
        ctx.bezierCurveTo(x + w, y, x + w, y + h * 0.7, x + w / 2, y + h);
        ctx.fill();

      } else if (sub === 'shield') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.lineTo(x + 10, y + h * 0.3);
        ctx.lineTo(x + w / 2, y + 10);
        ctx.lineTo(x + w - 10, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'sword') {
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + 15, y + h - 15);
        ctx.lineTo(x + w - 15, y + 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y + h * 0.7 - 25);
        ctx.lineTo(x + w * 0.3 + 25, y + h * 0.7);
        ctx.stroke();

      } else if (sub === 'xp-bar') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 4, y + 4, (w - 8) * 0.8, h - 8);
        ctx.strokeRect(x, y, w, h);

      } else if (sub === 'crosshair') {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w / 2, y + h);
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();

      } else if (sub === 'play') {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y + h * 0.15);
        ctx.lineTo(x + w * 0.85, y + h * 0.5);
        ctx.lineTo(x + w * 0.25, y + h * 0.85);
        ctx.closePath();
        ctx.fill();

      } else if (sub === 'bell') {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.35, w * 0.3, Math.PI, 0);
        ctx.lineTo(x + w * 0.85, y + h * 0.75);
        ctx.lineTo(x + w * 0.15, y + h * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'like') {
        ctx.beginPath();
        ctx.roundRect(x + 10, y + h * 0.3, w * 0.25, h * 0.65, 6);
        ctx.roundRect(x + w * 0.4, y + 10, w * 0.5, h * 0.85, 10);
        ctx.fill();

      } else if (sub === 'heart') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x + w * 0.35, y + h * 0.35, w * 0.25, 0, Math.PI * 2);
        ctx.arc(x + w * 0.65, y + h * 0.35, w * 0.25, 0, Math.PI * 2);
        ctx.fill();

      } else if (sub === 'comment') {
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 10, w - 20, h * 0.7, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 35, y + h * 0.7);
        ctx.lineTo(x + 35, y + h - 10);
        ctx.lineTo(x + 65, y + h * 0.7);
        ctx.fill();

      } else if (sub === 'share') {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + h / 2);
        ctx.lineTo(x + w - 20, y + 20);
        ctx.moveTo(x + 20, y + h / 2);
        ctx.lineTo(x + w - 20, y + h - 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 20, y + h / 2, 10, 0, Math.PI * 2);
        ctx.arc(x + w - 20, y + 20, 10, 0, Math.PI * 2);
        ctx.arc(x + w - 20, y + h - 20, 10, 0, Math.PI * 2);
        ctx.fill();

      } else if (sub === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 10);
        ctx.lineTo(x + w - 10, y + h - 10);
        ctx.lineTo(x + 10, y + h - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 10);
        ctx.lineTo(x + w - 10, y + h / 2);
        ctx.lineTo(x + w / 2, y + h - 10);
        ctx.lineTo(x + 10, y + h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'hexagon') {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const px = x + w / 2 + (w * 0.45) * Math.cos(a);
          const py = y + h / 2 + (h * 0.45) * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'parallelogram') {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w * 0.8, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (sub === 'divider') {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w / 2, y + h);
        ctx.stroke();

      } else if (sub === 'sunburst') {
        ctx.lineWidth = 3;
        for (let i = 0; i < 18; i++) {
          const a = (i * Math.PI) / 9;
          ctx.beginPath();
          ctx.moveTo(x + w / 2, y + h / 2);
          ctx.lineTo(x + w / 2 + Math.cos(a) * w * 0.5, y + h / 2 + Math.sin(a) * h * 0.5);
          ctx.stroke();
        }

      } else if (sub === 'grid') {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        for (let px = x; px <= x + w; px += 25) {
          ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
        }
        for (let py = y; py <= y + h; py += 25) {
          ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
        }

      } else if (sub === 'scanlines') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        for (let py = y; py <= y + h; py += 6) {
          ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
        }

      } else if (sub === 'particles') {
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(x + (Math.sin(i * 9) * 0.5 + 0.5) * w, y + (Math.cos(i * 7) * 0.5 + 0.5) * h, (i % 3) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (sub === 'glitch-box') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x, y + 10, w * 0.6, 16);
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x + w * 0.3, y + h * 0.5, w * 0.7, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 20, y + h - 25, w * 0.5, 12);

      } else if (sub === 'corner-glow') {
        const rad = ctx.createRadialGradient(x, y, 10, x, y, Math.max(w, h));
        rad.addColorStop(0, '#38bdf8aa');
        rad.addColorStop(1, 'transparent');
        ctx.fillStyle = rad;
        ctx.fillRect(x, y, w, h);

      } else if (sub === 'sparkle-cluster') {
        ctx.font = '36px sans-serif';
        ctx.fillText('✦', x + 10, y + 40);
        ctx.fillText('✦', x + w - 40, y + 25);
        ctx.fillText('★', x + w / 2, y + h - 15);
      }
    }

    function drawBoundingHandles(layer) {
      ctx.save();
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(layer.rotation || 0);
      ctx.translate(-cx, -cy);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
      ctx.setLineDash([]);

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2;

      const handles = getHandleCoordinates(layer);
      for (const [key, pt] of Object.entries(handles)) {
        ctx.beginPath();
        if (key === 'rot') {
          ctx.moveTo(cx, layer.y - 4);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
          ctx.arc(pt.x, pt.y, HANDLE_RADIUS + 1, 0, Math.PI * 2);
        } else {
          ctx.arc(pt.x, pt.y, HANDLE_RADIUS, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    function getHandleCoordinates(layer) {
      const x = layer.x - 4;
      const y = layer.y - 4;
      const w = layer.width + 8;
      const h = layer.height + 8;
      return {
        tl: { x: x, y: y },
        tr: { x: x + w, y: y },
        bl: { x: x, y: y + h },
        br: { x: x + w, y: y + h },
        rot: { x: x + w / 2, y: y - 28 }
      };
    }

    function addText(text = "HEADLINE", size = 80, bold = true, fill = '#ffffff', glow = 0) {
      const layer = {
        id: Date.now(),
        type: 'text',
        text: text,
        fontSize: size,
        bold: bold,
        fill: fill,
        x: 180,
        y: 200 + layers.length * 15,
        width: 300,
        height: size,
        rotation: 0,
        opacity: 1,
        glowBlur: glow,
        glowColor: fill
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addMysteryKidSilhouette() {
      const layer = {
        id: Date.now(),
        type: 'silhouette',
        fill: '#080c14',
        stroke: '#38bdf8',
        strokeWidth: 6,
        x: 1200,
        y: 260,
        width: 580,
        height: 780,
        rotation: 0,
        opacity: 1,
        glowBlur: 35,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addCensorBar(text = "12 YEARS OLD KID") {
      const bar = {
        id: Date.now(),
        type: 'rect',
        fill: '#000000',
        stroke: '#38bdf8',
        strokeWidth: 2,
        x: 1280,
        y: 410,
        width: 420,
        height: 64,
        rotation: 0,
        opacity: 1,
        glowBlur: 0
      };
      const textLayer = {
        id: Date.now() + 1,
        type: 'text',
        text: text,
        fontSize: 26,
        bold: true,
        fill: '#ffffff',
        x: 1320,
        y: 426,
        width: 340,
        height: 32,
        rotation: 0,
        opacity: 1,
        glowBlur: 0
      };
      layers.push(bar, textLayer);
      selectLayer(textLayer);
      render();
    }

    function addNeonEmblem(symbol = "?") {
      const layer = {
        id: Date.now(),
        type: 'text',
        text: symbol,
        fontSize: 160,
        bold: true,
        fill: '#38bdf8',
        x: 1440,
        y: 620,
        width: 100,
        height: 180,
        rotation: 0,
        opacity: 1,
        glowBlur: 35,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addAuraGlow() {
      const layer = {
        id: Date.now(),
        type: 'circle',
        fill: '#38bdf822',
        x: 1200,
        y: 260,
        width: 550,
        height: 550,
        rotation: 0,
        opacity: 0.8,
        glowBlur: 45,
        glowColor: '#38bdf8'
      };
      layers.unshift(layer);
      selectLayer(layer);
      render();
    }

    function addShape(type = 'rect', fill = '#111722', labelText = '') {
      const layer = {
        id: Date.now(),
        type: type,
        fill: fill,
        stroke: type === 'badge' ? '#ffffff' : (type === 'cross' ? '#ef4444' : '#38bdf8'),
        strokeWidth: 3,
        x: 240,
        y: 240,
        width: type === 'arrow' ? 260 : (type === 'cross' || type === 'check' ? 120 : 380),
        height: type === 'arrow' ? 140 : (type === 'cross' || type === 'check' ? 120 : 180),
        rotation: 0,
        opacity: 1,
        glowBlur: type === 'badge' ? 20 : 0,
        glowColor: fill
      };
      layers.push(layer);

      if (labelText) {
        const textL = {
          id: Date.now() + 1,
          type: 'text',
          text: labelText,
          fontSize: 34,
          bold: true,
          fill: '#ffffff',
          x: layer.x + 30,
          y: layer.y + 30,
          width: 250,
          height: 40,
          rotation: 0,
          opacity: 1
        };
        layers.push(textL);
      }

      selectLayer(layer);
      render();
    }

    function addCustomVector(subType) {
      const layer = {
        id: Date.now(),
        type: 'custom-vector',
        subType: subType,
        fill: '#38bdf8',
        stroke: '#38bdf8',
        strokeWidth: 3,
        x: 400,
        y: 350,
        width: 140,
        height: 140,
        rotation: 0,
        opacity: 1,
        glowBlur: 15,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addSpeedLines() {
      const layer = {
        id: Date.now(),
        type: 'speed-lines',
        stroke: 'rgba(255, 255, 255, 0.3)',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        opacity: 1
      };
      layers.unshift(layer);
      selectLayer(layer);
      render();
    }

    function addBloopUserBubble() {
      const box = {
        id: Date.now(),
        type: 'badge',
        fill: '#151a26',
        stroke: '#1e2638',
        strokeWidth: 2,
        x: 600,
        y: 180,
        width: 520,
        height: 74,
        rotation: 0,
        opacity: 1
      };
      const text = {
        id: Date.now() + 1,
        type: 'text',
        text: 'Who are you and what makes Bloop special?',
        fontSize: 20,
        bold: false,
        fill: '#f1f5f9',
        x: 630,
        y: 204,
        width: 460,
        height: 30,
        rotation: 0,
        opacity: 1
      };
      layers.push(box, text);
      selectLayer(box);
      render();
    }

    function addBloopResponseBubble() {
      const box = {
        id: Date.now(),
        type: 'badge',
        fill: '#0f1420',
        stroke: '#38bdf8',
        strokeWidth: 1.5,
        x: 600,
        y: 280,
        width: 620,
        height: 110,
        rotation: 0,
        opacity: 1,
        glowBlur: 15,
        glowColor: '#38bdf8'
      };
      const text = {
        id: Date.now() + 1,
        type: 'text',
        text: 'I am Bloop! Built at age 12 to help you code and think faster.',
        fontSize: 22,
        bold: true,
        fill: '#38bdf8',
        x: 630,
        y: 310,
        width: 560,
        height: 40,
        rotation: 0,
        opacity: 1
      };
      layers.push(box, text);
      selectLayer(box);
      render();
    }

    function addBloopPillBar() {
      const layer = {
        id: Date.now(),
        type: 'pill-input',
        fill: '#121722',
        stroke: '#38bdf8',
        x: 480,
        y: 920,
        width: 860,
        height: 74,
        rotation: 0,
        opacity: 1,
        glowBlur: 20,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addBloopBadge() {
      const layer = {
        id: Date.now(),
        type: 'badge',
        fill: '#131d2b',
        stroke: '#1e314a',
        strokeWidth: 1.5,
        x: 1650,
        y: 40,
        width: 180,
        height: 42,
        rotation: 0,
        opacity: 1
      };
      const text = {
        id: Date.now() + 1,
        type: 'text',
        text: 'Bloop 2.0 Ultra',
        fontSize: 15,
        bold: true,
        fill: '#38bdf8',
        x: 1680,
        y: 52,
        width: 120,
        height: 20,
        rotation: 0,
        opacity: 1
      };
      layers.push(layer, text);
      selectLayer(text);
      render();
    }

    function addOnlineStatus() {
      const layer = {
        id: Date.now(),
        type: 'text',
        text: '● Online',
        fontSize: 26,
        bold: true,
        fill: '#22c55e',
        x: 120,
        y: 120,
        width: 130,
        height: 35,
        rotation: 0,
        opacity: 1,
        glowBlur: 10,
        glowColor: '#22c55e'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addCyberBrackets() {
      const layer = {
        id: Date.now(),
        type: 'hud-bracket',
        stroke: '#38bdf8',
        x: 150,
        y: 650,
        width: 900,
        height: 260,
        rotation: 0,
        opacity: 1,
        glowBlur: 15,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    function addBorderFrame() {
      const layer = {
        id: Date.now(),
        type: 'border-frame',
        stroke: '#38bdf8',
        x: 20,
        y: 20,
        width: 1880,
        height: 1040,
        rotation: 0,
        opacity: 1,
        glowBlur: 20,
        glowColor: '#38bdf8'
      };
      layers.push(layer);
      selectLayer(layer);
      render();
    }

    document.getElementById("imageUpload").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > 900) {
            const ratio = 900 / w;
            w = 900;
            h = h * ratio;
          }
          const layer = {
            id: Date.now(),
            type: 'image',
            img: img,
            x: (canvasWidth - w) / 2,
            y: (canvasHeight - h) / 2,
            width: w,
            height: h,
            rotation: 0,
            opacity: 1,
            glowBlur: 0
          };
          layers.push(layer);
          selectLayer(layer);
          render();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener("mousedown", onPointerDown);
    canvas.addEventListener("touchstart", onPointerDown, { passive: false });

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: false });

    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);

    function onPointerDown(e) {
      const pos = getCanvasCoords(e);
      startX = pos.x;
      startY = pos.y;

      if (selectedLayer) {
        const handle = hitTestHandles(pos.x, pos.y, selectedLayer);
        if (handle) {
          isTransforming = true;
          currentHandle = handle;
          initialLayerState = { ...selectedLayer };
          if (e.cancelable) e.preventDefault();
          return;
        }
      }

      let hit = null;
      for (let i = layers.length - 1; i >= 0; i--) {
        if (hitTestLayer(pos.x, pos.y, layers[i])) {
          hit = layers[i];
          break;
        }
      }

      if (hit) {
        selectLayer(hit);
        isDragging = true;
        initialLayerState = { x: hit.x, y: hit.y };
      } else {
        selectLayer(null);
      }
      render();
    }

    function onPointerMove(e) {
      if (!isDragging && !isTransforming) return;
      if (e.cancelable) e.preventDefault();

      const pos = getCanvasCoords(e);
      const dx = pos.x - startX;
      const dy = pos.y - startY;

      if (isDragging && selectedLayer) {
        selectedLayer.x = initialLayerState.x + dx;
        selectedLayer.y = initialLayerState.y + dy;
      } else if (isTransforming && selectedLayer) {
        const s = initialLayerState;

        if (currentHandle === 'br') {
          selectedLayer.width = Math.max(30, s.width + dx);
          selectedLayer.height = Math.max(20, s.height + dy);
          if (selectedLayer.type === 'text') {
            selectedLayer.fontSize = Math.max(14, s.fontSize * (selectedLayer.width / s.width));
          }
        } else if (currentHandle === 'tl') {
          selectedLayer.x = s.x + dx;
          selectedLayer.y = s.y + dy;
          selectedLayer.width = Math.max(30, s.width - dx);
          selectedLayer.height = Math.max(20, s.height - dy);
          if (selectedLayer.type === 'text') {
            selectedLayer.fontSize = Math.max(14, s.fontSize * (selectedLayer.width / s.width));
          }
        } else if (currentHandle === 'tr') {
          selectedLayer.y = s.y + dy;
          selectedLayer.width = Math.max(30, s.width + dx);
          selectedLayer.height = Math.max(20, s.height - dy);
        } else if (currentHandle === 'bl') {
          selectedLayer.x = s.x + dx;
          selectedLayer.width = Math.max(30, s.width - dx);
          selectedLayer.height = Math.max(20, s.height + dy);
        } else if (currentHandle === 'rot') {
          const cx = s.x + s.width / 2;
          const cy = s.y + s.height / 2;
          selectedLayer.rotation = Math.atan2(pos.y - cy, pos.x - cx) - Math.PI / 2;
        }
      }

      syncInspectorInputs();
      render();
    }

    function onPointerUp() {
      isDragging = false;
      isTransforming = false;
      currentHandle = null;
    }

    function hitTestLayer(px, py, layer) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const cos = Math.cos(-(layer.rotation || 0));
      const sin = Math.sin(-(layer.rotation || 0));
      const rx = cos * (px - cx) - sin * (py - cy) + cx;
      const ry = sin * (px - cx) + cos * (py - cy) + cy;

      return rx >= layer.x && rx <= layer.x + layer.width &&
             ry >= layer.y && ry <= layer.y + layer.height;
    }

    function hitTestHandles(px, py, layer) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const cos = Math.cos(-(layer.rotation || 0));
      const sin = Math.sin(-(layer.rotation || 0));
      const rx = cos * (px - cx) - sin * (py - cy) + cx;
      const ry = sin * (px - cx) + cos * (py - cy) + cy;

      const handles = getHandleCoordinates(layer);
      for (const [key, pt] of Object.entries(handles)) {
        const dist = Math.hypot(rx - pt.x, ry - pt.y);
        if (dist <= HANDLE_RADIUS + 8) return key;
      }
      return null;
    }

    function selectLayer(layer) {
      selectedLayer = layer;
      const noSel = document.getElementById("noSelectionMsg");
      const selCtrl = document.getElementById("selectionControls");

      if (!layer) {
        noSel.style.display = "block";
        selCtrl.style.display = "none";
        return;
      }

      noSel.style.display = "none";
      selCtrl.style.display = "flex";

      const isText = layer.type === 'text';
      document.getElementById("textInputRow").style.display = isText ? "flex" : "none";
      document.getElementById("fontSizeRow").style.display = isText ? "flex" : "none";

      syncInspectorInputs();
    }

    function syncInspectorInputs() {
      if (!selectedLayer) return;
      document.getElementById("propWidth").value = Math.round(selectedLayer.width);
      document.getElementById("propHeight").value = Math.round(selectedLayer.height);
      document.getElementById("propRotation").value = Math.round(((selectedLayer.rotation || 0) * 180) / Math.PI);

      if (selectedLayer.type === 'text') {
        document.getElementById("propText").value = selectedLayer.text;
        document.getElementById("propFontSize").value = selectedLayer.fontSize;
      }
      document.getElementById("propColor").value = selectedLayer.fill || '#ffffff';
      document.getElementById("fillColorHex").textContent = selectedLayer.fill || '#ffffff';
      document.getElementById("propGlowColor").value = selectedLayer.glowColor || '#38bdf8';
      document.getElementById("propGlowBlur").value = selectedLayer.glowBlur || 0;
      document.getElementById("propOpacity").value = (selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1) * 100;
    }

    function updateSelected(key, val) {
      if (!selectedLayer) return;
      selectedLayer[key] = val;
      render();
    }

    function updateSelectedNum(key, val) {
      if (!selectedLayer) return;
      selectedLayer[key] = Math.max(10, parseFloat(val) || 10);
      render();
    }

    function moveLayer(dir) {
      if (!selectedLayer) return;
      const idx = layers.indexOf(selectedLayer);
      if (dir === 'forward' && idx < layers.length - 1) {
        layers.splice(idx, 1);
        layers.splice(idx + 1, 0, selectedLayer);
      } else if (dir === 'backward' && idx > 0) {
        layers.splice(idx, 1);
        layers.splice(idx - 1, 0, selectedLayer);
      }
      render();
    }

    function duplicateSelected() {
      if (!selectedLayer) return;
      const copy = { ...selectedLayer, id: Date.now(), x: selectedLayer.x + 35, y: selectedLayer.y + 35 };
      layers.push(copy);
      selectLayer(copy);
      render();
    }

    function deleteSelected() {
      if (!selectedLayer) return;
      layers = layers.filter(l => l !== selectedLayer);
      selectLayer(null);
      render();
    }

    function updateCanvasBg(color) {
      canvasBg = color;
      render();
    }

    function changeCanvasPreset(preset) {
      const [w, h] = preset.split("x").map(Number);
      canvasWidth = w;
      canvasHeight = h;
      canvas.width = w;
      canvas.height = h;
      fitCanvasView();
      render();
    }

    function loadTemplate(key) {
      layers = [];
      selectLayer(null);

      if (key === 'bloop-prodigy') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#07090e';
        document.getElementById("vignetteRange").value = 45;

        layers.push({
          id: 1, type: 'rect', fill: '#0e131d', stroke: '#1e273a', strokeWidth: 2,
          x: 40, y: 40, width: 340, height: 1000, rotation: 0, opacity: 1, glowBlur: 0
        });
        layers.push({
          id: 2, type: 'badge', fill: '#151b29', stroke: '#1e273a', strokeWidth: 2,
          x: 440, y: 120, width: 560, height: 75, rotation: 0, opacity: 1, glowBlur: 0
        });
        layers.push({
          id: 3, type: 'text', text: 'Who are you and what makes Bloop special?', fontSize: 20, bold: false, fill: '#f1f5f9',
          x: 470, y: 145, width: 500, height: 25, rotation: 0, opacity: 1
        });
        layers.push({
          id: 4, type: 'pill-input', fill: '#121722', stroke: '#38bdf8',
          x: 440, y: 920, width: 680, height: 75, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#38bdf8'
        });

        layers.push({
          id: 5, type: 'rect', fill: 'rgba(10, 14, 24, 0.95)', stroke: '#38bdf8', strokeWidth: 2,
          x: 420, y: 640, width: 780, height: 230, rotation: -0.02, opacity: 1, glowBlur: 15, glowColor: '#38bdf8'
        });
        layers.push({
          id: 6, type: 'text', text: 'I BUILT AN AI STUDIO', fontSize: 72, bold: true, fill: '#ffffff',
          x: 450, y: 670, width: 700, height: 75, rotation: -0.02, opacity: 1, glowBlur: 10, glowColor: '#000000'
        });
        layers.push({
          id: 7, type: 'text', text: 'AT AGE 12 ✦ BLOOP AI', fontSize: 62, bold: true, fill: '#38bdf8',
          x: 450, y: 765, width: 700, height: 65, rotation: -0.02, opacity: 1, glowBlur: 25, glowColor: '#38bdf8'
        });

        addMysteryKidSilhouette();
        addCensorBar('12 YEARS OLD KID');
        addNeonEmblem('?');

      } else if (key === 'mrbeast-shock') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#1c0707';
        document.getElementById("vignetteRange").value = 40;

        layers.push({
          id: 1, type: 'speed-lines', stroke: 'rgba(239, 68, 68, 0.3)',
          x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1
        });
        layers.push({
          id: 2, type: 'badge', fill: '#ef4444', stroke: '#ffffff', strokeWidth: 4,
          x: 120, y: 100, width: 520, height: 95, rotation: -0.05, opacity: 1, glowBlur: 30, glowColor: '#ef4444'
        });
        layers.push({
          id: 3, type: 'text', text: 'DO NOT TRY THIS!', fontSize: 46, bold: true, fill: '#ffffff',
          x: 150, y: 122, width: 460, height: 50, rotation: -0.05, opacity: 1
        });
        layers.push({
          id: 4, type: 'arrow', fill: '#ef4444',
          x: 950, y: 320, width: 320, height: 180, rotation: 0.35, opacity: 1, glowBlur: 20, glowColor: '#ef4444'
        });
        layers.push({
          id: 5, type: 'text', text: 'THEY BANNED ME...', fontSize: 130, bold: true, fill: '#facc15',
          x: 120, y: 680, width: 1200, height: 140, rotation: -0.03, opacity: 1, glowBlur: 35, glowColor: '#ca8a04'
        });
        layers.push({
          id: 6, type: 'text', text: 'IN JUST 24 HOURS!', fontSize: 105, bold: true, fill: '#ffffff',
          x: 120, y: 830, width: 1100, height: 110, rotation: -0.03, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });
        layers.push({
          id: 7, type: 'badge', fill: '#0a0a0a', stroke: '#facc15', strokeWidth: 5,
          x: 1380, y: 220, width: 460, height: 600, rotation: 0.04, opacity: 1, glowBlur: 30, glowColor: '#facc15'
        });
        layers.push({
          id: 8, type: 'text', text: '😱', fontSize: 180, bold: false, fill: '#ffffff',
          x: 1510, y: 380, width: 200, height: 200, rotation: 0, opacity: 1
        });

      } else if (key === 'cyber-hacker') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#040b08';
        document.getElementById("vignetteRange").value = 55;

        layers.push({
          id: 1, type: 'hud-bracket', stroke: '#22c55e',
          x: 80, y: 80, width: 1760, height: 920, rotation: 0, opacity: 0.9, glowBlur: 20, glowColor: '#22c55e'
        });
        layers.push({
          id: 2, type: 'text', text: '> SYSTEM_BREACH_DETECTED (ROOT_ACCESS)', fontSize: 32, bold: true, fill: '#4ade80',
          x: 140, y: 130, width: 800, height: 35, rotation: 0, opacity: 1, glowBlur: 10, glowColor: '#22c55e'
        });
        layers.push({
          id: 3, type: 'text', text: '100% AUTOMATED WITH CODE', fontSize: 96, bold: true, fill: '#ffffff',
          x: 140, y: 640, width: 1400, height: 100, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#000000'
        });
        layers.push({
          id: 4, type: 'text', text: 'NEURAL AI MODEL DEPLOYED ⚡', fontSize: 74, bold: true, fill: '#22d3ee',
          x: 140, y: 760, width: 1200, height: 80, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#22d3ee'
        });
        layers.push({
          id: 5, type: 'badge', fill: '#052e16', stroke: '#4ade80', strokeWidth: 2,
          x: 140, y: 880, width: 340, height: 60, rotation: 0, opacity: 1
        });
        layers.push({
          id: 6, type: 'text', text: 'STATUS: ACTIVE', fontSize: 26, bold: true, fill: '#4ade80',
          x: 200, y: 895, width: 220, height: 30, rotation: 0, opacity: 1
        });

      } else if (key === 'before-after') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#07090e';
        document.getElementById("vignetteRange").value = 35;

        layers.push({
          id: 1, type: 'rect', fill: 'rgba(127, 29, 29, 0.45)', stroke: '#ef4444', strokeWidth: 2,
          x: 80, y: 80, width: 850, height: 920, rotation: 0, opacity: 1
        });
        layers.push({
          id: 2, type: 'rect', fill: 'rgba(20, 83, 45, 0.45)', stroke: '#22c55e', strokeWidth: 2,
          x: 990, y: 80, width: 850, height: 920, rotation: 0, opacity: 1
        });
        layers.push({
          id: 3, type: 'badge', fill: '#ef4444', stroke: '#ffffff', strokeWidth: 3,
          x: 240, y: 130, width: 500, height: 85, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#ef4444'
        });
        layers.push({
          id: 4, type: 'text', text: 'BEFORE / NOOB', fontSize: 48, bold: true, fill: '#ffffff',
          x: 320, y: 145, width: 350, height: 50, rotation: 0, opacity: 1
        });
        layers.push({
          id: 5, type: 'cross', stroke: '#ef4444',
          x: 420, y: 380, width: 180, height: 180, rotation: 0, opacity: 1
        });
        layers.push({
          id: 6, type: 'badge', fill: '#22c55e', stroke: '#ffffff', strokeWidth: 3,
          x: 1160, y: 130, width: 500, height: 85, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#22c55e'
        });
        layers.push({
          id: 7, type: 'text', text: 'AFTER / PRODIGY', fontSize: 48, bold: true, fill: '#ffffff',
          x: 1220, y: 145, width: 380, height: 50, rotation: 0, opacity: 1
        });
        layers.push({
          id: 8, type: 'check', stroke: '#22c55e',
          x: 1340, y: 380, width: 180, height: 180, rotation: 0, opacity: 1
        });
        layers.push({
          id: 9, type: 'badge', fill: '#0a0d14', stroke: '#facc15', strokeWidth: 4,
          x: 620, y: 840, width: 680, height: 110, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#facc15'
        });
        layers.push({
          id: 10, type: 'text', text: 'HOW TO LEVEL UP FAST', fontSize: 52, bold: true, fill: '#facc15',
          x: 680, y: 865, width: 560, height: 60, rotation: 0, opacity: 1
        });

      } else if (key === 'hardcore-gaming') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#0b0817';
        document.getElementById("vignetteRange").value = 50;

        layers.push({
          id: 1, type: 'badge', fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 3,
          x: 100, y: 120, width: 440, height: 85, rotation: -0.04, opacity: 1, glowBlur: 25, glowColor: '#7c3aed'
        });
        layers.push({
          id: 2, type: 'text', text: '100 DAYS SURVIVAL', fontSize: 38, bold: true, fill: '#ffffff',
          x: 130, y: 142, width: 380, height: 40, rotation: -0.04, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: 'I BEAT THE GAME', fontSize: 120, bold: true, fill: '#ffffff',
          x: 100, y: 640, width: 1100, height: 130, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#000000'
        });
        layers.push({
          id: 4, type: 'text', text: 'WITH NO ARMOR! 👑', fontSize: 98, bold: true, fill: '#f59e0b',
          x: 100, y: 790, width: 1000, height: 110, rotation: 0, opacity: 1, glowBlur: 35, glowColor: '#f59e0b'
        });

      } else if (key === 'true-crime') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#0a0a0c';
        document.getElementById("vignetteRange").value = 65;

        layers.push({
          id: 1, type: 'badge', fill: '#000000', stroke: '#ef4444', strokeWidth: 3,
          x: 120, y: 100, width: 360, height: 75, rotation: 0.03, opacity: 1, glowBlur: 15, glowColor: '#ef4444'
        });
        layers.push({
          id: 2, type: 'text', text: 'CLASSIFIED FILE #012', fontSize: 26, bold: true, fill: '#ef4444',
          x: 150, y: 122, width: 300, height: 30, rotation: 0.03, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: 'THE UNTOLD STORY', fontSize: 105, bold: true, fill: '#ffffff',
          x: 120, y: 660, width: 1100, height: 115, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#000000'
        });
        layers.push({
          id: 4, type: 'text', text: 'WHAT HAPPENED TO BLOOP?', fontSize: 72, bold: true, fill: '#ef4444',
          x: 120, y: 800, width: 1100, height: 80, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#ef4444'
        });
        layers.push({
          id: 5, type: 'rect', fill: '#17171a', stroke: '#ffffff', strokeWidth: 4,
          x: 1320, y: 220, width: 500, height: 620, rotation: -0.05, opacity: 1
        });
        layers.push({
          id: 6, type: 'rect', fill: '#000000', stroke: '#ef4444', strokeWidth: 2,
          x: 1370, y: 440, width: 400, height: 60, rotation: -0.05, opacity: 1
        });
        layers.push({
          id: 7, type: 'text', text: 'CONFIDENTIAL', fontSize: 24, bold: true, fill: '#ffffff',
          x: 1470, y: 456, width: 200, height: 30, rotation: -0.05, opacity: 1
        });

      } else if (key === 'startup-launch') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#0b0f19';
        document.getElementById("vignetteRange").value = 35;

        layers.push({
          id: 1, type: 'rect', fill: 'rgba(30, 41, 59, 0.7)', stroke: '#38bdf8', strokeWidth: 2,
          x: 120, y: 140, width: 1680, height: 800, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#38bdf8'
        });
        layers.push({
          id: 2, type: 'badge', fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2,
          x: 180, y: 200, width: 300, height: 60, rotation: 0, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: '#1 PRODUCT OF THE DAY', fontSize: 20, bold: true, fill: '#07090e',
          x: 210, y: 218, width: 250, height: 25, rotation: 0, opacity: 1
        });
        layers.push({
          id: 4, type: 'text', text: 'BLOOP AI STUDIO 2.0', fontSize: 105, bold: true, fill: '#ffffff',
          x: 180, y: 300, width: 1200, height: 115, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#000000'
        });
        layers.push({
          id: 5, type: 'text', text: 'The fast, personal AI assistant built for creators and coders.', fontSize: 44, bold: false, fill: '#94a3b8',
          x: 180, y: 450, width: 1300, height: 55, rotation: 0, opacity: 1
        });
        layers.push({
          id: 6, type: 'pill-input', fill: '#0f172a', stroke: '#a855f7',
          x: 180, y: 640, width: 950, height: 90, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#a855f7'
        });

      } else if (key === 'speed-burst') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#1c0804';
        document.getElementById("vignetteRange").value = 30;

        layers.push({
          id: 1, type: 'speed-lines', stroke: 'rgba(249, 115, 22, 0.4)',
          x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1
        });
        layers.push({
          id: 2, type: 'circle', fill: '#f9731633',
          x: 460, y: 40, width: 1000, height: 1000, rotation: 0, opacity: 0.9, glowBlur: 50, glowColor: '#f97316'
        });
        layers.push({
          id: 3, type: 'text', text: 'EPIC REVEAL!', fontSize: 160, bold: true, fill: '#facc15',
          x: 280, y: 420, width: 1400, height: 180, rotation: -0.05, opacity: 1, glowBlur: 40, glowColor: '#ea580c'
        });
        layers.push({
          id: 4, type: 'text', text: 'YOU WON\\'T BELIEVE WHAT HAPPENED', fontSize: 62, bold: true, fill: '#ffffff',
          x: 320, y: 620, width: 1300, height: 70, rotation: -0.05, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });

      } else if (key === 'hardware-review') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#0b1329';
        document.getElementById("vignetteRange").value = 35;

        layers.push({
          id: 1, type: 'hud-bracket', stroke: '#38bdf8',
          x: 80, y: 80, width: 1760, height: 920, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#38bdf8'
        });
        layers.push({
          id: 2, type: 'badge', fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2,
          x: 140, y: 140, width: 340, height: 65, rotation: 0, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: 'FLAGSHIP REVIEW', fontSize: 32, bold: true, fill: '#ffffff',
          x: 180, y: 155, width: 280, height: 35, rotation: 0, opacity: 1
        });
        layers.push({
          id: 4, type: 'text', text: 'DON\\'T BUY THIS YET!', fontSize: 110, bold: true, fill: '#ffffff',
          x: 140, y: 640, width: 1300, height: 120, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#000000'
        });
        layers.push({
          id: 5, type: 'text', text: 'THE REAL TRUTH AFTER 30 DAYS', fontSize: 62, bold: true, fill: '#38bdf8',
          x: 140, y: 780, width: 1200, height: 70, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#38bdf8'
        });
        layers.push({
          id: 6, type: 'rect', fill: '#152445', stroke: '#38bdf8', strokeWidth: 3,
          x: 1380, y: 220, width: 440, height: 600, rotation: 0.05, opacity: 1, glowBlur: 30, glowColor: '#38bdf8'
        });
        layers.push({
          id: 7, type: 'text', text: '📱', fontSize: 180, bold: false, fill: '#ffffff',
          x: 1500, y: 380, width: 200, height: 200, rotation: 0.05, opacity: 1
        });

      } else if (key === 'gta-heist') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#1c1003';
        document.getElementById("vignetteRange").value = 45;

        layers.push({
          id: 1, type: 'badge', fill: '#b45309', stroke: '#fde047', strokeWidth: 3,
          x: 120, y: 120, width: 480, height: 85, rotation: -0.04, opacity: 1, glowBlur: 25, glowColor: '#fde047'
        });
        layers.push({
          id: 2, type: 'text', text: '★ ★ ★ ★ ★ WANTED', fontSize: 38, bold: true, fill: '#fde047',
          x: 150, y: 142, width: 420, height: 40, rotation: -0.04, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: '$10,000,000 HEIST', fontSize: 130, bold: true, fill: '#facc15',
          x: 120, y: 640, width: 1200, height: 140, rotation: -0.02, opacity: 1, glowBlur: 35, glowColor: '#d97706'
        });
        layers.push({
          id: 4, type: 'text', text: 'SOLO STEALTH RUN!', fontSize: 88, bold: true, fill: '#ffffff',
          x: 120, y: 790, width: 1000, height: 95, rotation: -0.02, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });
        layers.push({
          id: 5, type: 'arrow', fill: '#f59e0b',
          x: 1250, y: 440, width: 340, height: 180, rotation: -0.2, opacity: 1, glowBlur: 25, glowColor: '#f59e0b'
        });

      } else if (key === 'podcast-studio') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#09090b';
        document.getElementById("vignetteRange").value = 40;

        layers.push({
          id: 1, type: 'rect', fill: 'rgba(24, 24, 27, 0.85)', stroke: '#27272a', strokeWidth: 2,
          x: 80, y: 80, width: 850, height: 750, rotation: 0, opacity: 1
        });
        layers.push({
          id: 2, type: 'rect', fill: 'rgba(24, 24, 27, 0.85)', stroke: '#27272a', strokeWidth: 2,
          x: 990, y: 80, width: 850, height: 750, rotation: 0, opacity: 1
        });
        layers.push({
          id: 3, type: 'badge', fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2,
          x: 850, y: 120, width: 220, height: 60, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#ef4444'
        });
        layers.push({
          id: 4, type: 'text', text: '● ON AIR', fontSize: 28, bold: true, fill: '#ffffff',
          x: 895, y: 135, width: 140, height: 30, rotation: 0, opacity: 1
        });
        layers.push({
          id: 5, type: 'badge', fill: '#18181b', stroke: '#38bdf8', strokeWidth: 2,
          x: 180, y: 860, width: 1560, height: 160, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#38bdf8'
        });
        layers.push({
          id: 6, type: 'text', text: 'THE SECRET LIFE OF A 12-YEAR-OLD CODER', fontSize: 58, bold: true, fill: '#ffffff',
          x: 240, y: 885, width: 1400, height: 65, rotation: 0, opacity: 1
        });
        layers.push({
          id: 7, type: 'text', text: 'BLOOP PODCAST EPISODE #42 ✦ WITH GUEST', fontSize: 32, bold: true, fill: '#38bdf8',
          x: 240, y: 960, width: 1000, height: 35, rotation: 0, opacity: 1
        });

      } else if (key === 'esports-final') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#0b091f';
        document.getElementById("vignetteRange").value = 45;

        layers.push({
          id: 1, type: 'badge', fill: '#4338ca', stroke: '#a855f7', strokeWidth: 3,
          x: 710, y: 80, width: 500, height: 80, rotation: 0, opacity: 1, glowBlur: 25, glowColor: '#a855f7'
        });
        layers.push({
          id: 2, type: 'text', text: 'GRAND FINALS 2026', fontSize: 38, bold: true, fill: '#ffffff',
          x: 770, y: 100, width: 380, height: 40, rotation: 0, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: 'TEAM ALPHA', fontSize: 94, bold: true, fill: '#38bdf8',
          x: 160, y: 440, width: 650, height: 100, rotation: 0, opacity: 1, glowBlur: 30, glowColor: '#38bdf8'
        });
        layers.push({
          id: 4, type: 'text', text: 'VS', fontSize: 130, bold: true, fill: '#facc15',
          x: 880, y: 420, width: 160, height: 130, rotation: 0, opacity: 1, glowBlur: 35, glowColor: '#facc15'
        });
        layers.push({
          id: 5, type: 'text', text: 'TEAM BLOOP', fontSize: 94, bold: true, fill: '#ec4899',
          x: 1150, y: 440, width: 650, height: 100, rotation: 0, opacity: 1, glowBlur: 30, glowColor: '#ec4899'
        });
        layers.push({
          id: 6, type: 'text', text: '$500,000 PRIZE POOL MATCH', fontSize: 64, bold: true, fill: '#ffffff',
          x: 480, y: 760, width: 960, height: 70, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });

      } else if (key === 'crypto-bull') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#021e17';
        document.getElementById("vignetteRange").value = 40;

        layers.push({
          id: 1, type: 'badge', fill: '#059669', stroke: '#34d399', strokeWidth: 3,
          x: 120, y: 120, width: 440, height: 80, rotation: -0.03, opacity: 1, glowBlur: 25, glowColor: '#34d399'
        });
        layers.push({
          id: 2, type: 'text', text: 'BREAKOUT ALERT 🚀', fontSize: 36, bold: true, fill: '#ffffff',
          x: 160, y: 140, width: 360, height: 40, rotation: -0.03, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: '1000X NEXT MOON?', fontSize: 120, bold: true, fill: '#34d399',
          x: 120, y: 640, width: 1200, height: 130, rotation: 0, opacity: 1, glowBlur: 35, glowColor: '#059669'
        });
        layers.push({
          id: 4, type: 'text', text: 'ALL-TIME HIGH TARGETS!', fontSize: 84, bold: true, fill: '#ffffff',
          x: 120, y: 790, width: 1100, height: 90, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });
        layers.push({
          id: 5, type: 'arrow', fill: '#10b981',
          x: 1320, y: 380, width: 360, height: 200, rotation: -0.65, opacity: 1, glowBlur: 30, glowColor: '#10b981'
        });

      } else if (key === 'horror-paranormal') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#04070a';
        document.getElementById("vignetteRange").value = 75;

        layers.push({
          id: 1, type: 'text', text: '● REC  [03:04:12 AM]', fontSize: 36, bold: true, fill: '#ef4444',
          x: 120, y: 120, width: 450, height: 40, rotation: 0, opacity: 1, glowBlur: 15, glowColor: '#ef4444'
        });
        layers.push({
          id: 2, type: 'text', text: 'DO NOT GO IN THERE', fontSize: 115, bold: true, fill: '#f1f5f9',
          x: 120, y: 640, width: 1200, height: 125, rotation: 0, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });
        layers.push({
          id: 3, type: 'text', text: 'PARANORMAL ACTIVITY CAUGHT 💀', fontSize: 68, bold: true, fill: '#ef4444',
          x: 120, y: 780, width: 1200, height: 75, rotation: 0, opacity: 1, glowBlur: 30, glowColor: '#ef4444'
        });
        layers.push({
          id: 4, type: 'text', text: '👻', fontSize: 240, bold: false, fill: '#ffffff',
          x: 1420, y: 280, width: 260, height: 260, rotation: 0, opacity: 0.75, glowBlur: 40, glowColor: '#ffffff'
        });

      } else if (key === 'fitness-transform') {
        changeCanvasPreset('1920x1080');
        canvasBg = '#140c06';
        document.getElementById("vignetteRange").value = 45;

        layers.push({
          id: 1, type: 'badge', fill: '#ea580c', stroke: '#ffffff', strokeWidth: 3,
          x: 120, y: 120, width: 440, height: 80, rotation: -0.03, opacity: 1, glowBlur: 25, glowColor: '#ea580c'
        });
        layers.push({
          id: 2, type: 'text', text: '90 DAYS CHALLENGE', fontSize: 36, bold: true, fill: '#ffffff',
          x: 150, y: 142, width: 380, height: 40, rotation: -0.03, opacity: 1
        });
        layers.push({
          id: 3, type: 'text', text: 'ZERO TO HERO', fontSize: 130, bold: true, fill: '#f97316',
          x: 120, y: 640, width: 1100, height: 140, rotation: -0.02, opacity: 1, glowBlur: 35, glowColor: '#ea580c'
        });
        layers.push({
          id: 4, type: 'text', text: 'MY COMPLETE ROUTINE 💪', fontSize: 88, bold: true, fill: '#ffffff',
          x: 120, y: 790, width: 1100, height: 95, rotation: -0.02, opacity: 1, glowBlur: 20, glowColor: '#000000'
        });
        layers.push({
          id: 5, type: 'badge', fill: '#0a0d14', stroke: '#f97316', strokeWidth: 4,
          x: 1360, y: 260, width: 440, height: 560, rotation: 0.04, opacity: 1, glowBlur: 25, glowColor: '#f97316'
        });
        layers.push({
          id: 6, type: 'text', text: '🔥', fontSize: 160, bold: false, fill: '#ffffff',
          x: 1500, y: 440, width: 180, height: 180, rotation: 0.04, opacity: 1
        });
      }

      render();
    }

    function switchTab(tabId) {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      event.currentTarget.classList.add("active");
      document.getElementById(\`tab-\${tabId}\`).classList.add("active");
    }

    document.getElementById("exportBtn").addEventListener("click", () => {
      selectLayer(null);
      render();
      const a = document.createElement("a");
      a.download = \`bloop-thumbnail-\${canvasWidth}x\${canvasHeight}.png\`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    });

    document.getElementById("clearCanvasBtn").addEventListener("click", () => {
      if (confirm("Clear all layers on canvas?")) {
        layers = [];
        selectLayer(null);
        render();
      }
    });

    window.addEventListener("keydown", (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayer) {
        if (document.activeElement.tagName !== 'INPUT') {
          deleteSelected();
        }
      }
      if (e.key === "Escape") {
        selectLayer(null);
        render();
      }
    });

    loadTemplate('bloop-prodigy');
    fitCanvasView();
  </script>
</body>
</html>`);
});

// ----------------------------------------------------
// 3. ROUTE: / (AND FALLBACK) -> BLOOP AI CHATBOT STUDIO
// ----------------------------------------------------
app.get('*', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content">
  <title>Bloop AI Studio</title>
  
  <meta name="theme-color" content="#0b0e14">
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

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100dvh; min-height: 100dvh; overflow: hidden; background-color: var(--bg-main); color: var(--text-primary); }
    body { display: flex; position: relative; }

    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); z-index: 40; display: none; opacity: 0; transition: opacity 0.25s ease; }
    .sidebar-overlay.active { display: block; opacity: 1; }

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
    aside.desktop-collapsed { margin-left: calc(-1 * var(--sidebar-width)); }

    .sidebar-header { padding: 1.1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; }
    .brand-wrap { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #38bdf8, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.1rem; }
    .brand-text h1 { font-size: 1.05rem; font-weight: 700; }
    .brand-text span { font-size: 0.68rem; color: var(--accent-blue); font-weight: 700; letter-spacing: 0.08em; }

    .toggle-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.15rem; cursor: pointer; padding: 8px; border-radius: 8px; }
    .new-chat-btn { margin: 0.25rem 1rem 0.85rem; padding: 0.75rem 1rem; background-color: #172030; border: 1px solid var(--border-color); border-radius: 24px; color: var(--text-primary); display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; font-weight: 500; cursor: pointer; }

    .sidebar-section-title { padding: 0.6rem 1.25rem 0.35rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 700; display: flex; justify-content: space-between; }
    .chat-history { flex: 1; overflow-y: auto; padding: 0.25rem 0.6rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .history-item { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.8rem; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.86rem; gap: 0.6rem; }
    .history-item span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .history-item.active { background-color: #161e2c; color: var(--text-primary); }
    .delete-chat-btn { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; border-radius: 4px; }

    .user-profile { padding: 0.85rem 1.1rem; background-color: #0d1119; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; }
    .profile-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
    .profile-names .name { font-size: 0.84rem; font-weight: 600; }
    .status-line { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: #22c55e; }
    .status-dot { width: 6px; height: 6px; background-color: #22c55e; border-radius: 50%; }

    main { flex: 1; display: flex; flex-direction: column; height: 100dvh; overflow: hidden; position: relative; background-color: var(--bg-main); }
    .top-bar { height: 54px; min-height: 54px; padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.04); z-index: 10; }
    .top-left { display: flex; align-items: center; gap: 0.6rem; }
    .breadcrumbs { display: flex; align-items: center; gap: 0.45rem; font-size: 0.84rem; }
    .breadcrumbs .brand-crumb { font-weight: 700; }
    .breadcrumbs .title-crumb { color: var(--text-secondary); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .top-right { display: flex; align-items: center; gap: 0.6rem; }
    .studio-link-btn {
      font-size: 0.76rem;
      font-weight: 700;
      color: #07090e;
      background: var(--accent-blue);
      padding: 0.35rem 0.85rem;
      border-radius: 18px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s;
    }
    .studio-link-btn:hover { background: #7dd3fc; }
    .model-badge { font-size: 0.76rem; font-weight: 600; color: var(--accent-blue); background: #131d2b; border: 1px solid #1e314a; padding: 0.3rem 0.75rem; border-radius: 20px; }

    .messages-viewport { flex: 1; overflow-y: auto; padding: 1.25rem 1rem 8rem; display: flex; flex-direction: column; align-items: center; }
    .messages-container { width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 1.4rem; }

    .empty-state { margin-top: 3vh; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.1rem; width: 100%; }
    .hero-badge-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #1b263b, #152238); border: 1px solid #233552; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--accent-blue); font-size: 1.35rem; }
    .hero-title { font-size: 2.1rem; font-weight: 700; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-subtitle { color: var(--text-secondary); font-size: 0.94rem; max-width: 480px; line-height: 1.5; }

    .prompt-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; width: 100%; max-width: 680px; margin-top: 0.5rem; }
    .prompt-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.9rem 1rem; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 0.3rem; }
    .prompt-card-title { font-size: 0.86rem; font-weight: 600; }
    .prompt-card-desc { font-size: 0.77rem; color: var(--text-secondary); line-height: 1.4; }

    .message-row { display: flex; width: 100%; gap: 1rem; }
    .message-row.user { justify-content: flex-end; }
    .bubble { padding: 0.8rem 1.15rem; border-radius: 18px; font-size: 0.93rem; line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
    .user .bubble { background-color: var(--bg-card); border: 1px solid var(--border-color); max-width: 82%; border-bottom-right-radius: 4px; }
    .assistant .bubble { background: transparent; max-width: 100%; padding-left: 0; }
    .typing-cursor::after { content: "▎"; color: var(--accent-blue); animation: blink 0.8s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .input-wrapper { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.75rem 1rem 1rem; background: linear-gradient(180deg, rgba(11, 14, 20, 0) 0%, var(--bg-main) 45%); display: flex; flex-direction: column; align-items: center; z-index: 20; }
    .input-box { width: 100%; max-width: 740px; background-color: var(--bg-input); border: 1.5px solid #1f364d; border-radius: 36px; padding: 0.45rem 0.65rem 0.45rem 0.75rem; display: flex; align-items: center; gap: 0.55rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
    .input-box:focus-within { border-color: #38bdf8; box-shadow: 0 0 16px rgba(56, 189, 248, 0.25); }
    .input-box textarea { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 16px; resize: none; max-height: 110px; line-height: 1.4; padding: 0.4rem 0; }
    .send-btn { width: 36px; height: 36px; border-radius: 50%; background: #192a3e; border: 1px solid #284463; color: var(--accent-blue); display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .send-btn.stop-state { background: #7f1d1d; border-color: #ef4444; color: #ffffff; opacity: 1 !important; }
    .footnote { margin-top: 0.45rem; font-size: 0.72rem; color: var(--text-muted); }

    body.is-mobile aside { position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); margin-left: 0 !important; }
    body.is-mobile aside.mobile-open { transform: translateX(0); }
    body.is-mobile .prompt-cards-grid { grid-template-columns: 1fr; }
  </style>
</head>
<body>

  <div class="sidebar-overlay" id="sidebarOverlay"></div>

  <aside id="sidebar">
    <div class="sidebar-header">
      <div class="brand-wrap">
        <div class="brand-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <div class="brand-text">
          <h1>Bloop</h1>
          <span>AI STUDIO</span>
        </div>
      </div>
      <button class="toggle-btn" id="closeSidebarBtn"><i class="fa-solid fa-bars"></i></button>
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
    </div>
  </aside>

  <main>
    <div class="top-bar">
      <div class="top-left">
        <button class="toggle-btn" id="openSidebarBtn"><i class="fa-solid fa-bars"></i></button>
        <div class="breadcrumbs">
          <span class="brand-crumb">Bloop</span>
          <span class="crumb-sep">/</span>
          <span class="title-crumb" id="breadcrumbTitle">New conversation</span>
        </div>
      </div>
      <div class="top-right">
        <a href="/studio" class="studio-link-btn" title="Open Bloop Canvas Studio Max">
          <i class="fa-solid fa-palette"></i> Open Studio
        </a>
        <div class="model-badge">Bloop 2.0 Ultra</div>
      </div>
    </div>

    <div class="messages-viewport" id="viewport">
      <div class="messages-container" id="messagesContainer">
        
        <div class="empty-state" id="emptyState">
          <div class="hero-badge-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          <h2 class="hero-title">Hello, Guest</h2>
          <p class="hero-subtitle">How can Bloop assist your thinking, coding, or graphic creation today?</p>

          <div class="prompt-cards-grid">
            <div class="prompt-card" onclick="sendPrompt('Explain quantum computing in simple everyday analogies.')">
              <span class="prompt-card-title">Explore ideas</span>
              <span class="prompt-card-desc">Explain quantum computing in simple everyday analogies.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Write a thumbnail title and hook for a video about a 12yo coder.')">
              <span class="prompt-card-title">Thumbnail ideas</span>
              <span class="prompt-card-desc">Write a thumbnail title and hook for a video about a 12yo coder.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Generate a clean Node.js Express server with CORS setup.')">
              <span class="prompt-card-title">Write clean code</span>
              <span class="prompt-card-desc">Generate a clean Node.js Express server with CORS setup.</span>
            </div>
            <div class="prompt-card" onclick="sendPrompt('Who are you and what makes Bloop special?')">
              <span class="prompt-card-title">Ask anything</span>
              <span class="prompt-card-desc">Who are you and what makes Bloop special?</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="input-wrapper">
      <div class="input-box">
        <textarea id="promptInput" rows="1" placeholder="Message Bloop..."></textarea>
        <button id="sendBtn" class="send-btn" disabled><i class="fa-solid fa-arrow-up" id="sendBtnIcon"></i></button>
      </div>
      <div class="footnote">Bloop may produce inaccurate information. Always verify critical facts.</div>
    </div>
  </main>

  <script>
    function detectDevice() {
      const isMobile = window.innerWidth <= 820;
      document.body.classList.toggle("is-mobile", isMobile);
    }
    detectDevice();
    window.addEventListener("resize", detectDevice);

    let chats = JSON.parse(localStorage.getItem("bloop_chats")) || [];
    let currentChatId = null;
    let isGenerating = false;
    let currentAbortController = null;

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
    const viewport = document.getElementById("viewport");

    function toggleSidebar() {
      if (document.body.classList.contains("is-mobile")) {
        sidebar.classList.toggle("mobile-open");
        sidebarOverlay.classList.toggle("active");
      } else {
        sidebar.classList.toggle("desktop-collapsed");
      }
    }

    openSidebarBtn.addEventListener("click", toggleSidebar);
    closeSidebarBtn.addEventListener("click", toggleSidebar);
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      sidebarOverlay.classList.remove("active");
    });

    promptInput.addEventListener("input", () => {
      promptInput.style.height = "auto";
      promptInput.style.height = Math.min(promptInput.scrollHeight, 110) + "px";
      sendBtn.disabled = !promptInput.value.trim() && !isGenerating;
    });

    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && promptInput.value.trim()) handleSend();
      }
    });

    sendBtn.addEventListener("click", () => {
      if (isGenerating && currentAbortController) currentAbortController.abort();
      else handleSend();
    });

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
        item.innerHTML = \`<i class="fa-regular fa-message"></i><span>\${chat.title}</span>\`;
        item.onclick = () => {
          currentChatId = chat.id;
          renderChatHistory();
          renderActiveChat();
        };
        chatHistoryList.appendChild(item);
      });
    }

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
      viewport.scrollTop = viewport.scrollHeight;
    }

    function appendBubble(role, content) {
      const row = document.createElement("div");
      row.className = "message-row " + role;
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = content;
      row.appendChild(bubble);
      messagesContainer.appendChild(row);
      viewport.scrollTop = viewport.scrollHeight;
      return bubble;
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

      isGenerating = true;
      sendBtn.disabled = false;
      sendBtn.classList.add("stop-state");
      sendBtnIcon.className = "fa-solid fa-square";

      currentAbortController = new AbortController();
      const assistantBubble = appendBubble("assistant", "");
      assistantBubble.classList.add("typing-cursor");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: activeChat.messages }),
          signal: currentAbortController.signal
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Server Error");

        const reply = data.choices[0].message.content;
        assistantBubble.textContent = reply;
        activeChat.messages.push({ role: "assistant", content: reply });
        saveChats();

      } catch (err) {
        if (err.name === 'AbortError') {
          assistantBubble.textContent += " [Stopped]";
          activeChat.messages.push({ role: "assistant", content: assistantBubble.textContent });
          saveChats();
        } else {
          assistantBubble.textContent = "Error: " + err.message;
        }
      } finally {
        assistantBubble.classList.remove("typing-cursor");
        isGenerating = false;
        sendBtn.classList.remove("stop-state");
        sendBtnIcon.className = "fa-solid fa-arrow-up";
        sendBtn.disabled = !promptInput.value.trim();
        viewport.scrollTop = viewport.scrollHeight;
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

// Export for Vercel Serverless Function Execution
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Bloop running on port ${PORT}`);
  });
}
