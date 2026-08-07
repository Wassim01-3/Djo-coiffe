importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// Hardcoded Firebase Config for the Service Worker
// (Since this runs outside of Vite's build process)
const firebaseConfig = {
  apiKey: "AIzaSyAQr7aVtiNrjwhtbE7n57i5lPEMBh7VQ1s",
  authDomain: "djo-coiffe.firebaseapp.com",
  projectId: "djo-coiffe",
  storageBucket: "djo-coiffe.firebasestorage.app",
  messagingSenderId: "909169190616",
  appId: "1:909169190616:web:abac86418cbb2f6c6e99ad"
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// We purposely do NOT call messaging.onBackgroundMessage() and showNotification()
// here because Firebase automatically displays a notification if the payload
// contains a 'notification' object. Doing it manually causes duplicate notifications.

// Handle click on the FCM-generated notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Try to extract the custom actionUrl from the data payload
  let urlToOpen = '/';
  
  if (event.notification.data) {
    if (event.notification.data.actionUrl) {
      urlToOpen = event.notification.data.actionUrl;
    } else if (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.data && event.notification.data.FCM_MSG.data.actionUrl) {
      urlToOpen = event.notification.data.FCM_MSG.data.actionUrl;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target app
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        // If the window is already open, just navigate it and focus
        if (client.url && client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
