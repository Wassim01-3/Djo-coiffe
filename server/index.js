const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin')

const app = express()
app.use(express.json())
app.use(cors())

// ─── Initialize Firebase Admin ────────────────────────────────────────────────
// The service account JSON is stored as an env variable (set in Render dashboard)
let initialized = false
function initFirebase() {
  if (initialized) return
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env variable is not set')
    }
    const serviceAccount = JSON.parse(serviceAccountJson)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    initialized = true
    console.log('✅ Firebase Admin initialized.')
  } catch (err) {
    console.error('❌ Firebase Admin init error:', err.message)
  }
}
initFirebase()

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'djo-coiffe-notifier' })
})

// ─── Send push notification ───────────────────────────────────────────────────
// Body: { tokens: string[], title: string, body: string, actionUrl?: string }
app.post('/notify', async (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== process.env.NOTIFY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { tokens, title, body, actionUrl } = req.body

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'No tokens provided' })
  }
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' })
  }

  try {
    const messaging = admin.messaging()
    const message = {
      tokens,
      notification: { title, body },
      webpush: {
        notification: {
          icon: '/logo.png',
          badge: '/logo.png',
        },
        fcmOptions: { link: actionUrl ?? '/' },
      },
      apns: {
        payload: {
          aps: { badge: 1, sound: 'default' },
        },
      },
    }

    const response = await messaging.sendEachForMulticast(message)
    console.log(`Sent: ${response.successCount} OK, ${response.failureCount} failed`)
    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    })
  } catch (err) {
    console.error('FCM error:', err)
    return res.status(500).json({ error: 'Failed to send notification' })
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Notify server running on port ${PORT}`)
})
