# ✅ Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

---

## 📦 Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.gitignore` properly configured
- [ ] No `.env` files committed
- [ ] Model file `model/best_urban_mobilenet.pth` exists in repo
- [ ] All dependencies listed in `package.json`
- [ ] All Python dependencies in `backend/requirements.txt`

### Files Verification
- [ ] `vercel.json` exists and is correct
- [ ] `render.yaml` exists (optional, can configure manually)
- [ ] `src/config.js` has correct API configuration
- [ ] `src/firebase.js` uses environment variables
- [ ] `backend/app.py` uses `PORT` environment variable

---

## 🔧 Backend Deployment (Render)

### Service Configuration
- [ ] Created Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set build command: `cd backend && pip install -r requirements.txt`
- [ ] Set start command: `cd backend && python app.py`
- [ ] Selected Python 3 environment

### Environment Variables (Backend)
- [ ] `FLASK_ENV=production`
- [ ] `DATABASE_URL` (from PostgreSQL - set after creating DB)
- [ ] `GEMINI_API_KEY` (optional)
- [ ] `OPENCAGE_API_KEY` (optional)

### PostgreSQL Database
- [ ] Created PostgreSQL database on Render
- [ ] Copied Internal Database URL
- [ ] Set `DATABASE_URL` in backend service
- [ ] Redeployed backend after setting `DATABASE_URL`

### Verification
- [ ] Backend health check: `https://your-backend.onrender.com/health` → `{"status":"ok"}`
- [ ] Backend API: `https://your-backend.onrender.com/api/all-complaints` → Returns JSON
- [ ] Backend logs show: `[INFO] Using PostgreSQL database`
- [ ] Backend logs show: `✓ Initialized 6 departments in database`

---

## 🎨 Frontend Deployment (Vercel)

### Project Configuration
- [ ] Imported GitHub repository to Vercel
- [ ] Framework preset: `Create React App` (auto-detected)
- [ ] Build command: `npm run build` (auto-detected)
- [ ] Output directory: `build` (auto-detected)

### Environment Variables (Frontend)
- [ ] `REACT_APP_FIREBASE_API_KEY`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN`
- [ ] `REACT_APP_FIREBASE_DATABASE_URL`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `REACT_APP_FIREBASE_APP_ID`
- [ ] `REACT_APP_API_BASE_URL` (your Render backend URL)

**Important**: Set all variables for **Production**, **Preview**, AND **Development**

### Verification
- [ ] Frontend loads without white screen
- [ ] Home page displays correctly
- [ ] Preloader animation works
- [ ] "Sign In" button visible (if not logged in)
- [ ] No console errors (F12 → Console)
- [ ] Firebase initialized message in console

---

## 🧪 Testing

### Authentication
- [ ] Can sign up with new account
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] User data saved to Firebase

### Complaint Submission
- [ ] Can upload image
- [ ] Can select location on map
- [ ] Can submit complaint
- [ ] ML model classifies issue correctly
- [ ] Complaint appears in "My Complaints" dashboard
- [ ] Complaint appears in backend API: `/api/all-complaints`

### Dashboards
- [ ] Citizen dashboard shows user's complaints
- [ ] Department dashboard shows all complaints (for officials)
- [ ] Filters work (status, priority, search)
- [ ] Map view displays complaints correctly

### Backend API
- [ ] `/health` returns `{"status":"ok"}`
- [ ] `/api/all-complaints` returns complaints
- [ ] `/api/classify-issue` classifies images correctly
- [ ] Database persists data (not lost on restart)

---

## 🐛 Common Issues Check

- [ ] No white screen on Vercel (check Firebase env vars)
- [ ] Backend returns data (check PostgreSQL connection)
- [ ] CORS errors resolved (check `REACT_APP_API_BASE_URL`)
- [ ] Model loads correctly (check model file in repo)
- [ ] No build errors (check logs in Vercel/Render)

---

## 📝 Final Steps

- [ ] Test complete user flow: Sign up → Report issue → View dashboard
- [ ] Verify data persistence (restart backend, data should remain)
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Document your deployment URLs:
  - Frontend: `https://your-project.vercel.app`
  - Backend: `https://your-backend.onrender.com`

---

## ✅ Deployment Complete!

Once all items are checked, your deployment is complete and ready for users!

---

**Quick Links**:
- [Complete Deployment Guide](./COMPLETE_DEPLOYMENT_GUIDE.md)
- [Troubleshooting](./VERCEL_WHITE_SCREEN_FIX.md)
- [Database Fix](./RENDER_DATABASE_FIX.md)

