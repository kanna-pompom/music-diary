'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Heart, X, Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const GENRES = [
  'J-Pop', 'ロック', 'ジャズ', 'クラシック', 'R&B', 'ヒップホップ',
  'エレクトロニック', 'フォーク', 'カントリー', 'レゲエ', 'ブルース',
  'メタル', 'パンク', 'ファンク', 'ディスコ', 'ハウス', 'テクノ'
]

const ERAS = ['60年代', '70年代', '80年代', '90年代', '2000年代', '2010年代', '2020年代']

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    favoriteArtists: [''],
    favoriteGenres: [] as string[],
    favoriteEras: [] as string[],
    preferenceType: '' as 'existing' | 'new' | '',
    dislikedGenres: [] as string[]
  })

  const addArtist = () => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: [...prev.favoriteArtists, '']
    }))
  }

  const updateArtist = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: prev.favoriteArtists.map((artist, i) => 
        i === index ? value : artist
      )
    }))
  }

  const removeArtist = (index: number) => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: prev.favoriteArtists.filter((_, i) => i !== index)
    }))
  }

  const toggleGenre = (genre: string, type: 'favoriteGenres' | 'dislikedGenres') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(genre)
        ? prev[type].filter(g => g !== genre)
        : [...prev[type], genre]
    }))
  }

  const toggleEra = (era: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteEras: prev.favoriteEras.includes(era)
        ? prev.favoriteEras.filter(e => e !== era)
        : [...prev.favoriteEras, era]
    }))
  }

  const handleSubmit = () => {
    console.log('Setup completed:', formData)
    // TODO: Save to Firebase
    // セットアップ完了後、日記作成ページにリダイレクト
    router.push('/diary/new')
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Music className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Music Diary</h1>
          <p className="text-gray-600">あなたの音楽の好みを教えてください</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>ステップ {step} / 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: '20%' }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="w-6 h-6 text-red-500 mr-3" />
                好きなアーティスト
              </h2>
              <p className="text-gray-600 mb-6">
                あなたが好きなアーティストを教えてください（最低1つ）
              </p>

              <div className="space-y-4">
                {formData.favoriteArtists.map((artist, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => updateArtist(index, e.target.value)}
                      placeholder="アーティスト名を入力"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {formData.favoriteArtists.length > 1 && (
                      <button
                        onClick={() => removeArtist(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addArtist}
                className="mt-4 flex items-center text-purple-600 hover:text-purple-800"
              >
                <Plus className="w-5 h-5 mr-2" />
                アーティストを追加
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                好きな音楽ジャンル
              </h2>
              <p className="text-gray-600 mb-6">
                あなたが好きなジャンルを選択してください（複数選択可）
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre, 'favoriteGenres')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.favoriteGenres.includes(genre)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                好きな年代
              </h2>
              <p className="text-gray-600 mb-6">
                どの年代の音楽がお好みですか？（複数選択可）
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ERAS.map((era) => (
                  <button
                    key={era}
                    onClick={() => toggleEra(era)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.favoriteEras.includes(era)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                音楽の好み
              </h2>
              <p className="text-gray-600 mb-6">
                あなたの音楽に対する姿勢を教えてください
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, preferenceType: 'existing' }))}
                  className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                    formData.preferenceType === 'existing'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-lg mb-2">既存ジャンル派</div>
                  <div className="text-gray-600">
                    聞いたことのあるジャンルや、似たような音楽を中心に提案してほしい
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, preferenceType: 'new' }))}
                  className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                    formData.preferenceType === 'new'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-lg mb-2">新ジャンル派</div>
                  <div className="text-gray-600">
                    新しいジャンルや、今まで聞いたことのない音楽にも挑戦したい
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                聴きたくないジャンル
              </h2>
              <p className="text-gray-600 mb-6">
                提案から除外したいジャンルがあれば選択してください（オプション）
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre, 'dislikedGenres')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.dislikedGenres.includes(genre)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            戻る
          </button>

          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && !formData.favoriteArtists.some(artist => artist.trim())) ||
                (step === 4 && !formData.preferenceType)
              }
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
            >
              設定完了
            </button>
          )}
        </div>
      </div>
    </div>
  )
}