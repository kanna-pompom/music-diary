import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        status: process.env.OPENAI_API_KEY ? 'ready' : 'not_configured'
      },
      spotify: {
        configured: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
        status: (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) ? 'ready' : 'not_configured'
      },
      firebase: {
        configured: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ),
        status: (
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ) ? 'ready' : 'not_configured'
      }
    },
    mode: 'development',
    testMode: !process.env.OPENAI_API_KEY
  }

  const allConfigured = Object.values(health.services).every(service => service.configured)
  
  return NextResponse.json({
    ...health,
    overall_status: allConfigured ? 'fully_configured' : health.testMode ? 'test_mode' : 'partially_configured'
  })
}