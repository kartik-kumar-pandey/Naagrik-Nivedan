# ML Model Deployment Guide

## 🎯 Answer: **Render (Backend) Controls the Model**

The ML model runs on **Render (backend)**, NOT on Vercel (frontend).

### How It Works:
1. **Frontend (Vercel)**: User uploads an image → Sends to backend API
2. **Backend (Render)**: Receives image → Loads model → Classifies image → Returns result
3. **Frontend (Vercel)**: Receives classification result → Displays to user

---

## 📁 Current Model Setup

Your model file is located at:
```
project-root/
  ├── model/
  │   └── best_urban_mobilenet.pth  ← Your model file
  └── backend/
      ├── app.py
      └── model_inference.py
```

The backend code looks for the model at:
```python
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, 'model', 'best_urban_mobilenet.pth')
```

This means: `../model/best_urban_mobilenet.pth` from backend's perspective.

---

## ✅ Deployment Checklist for Model

### 1. Include Model in Git Repository

**Important**: Make sure your model file is committed to Git (if it's not too large).

Check your `.gitignore` - it should NOT ignore `.pth` files:

```gitignore
# Model files (include them)
# Do NOT add *.pth here
```

If your model is too large for Git (>100MB), see "Alternative: Large Model Storage" below.

### 2. Verify Model Path for Render

When deploying on Render, the directory structure will be:
```
/
  ├── model/
  │   └── best_urban_mobilenet.pth
  └── backend/
      ├── app.py
      └── model_inference.py
```

Your current code should work, but let's verify the path is correct.

### 3. Update Model Path (If Needed)

If the model path doesn't work on Render, you can update `backend/app.py`:

**Option A: Keep current structure** (Recommended)
```python
# Current code - should work
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, 'model', 'best_urban_mobilenet.pth')
```

**Option B: Use absolute path from backend**
```python
# Alternative if Option A doesn't work
backend_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(backend_dir, '..', 'model', 'best_urban_mobilenet.pth')
model_path = os.path.abspath(model_path)  # Resolve to absolute path
```

**Option C: Move model to backend directory** (Simplest)
```python
# If you move model to backend/model/
backend_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(backend_dir, 'model', 'best_urban_mobilenet.pth')
```

---

## 🚀 Render Deployment Steps

### Step 1: Ensure Model is in Repository

```bash
# Check if model is tracked
git ls-files | grep best_urban_mobilenet.pth

# If not, add it
git add model/best_urban_mobilenet.pth
git commit -m "Add model file for deployment"
git push
```

### Step 2: Configure Render Build

In Render dashboard, set:
- **Root Directory**: Leave empty (or `/` if required)
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && python app.py`

This ensures the model directory is accessible.

### Step 3: Verify Model Loading

After deployment, check Render logs for:
```
[OK] Model ready for inference on device: cpu
```

If you see errors about model file not found, check the path.

---

## 📦 Alternative: Large Model Storage

If your model file is too large for Git (>100MB), use one of these options:

### Option 1: Git LFS (Large File Storage)

```bash
# Install Git LFS
git lfs install

# Track .pth files
git lfs track "*.pth"

# Add and commit
git add .gitattributes
git add model/best_urban_mobilenet.pth
git commit -m "Add model with Git LFS"
git push
```

### Option 2: Cloud Storage (Recommended for Large Models)

1. **Upload model to cloud storage** (AWS S3, Google Cloud Storage, etc.)
2. **Download on first startup** in `backend/app.py`:

```python
import os
import requests

def download_model_if_needed():
    model_path = os.path.join(project_root, 'model', 'best_urban_mobilenet.pth')
    
    if not os.path.exists(model_path):
        print("Downloading model from cloud storage...")
        model_url = os.getenv('MODEL_DOWNLOAD_URL')  # Set in Render env vars
        response = requests.get(model_url)
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        with open(model_path, 'wb') as f:
            f.write(response.content)
        print("Model downloaded successfully")

# Call this before initializing classifier
download_model_if_needed()
```

3. **Set environment variable in Render**:
   - `MODEL_DOWNLOAD_URL` = Your cloud storage URL

### Option 3: Render Disk Storage

Render provides persistent disk storage. You can:
1. Upload model via Render dashboard
2. Mount it to your service
3. Update path to use mounted volume

---

## 🔍 Troubleshooting Model Issues

### Issue: "Model file not found"

**Solution**: Check the path in Render logs and verify:
1. Model file is in Git repository
2. Path is correct relative to backend directory
3. File permissions are correct

### Issue: "CUDA/GPU errors"

**Solution**: Render free tier uses CPU. Your code should handle this:
```python
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
```

This should default to CPU on Render.

### Issue: "Out of memory"

**Solution**: 
- Use CPU inference (already default)
- Reduce batch size if batching
- Consider model quantization for smaller size

### Issue: "Slow inference"

**Solution**: 
- This is normal on CPU
- Consider upgrading Render plan for better performance
- Optimize model loading (load once, reuse)

---

## ✅ Verification Steps

After deployment:

1. **Check Render logs** for model loading:
   ```
   [OK] Model ready for inference on device: cpu
   ```

2. **Test API endpoint**:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/classify-issue \
     -H "Content-Type: application/json" \
     -d '{"image": "base64_encoded_image"}'
   ```

3. **Test from frontend**: Submit a test complaint with an image

---

## 📝 Summary

- ✅ **Model runs on Render (backend)**
- ✅ **Vercel (frontend) only sends requests**
- ✅ **Model file must be accessible to backend**
- ✅ **Current path structure should work on Render**
- ✅ **Verify model loads in Render logs after deployment**

---

## 🎯 Quick Answer

**Render controls the model.** Vercel just sends image data to Render's API, and Render does the ML inference using the model file.

