const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendDailyReminders = functions.pubsub.schedule("every day 09:00").onRun(async (context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").where("fcmToken", "!=", null).get();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promises = [];

    usersSnapshot.forEach(userDoc => {
        const user = userDoc.data();
        const userId = userDoc.id;

        const completionsRef = db.collection(`/artifacts/default-app-id/users/${userId}/tasks`);
        const todaysCompletions = completionsRef.where("date", ">=", today).get();

        const promise = todaysCompletions.then(snapshot => {
            if (snapshot.empty) {
                const message = {
                    notification: {
                        title: "Don't forget to track your progress! 🚀",
                        body: "You haven't logged any task completions today. Keep up the great work!",
                    },
                    token: user.fcmToken,
                };
                return admin.messaging().send(message);
            }
            return null;
        });

        promises.push(promise);
    });

    return Promise.all(promises);
});