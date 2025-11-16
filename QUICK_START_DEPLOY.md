# 🚀 Quick Start Deployment Guide

**Fast deployment in 15 minutes!**

---

## Step 1: Push Code to GitHub (2 min)

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Verify**:
- ✅ `model/best_urban_mobilenet.pth` is in your repo
- ✅ No `.env` files are committed
- ✅ All code is pushed

---

## Step 2: Deploy Backend on Render (5 min)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repo
4. Configure:
   - **Name**: `civic-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python app.py`
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 min)
7. **Note your backend URL**: `https://your-service.onrender.com`

---

## Step 3: Create PostgreSQL Database (2 min)

1. In Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `civic-database`
   - **Plan**: Free
3. Click **"Create Database"**
4. Copy **Internal Database URL**
5. Go to your **Backend Service** → **Environment** tab
6. Add: `DATABASE_URL` = (paste Internal Database URL)
7. **Redeploy** backend service

---

## Step 4: Deploy Frontend on Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Configure (auto-detected):
   - Framework: `Create React App`
   - Build: `npm run build`
   - Output: `build`
5. **Before deploying**, go to **Environment Variables** and add:

### Required Environment Variables:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_BASE_URL=https://your-backend.onrender.com
```

**Important**: 
- Replace `your-backend.onrender.com` with your actual Render backend URL
- Set for **Production**, **Preview**, AND **Development**

6. Click **"Deploy"**
7. Wait for deployment (2-5 min)

---

## Step 5: Test (1 min)

1. Visit your Vercel URL
2. Check:
   - ✅ Home page loads
   - ✅ No white screen
   - ✅ "Sign In" button visible
3. Test backend:
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok"}`

---

## ✅ Done!

Your app is now live!

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

---

## 🆘 Quick Troubleshooting

**White Screen?**
→ Check all 7 Firebase environment variables are set on Vercel

**Backend Empty Data?**
→ Check `DATABASE_URL` is set in Render backend service

**Need More Help?**
→ See [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)

---

**Total Time**: ~15 minutes

