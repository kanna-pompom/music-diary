'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  ArrowLeft, 
  Calendar,
  Music,
  Heart,
  Award,
  BarChart3,
  Clock,
  Star,
  Flame,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { DatabaseService } from '../../lib/db-service'
import { DiaryEntry, SongRecommendation } from '../../types/database'

interface StatsData {
  totalDiaryEntries: number
  totalSongsRecommended: number
  streakDays: number
  currentStreak: number
  genresDiscovered: number
  favoriteGenres: { genre: string; count: number }[]
  emotionalBreakdown: { emotion: string; count: number; percentage: number }[]
  monthlyActivity: { month: string; entries: number }[]
  averageIntensity: number
  mostActiveDay: string
  totalListeningTime: number
}

export default function StatsPage() {
  const { user, signInAnonymously } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      calculateStats()
    } else {
      setLoading(false)
    }
  }, [user])

  const calculateStats = async () => {
    if (!user) return

    try {
      const [diaryEntries, songRecommendations] = await Promise.all([
        DatabaseService.getDiaryEntries(user.uid, 500),
        DatabaseService.getSongRecommendations(user.uid, 500)
      ])

      const stats = await generateStatsData(diaryEntries, songRecommendations)
      setStats(stats)
    } catch (error) {
      console.error('統計データの計算に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateStatsData = async (
    entries: DiaryEntry[], 
    recommendations: SongRecommendation[]
  ): Promise<StatsData> => {
    // 基本統計
    const totalDiaryEntries = entries.length
    const totalSongsRecommended = recommendations.length

    // ストリーク計算
    const streakData = calculateStreak(entries)

    // ジャンル分析
    const genreMap = new Map<string, number>()
    recommendations.forEach(rec => {
      const genre = rec.song?.genre || 'その他'
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1)
    })

    const favoriteGenres = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const genresDiscovered = genreMap.size

    // 感情分析
    const emotionMap = new Map<string, number>()
    entries.forEach(entry => {
      if (entry.analysis?.emotions.primary) {
        const emotion = entry.analysis.emotions.primary
        emotionMap.set(emotion, (emotionMap.get(emotion) || 0) + 1)
      }
    })

    const emotionalBreakdown = Array.from(emotionMap.entries())
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: Math.round((count / entries.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // 月次アクティビティ
    const monthlyMap = new Map<string, number>()
    entries.forEach(entry => {
      const month = new Date(entry.createdAt).toISOString().substring(0, 7)
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1)
    })

    const monthlyActivity = Array.from(monthlyMap.entries())
      .map(([month, entries]) => ({ month, entries }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // 平均感情強度
    const intensities = entries
      .map(entry => entry.analysis?.emotions.intensity)
      .filter((intensity): intensity is number => intensity !== undefined)
    
    const averageIntensity = intensities.length > 0 
      ? Math.round(intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length * 10) / 10
      : 0

    // 最もアクティブな曜日
    const dayMap = new Map<string, number>()
    entries.forEach(entry => {
      const day = new Date(entry.createdAt).toLocaleDateString('ja-JP', { weekday: 'long' })
      dayMap.set(day, (dayMap.get(day) || 0) + 1)
    })

    const mostActiveDay = Array.from(dayMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '日曜日'

    // 推定リスニング時間（分）
    const totalListeningTime = recommendations.reduce((total, rec) => {
      return total + (rec.song?.duration || 180) // 平均3分として計算
    }, 0)

    return {
      totalDiaryEntries,
      totalSongsRecommended,
      streakDays: streakData.maxStreak,
      currentStreak: streakData.currentStreak,
      genresDiscovered,
      favoriteGenres,
      emotionalBreakdown,
      monthlyActivity,
      averageIntensity,
      mostActiveDay,
      totalListeningTime: Math.round(totalListeningTime / 60) // 時間に変換
    }
  }

  const calculateStreak = (entries: DiaryEntry[]) => {
    if (entries.length === 0) return { maxStreak: 0, currentStreak: 0 }

    const sortedEntries = entries
      .map(entry => new Date(entry.createdAt).toDateString())
      .sort()
      .filter((date, index, array) => index === 0 || date !== array[index - 1])

    let maxStreak = 1
    let currentStreak = 1
    let tempStreak = 1

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i])
      const previousDate = new Date(sortedEntries[i - 1])
      const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)

      if (dayDiff === 1) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    // 現在のストリーク計算
    const lastEntry = sortedEntries[sortedEntries.length - 1]
    if (lastEntry === today || lastEntry === yesterday) {
      currentStreak = tempStreak
    } else {
      currentStreak = 0
    }

    return { maxStreak, currentStreak }
  }

  const handleSignIn = async () => {
    await signInAnonymously()
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`
  }

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      excited: '🎉',
      calm: '😌',
      nostalgic: '🍃',
      energetic: '⚡',
      melancholic: '🌙'
    }
    return emojiMap[emotion] || '🎵'
  }

  const getStatIcon = (stat: string) => {
    const iconMap: Record<string, React.ElementType> = {
      entries: Calendar,
      songs: Music,
      streak: Flame,
      genres: Star,
      intensity: Zap,
      time: Clock
    }
    return iconMap[stat] || TrendingUp
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <TrendingUp className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">統計データ</h2>
          <p className="text-gray-600 mb-6">
            あなたの音楽日記の統計を確認してみましょう。
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSignIn}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              はじめる
            </button>
            <Link 
              href="/"
              className="px-6 py-3 text-purple-600 hover:text-purple-800 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">統計データを計算中...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-4">統計データがありません</h2>
          <p className="text-gray-600 mb-6">
            まず日記を書いて、音楽の記録を作成してください。
          </p>
          <Link 
            href="/diary/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            日記を書く
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between py-4 sm:py-6 px-2 sm:px-0"
        >
          <Link 
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ホームに戻る
          </Link>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            統計
          </h1>
          
          <div className="w-16 sm:w-24" />
        </motion.header>

        {/* Key Metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        >
          {[
            { 
              key: 'entries', 
              label: '日記数', 
              value: stats.totalDiaryEntries, 
              suffix: '件',
              color: 'blue'
            },
            { 
              key: 'songs', 
              label: '発見楽曲', 
              value: stats.totalSongsRecommended, 
              suffix: '曲',
              color: 'purple'
            },
            { 
              key: 'streak', 
              label: '最長継続', 
              value: stats.streakDays, 
              suffix: '日',
              color: 'orange'
            },
            { 
              key: 'genres', 
              label: 'ジャンル', 
              value: stats.genresDiscovered, 
              suffix: '種類',
              color: 'green'
            },
            { 
              key: 'intensity', 
              label: '平均強度', 
              value: stats.averageIntensity, 
              suffix: '/10',
              color: 'pink'
            },
            { 
              key: 'time', 
              label: '総再生時間', 
              value: stats.totalListeningTime, 
              suffix: '時間',
              color: 'indigo'
            }
          ].map((metric, index) => {
            const Icon = getStatIcon(metric.key)
            return (
              <motion.div
                key={metric.key}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 bg-${metric.color}-100 rounded-lg mb-3`}>
                  <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {metric.value}{metric.suffix}
                </div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Current Streak */}
        {stats.currentStreak > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl mb-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Flame className="w-6 h-6 mr-2" />
                  <h2 className="text-xl font-bold">継続中のストリーク</h2>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {stats.currentStreak}日連続
                </div>
                <p className="text-orange-100">
                  素晴らしい継続力です！このまま続けていきましょう。
                </p>
              </div>
              <div className="text-6xl opacity-20">
                🔥
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Emotional Breakdown */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              感情の内訳
            </h2>
            
            <div className="space-y-4">
              {stats.emotionalBreakdown.slice(0, 5).map((emotion, index) => (
                <div key={emotion.emotion} className="flex items-center">
                  <div className="text-2xl mr-3">
                    {getEmotionEmoji(emotion.emotion)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {emotion.emotion}
                      </span>
                      <span className="text-sm text-gray-500">
                        {emotion.count}回 ({emotion.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${emotion.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Favorite Genres */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Music className="w-5 h-5 mr-2 text-purple-500" />
              よく聴くジャンル
            </h2>
            
            <div className="space-y-4">
              {stats.favoriteGenres.slice(0, 5).map((genre, index) => (
                <div key={genre.genre} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">
                      {genre.genre}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {genre.count}曲
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.round((genre.count / stats.favoriteGenres[0].count) * 100)}%` 
                        }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-xl lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              月間アクティビティ
            </h2>
            
            <div className="h-64 flex items-end justify-center gap-2 overflow-x-auto">
              {stats.monthlyActivity.slice(-12).map((month, index) => {
                const height = Math.max((month.entries / Math.max(...stats.monthlyActivity.map(m => m.entries))) * 200, 4)
                const monthName = new Date(month.month + '-01').toLocaleDateString('ja-JP', { month: 'short' })
                
                return (
                  <div key={month.month} className="flex flex-col items-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: height }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                      className="w-8 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg flex items-end justify-center pb-1"
                    >
                      <span className="text-xs text-white font-bold">
                        {month.entries}
                      </span>
                    </motion.div>
                    <span className="text-xs text-gray-600 mt-2">
                      {monthName}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              あなたの音楽日記データ
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    最もアクティブな曜日: <strong>{stats.mostActiveDay}</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    平均感情強度: <strong>{stats.averageIntensity}/10</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    発見したジャンル: <strong>{stats.genresDiscovered}種類</strong>
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    推定リスニング時間: <strong>{formatTime(stats.totalListeningTime * 60)}</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    最長継続記録: <strong>{stats.streakDays}日</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                  <span className="text-gray-700">
                    平均日記頻度: <strong>
                      {stats.monthlyActivity.length > 0 
                        ? Math.round(stats.totalDiaryEntries / stats.monthlyActivity.length)
                        : 0
                      }回/月
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievement Badge */}
        {stats.totalDiaryEntries >= 10 && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: "spring", bounce: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-xl">
              <div className="text-center text-white">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-bold">継続者バッジ</div>
                <div className="text-sm opacity-90">10回以上の日記記録</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}