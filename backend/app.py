from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import base64
import traceback
import cv2
import numpy as np
from PIL import Image
import io
import requests
import json
import uuid
import re
from datetime import datetime
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
# Supports both PostgreSQL (Render production) and SQLite (local development)
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
    print(f"[INFO] Python version: {os.sys.version}")
else:
    # Local SQLite (development)
    instance_dir = os.path.join(backend_dir, 'instance')
    os.makedirs(instance_dir, exist_ok=True)
    db_path = os.path.join(instance_dir, 'civic_issues.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    print(f"[INFO] Using SQLite database at {db_path}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# API Keys
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize AI services
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Root and health endpoints
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'Civic Issue Backend',
        'status': 'running',
        'endpoints': {
            'health': '/health',
            'classify_issue': 'POST /api/classify-issue',
            'submit_complaint': 'POST /api/submit-complaint',
            'track_complaint': 'GET /api/track-complaint/<id>',
            'complaints_map': 'GET /api/complaints-map?lat=<>&lon=<>',
            'heatmap_data': 'GET /api/heatmap-data',
            'all_complaints': 'GET /api/all-complaints'
        }
    })

@app.route('/api', methods=['GET'])
def api_root():
    return jsonify({
        'message': 'API root',
        'classify_issue': 'POST /api/classify-issue'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# Database Models
class IssueReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    image_path = db.Column(db.String(500))
    issue_type = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String(500))
    description = db.Column(db.Text)
    formal_complaint = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')
    priority = db.Column(db.String(20), default='normal')
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    issue_types = db.Column(db.String(500))  # JSON string of handled issue types
    contact_info = db.Column(db.String(200))

# Import the model inference module
from model_inference import IssueClassifier

# Initialize the classifier with the trained MobileNetV3 model
# Using the best_urban_mobilenet.pth model from the model directory
# Get the project root directory (parent of backend)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, 'model', 'best_urban_mobilenet.pth')

# Set num_classes=6 if your model was trained with all 6 categories (including illegal_parking)
# Set num_classes=5 if your model was trained with only 5 categories (without illegal_parking)
try:
    classifier = IssueClassifier(model_path=model_path, num_classes=6)
    print("=" * 60)
    print("[OK] Model classifier initialized successfully!")
    print("=" * 60)
except FileNotFoundError as e:
    print("=" * 60)
    print("[ERROR] Model file not found!")
    print("=" * 60)
    print(str(e))
    print(f"\nExpected model path: {model_path}")
    print("\nTo fix this:")
    print("1. Ensure best_urban_mobilenet.pth exists in the model/ directory")
    print("2. The model should be trained with MobileNetV3CBAM architecture")
    print("3. Check that the file path is correct")
    print("=" * 60)
    raise
except Exception as e:
    print("=" * 60)
    print("[ERROR] Failed to initialize model!")
    print("=" * 60)
    print(str(e))
    print("=" * 60)
    raise

# Utility Functions
def get_address_from_coords(lat, lon):
    try:
        geolocator = Nominatim(user_agent="civic_issue_app/1.0 (contact: support@example.com)")
        # Request detailed address with higher zoom for POI-level names
        location = geolocator.reverse(
            (lat, lon),
            exactly_one=True,
            addressdetails=True,
            zoom=18,
            language='en'
        )
        if not location:
            return "Address not found"
        # Prefer a friendly place name if available
        addr = location.raw.get('address', {}) if hasattr(location, 'raw') else {}
        parts = []
        for key in ['name', 'amenity', 'building', 'shop', 'poi']:
            val = addr.get(key)
            if val:
                parts.append(val)
                break
        # Road / house no
        road_bits = []
        if addr.get('house_number'):
            road_bits.append(addr.get('house_number'))
        if addr.get('road'):
            road_bits.append(addr.get('road'))
        if road_bits:
            parts.append(' '.join(road_bits))
        # Area / city
        for key in ['neighbourhood', 'suburb', 'city_district', 'city', 'town', 'village']:
            val = addr.get(key)
            if val:
                parts.append(val)
                break
        # State / postcode / country
        if addr.get('state'):
            parts.append(addr.get('state'))
        if addr.get('postcode'):
            parts.append(addr.get('postcode'))
        if addr.get('country'):
            parts.append(addr.get('country'))
        friendly = ', '.join([p for p in parts if p])
        return friendly or (location.address if hasattr(location, 'address') else "Address not found")
    except Exception as e:
        print(f"Reverse geocoding error: {e}")
        return "Address not found"

def get_department_for_issue(issue_type):
    """Assign department based on issue type"""
    department_mapping = {
        # Model categories (6 categories from MobileNetV3)
        'damaged_signs': 'Traffic Department',
        'fallen_trees': 'Public Works',
        'garbage': 'Sanitation',
        'graffiti': 'Public Works',
        'illegal_parking': 'Traffic Department',
        'potholes': 'Public Works',
        
        # Legacy categories (for backward compatibility)
        'pothole': 'Public Works',
        'street_light': 'Public Works',
        'sidewalk_damage': 'Public Works',
        'road_damage': 'Public Works',
        'bridge_issue': 'Public Works',
        'street_repair': 'Public Works',
        
        # Water Department
        'water_leak': 'Water Department',
        'drainage': 'Water Department',
        'sewage_issue': 'Water Department',
        'water_supply': 'Water Department',
        
        # Traffic Department
        'traffic_signal': 'Traffic Department',
        'traffic_sign': 'Traffic Department',
        'road_marking': 'Traffic Department',
        'traffic_light': 'Traffic Department',
        
        # Sanitation
        'waste_management': 'Sanitation',
        'cleanliness': 'Sanitation',
        
        # Health Department
        'health_issue': 'Health Department',
        'medical_emergency': 'Health Department',
        'sanitation_health': 'Health Department',
        
        # Education Department
        'school_issue': 'Education Department',
        'education_facility': 'Education Department',
        
        # Default for unknown issues
        'other': 'Public Works'
    }
    return department_mapping.get(issue_type, 'Public Works')  # Always return a valid department

def find_nearest_department(lat, lon, issue_type):
    departments = Department.query.all()
    if not departments:
        return None
    
    min_distance = float('inf')
    nearest_dept = None
    
    for dept in departments:
        if dept.latitude and dept.longitude:
            distance = geodesic((lat, lon), (dept.latitude, dept.longitude)).kilometers
            if distance < min_distance:
                min_distance = distance
                nearest_dept = dept
    
    return nearest_dept

def generate_formal_complaint(issue_type, description, location, latitude=None, longitude=None, priority='normal', department=None, user_id='anonymous'):
    """
    Generate a professional, formal complaint letter with actual details.
    Uses 100% template-based approach - NO placeholders, all actual data.
    
    Args:
        issue_type: Type of issue (e.g., 'potholes')
        description: User description of the issue
        location: Full address
        latitude: GPS latitude
        longitude: GPS longitude
        priority: Priority level (low, normal, high, urgent)
        department: Assigned department name
        user_id: User identifier
    
    Returns:
        str: Complete complaint letter with no placeholders
    """
    
    # Format issue type for display
    issue_type_display = issue_type.replace('_', ' ').title()
    
    # Extract city and state from location if available
    # Format: "Jajmau, Kanpur, Kanpur Nagar, Uttar Pradesh, 208015, India"
    location_parts = [part.strip() for part in location.split(',')] if location else []
    
    # Try to extract city and state from location parts
    city = "Kanpur"  # Default
    state = "Uttar Pradesh"  # Default
    
    if len(location_parts) >= 4:
        # Usually format: Area, City, District, State, Pincode, Country
        for i, part in enumerate(location_parts):
            # Check for common state names in India
            state_names = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Gujarat', 'Rajasthan', 'Punjab', 
                          'West Bengal', 'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh', 'Bihar', 'Odisha', 
                          'Assam', 'Haryana', 'Kerala', 'Jharkhand', 'Chhattisgarh', 'Delhi', 
                          'Himachal Pradesh', 'Uttarakhand', 'Goa', 'Manipur', 'Meghalaya', 'Mizoram', 
                          'Nagaland', 'Sikkim', 'Tripura', 'Arunachal Pradesh', 'Telangana']
            if any(state_name in part for state_name in state_names):
                state = part
                # City is usually the part before state
                if i > 0:
                    city = location_parts[i-1]
                break
    
    # Fallback: use index-based extraction
    if city == "Kanpur" and len(location_parts) >= 2:
        # Try to find city (usually second to last before pincode)
        for i, part in enumerate(location_parts):
            if part.lower() in ['kanpur', 'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad']:
                city = part
                break
        if city == "Kanpur" and len(location_parts) >= 2:
            city = location_parts[-3] if len(location_parts) >= 3 else location_parts[-2]
    
    if state == "Uttar Pradesh" and len(location_parts) >= 2:
        # Skip pincode and country, get state
        for part in reversed(location_parts):
            if not part.isdigit() and part.lower() not in ['india', 'indian']:
                if any(s in part for s in ['Pradesh', 'Bengal', 'Nadu', 'Kerala', 'Gujarat', 'Rajasthan']):
                    state = part
                    break
    
    # Format coordinates
    coordinates_text = ""
    if latitude and longitude:
        coordinates_text = f"Latitude: {latitude:.6f}° N\nLongitude: {longitude:.6f}° E"
    
    # Priority mapping
    priority_map = {
        'low': 'Low',
        'normal': 'Normal',
        'high': 'High',
        'urgent': 'Urgent'
    }
    priority_display = priority_map.get(priority, 'Normal')
    
    # Department name
    dept_name = department or get_department_for_issue(issue_type)
    
    # Current date
    current_date = datetime.now().strftime('%B %d, %Y')
    
    # Build description text
    if description:
        description_text = description
    else:
        # Generate default description based on issue type
        issue_descriptions = {
            'potholes': f'The road surface in {location} has multiple potholes that are causing significant disruption to traffic flow and posing safety risks to vehicles and pedestrians.',
            'damaged_signs': f'Traffic signs or road signs in {location} are damaged, missing, or illegible, which poses safety risks to motorists and pedestrians.',
            'fallen_trees': f'Fallen trees or tree branches in {location} are blocking roads or pathways, creating obstacles and potential safety hazards.',
            'garbage': f'Garbage and waste accumulation in {location} is causing health and environmental concerns, requiring immediate cleanup and waste management.',
            'graffiti': f'Unauthorized graffiti and vandalism in {location} is affecting the aesthetic appearance of public spaces and may indicate security concerns.',
            'illegal_parking': f'Illegal parking in {location} is obstructing traffic flow and creating safety hazards for vehicles and pedestrians.',
            'street_light': f'Street lights in {location} are not functioning properly, creating safety concerns especially during nighttime hours.',
            'water_leak': f'Water leaks in {location} are causing water wastage and potential damage to infrastructure and surrounding areas.',
            'traffic_signal': f'Traffic signals in {location} are malfunctioning or not working, creating traffic congestion and safety risks.',
            'sidewalk_damage': f'Sidewalk damage in {location} is creating hazards for pedestrians and requires immediate repair.',
            'drainage': f'Drainage issues in {location} are causing water accumulation and potential flooding risks.',
        }
        description_text = issue_descriptions.get(issue_type, f'Civic infrastructure issue of type {issue_type_display.lower()} has been identified in {location} and requires immediate attention to ensure public safety.')
    
    # Build complaint letter using template (NO placeholders - all actual data)
    complaint_letter = f"""Nagrik Nivedan Platform
Complaint Reference: {user_id}

{current_date}

To,
The Municipal Commissioner,
{city} Municipal Corporation,
{city}, {state}, India.

**Subject: Formal Complaint Regarding {issue_type_display} Issue in {location}**

Dear Sir/Madam,

This letter serves as a formal complaint regarding a {issue_type_display.lower()} issue that has been identified in {location} and requires immediate attention.

**COMPLAINT DETAILS:**

**Issue Type:** {issue_type_display} (AI-Identified)
**Priority:** {priority_display} Priority
**Location:** {location}
{f'**Coordinates:**\n{coordinates_text}' if coordinates_text else ''}
**Date:** {current_date}
**Assigned Department:** {dept_name}
**Complaint ID:** {user_id}

**DESCRIPTION:**

{description_text}

**LOCATION DETAILS:**

- **Full Address:** {location}
{f'- **GPS Coordinates:** {coordinates_text}' if coordinates_text else ''}
{f'- **Captured from user\'s device GPS**' if coordinates_text else ''}

**URGENCY ASSESSMENT:**

We consider this issue to be of **{priority_display.lower()} priority**. The condition of the {issue_type_display.lower()} in {location} requires attention to ensure public safety and maintain service standards. {'Given the ' + priority_display.lower() + ' priority level, we request immediate action to address this matter.' if priority in ['high', 'urgent'] else 'Prompt action is necessary to prevent further deterioration and ensure the safety of residents and commuters.'}

**POTENTIAL SAFETY CONCERNS:**

The presence of this {issue_type_display.lower()} issue presents several potential safety concerns, including:
- Increased risk of accidents, particularly for vehicles and pedestrians
- Potential damage to vehicles and infrastructure
- Disruption to traffic flow and public safety
- Risk of injury to residents and commuters

**REQUEST FOR IMMEDIATE ACTION:**

We respectfully request that the {dept_name} take immediate action to address this critical issue. Specifically, we request the following:

1. **Immediate Inspection:** Conduct a thorough inspection of the location in {location} to assess the extent of the {issue_type_display.lower()} issue.

2. **Assessment and Remediation:** Implement appropriate measures to resolve the {issue_type_display.lower()} issue and restore the area to a safe and usable condition.

3. **Preventative Measures:** Explore and implement preventative measures to prevent the recurrence of similar issues in the future, such as improved maintenance and use of durable materials.

4. **Status Updates:** Provide updates on the progress through our tracking system (Complaint ID: {user_id}).

We believe that prompt action is essential to mitigate any risks associated with this issue and ensure the safety and well-being of the residents and commuters in {location}. We look forward to a timely response and a concrete plan of action to address this matter.

Thank you for your attention to this important issue.

Respectfully,

Nagrik Nivedan Platform
Complaint ID: {user_id}
{current_date}"""
    
    # Final cleanup - remove any remaining brackets or placeholder-like text (shouldn't be any, but just in case)
    complaint_letter = re.sub(r'\[.*?\]', '', complaint_letter)
    complaint_letter = re.sub(r'\n{3,}', '\n\n', complaint_letter)
    
    return complaint_letter.strip()

