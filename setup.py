#!/usr/bin/env python3
"""
Setup script for the Civic Issue Reporting App
"""

import os
import subprocess
import sys

def run_command(command, cwd=None):
    """Run a command and handle errors"""
    try:
        result = subprocess.run(command, shell=True, check=True, cwd=cwd, capture_output=True, text=True)
        print(f"✓ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Civic Issue Reporting App...")
    print("=" * 50)
    
    # Check if Node.js is installed
    if not run_command("node --version"):
        print("❌ Node.js is not installed. Please install Node.js first.")
        return
    
    # Check if Python is installed
    if not run_command("python --version"):
        print("❌ Python is not installed. Please install Python first.")
        return
    
    print("\n📦 Installing frontend dependencies...")
    if not run_command("npm install"):
        print("❌ Failed to install frontend dependencies")
        return
    
    print("\n🐍 Setting up Python backend...")
    backend_dir = "backend"
    
    # Create virtual environment
    if not run_command("python -m venv venv", cwd=backend_dir):
        print("❌ Failed to create virtual environment")
        return
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/Mac
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print("📚 Installing Python dependencies...")
    if not run_command(f"{pip_cmd} install -r requirements.txt", cwd=backend_dir):
        print("❌ Failed to install Python dependencies")
        return
    
    print("\n🔧 Creating environment file...")
    env_content = """# API Keys - Get these from the respective services
GEMINI_API_KEY=your_gemini_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here
"""
    
    env_file = os.path.join(backend_dir, ".env")
    with open(env_file, "w") as f:
        f.write(env_content)
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Get API keys from Google Gemini and OpenCage")
    print("2. Update the .env file in the backend directory with your API keys")
    print("3. Run 'npm run dev' to start both frontend and backend")
    print("4. Open http://localhost:3000 in your browser")
    
    print("\n🔑 Required API Keys:")
    print("- Google Gemini: https://makersuite.google.com/")
    print("- OpenCage Geocoding: https://opencagedata.com/")

if __name__ == "__main__":
    main()
