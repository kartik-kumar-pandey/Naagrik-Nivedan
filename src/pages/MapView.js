import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, AlertTriangle, Eye, Filter } from 'lucide-react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    issueType: 'all',
    status: 'all',
    priority: 'all'
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  // Default center (New York City)
  const defaultCenter = [40.7128, -74.0060];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    getCurrentLocation();
    fetchComplaints();
    fetchHeatmapData();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/complaints-map', {
        params: {
          lat: mapCenter[0],
          lon: mapCenter[1],
          radius: 10 // 10km radius
        }
      });
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/heatmap-data');
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }
  };

  const getMarkerColor = (status, priority) => {
    if (status === 'resolved') return 'green';
    if (status === 'rejected') return 'red';
    if (priority === 'urgent') return 'red';
    if (priority === 'high') return 'orange';
    return 'blue';
  };

  const getIssueIcon = (issueType) => {
    const icons = {
      pothole: '🕳️',
      street_light: '💡',
      garbage: '🗑️',
      water_leak: '💧',
      traffic_signal: '🚦',
      sidewalk_damage: '🚶',
      drainage: '🌊',
      other: '⚠️'
    };
    return icons[issueType] || '⚠️';
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filters.issueType !== 'all' && complaint.issue_type !== filters.issueType) {
      return false;
    }
    if (filters.status !== 'all' && complaint.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && complaint.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  const issueTypes = [
    'all', 'pothole', 'street_light', 'garbage', 'water_leak', 
    'traffic_signal', 'sidewalk_damage', 'drainage', 'other'
  ];

  const statuses = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];
  const priorities = ['all', 'low', 'normal', 'high', 'urgent'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Issue Map</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showHeatmap 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                value={filters.issueType}
                onChange={(e) => setFilters(prev => ({ ...prev, issueType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {issueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '600px', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <div className="text-center">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Complaint Markers */}
            {filteredComplaints.map((complaint) => (
              <Marker
                key={complaint.id}
                position={[complaint.latitude, complaint.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getIssueIcon(complaint.issue_type)}</span>
                      <span className="font-semibold text-gray-900">
                        {complaint.issue_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Status:</strong> {complaint.status}</p>
                      <p><strong>Priority:</strong> {complaint.priority}</p>
                      <p><strong>Distance:</strong> {complaint.distance?.toFixed(2)} km</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Heatmap Circles */}
            {showHeatmap && heatmapData.map((point, index) => (
              <Circle
                key={index}
                center={[point.lat, point.lng]}
                radius={point.weight * 100}
                pathOptions={{
                  color: 'red',
                  fillColor: 'red',
                  fillOpacity: 0.3,
                  weight: 1
                }}
              />
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <h3 className="font-semibold text-gray-900 mb-2">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Resolved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Pending/In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Rejected/Urgent</span>
              </div>
              {showHeatmap && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full opacity-30"></div>
                  <span>High Density Area</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {complaints.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {complaints.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {complaints.filter(c => c.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600">Urgent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
