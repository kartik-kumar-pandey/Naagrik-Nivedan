import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageCapture from '../components/ImageCapture';
import LocationDetails from '../components/LocationDetails';
import { MapPin, FileText, Send, Loader } from 'lucide-react';
import axios from 'axios';

const ReportIssue = ({ userLocation, setUserLocation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    image: null,
    issueType: '',
    description: '',
    latitude: null,
    longitude: null,
    address: '',
    locationDetails: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const navigate = useNavigate();

  // Get user location
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    } else {
      setFormData(prev => ({
        ...prev,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address
      }));
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Getting address...'
          };
          setUserLocation(location);
          setFormData(prev => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude
          }));
          
          // Get address from coordinates
          getAddressFromCoords(location.latitude, location.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage += 'Please enable location services.';
              break;
          }
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Use OpenStreetMap's Nominatim service for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&namedetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CivicIssuesApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data && data.address) {
        // Enhanced address data processing
        const enhancedAddress = {
          street: data.address.road || data.address.street || data.address.footway || data.address.path || 'N/A',
          area: data.address.neighbourhood || data.address.suburb || data.address.residential || data.address.hamlet || 'N/A',
          city: data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || 'N/A',
          state: data.address.state || data.address.province || data.address.region || 'N/A',
          pinCode: data.address.postcode || data.address.postal_code || 'N/A',
          country: data.address.country || 'N/A',
          completeAddress: data.display_name || `${lat}, ${lng}`,
          coordinates: { latitude: lat, longitude: lng }
        };
        
        const address = enhancedAddress.completeAddress;
        setFormData(prev => ({ ...prev, address, locationDetails: enhancedAddress }));
        setUserLocation(prev => ({ ...prev, address, locationDetails: enhancedAddress }));
      } else {
        // Fallback if no address data is found
        const fallbackAddress = {
          street: 'N/A',
          area: 'N/A',
          city: 'N/A',
          state: 'N/A',
          pinCode: 'N/A',
          country: 'N/A',
          completeAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { latitude: lat, longitude: lng }
        };
        
        const address = fallbackAddress.completeAddress;
        setFormData(prev => ({ ...prev, address, locationDetails: fallbackAddress }));
        setUserLocation(prev => ({ ...prev, address, locationDetails: fallbackAddress }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      toast.error('Unable to get address details. Using coordinates only.');
      
      // Fallback on error
      const fallbackAddress = {
        street: 'N/A',
        area: 'N/A',
        city: 'N/A',
        state: 'N/A',
        pinCode: 'N/A',
        country: 'N/A',
        completeAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { latitude: lat, longitude: lng }
      };
      
      const address = fallbackAddress.completeAddress;
      setFormData(prev => ({ ...prev, address, locationDetails: fallbackAddress }));
      setUserLocation(prev => ({ ...prev, address, locationDetails: fallbackAddress }));
    }
  };

  const handleManualLocationSubmit = () => {
    if (manualLocationInput.trim()) {
      const manualAddress = {
        street: 'N/A',
        area: 'N/A',
        city: 'N/A',
        state: 'N/A',
        pinCode: 'N/A',
        country: 'N/A',
        completeAddress: manualLocationInput.trim(),
        coordinates: { latitude: null, longitude: null }
      };
      
      setFormData(prev => ({ 
        ...prev, 
        address: manualLocationInput.trim(), 
        locationDetails: manualAddress 
      }));
      setUserLocation(prev => ({ 
        ...prev, 
        address: manualLocationInput.trim(), 
        locationDetails: manualAddress 
      }));
      setShowManualLocation(false);
      toast.success('Manual location set successfully');
    }
  };

  const handleImageCapture = (imageData) => {
    setFormData(prev => ({ ...prev, image: imageData }));
    setStep(2);
    classifyImage(imageData);
  };

  const handleImageUpload = (imageData) => {
    setFormData(prev => ({ ...prev, image: imageData }));
    setStep(2);
    classifyImage(imageData);
  };

  const classifyImage = async (imageData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/classify-issue', {
        image: imageData
      });
      setClassificationResult(response.data);
      setFormData(prev => ({ 
        ...prev, 
        issueType: response.data.issue_type 
      }));
    } catch (error) {
      console.error('Classification error:', error);
      toast.error('Failed to classify the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/submit-complaint', {
        ...formData,
        user_id: 'user_' + Date.now() // Simple user ID generation
      });

      toast.success('Complaint submitted successfully!');
      navigate(`/track?complaint_id=${response.data.complaint_id}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const issueTypes = [
    { value: 'pothole', label: 'Pothole', description: 'Road surface damage' },
    { value: 'street_light', label: 'Street Light', description: 'Non-working street lights' },
    { value: 'garbage', label: 'Garbage', description: 'Waste management issues' },
    { value: 'water_leak', label: 'Water Leak', description: 'Water supply problems' },
    { value: 'traffic_signal', label: 'Traffic Signal', description: 'Traffic light issues' },
    { value: 'sidewalk_damage', label: 'Sidewalk Damage', description: 'Pedestrian pathway issues' },
    { value: 'drainage', label: 'Drainage', description: 'Water drainage problems' },
    { value: 'other', label: 'Other', description: 'Other civic issues' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Report a Civic Issue</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Image Capture */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Take or Upload a Photo</h2>
            <p className="text-gray-600 mb-6">
              Capture a clear photo of the issue or upload an existing image. 
              Our AI will automatically classify the type of issue.
            </p>
            
            {/* Location Details */}
            {formData.address && (
              <div className="mb-6">
                <LocationDetails 
                  location={formData.address} 
                  coordinates={{ latitude: formData.latitude, longitude: formData.longitude }}
                  detailedAddress={formData.locationDetails}
                />
              </div>
            )}
            
            <ImageCapture
              onImageCapture={handleImageCapture}
              onImageUpload={handleImageUpload}
            />
          </div>
        )}

        {/* Step 2: Classification Results */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Issue Classification</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Analyzing your image...</p>
              </div>
            ) : classificationResult ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Issue Detected: {classificationResult.issue_type.replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-green-700">
                  Confidence: {Math.round(classificationResult.confidence * 100)}%
                </p>
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  value={formData.issueType}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueType: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select issue type</option>
                  {issueTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide any additional details about the issue..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.issueType}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location and Submit */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location & Submit</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Detailed Location Display */}
              <LocationDetails 
                location={formData.address} 
                coordinates={{ latitude: formData.latitude, longitude: formData.longitude }}
                detailedAddress={formData.locationDetails}
              />

              {/* Manual Location Input Option */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Location Not Correct?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualLocation(!showManualLocation)}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    {showManualLocation ? 'Hide' : 'Enter Manually'}
                  </button>
                </div>
                
                {showManualLocation && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={manualLocationInput}
                      onChange={(e) => setManualLocationInput(e.target.value)}
                      placeholder="Enter your complete address manually"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <button
                      type="button"
                      onClick={handleManualLocationSubmit}
                      disabled={!manualLocationInput.trim()}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set Manual Location
                    </button>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-2">
                  If the detected location is incorrect, you can enter your address manually above.
                </p>
              </div>

              {/* Issue Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Issue Summary</span>
                </div>
                <p className="text-gray-700">
                  <strong>Type:</strong> {formData.issueType.replace('_', ' ').toUpperCase()}
                </p>
                {formData.description && (
                  <p className="text-gray-700 mt-1">
                    <strong>Description:</strong> {formData.description}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
