"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Triggered whenever a new notification document is created in Firestore.
 * Sends a real push notification to all registered device tokens for the customer.
 */
exports.sendPushNotification = (0, firestore_1.onDocumentCreated)("notifications/{notificationId}", async (event) => {
    var _a, _b, _c, _d;
    const notification = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!notification) {
        console.log("No data in notification document.");
        return;
    }
    const { customerId, title, message } = notification;
    if (!customerId) {
        console.log("Notification has no customerId — skipping.");
        return;
    }
    // Fetch the customer's device tokens
    const userSnap = await db.collection("users").doc(customerId).get();
    if (!userSnap.exists) {
        console.log(`User ${customerId} not found.`);
        return;
    }
    const userData = userSnap.data();
    const tokens = (_b = userData === null || userData === void 0 ? void 0 : userData.deviceTokens) !== null && _b !== void 0 ? _b : [];
    const notificationEnabled = (_c = userData === null || userData === void 0 ? void 0 : userData.notificationEnabled) !== null && _c !== void 0 ? _c : false;
    if (!notificationEnabled || tokens.length === 0) {
        console.log(`User ${customerId} has no tokens or disabled notifications.`);
        return;
    }
    // Build the FCM message
    const fcmPayload = {
        tokens,
        notification: {
            title: title !== null && title !== void 0 ? title : "Djo Coiffe",
            body: message !== null && message !== void 0 ? message : "Vous avez une nouvelle notification.",
        },
        webpush: {
            notification: {
                icon: "/logo.png",
                badge: "/logo.png",
                requireInteraction: false,
            },
            fcmOptions: {
                link: (_d = notification.actionUrl) !== null && _d !== void 0 ? _d : "/",
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
    };
    // Send and handle invalid tokens
    try {
        const response = await messaging.sendEachForMulticast(fcmPayload);
        console.log(`${response.successCount} messages sent, ${response.failureCount} failed.`);
        // Remove any invalid tokens
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
            var _a, _b;
            if (!resp.success &&
                (((_a = resp.error) === null || _a === void 0 ? void 0 : _a.code) === "messaging/invalid-registration-token" ||
                    ((_b = resp.error) === null || _b === void 0 ? void 0 : _b.code) ===
                        "messaging/registration-token-not-registered")) {
                invalidTokens.push(tokens[idx]);
            }
        });
        if (invalidTokens.length > 0) {
            console.log(`Removing ${invalidTokens.length} invalid tokens...`);
            await db
                .collection("users")
                .doc(customerId)
                .update({
                deviceTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
            });
        }
    }
    catch (err) {
        console.error("Error sending FCM message:", err);
    }
});
//# sourceMappingURL=index.js.map