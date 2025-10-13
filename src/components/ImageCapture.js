import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ImageCapture = ({ onImageCapture, onImageUpload }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCapturing(false);
    onImageCapture(imageSrc);
  }, [webcamRef, onImageCapture]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target.result;
        setUploadedImage(imageSrc);
        onImageUpload(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const resetImages = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setIsCapturing(false);
  };

  const startCapture = () => {
    setIsCapturing(true);
  };

  const stopCapture = () => {
    setIsCapturing(false);
  };

  return (
    <div className="space-y-6">
      {/* Image Display */}
      {(capturedImage || uploadedImage) && (
        <div className="relative">
          <img
            src={capturedImage || uploadedImage}
            alt="Captured/Uploaded"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          <button
            onClick={resetImages}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Camera Capture */}
      {isCapturing && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="camera-preview"
          />
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={capture}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture</span>
            </button>
            <button
              onClick={stopCapture}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!capturedImage && !uploadedImage && !isCapturing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Button */}
          <button
            onClick={startCapture}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center space-y-2"
          >
            <Camera className="w-8 h-8" />
            <span className="font-semibold">Take Photo</span>
          </button>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`upload-area ${isDragActive ? 'dragover' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 font-medium">
              {isDragActive ? 'Drop the image here' : 'Upload Image'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop or click to select
            </p>
          </div>
        </div>
      )}

      {/* Start Over Button */}
      {(capturedImage || uploadedImage) && !isCapturing && (
        <div className="text-center">
          <button
            onClick={resetImages}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