# API Routes
@app.route('/api/classify-issue', methods=['POST'])
def classify_issue():
    try:
        data = request.json
        image_data = data.get('image') if data else None
        mime_hint = None
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image (supports both data URL and raw base64)
        try:
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # data URL format: data:image/<type>;base64,<payload>
                try:
                    header, payload = image_data.split(',', 1)
                    # Example header: data:image/webp;base64
                    if ';' in header and ':' in header:
                        mime_hint = header.split(':', 1)[1].split(';', 1)[0]  # image/webp, image/jpeg, etc.
                    image_data = payload
                except Exception:
                    # Fallback if split fails
                    image_data = image_data.split(',', 1)[1]
            image_bytes = base64.b64decode(image_data)
        except Exception:
            return jsonify({'error': 'Invalid image format. Expected a base64-encoded image string.'}), 400
        
        # Open image (PIL first, then OpenCV fallback for formats like WEBP)
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception:
            try:
                # Fallback: OpenCV decode (handles webp if build supports it)
                npbuf = np.frombuffer(image_bytes, np.uint8)
                cv_img = cv2.imdecode(npbuf, cv2.IMREAD_COLOR)  # BGR
                if cv_img is None:
                    raise ValueError("cv2.imdecode returned None")
                cv_img = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(cv_img)
            except Exception:
                msg = 'Failed to decode image bytes.'
                if mime_hint:
                    msg += f' mime={mime_hint}'
                return jsonify({'error': msg}), 400
        
        # Convert to numpy array for processing
        image_array = np.array(image)
        
        # Classify the issue
        result = classifier.classify_issue(image_array)
        
        return jsonify(result)
    
    except Exception as e:
        print("Classification endpoint error:", e)
        print(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error during classification.',
            'detail': str(e)
        }), 500

