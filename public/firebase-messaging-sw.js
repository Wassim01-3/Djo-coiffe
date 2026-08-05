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

// Optional: Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = payload.notification?.title || 'Nouvelle notification'
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo.png',
    data: payload.data
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
