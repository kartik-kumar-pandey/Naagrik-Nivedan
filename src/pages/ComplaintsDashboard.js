import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, AlertTriangle, Eye, Filter, Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

const ComplaintsDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    issueType: 'all',
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Default center (Kanpur, India)
  const defaultCenter = [26.4499, 80.3319];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    getCurrentLocation();
    fetchAllComplaints();
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

  const fetchAllComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/all-complaints');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      // Fallback to mock data if API fails
      const mockComplaints = [
        {
          id: 1,
          issue_type: 'pothole',
          status: 'pending',
          priority: 'high',
          latitude: 26.4499,
          longitude: 80.3319,
          address: 'Kanpur, Uttar Pradesh 208015, India',
          description: 'Large pothole on main road causing traffic issues',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          department: 'Public Works'
        },
        {
          id: 2,
          issue_type: 'street_light',
          status: 'in_progress',
          priority: 'normal',
          latitude: 26.4500,
          longitude: 80.3320,
          address: 'Kanpur, Uttar Pradesh 208015, India',
          description: 'Street light not working in residential area',
          created_at: '2024-01-14T15:45:00Z',
          updated_at: '2024-01-16T09:20:00Z',
          department: 'Public Works'
        }
      ];
      setComplaints(mockComplaints);
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      in_progress: { icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      resolved: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
      rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
    };
    return icons[status] || icons.pending;
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'text-gray-600 bg-gray-100';
    const colors = {
      low: 'text-green-600 bg-green-100',
      normal: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.normal;
  };

  const getIssueIcon = (issueType) => {
    if (!issueType) return '⚠️';
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
    if (!complaint) return false;
    
    if (filters.issueType !== 'all' && complaint.issue_type !== filters.issueType) {
      return false;
    }
    if (filters.status !== 'all' && complaint.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && complaint.priority !== filters.priority) {
      return false;
    }
    if (filters.search && 
        !(complaint.description || '').toLowerCase().includes(filters.search.toLowerCase()) &&
        !(complaint.address || '').toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const issueTypes = [
    'all', 'pothole', 'street_light', 'garbage', 'water_leak', 
    'traffic_signal', 'sidewalk_damage', 'drainage', 'other'
  ];

  const statuses = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];
  const priorities = ['all', 'low', 'normal', 'high', 'urgent'];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading complaints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Complaints Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Map View
              </button>
            </div>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search complaints..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
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

        {/* Content */}
        {viewMode === 'list' ? (
          /* List View */
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => {
              const statusConfig = getStatusIcon(complaint.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={complaint.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getIssueIcon(complaint.issue_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {complaint.issue_type ? complaint.issue_type.replace('_', ' ').toUpperCase() : 'Unknown'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority ? complaint.priority.toUpperCase() : 'Unknown'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{complaint.description}</p>
                        <p className="text-sm text-gray-500 mb-3">{complaint.address}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>ID: #{complaint.id}</span>
                          <span>Department: {complaint.department}</span>
                          <span>Created: {formatDate(complaint.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {complaint.status ? complaint.status.replace('_', ' ').toUpperCase() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Map View */
          <div className="relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '600px', width: '100%' }}
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
                          {complaint.issue_type ? complaint.issue_type.replace('_', ' ').toUpperCase() : 'Unknown'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Status:</strong> {complaint.status || 'Unknown'}</p>
                        <p><strong>Priority:</strong> {complaint.priority || 'Unknown'}</p>
                        <p><strong>Department:</strong> {complaint.department || 'Not assigned'}</p>
                        <p><strong>Created:</strong> {formatDate(complaint.created_at)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Red Zones (Heatmap Circles) */}
              {showHeatmap && heatmapData.map((zone, index) => (
                <Circle
                  key={index}
                  center={[zone.lat, zone.lng]}
                  radius={zone.count * 50} // Radius based on complaint count
                  pathOptions={{
                    color: zone.count > 3 ? '#dc2626' : '#f59e0b', // Red for high density, orange for medium
                    fillColor: zone.count > 3 ? '#dc2626' : '#f59e0b',
                    fillOpacity: zone.count > 3 ? 0.4 : 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                          zone.count > 3 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {zone.count} Complaints
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="font-semibold text-gray-900 mb-1">Issues in this area:</p>
                        <div className="space-y-1">
                          {zone.complaints.map((complaint, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <span className="text-sm">{getIssueIcon(complaint.issue_type)}</span>
                              <span className="text-xs">
                                {complaint.issue_type ? complaint.issue_type.replace('_', ' ') : 'Unknown'} - {complaint.status || 'Unknown'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Circle>
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
                  <>
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium text-gray-700 mb-1">Heat Zones:</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full opacity-40"></div>
                        <span>High Density (3+ complaints)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full opacity-30"></div>
                        <span>Medium Density (2-3 complaints)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complaint Details Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Complaint Details</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getIssueIcon(selectedComplaint.issue_type)}</span>
                  <h3 className="text-lg font-semibold">
                    {selectedComplaint.issue_type ? selectedComplaint.issue_type.replace('_', ' ').toUpperCase() : 'Unknown'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-900">{selectedComplaint.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Priority</label>
                    <p className="text-gray-900">{selectedComplaint.priority}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Department</label>
                    <p className="text-gray-900">{selectedComplaint.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Complaint ID</label>
                    <p className="text-gray-900">#{selectedComplaint.id}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedComplaint.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{selectedComplaint.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{formatDate(selectedComplaint.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{formatDate(selectedComplaint.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsDashboard;
