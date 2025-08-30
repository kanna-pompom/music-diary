'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Image as ImageIcon, Save, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth-context'
import { DatabaseService } from '../../../lib/db-service'

export default function NewDiaryPage() {
  const { user, signInAnonymously } = useAuth()
  const [diaryData, setDiaryData] = useState({
    title: '',
    content: '',
    photos: [] as File[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setDiaryData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))

    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
  }

  const removePhoto = (index: number) => {
    setDiaryData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diaryData.content.trim()) return

    // 匿名認証がされていない場合は自動でサインイン
    if (!user) {
      await signInAnonymously()
    }

    setIsLoading(true)
    
    try {
      console.log('日記を分析中...')
      
      // 写真のアップロード処理
      let photoUrls: string[] = []
      if (diaryData.photos.length > 0 && user) {
        try {
          const uploadPromises = diaryData.photos.map(photo => 
            DatabaseService.uploadPhoto(photo, user.uid)
          )
          photoUrls = await Promise.all(uploadPromises)
        } catch (error) {
          console.warn('写真のアップロードに失敗:', error)
        }
      }
      
      // API分析を実行
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: diaryData.content,
          photos: photoUrls.length > 0 ? photoUrls : []
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error('分析に失敗しました')
      }

      const analysisResult = await analysisResponse.json()
      console.log('分析結果:', analysisResult)

      // 日記をFirebaseに保存
      let diaryEntryId = ''
      if (user) {
        try {
          diaryEntryId = await DatabaseService.createDiaryEntry({
            userId: user.uid,
            date: new Date().toISOString().split('T')[0],
            title: diaryData.title || undefined,
            content: diaryData.content,
            photos: photoUrls,
            analysis: analysisResult
          })
        } catch (error) {
          console.warn('日記の保存に失敗:', error)
        }
      }

      console.log('音楽を検索中...')
      
      const recommendResponse = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysisResult,
          userPreferences: {
            favoriteGenres: ['J-Pop', 'ロック']
          }
        }),
      })

      if (!recommendResponse.ok) {
        throw new Error('音楽推薦に失敗しました')
      }

      const recommendResult = await recommendResponse.json()
      console.log('推薦結果:', recommendResult)

      if (recommendResult.recommendation) {
        // 音楽推薦をFirebaseに保存
        if (user && diaryEntryId) {
          try {
            await DatabaseService.createSongRecommendation({
              userId: user.uid,
              diaryEntryId: diaryEntryId,
              date: new Date().toISOString().split('T')[0],
              song: recommendResult.recommendation.song,
              reason: recommendResult.recommendation.reason,
              relevanceScore: recommendResult.recommendation.relevanceScore || 8
            })
          } catch (error) {
            console.warn('音楽推薦の保存に失敗:', error)
          }
        }

        const params = new URLSearchParams({
          song: JSON.stringify(recommendResult.recommendation.song),
          reason: recommendResult.recommendation.reason,
          analysis: JSON.stringify(analysisResult)
        })
        
        window.location.href = `/recommendation?${params}`
      } else {
        alert('申し訳ございません。適切な楽曲が見つかりませんでした。')
      }
      
    } catch (error) {
      console.error('Error:', error)
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
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
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">今日の日記</h1>
          
          <div className="w-16 sm:w-24" />
        </motion.header>

        <motion.form 
          onSubmit={handleSubmit}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-0"
        >
          <div className="p-4 sm:p-8">
            <div className="mb-6">
              <input
                type="text"
                value={diaryData.title}
                onChange={(e) => setDiaryData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="タイトル（オプション）"
                className="w-full text-xl sm:text-2xl font-bold placeholder-gray-400 bg-transparent border-none outline-none"
              />
              <div className="border-b border-gray-200 mt-2" />
            </div>

            <div className="mb-6">
              <textarea
                value={diaryData.content}
                onChange={(e) => setDiaryData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="今日はどんな一日でしたか？あなたの気持ちを自由に書いてください..."
                className="w-full h-48 sm:h-64 resize-none placeholder-gray-400 bg-transparent border-none outline-none text-base sm:text-lg leading-relaxed"
                required
              />
            </div>

            {/* Photo Section */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-700 font-medium">写真を追加</span>
              </div>

              {/* Photo Preview */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Upload Button */}
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">写真をアップロード</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6">
            <button
              type="submit"
              disabled={!diaryData.content.trim() || isLoading}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm sm:text-base rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  日記を保存して音楽を提案してもらう
                </>
              )}
            </button>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <div className="inline-flex items-center text-purple-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  あなたの感情を分析して、ぴったりの音楽を探しています...
                </div>
              </motion.div>
            )}
          </div>
        </motion.form>

        {/* Tips Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-lg mx-2 sm:mx-0"
        >
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">💡 より良い音楽提案のためのヒント</h3>
          <ul className="space-y-2 text-gray-600 text-xs sm:text-sm">
            <li>• 今日の気分や感情を具体的に書いてみてください</li>
            <li>• どんな場所にいたか、誰と過ごしたかも音楽提案の参考になります</li>
            <li>• 写真があると、その時の雰囲気に合った音楽を提案できます</li>
            <li>• 長く書く必要はありません。素直な気持ちが一番大切です</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}