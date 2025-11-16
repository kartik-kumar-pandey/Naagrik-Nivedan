# 🚀 Complete Deployment Guide - Nagarik Nivedan

This is a comprehensive step-by-step guide to deploy your complete project on **Vercel** (Frontend) and **Render** (Backend).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Step 1: Prepare Your Code](#step-1-prepare-your-code)
4. [Step 2: Deploy Backend on Render](#step-2-deploy-backend-on-render)
5. [Step 3: Deploy Frontend on Vercel](#step-3-deploy-frontend-on-vercel)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Set Up PostgreSQL Database (Render)](#step-5-set-up-postgresql-database-render)
8. [Step 6: Verify Deployment](#step-6-verify-deployment)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting, ensure you have:

- [ ] **GitHub Account** - Your code must be in a GitHub repository
- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
- [ ] **Render Account** - Sign up at [render.com](https://render.com) (free)
- [ ] **Firebase Project** - Already set up with:
  - Firebase Authentication enabled
  - Realtime Database enabled
  - Firebase config values ready
- [ ] **API Keys** (optional but recommended):
  - Gemini API Key (for AI features)
  - OpenCage API Key (for geocoding)

---

## ✅ Pre-Deployment Checklist

### Code Preparation

- [ ] All code is committed and pushed to GitHub
- [ ] `.gitignore` is properly configured (excludes `.env`, `node_modules`, `venv`, etc.)
- [ ] Model file `model/best_urban_mobilenet.pth` exists and is committed to GitHub
- [ ] `package.json` has all dependencies listed
- [ ] `backend/requirements.txt` has all Python dependencies
- [ ] No hardcoded API keys or secrets in code
- [ ] `vercel.json` is configured correctly
- [ ] `render.yaml` is configured correctly (optional, can configure manually)

### Files to Verify

```
✅ package.json (frontend dependencies)
✅ backend/requirements.txt (backend dependencies)
✅ vercel.json (Vercel configuration)
✅ render.yaml (Render configuration - optional)
✅ src/config.js (API configuration)
✅ src/firebase.js (Firebase configuration)
✅ model/best_urban_mobilenet.pth (ML model file)
```

---

## 📝 Step 1: Prepare Your Code

### 1.1 Ensure Model File is in Repository

The ML model file must be in your GitHub repository:

```
model/
  └── best_urban_mobilenet.pth
```

**Important**: This file might be large. If GitHub rejects it:
- Use Git LFS: `git lfs track "*.pth"` then commit
- Or ensure it's under 100MB (GitHub's free limit)

### 1.2 Verify .gitignore

Make sure `.gitignore` excludes sensitive files but includes necessary files:

```gitignore
# Exclude
.env
.env.local
node_modules/
backend/venv/
backend/__pycache__/
backend/uploads/
*.db

# Include (make sure these are NOT ignored)
model/best_urban_mobilenet.pth
vercel.json
render.yaml
```

### 1.3 Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 🔧 Step 2: Deploy Backend on Render

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository

### 2.2 Configure Backend Service

**Service Settings:**

| Setting | Value |
|---------|-------|
| **Name** | `civic-backend` (or your preferred name) |
| **Environment** | `Python 3` |
| **Region** | Choose closest to you (e.g., `Oregon`) |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave empty (or `backend` if you want) |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && python app.py` |

**Important**: Render automatically sets the `PORT` environment variable. Your `app.py` should use:
```python
port = int(os.environ.get('PORT', 5000))
```

### 2.3 Set Environment Variables (Backend)

In Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `FLASK_ENV` | `production` | Required |
| `GEMINI_API_KEY` | `your-gemini-key` | Optional (for AI features) |
| `OPENCAGE_API_KEY` | `your-opencage-key` | Optional (for geocoding) |
| `DATABASE_URL` | *(Auto-set by Render)* | Set after creating PostgreSQL |

**Note**: `DATABASE_URL` will be automatically set when you create a PostgreSQL database (Step 5).

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. Note your backend URL: `https://your-service-name.onrender.com`

### 2.5 Verify Backend

Visit your backend URL:
- `https://your-service-name.onrender.com/health` → Should return `{"status":"ok"}`
- `https://your-service-name.onrender.com/` → Should show API endpoints

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 3.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your repository

### 3.2 Configure Frontend

**Project Settings:**

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Create React App` (auto-detected) |
| **Root Directory** | `./` (root of your repo) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

**Note**: Vercel will auto-detect these from `package.json` and `vercel.json`.

### 3.3 Set Environment Variables (Frontend)

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `REACT_APP_FIREBASE_API_KEY` | `your-firebase-api-key` | **Required** |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | **Required** |
| `REACT_APP_FIREBASE_DATABASE_URL` | `https://your-project-default-rtdb.firebaseio.com` | **Required** |
| `REACT_APP_FIREBASE_PROJECT_ID` | `your-project-id` | **Required** |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | **Required** |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | **Required** |
| `REACT_APP_FIREBASE_APP_ID` | `your-app-id` | **Required** |
| `REACT_APP_API_BASE_URL` | `https://your-backend-url.onrender.com` | **Required** (your Render backend URL) |

**Important**: 
- Set these for **Production**, **Preview**, AND **Development**
- Replace `your-backend-url.onrender.com` with your actual Render backend URL

### 3.4 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy (2-5 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🔐 Step 4: Configure Environment Variables

### 4.1 Get Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Settings** → **Project settings**
4. Scroll to **"Your apps"** section
5. Click on your web app (or create one)
6. Copy the config values

### 4.2 Set Firebase Variables on Vercel

Add all 7 Firebase environment variables to Vercel (as listed in Step 3.3).

### 4.3 Set Backend URL on Vercel

Add `REACT_APP_API_BASE_URL` pointing to your Render backend URL.

---

## 🗄️ Step 5: Set Up PostgreSQL Database (Render)

**Why PostgreSQL?** Render's free tier uses ephemeral storage for SQLite, meaning data is lost on restart. PostgreSQL provides persistent storage.

### 5.1 Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `civic-database` (or your preferred name)
   - **Database**: `civic_issues` (or auto-generated)
   - **User**: Auto-generated
   - **Region**: Same as your backend service
   - **Plan**: Free (or paid for better performance)
3. Click **"Create Database"**

### 5.2 Connect Database to Backend

1. After database is created, copy the **Internal Database URL**
2. Go to your **Backend Web Service** → **Environment** tab
3. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL from PostgreSQL service
4. **Redeploy** your backend service

### 5.3 Verify Database Connection

After redeploy, check backend logs. You should see:
```
[INFO] Using PostgreSQL database from DATABASE_URL
✓ Initialized 6 departments in database
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Frontend

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. You should see:
   - ✅ Home page loads
   - ✅ Preloader animation works
   - ✅ "Sign In" button visible (if not logged in)
   - ✅ No white screen
   - ✅ No console errors (F12 → Console)

### 6.2 Test Backend

1. Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok"}`
2. Visit: `https://your-backend.onrender.com/api/all-complaints`
   - Should return: `{"complaints":[],"total":0}` (empty initially)

### 6.3 Test Full Flow

1. **Sign Up**: Create a new account on your Vercel app
2. **Report Issue**: Submit a complaint with an image
3. **Check Backend**: Verify complaint appears in `/api/all-complaints`
4. **Check Dashboard**: Verify complaint appears in "My Complaints"

---

## 🐛 Troubleshooting

### Issue 1: White Screen on Vercel

**Symptoms**: Page loads but shows white screen

**Solution**:
1. Check browser console (F12) for errors
2. Verify all 7 Firebase environment variables are set on Vercel
3. Check Vercel build logs for errors
4. Ensure `REACT_APP_API_BASE_URL` is set correctly

**See**: `VERCEL_WHITE_SCREEN_FIX.md` for detailed troubleshooting

### Issue 2: Backend Returns Empty Data

**Symptoms**: `/api/all-complaints` returns `{"complaints":[],"total":0}` even after submitting complaints

**Solution**:
1. Check if PostgreSQL database is connected (check `DATABASE_URL` env var)
2. Verify backend logs show: `[INFO] Using PostgreSQL database`
3. Check if database tables are created (backend should auto-create them)
4. Ensure backend is using PostgreSQL, not SQLite

**See**: `RENDER_DATABASE_FIX.md` for detailed troubleshooting

### Issue 3: Model Not Loading

**Symptoms**: Backend fails to start, error about model file

**Solution**:
1. Verify `model/best_urban_mobilenet.pth` is in your GitHub repository
2. Check file size (should be under 100MB for GitHub free tier)
3. If file is too large, use Git LFS:
   ```bash
   git lfs install
   git lfs track "*.pth"
   git add .gitattributes
   git add model/best_urban_mobilenet.pth
   git commit -m "Add model with LFS"
   git push
   ```

### Issue 4: CORS Errors

**Symptoms**: Frontend can't connect to backend, CORS errors in console

**Solution**:
1. Verify `REACT_APP_API_BASE_URL` is set correctly on Vercel
2. Check backend has `CORS(app)` enabled (should be in `app.py`)
3. Ensure backend URL in frontend config matches actual Render URL

### Issue 5: Firebase Authentication Not Working

**Symptoms**: Can't sign in/sign up

**Solution**:
1. Verify all 7 Firebase environment variables are set on Vercel
2. Check Firebase Console → Authentication → Sign-in method is enabled
3. Check Firebase Console → Realtime Database → Rules allow read/write
4. Check browser console for Firebase errors

### Issue 6: Build Fails on Vercel

**Symptoms**: Vercel deployment fails during build

**Solution**:
1. Check build logs for specific error
2. Verify `package.json` has all dependencies
3. Check for syntax errors in code
4. Ensure Node.js version is compatible (Vercel auto-detects)

### Issue 7: Backend Build Fails on Render

**Symptoms**: Render deployment fails during build

**Solution**:
1. Check build logs for specific error
2. Verify `backend/requirements.txt` has all dependencies
3. Check Python version (Render uses Python 3.12 by default)
4. Verify model file path is correct
5. Check for import errors in `app.py`

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL (Frontend)                          │
│  • React App (Static Files)                             │
│  • Environment Variables:                               │
│    - Firebase Config (7 vars)                            │
│    - REACT_APP_API_BASE_URL                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│              RENDER (Backend)                           │
│  • Flask API                                             │
│  • ML Model (best_urban_mobilenet.pth)                  │
│  • Environment Variables:                               │
│    - DATABASE_URL (PostgreSQL)                           │
│    - GEMINI_API_KEY (optional)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         RENDER PostgreSQL Database                      │
│  • Persistent Storage                                    │
│  • Tables: IssueReport, Department                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              FIREBASE (Frontend)                        │
│  • Authentication                                       │
│  • Realtime Database (User data, Complaints)           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Updating Your Deployment

### Update Frontend

1. Make changes to your code
2. Commit and push to GitHub
3. Vercel will automatically redeploy

### Update Backend

1. Make changes to your code
2. Commit and push to GitHub
3. Render will automatically redeploy (or manually trigger in dashboard)

### Update Environment Variables

1. Go to Vercel/Render dashboard
2. Update environment variables
3. Redeploy service (Vercel auto-redeploys, Render needs manual trigger)

---

## 📝 Quick Reference

### Frontend URLs
- **Vercel**: `https://your-project.vercel.app`
- **Health Check**: Visit the URL directly

### Backend URLs
- **Render**: `https://your-service-name.onrender.com`
- **Health**: `https://your-service-name.onrender.com/health`
- **API**: `https://your-service-name.onrender.com/api/all-complaints`

### Environment Variables Checklist

**Vercel (Frontend)**:
- [ ] `REACT_APP_FIREBASE_API_KEY`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
- [ ] `REACT_APP_FIREBASE_DATABASE_URL`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `REACT_APP_FIREBASE_APP_ID`
- [ ] `REACT_APP_API_BASE_URL`

**Render (Backend)**:
- [ ] `FLASK_ENV=production`
- [ ] `DATABASE_URL` (from PostgreSQL service)
- [ ] `GEMINI_API_KEY` (optional)
- [ ] `OPENCAGE_API_KEY` (optional)

---

## 🎉 Success!

Once deployed, your app should:
- ✅ Load on Vercel without white screen
- ✅ Allow users to sign up/sign in
- ✅ Submit complaints with images
- ✅ Classify issues using ML model
- ✅ Store data in Firebase and PostgreSQL
- ✅ Display complaints in dashboards

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review deployment logs in Vercel/Render dashboards
3. Check browser console (F12) for frontend errors
4. Check backend logs in Render dashboard

---

**Last Updated**: 2025-01-16
**Project**: Nagarik Nivedan - Civic Issue Reporting App

