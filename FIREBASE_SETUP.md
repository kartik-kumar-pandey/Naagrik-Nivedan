# Firebase Setup Guide

This project now uses **Firebase Authentication** and **Firebase Realtime Database** for user management and complaint storage.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Save the changes

### 3. Create Realtime Database

1. In Firebase Console, go to **Realtime Database**
2. Click "Create Database"
3. Choose your preferred location
4. Start in **Test mode** for development (you'll set up rules later)
5. Copy the database URL (it looks like: `https://your-project-default-rtdb.firebaseio.com`)

### 4. Configure Environment Variables

Create a `.env` file in the root of your project with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

You can find these values in Firebase Console:
- Go to **Project Settings** (gear icon)
- Scroll down to "Your apps" section
- Click on the Web app icon (</>)
- Copy the configuration values

### 5. Update Firebase Configuration

Edit `src/firebase.js` and replace the placeholder values with your actual Firebase config values, or ensure your `.env` file is properly loaded.

### 6. Set Up Database Security Rules

In Firebase Console, go to **Realtime Database** > **Rules** and update the rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "complaints": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$complaintId": {
        ".read": "auth != null",
        ".write": "data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('userType').val() === 'official'"
      }
    }
  }
}
```

These rules ensure:
- Users can read/write their own user data
- All authenticated users can read complaints
- Users can create complaints
- Users can only update their own complaints
- Officials can update any complaint

## Features Implemented

### Authentication
- ✅ Email/Password sign up
- ✅ Email/Password sign in
- ✅ Sign out
- ✅ User session persistence
- ✅ User type management (citizen/official)
- ✅ Department assignment for officials

### Realtime Database
- ✅ Store user profiles
- ✅ Create complaints
- ✅ Read complaints
- ✅ Update complaint status
- ✅ Real-time subscription to complaints
- ✅ Get complaints by user
- ✅ Get all complaints (for officials)

## Database Structure

### Users
```
users/
  {userId}/
    email: string
    displayName: string
    userType: 'citizen' | 'official'
    department: string | null
    createdAt: timestamp
    updatedAt: timestamp
```

### Complaints
```
complaints/
  {complaintId}/
    id: string
    userId: string
    image: string (base64)
    issueType: string
    description: string
    latitude: number
    longitude: number
    address: string
    locationDetails: object
    department: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
    classificationResult: object | null
    formalComplaint: string | null
    createdAt: timestamp
    updatedAt: timestamp
```

## Usage

### Sign Up
1. Go to `/login`
2. Click "Sign Up"
3. Select user type (Citizen or Official)
4. Fill in email, password, and optional name
5. For officials, select department
6. Submit to create account

### Sign In
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"

### Report Issue
1. Sign in as a citizen
2. Go to `/report`
3. Follow the steps to report an issue
4. Complaint is automatically saved to Firebase Realtime Database

### Track Complaint
1. Go to `/track`
2. Enter complaint ID (shown after submission)
3. View real-time status updates

## Notes

- The backend Flask API is still used for ML image classification
- Complaints are stored in Firebase Realtime Database
- User authentication is handled entirely by Firebase
- Real-time updates are available via Firebase subscriptions