@app.route('/api/submit-complaint', methods=['POST'])
def submit_complaint():
    try:
        data = request.json
        
        # Get issue type - support both camelCase (issueType) and snake_case (issue_type)
        issue_type = data.get('issue_type') or data.get('issueType')
        if not issue_type:
            return jsonify({'error': 'Issue type is required'}), 400
        
        # Get location details
        lat = data.get('latitude')
        lon = data.get('longitude')
        # Prefer client-provided address if available; fallback to reverse geocoding
        if data.get('address'):
            address = data.get('address')
        elif lat is not None and lon is not None:
            address = get_address_from_coords(lat, lon)
        else:
            address = "Location not provided"
        
        # Assign department based on issue type
        assigned_department = get_department_for_issue(issue_type)
        
        # Get priority (default to normal)
        priority = data.get('priority', 'normal')
        
        # Get user ID
        user_id = data.get('user_id', 'anonymous')
        
        # Generate formal complaint with all details
        formal_complaint = generate_formal_complaint(
            issue_type=issue_type,
            description=data.get('description', ''),
            location=address,
            latitude=lat,
            longitude=lon,
            priority=priority,
            department=assigned_department,
            user_id=user_id
        )
        
        # Save image if provided
        image_path = None
        if data.get('image'):
            try:
                # Create images directory if it doesn't exist
                uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
                os.makedirs(uploads_dir, exist_ok=True)
                
                # Generate unique filename
                filename = f"{uuid.uuid4().hex}.jpg"
                image_path = f"uploads/{filename}"
                
                # Save image
                image_data = data.get('image')
                if image_data.startswith('data:image'):
                    # Remove data URL prefix
                    image_data = image_data.split(',')[1]
                
                full_image_path = os.path.join(uploads_dir, filename)
                with open(full_image_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))
                    
            except Exception as e:
                print(f"Error saving image: {e}")
                traceback.print_exc()
                image_path = None

        # Create issue report
        issue_report = IssueReport(
            user_id=user_id,
            issue_type=issue_type,  # Ensure issue_type is always set
            latitude=lat,
            longitude=lon,
            address=address,
            description=data.get('description', ''),
            formal_complaint=formal_complaint,
            department=assigned_department,
            status='pending',
            priority=priority,  # Set priority
            image_path=image_path
        )
        
        db.session.add(issue_report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'complaint_id': issue_report.id,
            'department': assigned_department,
            'issue_type': issue_type
        })
    
    except Exception as e:
        print(f"Error submitting complaint: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/track-complaint/<int:complaint_id>', methods=['GET'])
def track_complaint(complaint_id):
    try:
        complaint = IssueReport.query.get_or_404(complaint_id)
        return jsonify({
            'id': complaint.id,
            'issue_type': complaint.issue_type or 'other',
            'status': complaint.status or 'pending',
            'priority': complaint.priority or 'normal',
            'department': complaint.department,
            'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
            'updated_at': complaint.updated_at.isoformat() if complaint.updated_at else None
        })
    
    except Exception as e:
        print(f"Error tracking complaint: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaints-map', methods=['GET'])
def get_complaints_map():
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        radius = request.args.get('radius', 5, type=float)  # km
        
        if lat is None or lon is None:
            return jsonify({'error': 'Latitude and longitude required'}), 400
        
        # Get complaints within radius
        complaints = IssueReport.query.filter(
            IssueReport.latitude.isnot(None),
            IssueReport.longitude.isnot(None)
        ).all()
        
        nearby_complaints = []
        for complaint in complaints:
            distance = geodesic((lat, lon), (complaint.latitude, complaint.longitude)).kilometers
            if distance <= radius:
                nearby_complaints.append({
                    'id': complaint.id,
                    'latitude': complaint.latitude,
                    'longitude': complaint.longitude,
                    'issue_type': complaint.issue_type or 'other',
                    'status': complaint.status or 'pending',
                    'priority': complaint.priority or 'normal',
                    'distance': distance
                })
        
        return jsonify({
            'complaints': nearby_complaints,
            'center': {'lat': lat, 'lon': lon},
            'radius': radius
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heatmap-data', methods=['GET'])
def get_heatmap_data():
    try:
        complaints = IssueReport.query.filter(
            IssueReport.latitude.isnot(None),
            IssueReport.longitude.isnot(None)
        ).all()
        
        # Group complaints by location clusters (within 100m radius)
        clusters = {}
        cluster_radius = 0.001  # Approximately 100m
        
        for complaint in complaints:
            lat, lng = complaint.latitude, complaint.longitude
            
            # Find existing cluster or create new one
            cluster_found = False
            for cluster_center, cluster_data in clusters.items():
                cluster_lat, cluster_lng = cluster_center
                distance = ((lat - cluster_lat) ** 2 + (lng - cluster_lng) ** 2) ** 0.5
                
                if distance < cluster_radius:
                    clusters[cluster_center]['count'] += 1
                    clusters[cluster_center]['complaints'].append(complaint)
                    cluster_found = True
                    break
            
            if not cluster_found:
                clusters[(lat, lng)] = {
                    'count': 1,
                    'complaints': [complaint],
                    'center_lat': lat,
                    'center_lng': lng
                }
        
        # Convert clusters to heatmap data with intensity based on complaint count
        heatmap_data = []
        for cluster_center, cluster_data in clusters.items():
            # Calculate intensity based on complaint count
            intensity = min(cluster_data['count'] / 5.0, 1.0)  # Cap at 1.0 for 5+ complaints
            
            heatmap_data.append({
                'lat': cluster_data['center_lat'],
                'lng': cluster_data['center_lng'],
                'weight': intensity,
                'count': cluster_data['count'],
                'complaints': [
                    {
                        'id': c.id,
                        'issue_type': c.issue_type or 'other',
                        'status': c.status or 'pending',
                        'priority': c.priority or 'normal'
                    } for c in cluster_data['complaints']
                ]
            })
        
        return jsonify(heatmap_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/all-complaints', methods=['GET'])
def get_all_complaints():
    try:
        complaints = IssueReport.query.all()
        
        complaints_data = []
        for complaint in complaints:
            # Provide default values for None fields
            issue_type = complaint.issue_type or 'other'
            complaints_data.append({
                'id': complaint.id,
                'user_id': complaint.user_id,
                'issue_type': issue_type,
                'status': complaint.status or 'pending',
                'priority': complaint.priority or 'normal',
                'latitude': complaint.latitude,
                'longitude': complaint.longitude,
                'address': complaint.address,
                'description': complaint.description,
                'department': complaint.department,
                'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
                'updated_at': complaint.updated_at.isoformat() if complaint.updated_at else None
            })
        
        return jsonify({
            'complaints': complaints_data,
            'total': len(complaints_data)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaint/<int:complaint_id>', methods=['GET'])
def get_complaint_details(complaint_id):
    try:
        complaint = IssueReport.query.get_or_404(complaint_id)
        
        # Provide default values for None fields
        return jsonify({
                'id': complaint.id,
                'user_id': complaint.user_id,
                'issue_type': complaint.issue_type or 'other',
                'status': complaint.status or 'pending',
                'priority': complaint.priority or 'normal',
                'latitude': complaint.latitude,
                'longitude': complaint.longitude,
                'address': complaint.address,
                'description': complaint.description,
                'formal_complaint': complaint.formal_complaint,
                'department': complaint.department,
                'image_path': complaint.image_path,
                'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
                'updated_at': complaint.updated_at.isoformat() if complaint.updated_at else None
            })
    
    except Exception as e:
        print(f"Error fetching complaint details: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/complaint/<int:complaint_id>/update-status', methods=['PUT'])
def update_complaint_status(complaint_id):
    try:
        data = request.get_json()
        complaint = IssueReport.query.get_or_404(complaint_id)
        
        # Update status and priority if provided
        if 'status' in data:
            complaint.status = data['status']
        if 'priority' in data:
            complaint.priority = data['priority']
        
        complaint.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Complaint status updated successfully',
            'complaint': {
                'id': complaint.id,
                'status': complaint.status,
                'priority': complaint.priority,
                'updated_at': complaint.updated_at.isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/<path:filename>')
def serve_image(filename):
    try:
        from flask import send_from_directory
        # Handle both cases: filename only or uploads/filename
        if filename.startswith('uploads/'):
            # Extract just the filename from uploads/filename
            actual_filename = filename.replace('uploads/', '')
            return send_from_directory('uploads', actual_filename)
        else:
            # Direct filename
            return send_from_directory('uploads', filename)
    except Exception as e:
        print(f"Error serving image: {e}")
        return jsonify({'error': 'Image not found'}), 404

# Initialize database
def create_tables():
    db.create_all()
    
    # Add sample departments
    if not Department.query.first():
        departments = [
            Department(
                name="Public Works", 
                latitude=40.7128, 
                longitude=-74.0060,
                issue_types='["potholes", "pothole", "fallen_trees", "graffiti", "street_light", "sidewalk_damage", "road_damage", "bridge_issue", "street_repair", "other"]',
                contact_info="Contact: publicworks@city.gov | Phone: (555) 123-4567"
            ),
            Department(
                name="Water Department", 
                latitude=40.7589, 
                longitude=-73.9851,
                issue_types='["water_leak", "drainage", "sewage_issue", "water_supply"]',
                contact_info="Contact: waterdept@city.gov | Phone: (555) 123-4568"
            ),
            Department(
                name="Traffic Department", 
                latitude=40.7505, 
                longitude=-73.9934,
                issue_types='["damaged_signs", "illegal_parking", "traffic_signal", "traffic_sign", "road_marking", "traffic_light"]',
                contact_info="Contact: traffic@city.gov | Phone: (555) 123-4569"
            ),
            Department(
                name="Sanitation", 
                latitude=40.7614, 
                longitude=-73.9776,
                issue_types='["garbage", "waste_management", "cleanliness"]',
                contact_info="Contact: sanitation@city.gov | Phone: (555) 123-4570"
            ),
            Department(
                name="Health Department", 
                latitude=40.7550, 
                longitude=-73.9750,
                issue_types='["health_issue", "medical_emergency", "sanitation_health"]',
                contact_info="Contact: health@city.gov | Phone: (555) 123-4571"
            ),
            Department(
                name="Education Department", 
                latitude=40.7450, 
                longitude=-73.9800,
                issue_types='["school_issue", "education_facility"]',
                contact_info="Contact: education@city.gov | Phone: (555) 123-4572"
            )
        ]
        
        for dept in departments:
            db.session.add(dept)
        
        db.session.commit()
        print(f"✓ Initialized {len(departments)} departments in database")

if __name__ == '__main__':
    with app.app_context():
        create_tables()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
