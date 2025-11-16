# 🔍 Debug White Screen on Vercel

Your build is **successful**, but you're seeing a white screen. This means the issue is at **runtime**, not build time.

---

## 🚨 Most Likely Cause: Missing Firebase Environment Variables

Since the build succeeds, the problem is that **Firebase environment variables are not set** on Vercel.

---

## ✅ Step-by-Step Fix

### Step 1: Check Browser Console

1. Visit: https://naagrik-nivedan.vercel.app/
2. Press **F12** (or Right-click → Inspect)
3. Go to **Console** tab
4. Look for these messages:

**If you see:**
```
Firebase configuration is missing!
[AuthContext] Firebase not initialized
```

**→ This confirms Firebase env vars are missing**

---

### Step 2: Set Environment Variables on Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click on your project: **naagrik-nivedan**

2. **Navigate to Environment Variables:**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add ALL 8 Variables:**

   Click **"Add New"** for each:

   | Variable Name | Value | Where to Get |
   |--------------|-------|--------------|
   | `REACT_APP_FIREBASE_API_KEY` | `AIza...` | Firebase Console |
   | `REACT_APP_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Firebase Console |
   | `REACT_APP_FIREBASE_DATABASE_URL` | `https://...firebaseio.com` | Firebase Console |
   | `REACT_APP_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Console |
   | `REACT_APP_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Firebase Console |
   | `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console |
   | `REACT_APP_FIREBASE_APP_ID` | `1:123456789:web:...` | Firebase Console |
   | `REACT_APP_API_BASE_URL` | `https://your-backend.onrender.com` | Your Render backend URL |

4. **IMPORTANT Settings:**
   - For each variable, select **ALL environments**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save** after each variable

5. **Redeploy:**
   - After adding all variables, go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Or Vercel will auto-redeploy

---

### Step 3: Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ **Settings** → **Project settings**
4. Scroll to **"Your apps"** section
5. If you don't have a web app:
   - Click **"</>"** (Add app) → **Web**
   - Register app
6. Copy the config values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                    // → REACT_APP_FIREBASE_API_KEY
  authDomain: "project-id.firebaseapp.com", // → REACT_APP_FIREBASE_AUTH_DOMAIN
  databaseURL: "https://project-id-default-rtdb.firebaseio.com", // → REACT_APP_FIREBASE_DATABASE_URL
  projectId: "project-id",                // → REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "project-id.appspot.com", // → REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",         // → REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123"         // → REACT_APP_FIREBASE_APP_ID
};
```

---

### Step 4: Verify Environment Variables

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Environment Variables**
   - You should see all 8 variables listed
   - Each should have ✅ for Production, Preview, Development

2. **After Redeploy:**
   - Visit: https://naagrik-nivedan.vercel.app/
   - Open Console (F12)
   - Should see: `[Firebase] Initialized successfully`
   - Should **NOT** see: `Firebase configuration is missing!`

---

## 🧪 Testing After Fix

1. **Visit your site:**
   - https://naagrik-nivedan.vercel.app/
   - Should see Home page (not white screen)

2. **Check Console (F12):**
   - ✅ `[Firebase] Initialized successfully`
   - ✅ No red errors
   - ✅ Home page loads

3. **Test Functionality:**
   - ✅ Can see "Sign In" button
   - ✅ Can click "Sign In"
   - ✅ Can sign up/sign in

---

## 🐛 If Still White Screen

### Check 1: Verify Variables Are Set

1. In Vercel → **Settings** → **Environment Variables**
2. Make sure all 8 variables are there
3. Make sure they're set for **Production** environment
4. Check for typos in variable names (must start with `REACT_APP_`)

### Check 2: Check Build Logs

1. In Vercel → **Deployments**
2. Click on latest deployment
3. Check **Build Logs**
4. Look for any errors or warnings

### Check 3: Check Browser Console

1. Visit your site
2. Open Console (F12)
3. Look for:
   - Red errors
   - `Firebase configuration is missing!`
   - `Cannot read property of undefined`
   - Network errors

### Check 4: Hard Refresh

1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try incognito/private window

### Check 5: Verify Firebase Project

1. Go to Firebase Console
2. Make sure:
   - ✅ Authentication is enabled
   - ✅ Realtime Database is enabled
   - ✅ Database rules allow read/write

---

## 📝 Quick Checklist

- [ ] All 8 environment variables set on Vercel
- [ ] Variables set for Production, Preview, AND Development
- [ ] No typos in variable names
- [ ] Firebase project has Authentication enabled
- [ ] Firebase project has Realtime Database enabled
- [ ] Redeployed after setting variables
- [ ] Checked browser console for errors
- [ ] Hard refreshed the page

---

## 🎯 Expected Result

After setting environment variables and redeploying:

✅ Home page loads (not white screen)
✅ Preloader animation works
✅ "Sign In" button visible
✅ Console shows: `[Firebase] Initialized successfully`
✅ Can sign up/sign in
✅ No errors in console

---

## 🆘 Still Having Issues?

If you've done all the above and still see a white screen:

1. **Share browser console errors** (F12 → Console)
2. **Share Vercel build logs** (if any errors)
3. **Verify Firebase project is active**
4. **Check if variables are actually being used** (they should appear in build)

---

**Most Common Issue**: Environment variables not set for **Production** environment. Make sure to select **Production** when adding each variable!

---

**Last Updated**: 2025-01-16

