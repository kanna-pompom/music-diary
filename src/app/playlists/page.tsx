'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Music, 
  Plus, 
  ArrowLeft, 
  Play, 
  Heart, 
  Trash2, 
  Edit3,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../lib/auth-context'
import { DatabaseService } from '../../lib/db-service'
import { Playlist, SongRecommendation } from '../../types/database'

export default function PlaylistsPage() {
  const { user, signInAnonymously } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [songs, setSongs] = useState<SongRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'playlists' | 'daily' | 'emotions'>('daily')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [playlistsData, songsData] = await Promise.all([
        DatabaseService.getPlaylists(user.uid),
        DatabaseService.getSongRecommendations(user.uid, 100)
      ])

      setPlaylists(playlistsData)
      setSongs(songsData)
    } catch (error) {
      console.error('データの読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    await signInAnonymously()
  }

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return

    try {
      await DatabaseService.createPlaylist({
        userId: user.uid,
        name: newPlaylistName,
        description: newPlaylistDescription || undefined,
        type: 'custom',
        songs: [],
        isPublic: false
      })

      await loadData()
      setShowCreateModal(false)
      setNewPlaylistName('')
      setNewPlaylistDescription('')
    } catch (error) {
      console.error('プレイリストの作成に失敗:', error)
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('このプレイリストを削除しますか？')) return

    try {
      await DatabaseService.deletePlaylist(playlistId)
      await loadData()
    } catch (error) {
      console.error('プレイリストの削除に失敗:', error)
    }
  }

  const getDailyPicksSongs = () => {
    return songs.slice(0, 20) // 最新20曲
  }

  const getEmotionBasedSongs = () => {
    const emotionGroups = songs.reduce((groups, song) => {
      // 日記の分析結果から感情を取得
      const emotion = song.song?.genre || 'その他'
      if (!groups[emotion]) {
        groups[emotion] = []
      }
      groups[emotion].push(song)
      return groups
    }, {} as Record<string, SongRecommendation[]>)

    return emotionGroups
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">プレイリスト機能</h2>
          <p className="text-gray-600 mb-6">
            プレイリストを利用するには、まず日記を作成してください。
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
          <p className="text-gray-600">プレイリストを読み込み中...</p>
        </div>
      </div>
    )
  }

  const dailyPicksSongs = getDailyPicksSongs()
  const emotionGroups = getEmotionBasedSongs()

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
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">プレイリスト</h1>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            新規作成
          </button>
        </motion.header>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm"
        >
          {[
            { id: 'daily', label: '今日の1曲', icon: Calendar },
            { id: 'emotions', label: '感情別', icon: Heart },
            { id: 'playlists', label: 'カスタム', icon: Music }
          ].map((tab: { id: string; label: string; icon: React.ElementType }) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as 'playlists' | 'daily' | 'emotions')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  今日の1曲コレクション ({dailyPicksSongs.length}曲)
                </h2>
                <p className="text-gray-600 mb-6">
                  日記から生まれた音楽の思い出を振り返ってみましょう
                </p>

                {dailyPicksSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">まだ楽曲がありません</p>
                    <Link 
                      href="/diary/new"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      日記を書いて音楽を発見
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyPicksSongs.map((songRec, index) => (
                      <motion.div
                        key={songRec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                              {songRec.song.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {songRec.song.artist}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {songRec.date}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <a
                            href={songRec.song.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Spotify
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {selectedTab === 'emotions' && (
            <motion.div
              key="emotions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {Object.keys(emotionGroups).length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">感情別の楽曲がまだありません</p>
                    <Link 
                      href="/diary/new"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      日記を書いて感情を記録
                    </Link>
                  </div>
                ) : (
                  Object.entries(emotionGroups).map(([emotion, emotionSongs], index) => (
                    <motion.div
                      key={emotion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-xl"
                    >
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-pink-500" />
                        {emotion} ({emotionSongs.length}曲)
                      </h2>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emotionSongs.slice(0, 6).map((songRec) => (
                          <div
                            key={songRec.id}
                            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4"
                          >
                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                              {songRec.song.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {songRec.song.artist}
                            </p>
                            <a
                              href={songRec.song.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Spotify
                            </a>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {selectedTab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Music className="w-5 h-5 mr-2 text-purple-500" />
                  カスタムプレイリスト ({playlists.filter(p => p.type === 'custom').length}個)
                </h2>

                {playlists.filter(p => p.type === 'custom').length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">カスタムプレイリストがありません</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      最初のプレイリストを作成
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists
                      .filter(p => p.type === 'custom')
                      .map((playlist, index) => (
                        <motion.div
                          key={playlist.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">
                                {playlist.name}
                              </h3>
                              {playlist.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {playlist.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {playlist.songs.length}曲
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button className="p-1 text-gray-500 hover:text-purple-500 transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deletePlaylist(playlist.id)}
                                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex items-center px-3 py-1 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition-colors">
                              <Play className="w-3 h-3 mr-1" />
                              再生
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                新しいプレイリストを作成
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プレイリスト名 *
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="例: お気に入りの楽曲"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明（オプション）
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="このプレイリストについて..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={createPlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  作成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}