# firebase/

This directory is a placeholder for future **Firebase services integration**.

## What will live here

- Firebase Cloud Messaging (FCM) setup for push notifications to customers
- Firebase Realtime Database or Firestore rules (if used for live order updates)
- Firebase project configuration (non-secret parts only)
- Deployment scripts for Firebase functions (if needed)

## Security notice

**Never commit Firebase Admin SDK private key files to this repository.**
Files matching `*serviceAccount*.json`, `firebase-adminsdk-*.json`, and `firebase/*-key.json`
are excluded by `.gitignore`. Keep all private credentials in environment secrets.

## Status

Not yet started. See [`firebase-setup.md`](firebase-setup.md) for planned integration notes.
