import * as admin from "firebase-admin"
import { onDocumentCreated } from "firebase-functions/v2/firestore"

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()
const messaging = admin.messaging()

/**
 * Triggered whenever a new notification document is created in Firestore.
 * Sends a real push notification to all registered device tokens for the customer.
 */
export const sendPushNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const notification = event.data?.data()
    if (!notification) {
      console.log("No data in notification document.")
      return
    }

    const { customerId, title, message } = notification

    if (!customerId) {
      console.log("Notification has no customerId — skipping.")
      return
    }

    // Fetch the customer's device tokens
    const userSnap = await db.collection("users").doc(customerId).get()
    if (!userSnap.exists) {
      console.log(`User ${customerId} not found.`)
      return
    }

    const userData = userSnap.data()
    const tokens: string[] = userData?.deviceTokens ?? []
    const notificationEnabled: boolean = userData?.notificationEnabled ?? false

    if (!notificationEnabled || tokens.length === 0) {
      console.log(`User ${customerId} has no tokens or disabled notifications.`)
      return
    }

    // Build the FCM message
    const fcmPayload: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: title ?? "Djo Coiffe",
        body: message ?? "Vous avez une nouvelle notification.",
      },
      webpush: {
        notification: {
          icon: "/logo.png",
          badge: "/logo.png",
          requireInteraction: false,
        },
        fcmOptions: {
          link: notification.actionUrl ?? "/",
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
          },
        },
      },
    }

    // Send and handle invalid tokens
    try {
      const response = await messaging.sendEachForMulticast(fcmPayload)
      console.log(
        `${response.successCount} messages sent, ${response.failureCount} failed.`
      )

      // Remove any invalid tokens
      const invalidTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          (resp.error?.code === "messaging/invalid-registration-token" ||
            resp.error?.code ===
              "messaging/registration-token-not-registered")
        ) {
          invalidTokens.push(tokens[idx])
        }
      })

      if (invalidTokens.length > 0) {
        console.log(`Removing ${invalidTokens.length} invalid tokens...`)
        await db
          .collection("users")
          .doc(customerId)
          .update({
            deviceTokens: admin.firestore.FieldValue.arrayRemove(
              ...invalidTokens
            ),
          })
      }
    } catch (err) {
      console.error("Error sending FCM message:", err)
    }
  }
)
