# 🔧 Fix: Python 3.13 Compatibility Issue on Render

## Problem

Render is using Python 3.13 by default, but `psycopg2-binary` is not compatible with Python 3.13, causing this error:

```
ImportError: /opt/render/project/src/.venv/lib/python3.13/site-packages/psycopg2/_psycopg.cpython-313-x86_64-linux-gnu.so: undefined symbol: _PyInterpreterState_Get
```

## Solution

We've fixed this by specifying Python 3.12 in the Render configuration.

---

## ✅ What Was Fixed

1. **Created `backend/runtime.txt`** - Specifies Python 3.12.7
2. **Updated `render.yaml`** - Added `runtime: python-3.12.7`

---

## 🚀 Next Steps

### Option 1: Using render.yaml (Recommended)

If you're using `render.yaml` for deployment:

1. The fix is already in `render.yaml`
2. **Redeploy** your service on Render
3. Render will now use Python 3.12.7

### Option 2: Manual Configuration

If you're configuring manually in Render dashboard:

1. Go to your **Backend Service** → **Settings**
2. Scroll to **"Environment"** section
3. Set **"Python Version"** to `3.12.7` (or `3.12`)
4. **Save** and **Redeploy**

### Option 3: Using runtime.txt

If `render.yaml` doesn't work, Render will automatically detect `backend/runtime.txt`:

1. The file `backend/runtime.txt` is already created with `python-3.12.7`
2. Make sure it's committed to your GitHub repo
3. **Redeploy** your service

---

## ✅ Verification

After redeploying, check the build logs. You should see:

```
Using Python version 3.12.7
```

And the deployment should succeed without the `psycopg2` import error.

---

## 🔄 Alternative Solution (If Above Doesn't Work)

If you still have issues, you can replace `psycopg2-binary` with `psycopg` (the modern replacement):

1. Update `backend/requirements.txt`:
   ```txt
   psycopg[binary]>=3.1.0
   ```

2. Update `backend/app.py` (if needed):
   ```python
   # psycopg works with the same connection string
   # No code changes needed for basic usage
   ```

However, **using Python 3.12 is the recommended solution** as it requires no code changes.

---

## 📝 Summary

- **Problem**: Python 3.13 incompatible with `psycopg2-binary`
- **Solution**: Use Python 3.12.7
- **Files Changed**: 
  - `backend/runtime.txt` (created)
  - `render.yaml` (updated)

**Next Step**: Redeploy your backend service on Render.

---

**Last Updated**: 2025-01-16

