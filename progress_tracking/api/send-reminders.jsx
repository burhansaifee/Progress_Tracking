import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error', error.stack);
}

export default async function handler(request, response) {
  // 1. Authenticate the request
  const { authorization } = request.headers;
  if (authorization !== `Bearer ${process.env.VITE_CRON_SECRET}`) {
    return response.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // 2. The reminder logic (same as before)
  const db = admin.firestore();
  try {
    const usersSnapshot = await db.collection("users").where("fcmToken", "!=", null).get();

    if (usersSnapshot.empty) {
      return response.status(200).json({ success: true, message: 'No users with FCM tokens.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const promises = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      const completionsRef = db.collection(`/artifacts/default-app-id/users/${userId}/tasks`);
      const todaysCompletions = await completionsRef.where("date", ">=", today).get();
      
      if (todaysCompletions.empty) {
        const message = {
          notification: {
            title: "Don't forget to track your progress! 🚀",
            body: "You haven't logged any task completions today. Keep up the great work!",
          },
          token: user.fcmToken,
        };
        promises.push(admin.messaging().send(message));
      }
    }

    await Promise.all(promises);
    return response.status(200).json({ success: true, message: `Sent ${promises.length} reminders.` });

  } catch (error) {
    console.error('Error sending reminders:', error);
    return response.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}