# AcademAI Student Portal - Render Deployment Guide

This guide provides step-by-step instructions to deploy your AcademAI Student Portal app onto **Render.com** (which supports continuous deployments, Node.js Express web services, and streaming out-of-the-box).

---

## 📋 Prerequisites
1. A [GitHub](https://github.com) account.
2. A [Render](https://render.com) account.
3. Your **Google Gemini API Key**.

---

## 🚀 Step 1: Commit and Push your Code to GitHub

We have initialized a local Git repository in your `Student Portal` directory. Run the following commands in your terminal (PowerShell or Command Prompt) to commit and push your code:

```bash
# 1. Add all project files to Git stage
git add .

# 2. Commit files locally
git commit -m "feat: setup mobile responsiveness and bypass authentication"

# 3. Create a new repository on GitHub (name it "student-portal")
# Then copy the GitHub remote URL and run:
git remote add origin <YOUR_GITHUB_REPO_URL>

# 4. Rename default branch (if necessary) and push
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Create a Web Service on Render

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button at the top right and select **Web Service**.
3. Choose **Connect a repository** and connect your newly created GitHub repository (`student-portal`).
4. Configure the Web Service settings:
   - **Name**: `academai-student-portal`
   - **Region**: Select a region closest to you (e.g., `Singapore` or `Oregon`).
   - **Branch**: `main`
   - **Language**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Select the **Free** tier.

---

## 🔑 Step 3: Configure Environment Variables on Render

In your Render Web Service settings, go to the **Environment** tab, click **Add Environment Variable**, and insert the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `YOUR_API_KEY` | Your Google Gemini API Key. |

*Note: The `PORT` variable is automatically injected and managed by Render, and the Express server in `server.js` automatically binds to it via `process.env.PORT`.*

---

## 🚀 Step 4: Verify Deployment
Once Render finishes building your container (`npm install` -> `node server.js`), your dashboard will display a status of **Live**. 

Click the Render link (`https://YOUR-APP.onrender.com`) to launch and verify all features (AI chat streams, 3D Studio, quiz, and flashcards).
