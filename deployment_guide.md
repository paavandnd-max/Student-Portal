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

## 🌐 Step 2: Deploy on Render using Docker

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button at the top right and select **Web Service**.
3. Choose **Connect a repository** and connect your repository (`student-portal`).
4. Configure the Web Service settings:
   - **Name**: `academai-student-portal`
   - **Region**: Select a region closest to you.
   - **Branch**: `main`
   - **Language**: **Docker** (Render will automatically detect the `Dockerfile` and skip build/start command forms).
   - **Instance Type**: Select the **Free** tier.

---

## 🔑 Step 3: Configure Environment Variables on Render

In your Render Web Service settings, go to the **Environment** tab, click **Add Environment Variable**, and insert the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `YOUR_API_KEY` | Your Google Gemini API Key. |

---

## 🐳 Step 4: Run Locally with Docker (Optional)

If you have Docker Desktop installed, you can build and run the container locally to test:

```bash
# 1. Build the Docker image
docker build -t student-portal .

# 2. Run the Docker container (binding container port 3000 to host port 3000)
docker run -p 3000:3000 -e GEMINI_API_KEY="your_actual_gemini_api_key" student-portal
```
Once running, visit `http://localhost:3000` in your browser.

---

## 🚀 Step 5: Verify Deployment
Once Render finishes building your Docker container image, your dashboard will display a status of **Live**. 

Click the Render link (`https://YOUR-APP.onrender.com`) to launch and verify all features (AI chat streams, 3D Studio, quiz, and flashcards).
