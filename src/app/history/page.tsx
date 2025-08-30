'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  ArrowLeft, 
  Music, 
  Camera,
  Clock,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { DatabaseService } from '../../lib/db-service'
import { DiaryEntry, SongRecommendation } from '../../types/database'

interface DiaryWithRecommendation {
  diary: DiaryEntry
  recommendation?: SongRecommendation
}

export default function HistoryPage() {
  const { user, signInAnonymously } = useAuth()
  const [entries, setEntries] = useState<DiaryWithRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadHistoryData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadHistoryData = async () => {
    if (!user) return

    try {
      const [diaryEntries, songRecommendations] = await Promise.all([
        DatabaseService.getDiaryEntries(user.uid, 100),
        DatabaseService.getSongRecommendations(user.uid, 100)
      ])

      // 日記と音楽推薦をマッチング
      const entriesWithRecommendations: DiaryWithRecommendation[] = diaryEntries.map(diary => {
        const recommendation = songRecommendations.find(rec => rec.diaryEntryId === diary.id)
        return { diary, recommendation }
      })

      setEntries(entriesWithRecommendations)
    } catch (error) {
      console.error('履歴データの読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    await signInAnonymously()
  }

  const filteredEntries = entries.filter(({ diary, recommendation }) => {
    // テキスト検索
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesTitle = diary.title?.toLowerCase().includes(searchLower)
      const matchesContent = diary.content.toLowerCase().includes(searchLower)
      const matchesSong = recommendation?.song.title.toLowerCase().includes(searchLower)
      const matchesArtist = recommendation?.song.artist.toLowerCase().includes(searchLower)
      
      if (!matchesTitle && !matchesContent && !matchesSong && !matchesArtist) {
        return false
      }
    }

    // 感情フィルター
    if (selectedMood !== 'all' && diary.analysis?.mood !== selectedMood) {
      return false
    }

    // 月フィルター
    if (selectedMonth !== 'all') {
      const entryMonth = new Date(diary.createdAt).toISOString().substring(0, 7) // YYYY-MM
      if (entryMonth !== selectedMonth) {
        return false
      }
    }

    return true
  })

  const getAvailableMonths = () => {
    const months = new Set(
      entries.map(({ diary }) => 
        new Date(diary.createdAt).toISOString().substring(0, 7)
      )
    )
    return Array.from(months).sort().reverse()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }).format(date)
  }

  const getMoodEmoji = (mood?: string) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      excited: '🎉',
      calm: '😌',
      nostalgic: '🍃',
      energetic: '⚡',
      melancholic: '🌙'
    }
    return mood ? moodMap[mood] || '🎵' : '🎵'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <Calendar className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">日記履歴</h2>
          <p className="text-gray-600 mb-6">
            これまでの日記と音楽の記録を振り返ってみましょう。
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
          <p className="text-gray-600">履歴を読み込み中...</p>
        </div>
      </div>
    )
  }

  const availableMonths = getAvailableMonths()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
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
            <Calendar className="w-6 h-6 mr-2" />
            履歴
          </h1>
          
          <div className="w-16 sm:w-24" />
        </motion.header>

        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="日記の内容や楽曲名で検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Mood Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none min-w-[140px]"
              >
                <option value="all">全ての気分</option>
                <option value="happy">嬉しい</option>
                <option value="sad">悲しい</option>
                <option value="excited">興奮</option>
                <option value="calm">穏やか</option>
                <option value="nostalgic">懐かしい</option>
                <option value="energetic">元気</option>
                <option value="melancholic">物思い</option>
              </select>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none min-w-[140px]"
              >
                <option value="all">全期間</option>
                {availableMonths.map(month => {
                  const date = new Date(month + '-01')
                  const label = new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric',
                    month: 'long'
                  }).format(date)
                  return (
                    <option key={month} value={month}>{label}</option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredEntries.length}件の記録が見つかりました
            </p>
            <p className="text-sm text-gray-500">
              全{entries.length}件
            </p>
          </div>
        </motion.div>

        {/* Entries */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 shadow-xl text-center"
            >
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">記録が見つかりませんでした</h3>
              <p className="text-gray-500 mb-6">
                {entries.length === 0 
                  ? '日記を書いて音楽の思い出を作りましょう'
                  : '検索条件を変更してみてください'
                }
              </p>
              <Link 
                href="/diary/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                新しい日記を書く
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredEntries.map(({ diary, recommendation }, index) => (
                <motion.div
                  key={diary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Entry Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">
                            {getMoodEmoji(diary.analysis?.mood)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {diary.title || '無題の日記'}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(new Date(diary.createdAt))}
                            </p>
                          </div>
                        </div>

                        {/* Analysis Tags */}
                        {diary.analysis && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {diary.analysis.mood}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              強度: {diary.analysis.emotions.intensity}/10
                            </span>
                            {diary.analysis.keywords.slice(0, 2).map(keyword => (
                              <span key={keyword} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedEntry(
                          expandedEntry === diary.id ? null : diary.id
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedEntry === diary.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedEntry === diary.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0">
                          {/* Diary Content */}
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              日記の内容
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {diary.content}
                              </p>
                            </div>
                          </div>

                          {/* Photos */}
                          {diary.photos && diary.photos.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Camera className="w-4 h-4 mr-1" />
                                写真 ({diary.photos.length}枚)
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {diary.photos.map((photo, idx) => (
                                  <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                    <img 
                                      src={photo} 
                                      alt={`写真 ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Music Recommendation */}
                          {recommendation && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <Music className="w-4 h-4 mr-1" />
                                この日の1曲
                              </h4>
                              
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Music className="w-8 h-8 text-white" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-800 mb-1">
                                    {recommendation.song.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {recommendation.song.artist}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                    {recommendation.reason}
                                  </p>
                                  
                                  <div className="flex gap-2">
                                    <a
                                      href={recommendation.song.spotifyUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Spotify
                                    </a>
                                    <button className="inline-flex items-center px-3 py-1 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600 transition-colors">
                                      <Play className="w-3 h-3 mr-1" />
                                      再生
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Quick Preview */}
                  {expandedEntry !== diary.id && recommendation && (
                    <div className="p-6 pt-0">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <Music className="w-6 h-6 text-purple-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">
                            {recommendation.song.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {recommendation.song.artist}
                          </p>
                        </div>
                        <a
                          href={recommendation.song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          再生
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Load More Button */}
        {filteredEntries.length > 0 && filteredEntries.length < entries.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg shadow-lg hover:shadow-xl transition-all">
              さらに読み込む
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}