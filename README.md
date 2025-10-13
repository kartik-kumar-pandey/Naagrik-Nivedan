# Civic Issue Reporting App

A comprehensive civic issue reporting application built with React and Python Flask. The app allows citizens to report civic issues through photos, uses AI for automatic classification, and provides tracking and mapping capabilities.

## Features

- 📸 **Image Capture & Upload**: Take photos or upload images of civic issues
- 🤖 **AI Classification**: Automatic issue type detection using ML models
- 📍 **Location Services**: GPS-based location capture and mapping
- 🗺️ **Interactive Map**: View all reported issues on an interactive map
- 🔥 **Heatmap Visualization**: See high-density issue areas
- 📊 **Complaint Tracking**: Track the status of your complaints
- 🏢 **Department Routing**: Automatic routing to appropriate departments
- 📝 **Formal Complaint Generation**: AI-generated formal complaints using LLM APIs

## Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- React Leaflet (Maps)
- React Webcam (Camera)
- React Dropzone (File Upload)
- Axios (HTTP Client)

### Backend
- Python Flask
- SQLAlchemy (Database)
- TensorFlow (ML Model)
- OpenCV (Image Processing)
- OpenAI/Gemini API (LLM Integration)
- Geopy (Geocoding)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Copy the example environment file
cp env_example.txt .env

# Edit .env and add your API keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### Running Both Services

You can run both frontend and backend simultaneously:
```bash
npm run dev
```

## API Endpoints

### Backend API Routes

- `POST /api/classify-issue` - Classify issue from image
- `POST /api/submit-complaint` - Submit a new complaint
- `GET /api/track-complaint/<id>` - Track complaint status
- `GET /api/complaints-map` - Get complaints for map view
- `GET /api/heatmap-data` - Get heatmap data

## Configuration

### API Keys

You'll need API keys for the following services:

1. **OpenAI API** (for GPT-3.5-turbo)
   - Sign up at https://platform.openai.com/
   - Get your API key from the dashboard

2. **Google Gemini API** (alternative to OpenAI)
   - Sign up at https://makersuite.google.com/
   - Get your API key from the dashboard

3. **OpenCage Geocoding API** (for address lookup)
   - Sign up at https://opencagedata.com/
   - Get your API key from the dashboard

### Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here
```

## Usage

### Reporting an Issue

1. Navigate to the "Report Issue" page
2. Take a photo or upload an image of the issue
3. The AI will automatically classify the issue type
4. Add additional details if needed
5. Confirm your location
6. Submit the complaint

### Tracking Complaints

1. Go to the "Track Complaint" page
2. Enter your complaint ID
3. View the status and timeline

### Map View

1. Visit the "Map View" page
2. See all reported issues on the interactive map
3. Use filters to view specific issue types
4. Toggle heatmap view to see high-density areas

## Database Schema

### IssueReport Table
- `id` - Primary key
- `user_id` - User identifier
- `image_path` - Path to uploaded image
- `issue_type` - Classified issue type
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `address` - Human-readable address
- `description` - User description
- `formal_complaint` - AI-generated formal complaint
- `status` - Complaint status (pending, in_progress, resolved, rejected)
- `priority` - Priority level (low, normal, high, urgent)
- `department` - Assigned department
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Department Table
- `id` - Primary key
- `name` - Department name
- `latitude` - Department location latitude
- `longitude` - Department location longitude
- `issue_types` - JSON array of handled issue types
- `contact_info` - Department contact information

## ML Model Integration

The app includes a placeholder for ML model integration. To use a real model:

1. Train your model using TensorFlow/PyTorch
2. Save the model in the backend directory
3. Update the `IssueClassifier` class in `app.py`
4. Implement the `classify_issue` method with your model

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
