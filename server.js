require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');

// Initialize Gemini AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();

// Global No-Cache Middleware to prevent browser caching of HTML, CSS, JS, and API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
// Important: Ensure we can parse JSON bodies for the chat route (increased limit for photo uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// IBM App ID Configuration
const APPID_CLIENT_ID = process.env.APPID_CLIENT_ID;
const APPID_SECRET = process.env.APPID_SECRET;
const APPID_TENANT_ID = process.env.APPID_TENANT_ID;
const APPID_OAUTH_SERVER_URL = process.env.APPID_OAUTH_SERVER_URL;
const APPID_DISCOVERY_ENDPOINT = process.env.APPID_DISCOVERY_ENDPOINT;
const APPID_REDIRECT_URI = process.env.APPID_REDIRECT_URI;
const PORT = process.env.PORT || 3000;

// Configure session middleware
app.use(session({
  secret: 'studentportal',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure IBM App ID Strategy
passport.use(new WebAppStrategy({
  tenantId: APPID_TENANT_ID,
  clientId: APPID_CLIENT_ID,
  secret: APPID_SECRET,
  oauthServerUrl: APPID_OAUTH_SERVER_URL,
  redirectUri: APPID_REDIRECT_URI
}));

// Serialize user information
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI Chat Route (Streaming)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Parse image payload if present
    let contents = [message];
    if (image && typeof image === 'string' && image.includes(';base64,')) {
      try {
        const parts = image.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const base64Data = parts[1];
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      } catch (parseError) {
        console.error("Failed to parse uploaded photo base64 data:", parseError);
      }
    }

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-3.1-flash-lite'
    ];

    let responseStream = null;
    let currentModelIndex = 0;
    let streamSuccessful = false;

    while (currentModelIndex < candidateModels.length) {
      const modelName = candidateModels[currentModelIndex];
      try {
        console.log(`Attempting stream generation with model: ${modelName}`);
        responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: contents,
        });

        let chunkCount = 0;
        for await (const chunk of responseStream) {
          if (chunkCount === 0) {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'text/plain');
              res.setHeader('Transfer-Encoding', 'chunked');
            }
          }
          res.write(chunk.text);
          chunkCount++;
        }
        
        console.log(`Stream successfully generated with model: ${modelName}`);
        streamSuccessful = true;
        break;
      } catch (err) {
        console.warn(`Model ${modelName} failed. Error details:`, err.message || err);
        if (res.headersSent) {
          console.error("Headers already sent, cannot fallback to another model.");
          throw err;
        }
        currentModelIndex++;
      }
    }

    if (!streamSuccessful) {
      throw new Error("All candidate models failed to generate content.");
    }
    res.end();
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (res.headersSent) {
      res.write('\n[Error: Failed to process AI chat message]');
      res.end();
    } else {
      res.status(500).send('Failed to process AI chat message');
    }
  }
});

// AI Quiz Generator Route (Structured Output)
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
      return res.status(400).json({ error: 'Topic and difficulty are required' });
    }

    const prompt = `Generate a multiple-choice quiz about "${topic}" at a "${difficulty}" difficulty level with exactly 15 questions.`;
    const genConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly 4 options"
            },
            correctIndex: { 
              type: Type.INTEGER, 
              description: "Index of correct option (0 to 3)" 
            }
          },
          required: ["question", "options", "correctIndex"]
        }
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: genConfig
      });
    } catch (apiError) {
      console.warn('Gemini 2.5-flash failed for quiz generator, falling back to gemini-flash-latest:', apiError.message || apiError);
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: genConfig
      });
    }

    const questions = JSON.parse(response.text);
    res.json({ questions });
  } catch (error) {
    console.error('Gemini Quiz API Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// AI Flashcard Generator Route (Structured Output)
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
      return res.status(400).json({ error: 'Topic and difficulty are required' });
    }

    const prompt = `Generate a set of exactly 8 flashcards about "${topic}" at a "${difficulty}" level. Each flashcard should have a 'front' (question, term, or concept) and a 'back' (clear, concise explanation or definition).`;
    const genConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: genConfig
      });
    } catch (apiError) {
      console.warn('Gemini 2.5-flash failed for flashcard generator, falling back to gemini-flash-latest:', apiError.message || apiError);
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: genConfig
      });
    }

    const cards = JSON.parse(response.text);
    res.json({ cards });
  } catch (error) {
    console.error('Gemini Flashcard API Error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});


// Authentication routes
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.get('/appid_callback', (req, res, next) => {
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user, info) => {
    if (err) {
      console.error("Auth Error from App ID:", err);
      return res.status(500).send(`<h1>Authentication Error</h1><p>IBM Cloud rejected the login.</p><h3>Error Details:</h3><pre style="background:#f4f4f4;padding:15px;border-radius:8px;">${err.message || err}</pre>`);
    }
    if (!user) {
      console.error("No User found from App ID:", info);
      return res.status(401).send(`<h1>No User Found</h1><p>IBM Cloud did not return a valid user.</p><h3>Info Details:</h3><pre style="background:#f4f4f4;padding:15px;border-radius:8px;">${JSON.stringify(info, null, 2)}</pre>`);
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login serialization error:", err);
        return res.status(500).send(`<h1>Session Error</h1><p>Failed to save user session.</p><h3>Error Details:</h3><pre style="background:#f4f4f4;padding:15px;border-radius:8px;">${err.message || err}</pre>`);
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

app.get('/login/error', (req, res) => {
  res.send(`
    <h1>Login Failed</h1>
    <p>There was an error during authentication. Please try again.</p>
    <a href="/">Back to Home</a>
  `);
});



app.get('/dashboard', (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }

  const userInfo = req.user;
  const name = userInfo.name || userInfo.given_name || 'User';

  const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
  fs.readFile(dashboardPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error loading dashboard UI.");
    }
    
    // Inject the user's name into the UI
    let modifiedHtml = data.replace('<h1>Welcome Back 👋</h1>', `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <h1>Welcome Back, ${name} 👋</h1>
        <a href="/logout">Logout</a>
      </div>
    `);
    
    res.send(modifiedHtml);
  });
});



app.get('/admin', (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }

  // For demo purposes, we'll check if the user's email contains 'admin'
  // In a real application, you'd check roles/groups from App ID
  const userInfo = req.user;
  const email = userInfo.email || userInfo.preferred_username || '';
  const isAdmin = email.includes('admin') || email.includes('Admin');

  if (!isAdmin) {
    return res.send(`
      <h1>Access Denied</h1>
      <p>You don't have admin privileges.</p>
      <a href="/dashboard">Back to Dashboard</a>
    `);
  }

  res.send(`
    <h1>Admin Access Granted</h1>
    <p>Welcome to the admin panel, ${userInfo.name || 'Admin'}!</p>
    <a href="/dashboard">Back to Dashboard</a>
  `);
});



app.get('/logout', (req, res) => {
  // Logout from the application
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    // Redirect to App ID logout endpoint
    const logoutUrl = `${APPID_OAUTH_SERVER_URL}/logout`;
    res.redirect(logoutUrl);
  });
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});