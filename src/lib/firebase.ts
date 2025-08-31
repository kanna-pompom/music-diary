import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'
import type { Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'
import type { FirebaseStorage } from 'firebase/storage'

// Firebase設定が不完全な場合のデフォルト値
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
}

// Firebaseの無効化フラグ（デモモード）
const isFirebaseDisabled = process.env.NEXT_PUBLIC_DISABLE_FIREBASE === 'true' || 
                           process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here'

// Firebase初期化時のエラーハンドリング
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

try {
  if (!isFirebaseDisabled) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
  } else {
    console.warn('Firebase is disabled (demo mode)')
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error)
  // Firebase機能を無効化
}

export { db, auth, storage }
export default app