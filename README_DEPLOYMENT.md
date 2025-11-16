# 📚 Deployment Documentation Index

Welcome! This folder contains all the documentation you need to deploy your **Nagarik Nivedan** project.

---

## 🎯 Which Guide Should I Use?

### 🚀 **New to Deployment?**
→ Start with **[QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)**
- Fast 15-minute deployment
- Step-by-step instructions
- Perfect for first-time deployment

### 📖 **Want Detailed Instructions?**
→ Read **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)**
- Comprehensive guide
- Troubleshooting section
- Architecture diagrams
- Best practices

### ✅ **Ready to Deploy?**
→ Use **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
- Checklist format
- Verify each step
- Ensure nothing is missed

---

## 📋 Available Guides

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)** | Fast deployment | First time deploying |
| **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** | Detailed guide | Need comprehensive instructions |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Verification checklist | Before/after deployment |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Original guide | Alternative reference |
| **[VERCEL_WHITE_SCREEN_FIX.md](./VERCEL_WHITE_SCREEN_FIX.md)** | Troubleshooting | White screen issues |
| **[RENDER_DATABASE_FIX.md](./RENDER_DATABASE_FIX.md)** | Database issues | Empty data from backend |

---

## 🏗️ Deployment Architecture

```
┌─────────────┐
│   Vercel    │  ← Frontend (React App)
│  (Frontend) │
└──────┬──────┘
       │
       │ API Calls
       ▼
┌─────────────┐
│   Render    │  ← Backend (Flask API + ML Model)
│  (Backend)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │  ← Database (Persistent Storage)
│  (Render)   │
└─────────────┘

┌─────────────┐
│  Firebase   │  ← Authentication + Realtime DB
│  (Google)   │
└─────────────┘
```

---

## ⚡ Quick Reference

### Frontend (Vercel)
- **URL**: `https://your-project.vercel.app`
- **Framework**: Create React App
- **Build**: `npm run build`
- **Output**: `build/`

### Backend (Render)
- **URL**: `https://your-backend.onrender.com`
- **Framework**: Flask (Python)
- **Build**: `cd backend && pip install -r requirements.txt`
- **Start**: `cd backend && python app.py`

### Environment Variables Needed

**Vercel (8 variables)**:
1. `REACT_APP_FIREBASE_API_KEY`
2. `REACT_APP_FIREBASE_AUTH_DOMAIN`
3. `REACT_APP_FIREBASE_DATABASE_URL`
4. `REACT_APP_FIREBASE_PROJECT_ID`
5. `REACT_APP_FIREBASE_STORAGE_BUCKET`
6. `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
7. `REACT_APP_FIREBASE_APP_ID`
8. `REACT_APP_API_BASE_URL`

**Render (3+ variables)**:
1. `FLASK_ENV=production`
2. `DATABASE_URL` (from PostgreSQL)
3. `GEMINI_API_KEY` (optional)
4. `OPENCAGE_API_KEY` (optional)

---

## 🐛 Common Issues & Solutions

### Issue: White Screen on Vercel
**Solution**: See [VERCEL_WHITE_SCREEN_FIX.md](./VERCEL_WHITE_SCREEN_FIX.md)
- Check Firebase environment variables
- Verify all 7 Firebase vars are set
- Check browser console for errors

### Issue: Backend Returns Empty Data
**Solution**: See [RENDER_DATABASE_FIX.md](./RENDER_DATABASE_FIX.md)
- Create PostgreSQL database on Render
- Set `DATABASE_URL` environment variable
- Redeploy backend service

### Issue: CORS Errors
**Solution**: 
- Verify `REACT_APP_API_BASE_URL` matches your Render backend URL
- Check backend has `CORS(app)` enabled
- Ensure backend URL is correct

### Issue: Model Not Loading
**Solution**:
- Verify `model/best_urban_mobilenet.pth` is in GitHub repo
- Check file size (should be < 100MB)
- Use Git LFS if file is too large

---

## 📝 Deployment Steps Summary

1. ✅ **Prepare Code**
   - Push to GitHub
   - Verify model file is included
   - Check `.gitignore`

2. ✅ **Deploy Backend (Render)**
   - Create Web Service
   - Set environment variables
   - Create PostgreSQL database
   - Connect database to backend

3. ✅ **Deploy Frontend (Vercel)**
   - Import GitHub repo
   - Set Firebase environment variables
   - Set backend URL
   - Deploy

4. ✅ **Test**
   - Verify frontend loads
   - Test authentication
   - Test complaint submission
   - Verify data persistence

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Repository](https://github.com) (your repo)

---

## 📞 Need Help?

1. Check the troubleshooting sections in guides
2. Review deployment logs in Vercel/Render dashboards
3. Check browser console (F12) for frontend errors
4. Check backend logs in Render dashboard

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without white screen
- ✅ Users can sign up/sign in
- ✅ Complaints can be submitted
- ✅ ML model classifies issues correctly
- ✅ Data persists in database
- ✅ Dashboards display complaints correctly

---

**Ready to deploy?** Start with [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)!

**Last Updated**: 2025-01-16

