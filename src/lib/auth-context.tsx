'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { auth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInAnonymously: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignInAnonymously = async () => {
    if (!auth) {
      console.error('Firebase Auth not initialized')
      return
    }
    try {
      await signInAnonymously(auth)
    } catch (error) {
      console.error('Anonymous sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    if (!auth) {
      console.error('Firebase Auth not initialized')
      return
    }
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const value = {
    user,
    loading,
    signInAnonymously: handleSignInAnonymously,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}