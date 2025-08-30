export interface UserProfile {
  id: string
  email: string
  displayName?: string
  createdAt: Date
  
  musicPreferences: {
    favoriteArtists: string[]
    favoriteGenres: string[]
    favoriteEras: string[] // e.g., '80s', '90s', '2000s'
    preferenceType: 'existing' | 'new' // 既存ジャンル派 vs 新ジャンル派
    dislikedGenres: string[]
  }
  
  settings: {
    notificationsEnabled: boolean
    language: 'ja' | 'en'
  }
}

export interface DiaryEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  title?: string
  content: string
  photos?: string[] // Firebase Storage URLs
  createdAt: Date
  updatedAt: Date
  
  // AI分析結果
  analysis?: {
    emotions: {
      primary: string // 主要感情
      secondary?: string // 副次感情
      intensity: number // 1-10
    }
    keywords: string[]
    mood: 'happy' | 'sad' | 'excited' | 'calm' | 'nostalgic' | 'energetic' | 'melancholic'
    photoAnalysis?: {
      scene: string // 'indoor', 'outdoor', 'nature', 'city'
      objects: string[]
      activity: string
    }
  }
}

export interface SongRecommendation {
  id: string
  userId: string
  diaryEntryId: string
  date: string
  
  song: {
    spotifyId: string
    title: string
    artist: string
    album: string
    genre: string
    releaseYear: number
    previewUrl?: string
    albumCover: string
    duration: number // seconds
    spotifyUrl: string
  }
  
  reason: string // AI生成の提案理由（自然な語りかけ形式）
  relevanceScore: number // 1-10
  
  userFeedback?: {
    liked: boolean
    listened: boolean
    addedToPlaylist: boolean
    rating?: number // 1-5
  }
  
  createdAt: Date
}

export interface Playlist {
  id: string
  userId: string
  name: string
  description?: string
  type: 'daily_picks' | 'emotion_based' | 'custom'
  
  // 感情別プレイリスト用
  emotion?: string
  
  songs: {
    spotifyId: string
    addedAt: Date
    fromDiary?: string // diaryEntryId if from daily recommendation
  }[]
  
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
}

export interface GenreProgress {
  userId: string
  genreMap: {
    [genre: string]: {
      unlocked: boolean
      unlockedAt?: Date
      songsDiscovered: number
      emotionTrigger?: string // どの感情で解放されたか
    }
  }
  totalGenresUnlocked: number
  achievements: string[]
}

export interface UserStats {
  userId: string
  totalDiaryEntries: number
  totalSongsRecommended: number
  totalSongsLiked: number
  streakDays: number
  currentStreak: number
  genresDiscovered: number
  favoriteGenres: string[]
  emotionalBreakdown: {
    [emotion: string]: number
  }
  lastActive: Date
}