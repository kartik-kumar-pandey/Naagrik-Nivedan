# Fix: Empty Database on Render

## 🔴 Problem

Your backend on Render is returning empty data because:
- **Render's free tier uses ephemeral storage** - SQLite database gets wiped on each deployment
- Your local database has 13 complaints, but Render's database is fresh/empty
- Each time Render redeploys, the database resets

## ✅ Solution: Use PostgreSQL (Recommended)

Render provides **free PostgreSQL database** that persists data across deployments.

---

## 🚀 Step-by-Step Fix

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `civic-issues-db` (or any name)
   - **Database**: `civic_issues` (or any name)
   - **User**: Auto-generated
   - **Region**: Same as your backend (Oregon)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need this)

### Step 2: Update Backend Code for PostgreSQL

Update `backend/app.py` to use PostgreSQL:

```python
# Database configuration
import os

# Check if we're on Render (has DATABASE_URL) or local (use SQLite)
if os.getenv('DATABASE_URL'):
    # Render PostgreSQL
    # Render provides DATABASE_URL in format: postgresql://user:pass@host/dbname
    # SQLAlchemy needs postgresql:// (not postgres://)
    database_url = os.getenv('DATABASE_URL')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Local SQLite (for development)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    instance_dir = os.path.join(backend_dir, 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, 'civic_issues.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
```

### Step 3: Update requirements.txt

Add PostgreSQL driver:

```txt
Flask==2.3.2
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
psycopg2-binary==2.9.9  # Add this for PostgreSQL
tensorflow>=2.16.0
opencv-python>=4.8.0
Pillow>=10.0.0
numpy>=1.24.0
requests>=2.31.0
python-dotenv>=1.0.0
geopy>=2.3.0
google-generativeai>=0.1.0
python-multipart>=0.0.6
torch>=2.0.0
torchvision>=0.15.0
```

### Step 4: Connect Database to Backend Service

1. Go to your **backend service** on Render
2. Go to **"Environment"** tab
3. Click **"Link Database"** or **"Add Environment Variable"**
4. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL internal database URL (from Step 1)
   - Or use Render's auto-link feature if available

### Step 5: Redeploy Backend

1. Push your code changes to GitHub
2. Render will auto-deploy
3. The database will be created automatically on first run

### Step 6: (Optional) Migrate Existing Data

If you want to copy your local data to Render:

1. Export from local SQLite:
```python
# export_data.py
from backend.app import app, db, IssueReport
import json

with app.app_context():
    complaints = IssueReport.query.all()
    data = []
    for c in complaints:
        data.append({
            'user_id': c.user_id,
            'issue_type': c.issue_type,
            'status': c.status,
            'priority': c.priority,
            'latitude': c.latitude,
            'longitude': c.longitude,
            'address': c.address,
            'description': c.description,
            'department': c.department,
            'created_at': c.created_at.isoformat() if c.created_at else None,
        })
    
    with open('complaints_export.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Exported {len(data)} complaints")
```

2. Import to Render (via API or direct SQL):
```python
# import_data.py - Run this pointing to Render's database
# You'll need to set DATABASE_URL to Render's PostgreSQL URL
```

---

## 🔄 Alternative: Keep SQLite but Use Persistent Disk

If you want to keep SQLite:

1. **Upgrade to Render paid plan** (has persistent disk)
2. **Or use external storage** (AWS S3, etc.) for database file
3. **Not recommended** - PostgreSQL is better for production

---

## ✅ Quick Fix Code

Replace the database configuration section in `backend/app.py`:

```python
# Database configuration - Supports both PostgreSQL (Render) and SQLite (local)
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Check for Render's DATABASE_URL (PostgreSQL)
if os.getenv('DATABASE_URL'):
    # Render PostgreSQL
    database_url = os.getenv('DATABASE_URL')
    # SQLAlchemy needs postgresql:// not postgres://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    print(f"[INFO] Using PostgreSQL database from DATABASE_URL")
else:
    # Local SQLite (development)
    instance_dir = os.path.join(backend_dir, 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, 'civic_issues.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    print(f"[INFO] Using SQLite database at {db_path}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
```

---

## 🧪 Testing

After deployment:

1. Check Render logs for: `[INFO] Using PostgreSQL database from DATABASE_URL`
2. Test API: `https://naagrik-nivedan.onrender.com/api/all-complaints`
3. Submit a test complaint to verify it saves
4. Check again - should show the new complaint

---

## 📝 Summary

- ✅ **Problem**: SQLite on Render is ephemeral (gets wiped)
- ✅ **Solution**: Use Render's free PostgreSQL
- ✅ **Result**: Data persists across deployments
- ✅ **Bonus**: PostgreSQL is better for production anyway!

Your backend is working correctly - it just needs a persistent database! 🎉

