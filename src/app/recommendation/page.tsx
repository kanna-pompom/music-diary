'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, Heart, Plus, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Song {
  spotifyId: string
  title: string
  artist: string
  album: string
  albumCover: string
  duration: number
  previewUrl?: string
  spotifyUrl: string
  releaseYear: number
}

export default function RecommendationPage() {
  const searchParams = useSearchParams()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isAddedToPlaylist, setIsAddedToPlaylist] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const songData = searchParams.get('song')
  const reason = searchParams.get('reason')
  const analysisData = searchParams.get('analysis')
  const testMode = searchParams.get('testMode')

  const song: Song | null = songData ? JSON.parse(songData) : null
  const analysis = analysisData ? JSON.parse(analysisData) : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !song?.previewUrl) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setAudioError(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setAudioError(true)
      setIsPlaying(false)
      setIsLoading(false)
      console.error('Audio playback error')
    }

    const handleLoadStart = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [song])

  const togglePlayback = async () => {
    if (!audioRef.current || !song?.previewUrl || audioError) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setIsLoading(true)
        await audioRef.current.play()
        setIsPlaying(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Playback error:', error)
      setAudioError(true)
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleAddToPlaylist = () => {
    setIsAddedToPlaylist(!isAddedToPlaylist)
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">楽曲情報が見つかりません</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
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
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">今日のおすすめ楽曲</h1>
            {testMode && (
              <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full inline-block">
                🧪 デモモード
              </div>
            )}
          </div>
          
          <div className="w-16 sm:w-24" />
        </motion.header>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-2 sm:mx-0"
        >
          {/* Album Art & Main Info */}
          <div className="relative">
            <div className="aspect-square md:aspect-[2/1] bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative overflow-hidden">
              {song.albumCover ? (
                <img 
                  src={song.albumCover} 
                  alt={song.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <Volume2 className="w-16 h-16 text-white" />
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayback}
                  disabled={!song.previewUrl || audioError}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                  ) : audioError ? (
                    <div className="w-8 h-8 text-red-500 flex items-center justify-center">×</div>
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8 text-gray-800" />
                  ) : (
                    <Play className="w-8 h-8 text-gray-800 ml-1" />
                  )}
                </motion.button>
              </div>
              
              {/* Progress Bar */}
              {song.previewUrl && !audioError && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center text-white text-sm mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex-1 mx-3">
                        <div 
                          className="h-2 bg-white/30 rounded-full cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-100"
                            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                      <span>{duration ? formatTime(duration) : '--:--'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No Preview Message */}
              {!song.previewUrl && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-center text-sm">
                    この楽曲はプレビューがありません
                  </div>
                </div>
              )}
              
              {/* Audio Error Message */}
              {audioError && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-red-500/80 backdrop-blur-sm rounded-lg p-3 text-white text-center text-sm">
                    音楽の再生でエラーが発生しました
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Song Details */}
          <div className="p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{song.title}</h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-1">{song.artist}</p>
              <p className="text-sm sm:text-base text-gray-500">{song.album} ({song.releaseYear})</p>
            </div>

            {/* AI Recommendation Reason */}
            {reason && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-purple-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
              >
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center text-sm sm:text-base">
                  🎵 この楽曲をおすすめする理由
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{reason}</p>
              </motion.div>
            )}

            {/* Emotion Analysis */}
            {analysis && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
              >
                <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">📊 感情分析結果</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-sm text-gray-600">主要感情</p>
                    <p className="font-medium text-gray-800 capitalize">{analysis.emotions?.primary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">強度</p>
                    <p className="font-medium text-gray-800">{analysis.emotions?.intensity}/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">全体的な気分</p>
                    <p className="font-medium text-gray-800 capitalize">{analysis.mood}</p>
                  </div>
                </div>
                {analysis.keywords && analysis.keywords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">キーワード</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-white rounded-full text-sm text-gray-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-white' : ''}`} />
                {isLiked ? 'お気に入り済み' : 'お気に入りに追加'}
              </button>

              <button
                onClick={handleAddToPlaylist}
                className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-medium text-sm sm:text-base transition-all ${
                  isAddedToPlaylist
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                {isAddedToPlaylist ? 'プレイリスト追加済み' : 'プレイリストに追加'}
              </button>

              <a
                href={song.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm sm:text-base"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Spotifyで開く
              </a>
            </div>
          </div>
        </motion.div>

        {/* New Diary Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link 
            href="/diary/new"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            また日記を書く
          </Link>
        </motion.div>

        {/* Hidden Audio Element */}
        {song.previewUrl && (
          <audio
            ref={audioRef}
            src={song.previewUrl}
            onLoadedData={() => console.log('Audio loaded')}
            onError={(e) => console.error('Audio error:', e)}
          />
        )}
      </div>
    </div>
  )
}