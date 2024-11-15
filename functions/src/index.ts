/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const helloWorld = onRequest({ cors: true }, (request, response) => {
  response.send("Hello from Firebase!");
});

export const sendNotification = onRequest({ cors: true }, (request, response) => {
  const data = request.body;
  const message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    topic: data.topic,  // Target device's FCM registration token
  };

  console.log("Sending notification", message);
  admin.messaging().send(message)
    .then((fcmresponse) => {
      console.debug('Notification sent successfully');
      response.json(fcmresponse);
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
      response.status(500).json(error)
      throw new HttpsError('internal', 'Notification failed');
    });
});
