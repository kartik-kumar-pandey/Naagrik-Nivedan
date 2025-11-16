# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] `.env` files are NOT committed (check `.gitignore`)
- [ ] All API keys are ready (Firebase, Gemini, OpenCage)
- [ ] Backend `requirements.txt` is up to date
- [ ] Frontend `package.json` is up to date

---

## 🚀 Render (Backend) - 5 Steps

1. **Go to**: [render.com](https://render.com) → New Web Service
2. **Connect**: Your GitHub repository
3. **Configure**:
   - Name: `civic-backend`
   - Environment: `Python 3`
   - Build: `cd backend && pip install -r requirements.txt`
   - Start: `cd backend && python app.py`
4. **Add Environment Variables**:
   - `FLASK_ENV=production`
   - `GEMINI_API_KEY=your-key`
   - `OPENCAGE_API_KEY=your-key` (if used)
5. **Deploy** → Copy your backend URL

**Backend URL**: `https://________________.onrender.com`

---

## 🎨 Vercel (Frontend) - 5 Steps

1. **Go to**: [vercel.com](https://vercel.com) → Add New Project
2. **Import**: Your GitHub repository
3. **Configure**:
   - Framework: `Create React App`
   - Build: `npm run build`
   - Output: `build`
4. **Add Environment Variables**:
   - `REACT_APP_API_BASE_URL` = Your Render backend URL
   - `REACT_APP_FIREBASE_API_KEY` = Your Firebase key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` = Your Firebase domain
   - `REACT_APP_FIREBASE_DATABASE_URL` = Your Firebase DB URL
   - `REACT_APP_FIREBASE_PROJECT_ID` = Your Firebase project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET` = Your Firebase bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = Your sender ID
   - `REACT_APP_FIREBASE_APP_ID` = Your app ID
5. **Deploy** → Your app is live!

**Frontend URL**: `https://________________.vercel.app`

---

## 🔧 Post-Deployment

- [ ] Update backend CORS to allow your Vercel domain
- [ ] Test login functionality
- [ ] Test complaint submission
- [ ] Test image classification
- [ ] Check Firebase rules

---

## 📝 Environment Variables Reference

### Render (Backend)
```
FLASK_ENV=production
GEMINI_API_KEY=your-key
OPENCAGE_API_KEY=your-key
```

### Vercel (Frontend)
```
REACT_APP_API_BASE_URL=https://your-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=your-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

---

## 🆘 Quick Troubleshooting

**Backend not working?**
- Check Render logs
- Verify environment variables
- Check if PORT is set correctly

**Frontend can't connect to backend?**
- Verify `REACT_APP_API_BASE_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**Firebase errors?**
- Verify all Firebase env variables are set
- Check Firebase console for project settings
- Verify database rules allow read/write

---

## 📚 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

