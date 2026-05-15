# Firebase Setup Notes

This document outlines the planned Firebase integration for Enzora. No Firebase services are active yet.

## Planned services

### Firebase Cloud Messaging (FCM)
- Send push notifications to customers when their order status changes (e.g. "Your order has been shipped").
- The mobile app (`app/`) will register a device token on login and pass it to the API server.
- The API server will use the Firebase Admin SDK to send targeted notifications.

### (Optional) Firebase Realtime Database or Firestore
- May be used for live order-status streaming to the customer's order-tracking page, reducing polling.

## How to wire it up (future steps)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable Cloud Messaging and generate a server key.
3. Download the Admin SDK service account JSON — **store it in an environment secret, never commit it**.
4. Add the `firebase-admin` npm package to `artifacts/api-server`.
5. Initialise the Admin SDK in the API server using the credential from the environment secret.
6. Add a `POST /api/notifications/send` route (or trigger from the order-status update handler).
7. In the mobile app, use `expo-notifications` + `@react-native-firebase/messaging` to register the device token.

## Environment variables needed (future)

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (PEM string) |

Store these in Replit Secrets (or your CI/CD secret store). Do not put them in `.env` files committed to the repo.
