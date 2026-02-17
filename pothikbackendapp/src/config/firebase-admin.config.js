// Firebase Admin SDK Configuration
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to service account key file
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

// Check if service account file exists
if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    // Initialize Firebase Admin only if not already initialized
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} else {
    console.warn('⚠️ Firebase service account key not found at:', serviceAccountPath);
    console.warn('⚠️ Google authentication will not work without it.');
    console.warn('⚠️ Please download the service account key from Firebase Console.');

    // Do NOT initialize without credentials - it causes EPERM errors on Windows
    // when trying to auto-detect credentials via child process spawning
    console.warn('⚠️ Firebase Admin SDK NOT initialized. Google auth endpoints will fail.');
}

module.exports = admin;
