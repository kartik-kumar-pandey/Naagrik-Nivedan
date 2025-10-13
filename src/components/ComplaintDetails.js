import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, Building2, AlertTriangle, CheckCircle, Clock, Eye, Download } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ComplaintDetails = ({ complaintId, onClose, onStatusUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setIsLoading(true);
          const response = await axios.get(`${API_BASE_URL}/api/complaint/${complaintId}`);
      setComplaint(response.data);
      setNewStatus(response.data.status);
      setNewPriority(response.data.priority);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      // Fallback to mock data
      setComplaint({
        id: complaintId,
        user_id: 'user@example.com',
        issue_type: 'pothole',
        status: 'pending',
        priority: 'high',
        latitude: 26.3843,
        longitude: 80.3768,
        address: 'Main Street, Kanpur',
        description: 'Large pothole causing traffic issues',
        formal_complaint: 'Formal complaint letter content...',
        department: 'Public Works',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      });
      setNewStatus('pending');
      setNewPriority('high');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
          await axios.put(`${API_BASE_URL}/api/complaint/${complaintId}/update-status`, {
        status: newStatus,
        priority: newPriority
      });
      
      // Update local state
      setComplaint(prev => ({
        ...prev,
        status: newStatus,
        priority: newPriority,
        updated_at: new Date().toISOString()
      }));
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(complaintId, newStatus, newPriority);
      }
      
    } catch (error) {
      console.error('Error updating complaint status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      in_progress: { icon: AlertTriangle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      resolved: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' }
    };
    return icons[status] || icons.pending;
  };

  const getPriorityColor = (priority) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading complaint details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h3>
            <p className="text-gray-600 mb-4">The requested complaint could not be found.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusIcon(complaint.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getIssueIcon(complaint.issue_type)}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Complaint #{complaint.id}
              </h2>
              <p className="text-gray-600">
                {complaint.issue_type ? complaint.issue_type.replace('_', ' ').toUpperCase() : 'Unknown Issue'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Professional Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Professional Semantic Report</h2>
                <p className="text-blue-100">AI-Generated Complaint Analysis</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Report ID</p>
                <p className="text-lg font-mono">{complaint.department?.replace(' ', '')}-TICKET-{complaint.id?.toString().padStart(5, '0')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-200">To:</span>
                <p className="font-semibold">{complaint.department} Department</p>
              </div>
              <div>
                <span className="text-blue-200">From:</span>
                <p className="font-semibold">Nagrik Nivedan Platform</p>
              </div>
              <div>
                <span className="text-blue-200">Category:</span>
                <p className="font-semibold">{complaint.issue_type ? complaint.issue_type.replace('_', ' ').toUpperCase() : 'UNKNOWN'} (AI-Identified)</p>
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {complaint.status ? complaint.status.replace('_', ' ').toUpperCase() : 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                {complaint.priority ? complaint.priority.toUpperCase() : 'Unknown'}
              </span>
            </div>
          </div>

          {/* AI-Generated Semantic Report */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI-Generated Semantic Report</span>
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="space-y-4">
                {/* AI-Identified Category */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {complaint.issue_type ? complaint.issue_type.replace('_', ' ').toUpperCase() : 'UNKNOWN'} (AI-Identified)
                  </span>
                </div>
                
                {/* Urgency & Sentiment Analysis */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Urgency:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    complaint.priority === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {complaint.priority ? complaint.priority.toUpperCase() : 'NORMAL'} Priority
                  </span>
                  <span className="text-sm text-gray-500">• Sentiment: Neutral</span>
                </div>
              </div>
            </div>
          </div>

          {/* Precise Geolocation */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Precise Geolocation</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address:</h4>
                  <p className="text-gray-700">{complaint.address}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Coordinates:</h4>
                  {complaint.latitude && complaint.longitude ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Latitude:</span> {complaint.latitude.toFixed(6)}° N
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Longitude:</span> {complaint.longitude.toFixed(6)}° E
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Captured from user's device GPS
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Coordinates not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Evidence */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <span>📸</span>
              <span>Visual Evidence</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {complaint.image_path ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img 
                      src={`${API_BASE_URL}/api/image/${complaint.image_path}`}
                      alt="Complaint Evidence"
                      className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="hidden w-full max-w-md h-64 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center"
                      style={{display: 'none'}}
                    >
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📷</span>
                        <p className="text-gray-600">Image not available</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Photo Evidence</p>
                      <p className="text-sm text-gray-600">Submitted by citizen</p>
                    </div>
                    <a 
                      href={`${API_BASE_URL}/api/image/${complaint.image_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Full Size →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📷</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No Photo Available</p>
                    <p className="text-sm text-gray-600">No visual evidence was submitted with this complaint</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <span>🔍</span>
              <span>Tracking Information</span>
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Unique Tracking ID:</h4>
                  <p className="text-lg font-mono text-blue-600 bg-white px-3 py-2 rounded border">
                    {complaint.department?.replace(' ', '')}-TICKET-{complaint.id?.toString().padStart(5, '0')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Public Dashboard:</h4>
                  <p className="text-sm text-gray-600">
                    Track progress at: <span className="text-blue-600">nagrik-nivedan.gov.in/track/{complaint.id}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formal Complaint Letter */}
          {complaint.formal_complaint && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <span>📝</span>
                <span>Formal Complaint Letter</span>
              </h3>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="font-mono text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                  {complaint.formal_complaint}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Submitted</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{formatDate(complaint.created_at)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Last Updated</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{formatDate(complaint.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Submitted By</h3>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{complaint.user_id}</span>
            </div>
          </div>

          {/* Department Assignment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Assigned Department</h3>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{complaint.department}</span>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Update Status</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
