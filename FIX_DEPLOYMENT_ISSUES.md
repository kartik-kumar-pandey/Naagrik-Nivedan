# 🔧 Fix Deployment Issues - Python 3.13 & White Screen

## Issue 1: Python 3.13 Compatibility (Backend)

### Problem
Render is using Python 3.13, but `psycopg2-binary` is incompatible, causing:
```
ImportError: undefined symbol: _PyInterpreterState_Get
```

### Solution Applied ✅

**Replaced `psycopg2-binary` with `psycopg`** (modern version, works with Python 3.13)

**Files Changed:**
- `backend/requirements.txt` - Changed `psycopg2-binary==2.9.9` to `psycopg[binary]>=3.1.0`
- `runtime.txt` - Created in root (backup, specifies Python 3.12.7)

### Next Steps

1. **Commit and push changes:**
   ```bash
   git add backend/requirements.txt runtime.txt
   git commit -m "Fix Python 3.13 compatibility - use psycopg instead of psycopg2-binary"
   git push origin main
   ```

2. **Redeploy on Render:**
   - Render will automatically redeploy
   - Or manually trigger redeploy in Render dashboard

3. **Verify:**
   - Check build logs - should see `psycopg` installing
   - No more `psycopg2` import errors
   - Backend should start successfully

---

## Issue 2: White Screen on Vercel

### Problem
Your Vercel deployment at https://naagrik-nivedan.vercel.app/ shows a white screen.

### Most Likely Cause
**Missing Firebase environment variables** on Vercel.

### Solution ✅

1. **Go to Vercel Dashboard:**
   - Open your project
   - Go to **Settings** → **Environment Variables**

2. **Add ALL 8 Required Variables:**

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

3. **Important Settings:**
   - Set for **Production**, **Preview**, AND **Development**
   - Replace `your-backend.onrender.com` with your actual Render backend URL
   - Get Firebase values from [Firebase Console](https://console.firebase.google.com)

4. **Redeploy:**
   - Vercel will auto-redeploy after saving env vars
   - Or manually trigger redeploy

5. **Verify:**
   - Open https://naagrik-nivedan.vercel.app/
   - Should see Home page (not white screen)
   - Open browser console (F12) - should see `[Firebase] Initialized successfully`
   - No red errors in console

---

## 🔍 How to Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Settings** → **Project settings**
4. Scroll to **"Your apps"** section
5. Click on your web app (or create one)
6. Copy the config values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // → REACT_APP_FIREBASE_API_KEY
  authDomain: "...",           // → REACT_APP_FIREBASE_AUTH_DOMAIN
  databaseURL: "https://...",  // → REACT_APP_FIREBASE_DATABASE_URL
  projectId: "...",            // → REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "...",        // → REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",    // → REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:..."               // → REACT_APP_FIREBASE_APP_ID
};
```

---

## 🧪 Testing After Fixes

### Test Backend
1. Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok"}`

2. Visit: `https://your-backend.onrender.com/api/all-complaints`
   - Should return: `{"complaints":[],"total":0}` (empty initially)

### Test Frontend
1. Visit: `https://naagrik-nivedan.vercel.app/`
   - ✅ Should see Home page
   - ✅ Preloader animation works
   - ✅ "Sign In" button visible
   - ✅ No white screen

2. Open Browser Console (F12):
   - ✅ Should see: `[Firebase] Initialized successfully`
   - ✅ No red errors

3. Test Sign Up:
   - ✅ Can create account
   - ✅ Can sign in
   - ✅ Redirects to dashboard

---

## 🐛 If Still Having Issues

### Backend Still Failing?

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for Python version being used
   - Check for any import errors

2. **Try Manual Python Version:**
   - In Render Dashboard → Settings
   - Set **Python Version** to `3.12.7` manually
   - Redeploy

3. **Alternative: Use psycopg2 (non-binary):**
   ```txt
   psycopg2>=2.9.0
   ```
   But this requires system dependencies, so `psycopg` is better.

### Frontend Still White Screen?

1. **Check Vercel Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment
   - Check **Build Logs** for errors

2. **Check Browser Console:**
   - Open https://naagrik-nivedan.vercel.app/
   - Press F12 → Console tab
   - Look for red errors
   - Common errors:
     - `Firebase configuration is missing!` → Set env vars
     - `Cannot read property of undefined` → Check Firebase init
     - `Network error` → Check `REACT_APP_API_BASE_URL`

3. **Verify Environment Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Make sure all 8 variables are set
   - Make sure they're set for **Production** environment
   - Check for typos in variable names

4. **Hard Refresh:**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache

---

## ✅ Success Checklist

After applying fixes:

- [ ] Backend deploys successfully on Render
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Frontend loads on Vercel (no white screen)
- [ ] Home page displays correctly
- [ ] Firebase initializes (check console)
- [ ] Can sign up/sign in
- [ ] Can submit complaints
- [ ] Data persists in database

---

## 📝 Summary

**Backend Fix:**
- ✅ Replaced `psycopg2-binary` with `psycopg[binary]` (Python 3.13 compatible)
- ✅ Created `runtime.txt` in root (backup)

**Frontend Fix:**
- ✅ Set all 8 Firebase environment variables on Vercel
- ✅ Set `REACT_APP_API_BASE_URL` to your Render backend URL

**Next Steps:**
1. Commit and push changes
2. Set Firebase env vars on Vercel
3. Redeploy both services
4. Test the application

---

**Last Updated**: 2025-01-16

