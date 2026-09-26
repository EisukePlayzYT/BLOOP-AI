const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Read API key from environment variable or fallback
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const MODEL = "openai/gpt-oss-120b";

app.use(express.json({ limit: '50mb' }));

// API route
app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes("your_key_here")) {
      return res.status(401).json({ 
        error: { message: "GROQ_API_KEY is not set or invalid in Vercel settings." } 
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
            content: "You are Bloop, a custom AI assistant. Your name is strictly Bloop. Never refer to yourself as ChatGPT, OpenAI, or an assistant trained by OpenAI. If asked who you are, what your name is, or who created you, always state that you are Bloop."
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
