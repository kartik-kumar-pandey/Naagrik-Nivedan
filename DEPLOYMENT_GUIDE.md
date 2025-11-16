# Deployment Guide: Civic Reporter App

This guide will help you deploy your React frontend on **Vercel** and Flask backend on **Render**.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Firebase Project** - Already set up (for authentication and database)
5. **API Keys** - Gemini API Key, OpenCage API Key (if used)

---

## 🚀 Part 1: Deploy Backend on Render

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `backend/requirements.txt` is up to date
3. Create a `.gitignore` file in the root if you don't have one:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Node
node_modules/
build/
dist/

# Database
*.db
*.sqlite
instance/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `civic-backend` (or any name you prefer)
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users (e.g., `Oregon`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `backend` if your backend is in a subfolder)
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     cd backend && python app.py
     ```
   - **Plan**: Choose **Free** (or upgrade if needed)

### Step 3: Set Environment Variables on Render

In the Render dashboard, go to **Environment** tab and add:

```
FLASK_ENV=production
GEMINI_API_KEY=your-gemini-api-key-here
OPENCAGE_API_KEY=your-opencage-api-key-here (if used)
PORT=10000
```

**Note**: Render automatically sets `PORT` environment variable. Make sure your `app.py` uses it:

```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. Copy your backend URL (e.g., `https://civic-backend.onrender.com`)

### Step 5: Test Backend

Visit your backend URL:
- `https://your-backend-url.onrender.com/` - Should show API info
- `https://your-backend-url.onrender.com/health` - Should return health status

---

## 🎨 Part 2: Deploy Frontend on Vercel

### Step 1: Update Config File

Update `src/config.js` to use environment variables:

```javascript
const config = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://your-backend-url.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;
```

### Step 2: Update vercel.json

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 3: Deploy on Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project root:
   ```bash
   cd "C:\Users\karti\OneDrive\Desktop\mini_project(5th semester)"
   ```

4. Deploy:
   ```bash
   vercel
   ```
   - Follow prompts
   - Choose your project settings
   - When asked about environment variables, add them (see Step 4)

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 4: Set Environment Variables on Vercel

In Vercel dashboard → Your Project → Settings → Environment Variables, add:

```
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Important**: Replace `your-backend-url.onrender.com` with your actual Render backend URL!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## 🔧 Part 3: Update Backend CORS Settings

Make sure your Flask backend allows requests from your Vercel domain.

In `backend/app.py`, update CORS:

```python
from flask_cors import CORS

# Allow requests from your Vercel domain
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://your-project.vercel.app",
            "http://localhost:3000"  # For local development
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

Or allow all origins (for development/testing):

```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

---

## 📝 Part 4: Update Firebase Rules

Make sure your Firebase Realtime Database rules allow read/write:

1. Go to Firebase Console → Realtime Database → Rules
2. Update rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "complaints": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$complaintId": {
        ".read": "auth != null",
        ".write": "auth != null || data.child('userId').val() == auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## ✅ Part 5: Testing Your Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend.onrender.com/health`
3. **Test Integration**: 
   - Try logging in
   - Submit a complaint
   - Check if images are being classified

---

## 🐛 Troubleshooting

### Backend Issues

1. **Build Fails**: Check `requirements.txt` for all dependencies
2. **App Crashes**: Check Render logs for errors
3. **CORS Errors**: Update CORS settings in `app.py`
4. **Database Issues**: Render free tier has ephemeral storage - consider using PostgreSQL

### Frontend Issues

1. **Build Fails**: Check for environment variables
2. **API Calls Fail**: Verify `REACT_APP_API_BASE_URL` is set correctly
3. **Firebase Errors**: Check Firebase config environment variables

### Common Fixes

- **Clear Build Cache**: In Vercel, go to Settings → Clear Build Cache
- **Redeploy**: Sometimes a simple redeploy fixes issues
- **Check Logs**: Both Vercel and Render provide detailed logs

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:
- **Vercel**: Automatically deploys on every push to `main` branch
- **Render**: Automatically deploys on every push to connected branch

---

## 📊 Monitoring

- **Vercel Analytics**: Available in dashboard
- **Render Metrics**: Available in dashboard
- **Firebase Console**: Monitor database usage

---

## 💰 Free Tier Limits

### Vercel
- Unlimited deployments
- 100GB bandwidth/month
- Automatic SSL

### Render
- 750 hours/month (enough for 24/7 on free tier)
- Automatic SSL
- Sleeps after 15 min inactivity (wakes on first request)

---

## 🎉 You're Done!

Your app should now be live:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Remember to update your `config.js` with the actual backend URL after deployment!

